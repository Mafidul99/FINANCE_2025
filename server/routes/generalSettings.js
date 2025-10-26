import express from 'express';
import AdminSetting from '../models/AdminSetting.js';
import auth from '../middleware/auth.js';

const router = express.Router();

// Get all general settings
router.get('/', auth, async (req, res) => {
  try {
    if (req.user.role !== 'admin') {
      return res.status(403).json({
        status: 'error',
        message: 'Access denied. Admin privileges required.'
      });
    }

    const settings = await AdminSetting.getByCategory('general');
    
    res.json({
      status: 'success',
      data: {
        settings,
        count: settings.length
      }
    });
  } catch (error) {
    console.error('Error fetching general settings:', error);
    res.status(500).json({
      status: 'error',
      message: 'Failed to fetch general settings',
      error: error.message
    });
  }
});

// Get specific general setting by key
router.get('/:key', auth, async (req, res) => {
  try {
    if (req.user.role !== 'admin') {
      return res.status(403).json({
        status: 'error',
        message: 'Access denied. Admin privileges required.'
      });
    }

    const { key } = req.params;
    const setting = await AdminSetting.findOne({ 
      key, 
      category: 'general' 
    });

    if (!setting) {
      return res.status(404).json({
        status: 'error',
        message: `Setting '${key}' not found in general category`
      });
    }

    res.json({
      status: 'success',
      data: { setting }
    });
  } catch (error) {
    console.error(`Error fetching setting ${req.params.key}:`, error);
    res.status(500).json({
      status: 'error',
      message: 'Failed to fetch setting',
      error: error.message
    });
  }
});

// Update general setting
router.put('/:key', auth, async (req, res) => {
  try {
    if (req.user.role !== 'admin') {
      return res.status(403).json({
        status: 'error',
        message: 'Access denied. Admin privileges required.'
      });
    }

    const { key } = req.params;
    const { value } = req.body;

    if (value === undefined || value === null) {
      return res.status(400).json({
        status: 'error',
        message: 'Value is required'
      });
    }

    const setting = await AdminSetting.setValue(key, value);

    res.json({
      status: 'success',
      message: `Setting '${key}' updated successfully`,
      data: { setting }
    });
  } catch (error) {
    console.error(`Error updating setting ${req.params.key}:`, error);
    
    if (error.message.includes('not found')) {
      return res.status(404).json({
        status: 'error',
        message: error.message
      });
    }
    
    if (error.message.includes('not editable') || error.message.includes('Invalid value type')) {
      return res.status(400).json({
        status: 'error',
        message: error.message
      });
    }

    res.status(500).json({
      status: 'error',
      message: 'Failed to update setting',
      error: error.message
    });
  }
});

// Update multiple general settings
router.put('/', auth, async (req, res) => {
  try {
    if (req.user.role !== 'admin') {
      return res.status(403).json({
        status: 'error',
        message: 'Access denied. Admin privileges required.'
      });
    }

    const { settings } = req.body;

    if (!settings || !Array.isArray(settings)) {
      return res.status(400).json({
        status: 'error',
        message: 'Settings array is required'
      });
    }

    const results = [];
    const errors = [];

    for (const item of settings) {
      try {
        const { key, value } = item;
        
        if (!key || value === undefined || value === null) {
          errors.push({
            key,
            error: 'Key and value are required'
          });
          continue;
        }

        const setting = await AdminSetting.setValue(key, value);
        results.push({
          key,
          success: true,
          value: setting.value
        });
      } catch (error) {
        errors.push({
          key: item.key,
          error: error.message
        });
      }
    }

    res.json({
      status: 'success',
      message: `Updated ${results.length} settings successfully`,
      data: {
        updated: results,
        errors: errors.length > 0 ? errors : undefined
      }
    });
  } catch (error) {
    console.error('Error updating multiple settings:', error);
    res.status(500).json({
      status: 'error',
      message: 'Failed to update settings',
      error: error.message
    });
  }
});

// Get system name (public endpoint)
router.get('/public/system-name', async (req, res) => {
  try {
    const systemName = await AdminSetting.getValue('system_name', 'FinancePro');
    
    res.json({
      status: 'success',
      data: { systemName }
    });
  } catch (error) {
    console.error('Error fetching system name:', error);
    res.status(500).json({
      status: 'error',
      message: 'Failed to fetch system name'
    });
  }
});

// Get currency (public endpoint)
router.get('/public/currency', async (req, res) => {
  try {
    const currency = await AdminSetting.getValue('currency', 'INR');
    
    res.json({
      status: 'success',
      data: { currency }
    });
  } catch (error) {
    console.error('Error fetching currency:', error);
    res.status(500).json({
      status: 'error',
      message: 'Failed to fetch currency'
    });
  }
});

// Initialize general settings (admin only)
router.post('/initialize', auth, async (req, res) => {
  try {
    if (req.user.role !== 'admin') {
      return res.status(403).json({
        status: 'error',
        message: 'Access denied. Admin privileges required.'
      });
    }

    await AdminSetting.initializeGeneralSettings();
    
    const settings = await AdminSetting.getByCategory('general');

    res.json({
      status: 'success',
      message: 'General settings initialized successfully',
      data: {
        settings,
        count: settings.length
      }
    });
  } catch (error) {
    console.error('Error initializing general settings:', error);
    res.status(500).json({
      status: 'error',
      message: 'Failed to initialize general settings',
      error: error.message
    });
  }
});

export default router;