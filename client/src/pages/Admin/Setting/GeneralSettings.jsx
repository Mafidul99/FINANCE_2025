/* eslint-disable no-unused-vars */
import React, { useState, useEffect } from 'react';
import { useAuth } from '../../../contexts/AuthContext';
import axios from 'axios';
import { 
  Save, 
  RefreshCw, 
  Building, 
  Coins,
  Globe,
  Calendar,
  CheckCircle,
  XCircle,
  AlertTriangle
} from 'lucide-react';

const GeneralSettings = () => {
  const { user } = useAuth();
  const [settings, setSettings] = useState({});
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState({ type: '', text: '' });

  // Default settings structure
  const defaultSettings = {
    system_name: { value: '', loading: false },
    currency: { value: '', loading: false },
    timezone: { value: '', loading: false },
    date_format: { value: '', loading: false }
  };

  useEffect(() => {
    fetchGeneralSettings();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const fetchGeneralSettings = async () => {
    try {
      setLoading(true);
      const response = await axios.get('/api/admin/general-settings');
      const settingsData = response.data.data.settings;
      
      // Transform settings array to object for easier access
      const settingsObj = { ...defaultSettings };
      settingsData.forEach(setting => {
        settingsObj[setting.key] = {
          ...setting,
          loading: false
        };
      });
      
      setSettings(settingsObj);
    } catch (error) {
      console.error('Error fetching general settings:', error);
      showMessage('error', 'Failed to load general settings');
    } finally {
      setLoading(false);
    }
  };

  const handleSettingChange = (key, value) => {
    setSettings(prev => ({
      ...prev,
      [key]: {
        ...prev[key],
        value: value
      }
    }));
  };

  const saveSetting = async (key) => {
    if (!settings[key] || settings[key].loading) return;

    try {
      setSettings(prev => ({
        ...prev,
        [key]: { ...prev[key], loading: true }
      }));

      await axios.put(`/api/admin/general-settings/${key}`, {
        value: settings[key].value
      });

      showMessage('success', `${key.replace('_', ' ')} updated successfully`);
    } catch (error) {
      console.error(`Error saving ${key}:`, error);
      showMessage('error', `Failed to update ${key.replace('_', ' ')}`);
    } finally {
      setSettings(prev => ({
        ...prev,
        [key]: { ...prev[key], loading: false }
      }));
    }
  };

  const saveAllSettings = async () => {
    try {
      setSaving(true);
      
      const settingsArray = Object.entries(settings)
        .filter(([key, setting]) => setting.value !== undefined)
        .map(([key, setting]) => ({
          key,
          value: setting.value
        }));

      const response = await axios.put('/api/admin/general-settings', {
        settings: settingsArray
      });

      if (response.data.data.errors && response.data.data.errors.length > 0) {
        showMessage('warning', `Some settings were not updated: ${response.data.data.errors.map(e => e.key).join(', ')}`);
      } else {
        showMessage('success', 'All settings updated successfully');
      }
    } catch (error) {
      console.error('Error saving all settings:', error);
      showMessage('error', 'Failed to update settings');
    } finally {
      setSaving(false);
    }
  };

  const initializeSettings = async () => {
    try {
      await axios.post('/api/admin/general-settings/initialize');
      showMessage('success', 'General settings initialized to defaults');
      fetchGeneralSettings();
    } catch (error) {
      showMessage('error', 'Failed to initialize settings');
    }
  };

  const showMessage = (type, text) => {
    setMessage({ type, text });
    setTimeout(() => setMessage({ type: '', text: '' }), 5000);
  };

  const SettingField = ({ settingKey, icon, title, description, type = 'text', options = [] }) => {
    const setting = settings[settingKey];
    
    if (!setting) return null;

    return (
      <div className="p-6 mb-6 bg-white border border-gray-200 rounded-lg">
        <div className="flex items-start justify-between">
          <div className="flex-1">
            <div className="flex items-center mb-3">
              <div className="p-2 mr-4 bg-blue-100 rounded-lg">
                {icon}
              </div>
              <div>
                <h3 className="text-lg font-semibold text-gray-900">{title}</h3>
                <p className="text-sm text-gray-600">{description}</p>
              </div>
            </div>
            
            <div className="flex items-center mt-4 space-x-4">
              {type === 'select' ? (
                <select
                  value={setting.value || ''}
                  onChange={(e) => handleSettingChange(settingKey, e.target.value)}
                  className="flex-1 max-w-md px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="">Select {title}</option>
                  {options.map((option, index) => (
                    <option key={index} value={option.value}>
                      {option.label}
                    </option>
                  ))}
                </select>
              ) : (
                <input
                  type={type}
                  value={setting.value || ''}
                  onChange={(e) => handleSettingChange(settingKey, e.target.value)}
                  className="flex-1 max-w-md px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder={`Enter ${title}`}
                />
              )}
              
              <button
                onClick={() => saveSetting(settingKey)}
                disabled={setting.loading}
                className="flex items-center px-4 py-2 text-white transition-colors bg-blue-600 rounded-md hover:bg-blue-700 disabled:opacity-50"
              >
                {setting.loading ? (
                  <RefreshCw className="w-4 h-4 animate-spin" />
                ) : (
                  <Save className="w-4 h-4" />
                )}
                <span className="ml-2">Save</span>
              </button>
            </div>
            
            {setting.validation && (
              <div className="mt-2 text-sm text-gray-500">
                {setting.validation.min && `Min: ${setting.validation.min} `}
                {setting.validation.max && `Max: ${setting.validation.max} `}
                {setting.validation.required && 'Required'}
              </div>
            )}
          </div>
        </div>
      </div>
    );
  };

  if (user?.role !== 'admin') {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <AlertTriangle className="w-12 h-12 mx-auto text-red-500" />
          <h2 className="mt-4 text-lg font-semibold text-gray-900">Access Denied</h2>
          <p className="mt-2 text-gray-600">Admin privileges required to access settings.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl px-4 py-8 mx-auto sm:px-6 lg:px-8">
      {/* Header */}
      <div className="mb-8">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">General Settings</h1>
            <p className="mt-2 text-gray-600">Manage your application's basic configuration</p>
          </div>
          <div className="flex space-x-3">
            <button
              onClick={initializeSettings}
              className="flex items-center px-4 py-2 text-white transition-colors bg-gray-600 rounded-lg hover:bg-gray-700"
            >
              <RefreshCw className="w-4 h-4 mr-2" />
              Reset Defaults
            </button>
            <button
              onClick={saveAllSettings}
              disabled={saving}
              className="flex items-center px-6 py-2 text-white transition-colors bg-blue-600 rounded-lg hover:bg-blue-700 disabled:opacity-50"
            >
              <Save className="w-4 h-4 mr-2" />
              {saving ? 'Saving...' : 'Save All'}
            </button>
          </div>
        </div>
      </div>

      {/* Message */}
      {message.text && (
        <div className={`mb-6 p-4 rounded-lg flex items-center ${
          message.type === 'success' 
            ? 'bg-green-50 text-green-800 border border-green-200' 
            : message.type === 'warning'
            ? 'bg-yellow-50 text-yellow-800 border border-yellow-200'
            : 'bg-red-50 text-red-800 border border-red-200'
        }`}>
          {message.type === 'success' ? (
            <CheckCircle className="w-5 h-5 mr-2" />
          ) : message.type === 'warning' ? (
            <AlertTriangle className="w-5 h-5 mr-2" />
          ) : (
            <XCircle className="w-5 h-5 mr-2" />
          )}
          {message.text}
        </div>
      )}

      {/* Settings Content */}
      <div className="bg-white rounded-lg shadow">
        <div className="p-6">
          {loading ? (
            <div className="flex justify-center py-8">
              <RefreshCw className="w-8 h-8 text-blue-600 animate-spin" />
            </div>
          ) : (
            <div>
              <SettingField
                settingKey="system_name"
                icon={<Building className="w-6 h-6 text-blue-600" />}
                title="System Name"
                description="The name of your financial application displayed throughout the system"
                type="text"
              />

              <SettingField
                settingKey="currency"
                icon={<Coins className="w-6 h-6 text-green-600" />}
                title="Default Currency"
                description="Primary currency for all financial transactions and displays"
                type="select"
                options={settings.currency?.options || []}
              />

              <SettingField
                settingKey="timezone"
                icon={<Globe className="w-6 h-6 text-purple-600" />}
                title="Timezone"
                description="Default timezone for the application"
                type="select"
                options={settings.timezone?.options || []}
              />

              <SettingField
                settingKey="date_format"
                icon={<Calendar className="w-6 h-6 text-orange-600" />}
                title="Date Format"
                description="Default date format used throughout the application"
                type="select"
                options={settings.date_format?.options || []}
              />

              {/* Settings Summary */}
              <div className="p-6 mt-8 rounded-lg bg-gray-50">
                <h3 className="mb-4 text-lg font-semibold text-gray-900">Current Configuration</h3>
                <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-4">
                  <div className="p-4 text-center bg-white border rounded">
                    <p className="text-sm text-gray-600">System Name</p>
                    <p className="text-lg font-semibold text-gray-900">
                      {settings.system_name?.value || 'Not set'}
                    </p>
                  </div>
                  <div className="p-4 text-center bg-white border rounded">
                    <p className="text-sm text-gray-600">Currency</p>
                    <p className="text-lg font-semibold text-gray-900">
                      {settings.currency?.value || 'Not set'}
                    </p>
                  </div>
                  <div className="p-4 text-center bg-white border rounded">
                    <p className="text-sm text-gray-600">Timezone</p>
                    <p className="text-lg font-semibold text-gray-900">
                      {settings.timezone?.value || 'Not set'}
                    </p>
                  </div>
                  <div className="p-4 text-center bg-white border rounded">
                    <p className="text-sm text-gray-600">Date Format</p>
                    <p className="text-lg font-semibold text-gray-900">
                      {settings.date_format?.value || 'Not set'}
                    </p>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default GeneralSettings;