import AdminSetting from '../models/AdminSetting.js';

const maintenanceMiddleware = async (req, res, next) => {
  try {
    // Skip maintenance check for admin users and auth routes
    if (req.user?.role === 'admin' || 
        req.path.startsWith('/api/auth') ||
        req.path === '/api/admin/settings/value/maintenance_mode') {
      return next();
    }

    const isMaintenanceMode = await AdminSetting.getSetting('maintenance_mode', false);
    
    if (isMaintenanceMode) {
      const maintenanceMessage = await AdminSetting.getSetting(
        'maintenance_message', 
        'System is under maintenance. Please try again later.'
      );
      
      return res.status(503).json({
        status: 'error',
        message: 'Service Unavailable',
        data: {
          maintenance: true,
          message: maintenanceMessage
        }
      });
    }
    
    next();
  } catch (error) {
    // If there's an error checking maintenance mode, allow the request to proceed
    console.error('Maintenance middleware error:', error);
    next();
  }
};

export default maintenanceMiddleware;