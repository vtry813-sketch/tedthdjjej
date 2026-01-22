
import express from 'express';
import helmet from 'helmet';
import cors from 'cors';
import rateLimit from 'express-rate-limit';
import { execa } from 'execa';
import path from 'path';
import fs from 'fs-extra';
import process from 'process';
import { WebSocketServer, WebSocket } from 'ws';
import { createServer } from 'http';
import multer from 'multer';
import AdmZip from 'adm-zip';
import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';

const app = express();
const server = createServer(app);
const wss = new WebSocketServer({ server });
const PORT = process.env.PORT || 5000;
const JWT_SECRET = process.env.JWT_SECRET || 'botcloud_ultra_secure_secret_99';
const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/botcloud';

// MongoDB Connection
mongoose.connect(MONGODB_URI)
  .then(() => console.log('✅ Connected to MongoDB Atlas'))
  .catch(err => console.error('❌ MongoDB Connection Error:', err));

// Transaction Schema
const transactionSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  amount: { type: Number, required: true },
  type: { 
    type: String, 
    enum: ['DAILY', 'REFERRAL', 'DEPLOY', 'TRANSFER', 'ADMIN', 'EXPIRE'], 
    required: true 
  },
  description: { type: String, required: true },
  timestamp: { type: Date, default: Date.now }
});

const Transaction = mongoose.model('Transaction', transactionSchema);

// User Schema
const userSchema = new mongoose.Schema({
  email: { type: String, required: true, unique: true },
  username: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  role: { type: String, enum: ['ADMIN', 'USER'], default: 'USER' },
  coins: { type: Number, default: 0 },
  isVerified: { type: Boolean, default: false },
  isBanned: { type: Boolean, default: false },
  referralCode: { type: String, unique: true },
  lastDailyClaim: { type: Date },
  createdAt: { type: Date, default: Date.now }
});

const User = mongoose.model('User', userSchema);

// Persistent Log Schema
const logSchema = new mongoose.Schema({
  botId: { type: String, required: true, index: true },
  message: { type: String, required: true },
  type: { type: String, enum: ['SUCCESS', 'ERROR', 'SYSTEM'], default: 'SYSTEM' },
  timestamp: { type: Date, default: Date.now }
});

const BotLog = mongoose.model('BotLog', logSchema);

// Multer configuration
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const uploadDir = path.join(process.cwd(), 'uploads');
    fs.ensureDirSync(uploadDir);
    cb(null, uploadDir);
  },
  filename: (req, file, cb) => {
    cb(null, `${Date.now()}-${file.originalname}`);
  }
});
const upload = multer({ storage, limits: { fileSize: 50 * 1024 * 1024 } });

// Security Middleware
app.use(helmet());
app.use(cors());
app.use(express.json());
app.use(rateLimit({ windowMs: 15 * 60 * 1000, max: 100 }));

// Process Tracking (In-memory for active instances)
const botProcesses = new Map<string, { process: any, pid: number, deployDir: string }>();
const botClients = new Map<string, Set<WebSocket>>();

const broadcastLog = async (botId: string, message: string, type: 'SUCCESS' | 'ERROR' | 'SYSTEM' = 'SYSTEM') => {
  const logEntry = { botId, timestamp: new Date(), message, type };
  
  // 1. Save to Database (Persistent)
  try {
    await new BotLog(logEntry).save();
  } catch (e) {
    console.error(`❌ Failed to save log to DB for ${botId}:`, e);
  }

  // 2. Broadcast to connected WebSocket clients
  const clients = botClients.get(botId);
  if (clients) {
    const payload = JSON.stringify({ type: 'log', data: logEntry });
    clients.forEach(client => { if (client.readyState === WebSocket.OPEN) client.send(payload); });
  }
};

/**
 * Stops a running bot process safely
 */
const stopBotInstance = async (botId: string) => {
    const instance = botProcesses.get(botId);
    if (!instance) return false;

    await broadcastLog(botId, `Stopping instance (PID: ${instance.pid})...`, 'SYSTEM');
    try {
        instance.process.kill('SIGTERM');
        const forceKillTimeout = setTimeout(() => {
            if (botProcesses.has(botId)) {
                broadcastLog(botId, 'Process hung. Force killing (SIGKILL)...', 'ERROR');
                instance.process.kill('SIGKILL');
            }
        }, 3000);

        await new Promise((resolve) => {
            instance.process.on('exit', () => {
                clearTimeout(forceKillTimeout);
                resolve(true);
            });
        });
        
        botProcesses.delete(botId);
        return true;
    } catch (e) {
        botProcesses.delete(botId);
        return true;
    }
};

