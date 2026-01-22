
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

// User Schema
const userSchema = new mongoose.Schema({
  email: { type: String, required: true, unique: true },
  username: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  role: { type: String, enum: ['ADMIN', 'USER'], default: 'USER' },
  coins: { type: Number, default: 0 },
  // Fix: changed 'boolean' (type) to 'Boolean' (constructor) for Mongoose schema field 'isVerified'
  isVerified: { type: Boolean, default: false },
  // Fix: changed 'boolean' (type) to 'Boolean' (constructor) for Mongoose schema field 'isBanned'
  isBanned: { type: Boolean, default: false },
  referralCode: { type: String, unique: true },
  createdAt: { type: Date, default: Date.now }
});

const User = mongoose.model('User', userSchema);

// Multer configuration for ZIP uploads
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
const upload = multer({ 
  storage,
  limits: { fileSize: 50 * 1024 * 1024 } // 50MB limit
});

// Security Middleware
app.use(helmet());
app.use(cors());
app.use(express.json());
app.use(rateLimit({ windowMs: 15 * 60 * 1000, max: 100 }));

// Track active processes
const botProcesses = new Map<string, { process: any, pid: number }>();
const botLogs = new Map<string, string[]>();
const botClients = new Map<string, Set<WebSocket>>();

const broadcastLog = (botId: string, message: string, type: 'SUCCESS' | 'ERROR' | 'SYSTEM' = 'SYSTEM') => {
  const logEntry = { timestamp: new Date().toISOString(), message, type };
  if (!botLogs.has(botId)) botLogs.set(botId, []);
  const logs = botLogs.get(botId)!;
  logs.push(JSON.stringify(logEntry));
  if (logs.length > 1000) logs.shift();

  const clients = botClients.get(botId);
  if (clients) {
    const payload = JSON.stringify({ type: 'log', data: logEntry });
    clients.forEach(client => {
      if (client.readyState === WebSocket.OPEN) client.send(payload);
    });
  }
};

const finalizeBotStartup = async (botId: string, deployDir: string) => {
    try {
        broadcastLog(botId, 'Installing dependencies (npm install)...', 'SYSTEM');
        const installProcess = execa('npm', ['install'], { cwd: deployDir });
        installProcess.stdout?.on('data', (data) => broadcastLog(botId, data.toString().trim(), 'SUCCESS'));
        installProcess.stderr?.on('data', (data) => broadcastLog(botId, data.toString().trim(), 'ERROR'));
        await installProcess;

        broadcastLog(botId, 'Launching bot process (npm start)...', 'SYSTEM');
        const subprocess = execa('npm', ['start'], { 
            cwd: deployDir,
            env: { ...process.env, BOT_ID: botId, NODE_ENV: 'production' }
        });

        subprocess.stdout?.on('data', (data) => broadcastLog(botId, data.toString().trim(), 'SUCCESS'));
        subprocess.stderr?.on('data', (data) => broadcastLog(botId, data.toString().trim(), 'ERROR'));

        subprocess.on('close', (code) => {
          broadcastLog(botId, `Process exited with code ${code}`, 'SYSTEM');
          botProcesses.delete(botId);
        });

        if (subprocess.pid) {
          botProcesses.set(botId, { pid: subprocess.pid, process: subprocess });
          broadcastLog(botId, `Bot is online. PID: ${subprocess.pid}`, 'SUCCESS');
        }
        return { success: true, pid: subprocess.pid };
    } catch (error: any) {
        broadcastLog(botId, `CRITICAL STARTUP ERROR: ${error.message}`, 'ERROR');
        throw error;
    }
}

/**
 * AUTH ROUTES
 */
