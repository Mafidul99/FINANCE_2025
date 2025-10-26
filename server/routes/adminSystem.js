import express from 'express';
import mongoose from 'mongoose';
import fs from 'fs';
import path from 'path';
import { exec } from 'child_process';
import util from 'util';
import auth from '../middleware/auth.js';
import SystemLog from '../models/SystemLog.js';
// import AdminSetting from '../models/AdminSetting.js';

const router = express.Router();
const execPromise = util.promisify(exec);

// System Diagnostics
router.get('/diagnostics', auth, async (req, res) => {
  try {
    if (req.user.role !== 'admin') {
      return res.status(403).json({ message: 'Access denied' });
    }

    // Database status
    const dbState = mongoose.connection.readyState;
    const dbStatus = dbState === 1 ? 'connected' : 'disconnected';

    // Memory usage
    const memoryUsage = process.memoryUsage();

    // System info
    const diagnostics = {
      database: {
        status: dbStatus,
        connectionState: dbState,
        databaseName: mongoose.connection.name,
        models: Object.keys(mongoose.connection.models)
      },
      server: {
        uptime: process.uptime(),
        nodeVersion: process.version,
        platform: process.platform,
        memory: {
          rss: `${Math.round(memoryUsage.rss / 1024 / 1024)} MB`,
          heapTotal: `${Math.round(memoryUsage.heapTotal / 1024 / 1024)} MB`,
          heapUsed: `${Math.round(memoryUsage.heapUsed / 1024 / 1024)} MB`,
          external: `${Math.round(memoryUsage.external / 1024 / 1024)} MB`
        }
      },
      application: {
        environment: process.env.NODE_ENV || 'development',
        timestamp: new Date().toISOString()
      }
    };

    // Log the diagnostics action
    await SystemLog.create({
      type: 'diagnostics',
      action: 'system_diagnostics_run',
      status: 'success',
      performedBy: req.user.id,
      details: diagnostics
    });

    res.json({
      status: 'success',
      data: { diagnostics }
    });
  } catch (error) {
    await SystemLog.create({
      type: 'diagnostics',
      action: 'system_diagnostics_run',
      status: 'failed',
      performedBy: req.user.id,
      details: { error: error.message }
    });

    res.status(500).json({ message: error.message });
  }
});

// Backup Database
router.post('/backup', auth, async (req, res) => {
  try {
    if (req.user.role !== 'admin') {
      return res.status(403).json({ message: 'Access denied' });
    }

    const backupDir = path.join(process.cwd(), 'backups');
    if (!fs.existsSync(backupDir)) {
      fs.mkdirSync(backupDir);
    }

    const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
    const backupFile = path.join(backupDir, `backup-${timestamp}.json`);

    // Get all data from collections
    const collections = mongoose.connection.collections;
    const backupData = {};

    for (const [collectionName, collection] of Object.entries(collections)) {
      try {
        const data = await collection.find({}).toArray();
        backupData[collectionName] = data;
      } catch (error) {
        console.error(`Error backing up ${collectionName}:`, error);
      }
    }

    // Write backup to file
    fs.writeFileSync(backupFile, JSON.stringify(backupData, null, 2));

    // Log the backup action
    await SystemLog.create({
      type: 'backup',
      action: 'database_backup',
      status: 'success',
      description: `Backup created: ${backupFile}`,
      performedBy: req.user.id,
      details: {
        backupFile,
        collections: Object.keys(backupData),
        size: `${Math.round(Buffer.byteLength(JSON.stringify(backupData)) / 1024)} KB`
      }
    });

    res.json({
      status: 'success',
      message: 'Backup created successfully',
      data: {
        backupFile,
        size: `${Math.round(Buffer.byteLength(JSON.stringify(backupData)) / 1024)} KB`,
        collections: Object.keys(backupData)
      }
    });
  } catch (error) {
    await SystemLog.create({
      type: 'backup',
      action: 'database_backup',
      status: 'failed',
      performedBy: req.user.id,
      details: { error: error.message }
    });

    res.status(500).json({ message: error.message });
  }
});

// Clear Cache
router.post('/clear-cache', auth, async (req, res) => {
  try {
    if (req.user.role !== 'admin') {
      return res.status(403).json({ message: 'Access denied' });
    }

    const cacheTypes = req.body.cacheTypes || ['all'];

    let cleared = [];

    if (cacheTypes.includes('all') || cacheTypes.includes('memory')) {
      if (global.gc) {
        global.gc();
        cleared.push('memory');
      }
    }

    // You can add more cache clearing logic here
    // For example: Redis cache, file cache, etc.

    // Log the cache clear action
    await SystemLog.create({
      type: 'cache_clear',
      action: 'cache_cleared',
      status: 'success',
      description: `Cache types cleared: ${cleared.join(', ')}`,
      performedBy: req.user.id,
      details: { clearedCacheTypes: cleared }
    });

    res.json({
      status: 'success',
      message: 'Cache cleared successfully',
      data: { cleared }
    });
  } catch (error) {
    await SystemLog.create({
      type: 'cache_clear',
      action: 'cache_cleared',
      status: 'failed',
      performedBy: req.user.id,
      details: { error: error.message }
    });

    res.status(500).json({ message: error.message });
  }
});

// Get System Logs
router.get('/logs', auth, async (req, res) => {
  try {
    if (req.user.role !== 'admin') {
      return res.status(403).json({ message: 'Access denied' });
    }

    const { page = 1, limit = 50, type } = req.query;
    const skip = (page - 1) * limit;

    const query = type ? { type } : {};
    const logs = await SystemLog.find(query)
      .populate('performedBy', 'name email')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(parseInt(limit));

    const total = await SystemLog.countDocuments(query);

    res.json({
      status: 'success',
      data: {
        logs,
        pagination: {
          page: parseInt(page),
          limit: parseInt(limit),
          total,
          pages: Math.ceil(total / limit)
        }
      }
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

export default router;