const finalizeBotStartup = async (botId: string, deployDir: string) => {
    try {
        await stopBotInstance(botId);

        await broadcastLog(botId, 'Installing dependencies (npm install)...', 'SYSTEM');
        const installProcess = execa('npm', ['install'], { cwd: deployDir });
        installProcess.stdout?.on('data', (data) => broadcastLog(botId, data.toString().trim(), 'SUCCESS'));
        installProcess.stderr?.on('data', (data) => broadcastLog(botId, data.toString().trim(), 'ERROR'));
        await installProcess;

        await broadcastLog(botId, 'Launching bot process (npm start)...', 'SYSTEM');
        const subprocess = execa('npm', ['start'], { 
            cwd: deployDir, 
            env: { ...process.env, BOT_ID: botId, NODE_ENV: 'production' },
            cleanup: true
        });

        subprocess.stdout?.on('data', (data) => broadcastLog(botId, data.toString().trim(), 'SUCCESS'));
        subprocess.stderr?.on('data', (data) => broadcastLog(botId, data.toString().trim(), 'ERROR'));
        
        if (subprocess.pid) {
          botProcesses.set(botId, { pid: subprocess.pid, process: subprocess, deployDir });
          await broadcastLog(botId, `Instance assigned PID ${subprocess.pid}`, 'SUCCESS');
        }

        subprocess.on('exit', (code) => {
            broadcastLog(botId, `Process terminated (Exit Code: ${code})`, 'SYSTEM');
            if (botProcesses.get(botId)?.pid === subprocess.pid) {
                botProcesses.delete(botId);
            }
        });
        
        await broadcastLog(botId, 'Bot is online.', 'SUCCESS');
        return { success: true };
    } catch (error: any) {
        await broadcastLog(botId, `Startup error: ${error.message}`, 'ERROR');
        botProcesses.delete(botId);
        throw error;
    }
}

/**
 * AUTH ROUTES
 */
app.post('/api/auth/register', async (req, res) => {
  const session = await mongoose.startSession();
  session.startTransaction();
  try {
    const { email, username, password, referral } = req.body;
    if (!email.endsWith('@gmail.com')) throw new Error('Gmail required.');

    const existingUser = await User.findOne({ $or: [{ email }, { username }] });
    if (existingUser) throw new Error('User exists.');

    const hashedPassword = await bcrypt.hash(password, 10);
    const referralCode = Math.random().toString(36).substring(2, 8).toUpperCase();

    const newUser = new User({
      email,
      username,
      password: hashedPassword,
      referralCode,
      coins: referral ? 1 : 0
    });

    if (referral) {
      const referrer = await User.findOne({ referralCode: referral.toUpperCase() });
      if (referrer) {
        referrer.coins += 1;
        await referrer.save({ session });
        await new Transaction({
          userId: referrer._id,
          amount: 1,
          type: 'REFERRAL',
          description: `Bonus for referring ${username}`
        }).save({ session });
        await new Transaction({
          userId: newUser._id,
          amount: 1,
          type: 'REFERRAL',
          description: `Onboarding bonus from ${referrer.username}`
        }).save({ session });
      }
    }

    await newUser.save({ session });
    await session.commitTransaction();
    res.status(201).json({ message: 'Success' });
  } catch (error: any) {
    await session.abortTransaction();
    res.status(400).json({ error: error.message });
  } finally {
    session.endSession();
  }
});

app.post('/api/auth/login', async (req, res) => {
  try {
    const { email, password } = req.body;
    const user = await User.findOne({ email });
    if (!user || user.isBanned || !(await bcrypt.compare(password, user.password))) {
        return res.status(401).json({ error: 'Invalid or banned account.' });
    }
    const token = jwt.sign({ id: user._id, role: user.role }, JWT_SECRET, { expiresIn: '7d' });
    const u = user.toObject(); delete u.password;
    res.json({ token, user: u });
  } catch (error: any) { res.status(500).json({ error: error.message }); }
});