app.post('/api/auth/register', async (req, res) => {
  try {
    const { email, username, password, referral } = req.body;
    
    // Validate Gmail requirement if strict
    if (!email.endsWith('@gmail.com')) {
      return res.status(400).json({ error: 'Only Gmail addresses are permitted.' });
    }

    const existingUser = await User.findOne({ $or: [{ email }, { username }] });
    if (existingUser) return res.status(400).json({ error: 'User already exists.' });

    const hashedPassword = await bcrypt.hash(password, 10);
    const referralCode = Math.random().toString(36).substring(2, 8).toUpperCase();

    const user = new User({
      email,
      username,
      password: hashedPassword,
      referralCode,
      coins: referral ? 1 : 0 // Give 1 coin if referred
    });

    await user.save();
    res.status(201).json({ message: 'Registration successful. Please verify your email.' });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

app.post('/api/auth/login', async (req, res) => {
  try {
    const { email, password } = req.body;
    const user = await User.findOne({ email });
    if (!user) return res.status(401).json({ error: 'Invalid credentials.' });
    
    if (user.isBanned) return res.status(403).json({ error: 'This account has been banned.' });

    const isValid = await bcrypt.compare(password, user.password);
    if (!isValid) return res.status(401).json({ error: 'Invalid credentials.' });

    const token = jwt.sign({ id: user._id, role: user.role }, JWT_SECRET, { expiresIn: '7d' });
    
    // Exclude password
    const userObject = user.toObject();
    delete userObject.password;

    res.json({ token, user: userObject });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

/**
 * DEPLOYMENT ROUTES
 */
app.post('/api/deploy', async (req, res) => {
    const { botId, repoUrl } = req.body;
    const deployDir = path.join(process.cwd(), 'deployments', botId);
    try {
        await fs.ensureDir(path.join(process.cwd(), 'deployments'));
        if (await fs.pathExists(deployDir)) {
            await execa('git', ['pull'], { cwd: deployDir });
        } else {
            await execa('git', ['clone', repoUrl, deployDir]);
        }
        finalizeBotStartup(botId, deployDir).catch(console.error);
        res.status(202).json({ message: 'Deployment triggered', botId });
    } catch (e: any) {
        res.status(500).json({ error: e.message });
    }
});

app.post('/api/deploy-zip', upload.single('package'), async (req, res) => {
    const { botId } = req.body;
    const file = req.file;
    if (!botId || !file) return res.status(400).json({ error: 'Missing data' });

    const deployDir = path.join(process.cwd(), 'deployments', botId);
    try {
        await fs.ensureDir(deployDir);
        await fs.emptyDir(deployDir);
        const zip = new AdmZip(file.path);
        zip.extractAllTo(deployDir, true);
        await fs.remove(file.path);
        finalizeBotStartup(botId, deployDir).catch(console.error);
        res.status(202).json({ message: 'ZIP Deployment triggered', botId });
    } catch (e: any) {
        res.status(500).json({ error: e.message });
    }
});

app.post('/api/stop', async (req, res) => {
    const { botId } = req.body;
    const bot = botProcesses.get(botId);
    if (bot) {
        bot.process.kill('SIGTERM');
        broadcastLog(botId, 'Terminated by user.', 'SYSTEM');
        res.json({ success: true });
    } else {
        res.status(404).json({ error: 'Process not found.' });
    }
});

// WebSocket Handling
wss.on('connection', (ws) => {
  let currentBotId: string | null = null;
  ws.on('message', (message) => {
    const { type, botId } = JSON.parse(message.toString());
    if (type === 'subscribe' && botId) {
      if (currentBotId) botClients.get(currentBotId)?.delete(ws);
      currentBotId = botId;
      if (!botClients.has(botId)) botClients.set(botId, new Set());
      botClients.get(botId)!.add(ws);
      const logs = botLogs.get(botId) || [];
      ws.send(JSON.stringify({ type: 'init', data: logs.map(l => JSON.parse(l)) }));
    }
  });
  ws.on('close', () => { if (currentBotId) botClients.get(currentBotId)?.delete(ws); });
});

server.listen(PORT, () => console.log(`🚀 Server on port ${PORT}`));
