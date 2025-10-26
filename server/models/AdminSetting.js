import mongoose from 'mongoose';

const adminSettingSchema = new mongoose.Schema({
  key: {
    type: String,
    required: true,
    unique: true,
    trim: true
  },
  value: {
    type: mongoose.Schema.Types.Mixed,
    required: true
  },
  type: {
    type: String,
    enum: ['string', 'number', 'boolean', 'array', 'object'],
    default: 'string'
  },
  category: {
    type: String,
    enum: ['general', 'loan', 'payment', 'notification', 'security'],
    default: 'general'
  },
  description: {
    type: String,
    required: true
  },
  editable: {
    type: Boolean,
    default: true
  },
  options: [{
    label: String,
    value: mongoose.Schema.Types.Mixed
  }],
  validation: {
    min: Number,
    max: Number,
    pattern: String,
    required: Boolean
  }
}, {
  timestamps: true
});

// Index for faster queries
adminSettingSchema.index({ key: 1 });
adminSettingSchema.index({ category: 1 });

// Static method to get setting value
adminSettingSchema.statics.getValue = async function(key, defaultValue = null) {
  try {
    const setting = await this.findOne({ key });
    return setting ? setting.value : defaultValue;
  } catch (error) {
    console.error(`Error getting setting ${key}:`, error);
    return defaultValue;
  }
};

// Static method to set setting value
adminSettingSchema.statics.setValue = async function(key, value) {
  try {
    const setting = await this.findOne({ key });
    if (!setting) {
      throw new Error(`Setting ${key} not found`);
    }
    
    if (!setting.editable) {
      throw new Error(`Setting ${key} is not editable`);
    }

    // Validate value based on type
    if (!validateValueByType(value, setting.type)) {
      throw new Error(`Invalid value type for ${key}. Expected ${setting.type}`);
    }

    setting.value = value;
    await setting.save();
    return setting;
  } catch (error) {
    console.error(`Error setting ${key}:`, error);
    throw error;
  }
};

// Static method to get all settings by category
adminSettingSchema.statics.getByCategory = async function(category) {
  try {
    return await this.find({ category }).sort({ key: 1 });
  } catch (error) {
    console.error(`Error getting settings for category ${category}:`, error);
    return [];
  }
};

// Initialize default general settings
adminSettingSchema.statics.initializeGeneralSettings = async function() {
  const generalSettings = [
    {
      key: 'system_name',
      value: 'FinancePro',
      type: 'string',
      category: 'general',
      description: 'The name of your financial application displayed throughout the system',
      editable: true,
      validation: {
        required: true,
        min: 2,
        max: 50
      }
    },
    {
      key: 'currency',
      value: 'INR',
      type: 'string',
      category: 'general',
      description: 'Default currency for all financial transactions and displays',
      editable: true,
      options: [
        { label: 'Indian Rupee (₹)', value: 'INR' },
        { label: 'US Dollar ($)', value: 'USD' },
        { label: 'Euro (€)', value: 'EUR' },
        { label: 'British Pound (£)', value: 'GBP' },
        { label: 'Japanese Yen (¥)', value: 'JPY' },
        { label: 'Australian Dollar (A$)', value: 'AUD' },
        { label: 'Canadian Dollar (C$)', value: 'CAD' }
      ],
      validation: {
        required: true
      }
    },
    {
      key: 'system_version',
      value: '1.0.0',
      type: 'string',
      category: 'general',
      description: 'Current version of the application',
      editable: false
    },
    {
      key: 'timezone',
      value: 'Asia/Kolkata',
      type: 'string',
      category: 'general',
      description: 'Default timezone for the application',
      editable: true,
      options: [
        { label: 'IST - India Standard Time', value: 'Asia/Kolkata' },
        { label: 'EST - Eastern Standard Time', value: 'America/New_York' },
        { label: 'PST - Pacific Standard Time', value: 'America/Los_Angeles' },
        { label: 'UTC - Coordinated Universal Time', value: 'UTC' },
        { label: 'GMT - Greenwich Mean Time', value: 'GMT' }
      ]
    },
    {
      key: 'date_format',
      value: 'DD/MM/YYYY',
      type: 'string',
      category: 'general',
      description: 'Default date format used throughout the application',
      editable: true,
      options: [
        { label: 'DD/MM/YYYY', value: 'DD/MM/YYYY' },
        { label: 'MM/DD/YYYY', value: 'MM/DD/YYYY' },
        { label: 'YYYY-MM-DD', value: 'YYYY-MM-DD' },
        { label: 'DD MMM YYYY', value: 'DD MMM YYYY' }
      ]
    }
  ];

  try {
    for (const setting of generalSettings) {
      await this.findOneAndUpdate(
        { key: setting.key },
        setting,
        { upsert: true, new: true }
      );
    }
    console.log('General settings initialized successfully');
  } catch (error) {
    console.error('Error initializing general settings:', error);
    throw error;
  }
};

// Helper function to validate value by type
function validateValueByType(value, type) {
  switch (type) {
    case 'string':
      return typeof value === 'string';
    case 'number':
      return typeof value === 'number' && !isNaN(value);
    case 'boolean':
      return typeof value === 'boolean';
    case 'array':
      return Array.isArray(value);
    case 'object':
      return typeof value === 'object' && value !== null && !Array.isArray(value);
    default:
      return false;
  }
}

export default mongoose.model('AdminSetting', adminSettingSchema);