/**
 * DEPLOYMENT & PROCESS CONTROL
 */
app.post('/api/deploy', async (req, res) => {
    const { botId, repoUrl } = req.body;
    const deployDir = path.join(process.cwd(), 'deployments', botId);
    try {
        await fs.ensureDir(path.join(process.cwd(), 'deployments'));
        await stopBotInstance(botId);

        if (await fs.pathExists(deployDir)) {
          await broadcastLog(botId, `Updating existing repository at ${deployDir}...`, 'SYSTEM');
          await execa('git', ['pull'], { cwd: deployDir });
        } else {
          await broadcastLog(botId, `Cloning repository: ${repoUrl} into ${deployDir}...`, 'SYSTEM');
          await execa('git', ['clone', repoUrl, deployDir]);
        }
        
        finalizeBotStartup(botId, deployDir).catch(console.error);
        res.status(202).json({ botId });
    } catch (e: any) { res.status(500).json({ error: e.message }); }
});

app.post('/api/deploy-zip', upload.single('package'), async (req, res) => {
  const { botId } = req.body;
  const file = req.file;
  if (!botId || !file) return res.status(400).json({ error: 'Missing deployment data or package file.' });

  const deployDir = path.join(process.cwd(), 'deployments', botId);
  try {
      await stopBotInstance(botId);

      await broadcastLog(botId, `Initializing ZIP extraction for package: ${file.originalname}`, 'SYSTEM');
      await fs.ensureDir(deployDir);
      await fs.emptyDir(deployDir);
      
      const zip = new AdmZip(file.path);
      zip.extractAllTo(deployDir, true);
      await broadcastLog(botId, 'ZIP extraction complete. Proceeding to startup...', 'SUCCESS');

      await fs.remove(file.path);
      finalizeBotStartup(botId, deployDir).catch(console.error);
      res.status(202).json({ botId });
  } catch (e: any) {
      await broadcastLog(botId, `Extraction failed: ${e.message}`, 'ERROR');
      res.status(500).json({ error: e.message });
  }
});

app.post('/api/stop', async (req, res) => {
    const { botId } = req.body;
    const success = await stopBotInstance(botId);
    if (success) {
        res.json({ success: true });
    } else {
        res.status(404).json({ error: 'Bot is not running.' });
    }
});

app.post('/api/restart', async (req, res) => {
    const { botId } = req.body;
    const instance = botProcesses.get(botId);
    const deployDir = instance?.deployDir || path.join(process.cwd(), 'deployments', botId);
    
    if (!(await fs.pathExists(deployDir))) {
        return res.status(404).json({ error: 'Deployment files not found.' });
    }

    try {
        await stopBotInstance(botId);
        await broadcastLog(botId, 'User initiated manual restart.', 'SYSTEM');
        finalizeBotStartup(botId, deployDir).catch(console.error);
        res.json({ success: true });
    } catch (e: any) {
        res.status(500).json({ error: e.message });
    }
});

app.get('/api/transactions', async (req, res) => {
    const { userId } = req.query;
    if (!userId) return res.status(400).json({ error: 'Missing userId' });
    const txs = await Transaction.find({ userId }).sort({ timestamp: -1 }).limit(20);
    res.json(txs);
});

// Retrieve persistent logs
app.get('/api/bots/:botId/logs', async (req, res) => {
  try {
    const { botId } = req.params;
    const logs = await BotLog.find({ botId }).sort({ timestamp: 1 }).limit(500);
    res.json(logs);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

// WS & Server Startup
wss.on('connection', (ws) => {
  let currentBotId: string | null = null;
  ws.on('message', async (m) => {
    const { type, botId } = JSON.parse(m.toString());
    if (type === 'subscribe') {
      if (currentBotId) botClients.get(currentBotId)?.delete(ws);
      currentBotId = botId;
      if (!botClients.has(botId)) botClients.set(botId, new Set());
      botClients.get(botId)!.add(ws);
      
      // Send historical logs from DB on subscription
      const history = await BotLog.find({ botId }).sort({ timestamp: 1 }).limit(1000);
      ws.send(JSON.stringify({ type: 'init', data: history }));
    }
  });
  ws.on('close', () => { if (currentBotId) botClients.get(currentBotId)?.delete(ws); });
});

server.listen(PORT, () => console.log(`🚀 Port ${PORT}`));
