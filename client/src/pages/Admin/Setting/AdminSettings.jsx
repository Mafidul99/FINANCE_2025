/* eslint-disable no-unused-vars */
import React, { useState, useEffect } from 'react';
import { useAuth } from '../../../contexts/AuthContext';
import axios from 'axios';
import { 
  Save, 
  RefreshCw, 
  Settings, 
  Shield,
  CreditCard,
  Bell,
  Globe,
  AlertTriangle,
  CheckCircle,
  XCircle,
  Database,
  Cpu,
  Trash2,
  Download,
  Activity,
  Server
} from 'lucide-react';

const AdminSettings = () => {
  const { user } = useAuth();
  const [settings, setSettings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [activeTab, setActiveTab] = useState('general');
  const [message, setMessage] = useState({ type: '', text: '' });
  const [diagnostics, setDiagnostics] = useState(null);
  const [backupLoading, setBackupLoading] = useState(false);
  const [cacheLoading, setCacheLoading] = useState(false);

  const tabs = [
    { id: 'general', name: 'General Settings', icon: <Globe className="w-5 h-5" /> },
    { id: 'loan', name: 'Loan Settings', icon: <CreditCard className="w-5 h-5" /> },
    { id: 'notifications', name: 'Notifications', icon: <Bell className="w-5 h-5" /> },
    { id: 'system', name: 'System Tools', icon: <Server className="w-5 h-5" /> }
  ];

  useEffect(() => {
    if (activeTab !== 'system') {
      fetchSettings();
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [activeTab]);

  const fetchSettings = async () => {
    try {
      setLoading(true);
      let category = activeTab;
      if (activeTab === 'notifications') category = 'notification';
      
      const response = await axios.get(`/api/admin/settings/category/${category}`);
      setSettings(response.data.data.settings);
    } catch (error) {
      showMessage('error', 'Failed to fetch settings');
    } finally {
      setLoading(false);
    }
  };

  const handleSettingChange = (key, newValue) => {
    setSettings(prev => prev.map(setting => 
      setting.key === key ? { ...setting, value: newValue } : setting
    ));
  };

  const saveSettings = async () => {
    try {
      setSaving(true);
      const changes = settings.map(({ key, value }) => ({ key, value }));
      
      await axios.put('/api/admin/settings', { settings: changes });
      showMessage('success', 'Settings saved successfully');
    } catch (error) {
      showMessage('error', 'Failed to save settings');
    } finally {
      setSaving(false);
    }
  };

  const initializeDefaults = async () => {
    try {
      await axios.post('/api/admin/settings/initialize');
      showMessage('success', 'Default settings initialized');
      fetchSettings();
    } catch (error) {
      showMessage('error', 'Failed to initialize settings');
    }
  };

  const runDiagnostics = async () => {
    try {
      const response = await axios.get('/api/admin/system/diagnostics');
      setDiagnostics(response.data.data.diagnostics);
      showMessage('success', 'System diagnostics completed');
    } catch (error) {
      showMessage('error', 'Failed to run diagnostics');
    }
  };

  const backupDatabase = async () => {
    try {
      setBackupLoading(true);
      const response = await axios.post('/api/admin/system/backup');
      showMessage('success', `Backup created: ${response.data.data.backupFile}`);   
    } catch (error) {
      showMessage('error', 'Failed to create backup');
    } finally {
      setBackupLoading(false);
    }
  };

  const clearCache = async () => {
    try {
      setCacheLoading(true);
      await axios.post('/api/admin/system/clear-cache', {
        cacheTypes: ['memory']
      });
      showMessage('success', 'Cache cleared successfully');
    } catch (error) {
      showMessage('error', 'Failed to clear cache');
    } finally {
      setCacheLoading(false);
    }
  };

  const showMessage = (type, text) => {
    setMessage({ type, text });
    setTimeout(() => setMessage({ type: '', text: '' }), 5000);
  };

  const renderInput = (setting) => {
    const commonProps = {
      value: setting.value,
      onChange: (e) => handleSettingChange(setting.key, getValue(e, setting.type)),
      disabled: !setting.editable,
      className: `w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${
        !setting.editable ? 'bg-gray-100 cursor-not-allowed' : 'bg-white'
      }`
    };

    switch (setting.type) {
      case 'boolean':
        return (
          <label className="inline-flex items-center">
            <input
              type="checkbox"
              checked={setting.value}
              onChange={(e) => handleSettingChange(setting.key, e.target.checked)}
              disabled={!setting.editable}
              className="text-blue-600 border-gray-300 rounded focus:ring-blue-500"
            />
            <span className="ml-2 text-sm text-gray-600">
              {setting.value ? 'Enabled' : 'Disabled'}
            </span>
          </label>
        );

      case 'number':
        return (
          <div className="relative">
            <input 
              type="number" 
              {...commonProps}
              step={setting.key.includes('interest') ? '0.1' : '1'}
            />
            {setting.key.includes('interest') && (
              <span className="absolute text-gray-500 right-3 top-2">%</span>
            )}
          </div>
        );

      default:
        return setting.options ? (
          <select {...commonProps}>
            {setting.options.map((option, index) => (
              <option key={index} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
        ) : (
          <input type="text" {...commonProps} />
        );
    }
  };

  const getValue = (e, type) => {
    switch (type) {
      case 'number':
        return parseFloat(e.target.value) || 0;
      case 'boolean':
        return e.target.checked;
      default:
        return e.target.value;
    }
  };

  const renderSystemTools = () => (
    <div className="space-y-6">
      {/* System Diagnostics */}
      <div className="p-6 bg-white border border-gray-200 rounded-lg">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h3 className="flex items-center text-lg font-semibold text-gray-900">
              <Activity className="w-5 h-5 mr-2 text-blue-600" />
              System Diagnostics
            </h3>
            <p className="text-sm text-gray-600">Check system health and performance</p>
          </div>
          <button
            onClick={runDiagnostics}
            className="flex items-center px-4 py-2 text-white transition-colors bg-blue-600 rounded-lg hover:bg-blue-700"
          >
            <Cpu className="w-4 h-4 mr-2" />
            Run Diagnostics
          </button>
        </div>

        {diagnostics && (
          <div className="grid grid-cols-1 gap-4 mt-4 text-sm md:grid-cols-2">
            <div className="p-4 rounded-lg bg-gray-50">
              <h4 className="mb-2 font-semibold">Database</h4>
              <p>Status: <span className={`font-medium ${diagnostics.database.status === 'connected' ? 'text-green-600' : 'text-red-600'}`}>
                {diagnostics.database.status}
              </span></p>
              <p>Name: {diagnostics.database.databaseName}</p>
              <p>Models: {diagnostics.database.models.length}</p>
            </div>
            <div className="p-4 rounded-lg bg-gray-50">
              <h4 className="mb-2 font-semibold">Server</h4>
              <p>Uptime: {Math.round(diagnostics.server.uptime / 60)} minutes</p>
              <p>Node: {diagnostics.server.nodeVersion}</p>
              <p>Platform: {diagnostics.server.platform}</p>
            </div>
            <div className="p-4 rounded-lg bg-gray-50 md:col-span-2">
              <h4 className="mb-2 font-semibold">Memory Usage</h4>
              <div className="grid grid-cols-2 gap-2 md:grid-cols-4">
                <p>RSS: {diagnostics.server.memory.rss}</p>
                <p>Heap Total: {diagnostics.server.memory.heapTotal}</p>
                <p>Heap Used: {diagnostics.server.memory.heapUsed}</p>
                <p>External: {diagnostics.server.memory.external}</p>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Backup & Cache */}
      <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
        {/* Backup Database */}
        <div className="p-6 bg-white border border-gray-200 rounded-lg">
          <div className="flex items-center mb-4">
            <Database className="w-5 h-5 mr-2 text-green-600" />
            <h3 className="text-lg font-semibold text-gray-900">Backup Database</h3>
          </div>
          <p className="mb-4 text-sm text-gray-600">
            Create a complete backup of the database. This will save all application data to a file.
          </p>
          <button
            onClick={backupDatabase}
            disabled={backupLoading}
            className="flex items-center justify-center w-full px-4 py-2 text-white transition-colors bg-green-600 rounded-lg hover:bg-green-700 disabled:opacity-50"
          >
            <Download className="w-4 h-4 mr-2" />
            {backupLoading ? 'Creating Backup...' : 'Backup Database'}
          </button>
        </div>

        {/* Clear Cache */}
        <div className="p-6 bg-white border border-gray-200 rounded-lg">
          <div className="flex items-center mb-4">
            <Trash2 className="w-5 h-5 mr-2 text-orange-600" />
            <h3 className="text-lg font-semibold text-gray-900">Clear Cache</h3>
          </div>
          <p className="mb-4 text-sm text-gray-600">
            Clear system cache to free up memory and resolve potential performance issues.
          </p>
          <button
            onClick={clearCache}
            disabled={cacheLoading}
            className="flex items-center justify-center w-full px-4 py-2 text-white transition-colors bg-orange-600 rounded-lg hover:bg-orange-700 disabled:opacity-50"
          >
            <Trash2 className="w-4 h-4 mr-2" />
            {cacheLoading ? 'Clearing Cache...' : 'Clear Cache'}
          </button>
        </div>
      </div>

      {/* Reset to Defaults */}
      <div className="p-6 bg-white border border-gray-200 rounded-lg">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="flex items-center text-lg font-semibold text-gray-900">
              <RefreshCw className="w-5 h-5 mr-2 text-red-600" />
              Reset to Defaults
            </h3>
            <p className="text-sm text-gray-600">
              Reset all settings to their default values. This action cannot be undone.
            </p>
          </div>
          <button
            onClick={initializeDefaults}
            className="flex items-center px-4 py-2 text-white transition-colors bg-red-600 rounded-lg hover:bg-red-700"
          >
            <RefreshCw className="w-4 h-4 mr-2" />
            Reset All Settings
          </button>
        </div>
      </div>
    </div>
  );

  if (user?.role !== 'admin') {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <AlertTriangle className="w-12 h-12 mx-auto text-red-500" />
          <h2 className="mt-4 text-lg font-semibold text-gray-900">Access Denied</h2>
          <p className="mt-2 text-gray-600">You don't have permission to access this page.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-6xl px-4 py-8 mx-auto sm:px-6 lg:px-8">
      {/* Header */}
      <div className="mb-8">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Admin Settings</h1>
            <p className="mt-2 text-gray-600">Manage application settings and system configuration</p>
          </div>
          {activeTab !== 'system' && (
            <div className="flex space-x-3">
              <button
                onClick={saveSettings}
                disabled={saving}
                className="flex items-center px-6 py-2 text-white transition-colors bg-blue-600 rounded-lg hover:bg-blue-700 disabled:opacity-50"
              >
                <Save className="w-4 h-4 mr-2" />
                {saving ? 'Saving...' : 'Save Changes'}
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Message */}
      {message.text && (
        <div className={`mb-6 p-4 rounded-lg flex items-center ${
          message.type === 'success' 
            ? 'bg-green-50 text-green-800 border border-green-200' 
            : 'bg-red-50 text-red-800 border border-red-200'
        }`}>
          {message.type === 'success' ? (
            <CheckCircle className="w-5 h-5 mr-2" />
          ) : (
            <XCircle className="w-5 h-5 mr-2" />
          )}
          {message.text}
        </div>
      )}

      <div className="bg-white rounded-lg shadow">
        <div className="border-b border-gray-200">
          <nav className="flex -mb-px">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center px-6 py-4 border-b-2 font-medium text-sm ${
                  activeTab === tab.id
                    ? 'border-blue-500 text-blue-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                {tab.icon}
                <span className="ml-2">{tab.name}</span>
              </button>
            ))}
          </nav>
        </div>

        <div className="p-6">
          {activeTab === 'system' ? (
            renderSystemTools()
          ) : loading ? (
            <div className="flex justify-center py-8">
              <RefreshCw className="w-8 h-8 text-blue-600 animate-spin" />
            </div>
          ) : (
            <div className="space-y-6">
              {settings.map((setting) => (
                <div key={setting.key} className="flex items-start justify-between p-4 border border-gray-200 rounded-lg">
                  <div className="flex-1">
                    <div className="flex items-center justify-between">
                      <h3 className="text-lg font-medium text-gray-900">
                        {setting.key.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase())}
                      </h3>
                      {!setting.editable && (
                        <span className="inline-flex items-center px-2 py-1 text-xs font-medium text-gray-800 bg-gray-100 rounded-full">
                          Read Only
                        </span>
                      )}
                    </div>
                    <p className="mt-1 text-sm text-gray-600">{setting.description}</p>
                    <div className="w-full max-w-md mt-3">
                      {renderInput(setting)}
                    </div>
                  </div>
                </div>
              ))}
              
              {settings.length === 0 && (
                <div className="py-8 text-center">
                  <Settings className="w-12 h-12 mx-auto text-gray-400" />
                  <p className="mt-4 text-gray-600">No settings found for this category.</p>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default AdminSettings;