import jwt from 'jsonwebtoken';
import User from '../models/User.js';

export const authMiddleware = async (req, res, next) => {
  try {
    const token = req.header('Authorization')?.replace('Bearer ', '');
    
    if (!token) {
      return res.status(401).json({ 
        error: 'Access denied. No token provided.' 
      });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'your-secret-key');
    const user = await User.findById(decoded.userId).select('-password');
    
    if (!user) {
      return res.status(401).json({ 
        error: 'Invalid token. User not found.' 
      });
    }

    if (!user.isActive) {
      return res.status(401).json({ 
        error: 'Account is deactivated.' 
      });
    }

    req.user = user;
    next();
  } catch (error) {
    if (error.name === 'JsonWebTokenError') {
      return res.status(401).json({ 
        error: 'Invalid token.' 
      });
    }
    if (error.name === 'TokenExpiredError') {
      return res.status(401).json({ 
        error: 'Token expired.' 
      });
    }
    res.status(500).json({ 
      error: 'Server error during authentication.' 
    });
  }
};

export const requireRole = (roles) => {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({ 
        error: 'Authentication required.' 
      });
    }

    if (!roles.includes(req.user.role)) {
      return res.status(403).json({ 
        error: 'Insufficient permissions.' 
      });
    }

    next();
  };
};

export const requireSubscription = (minPlan = 'free') => {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({ 
        error: 'Authentication required.' 
      });
    }

    const planHierarchy = {
      'free': 0,
      'basic': 1,
      'pro': 2
    };

    const userPlanLevel = planHierarchy[req.user.subscription.plan] || 0;
    const requiredPlanLevel = planHierarchy[minPlan] || 0;

    if (userPlanLevel < requiredPlanLevel) {
      return res.status(403).json({ 
        error: `This feature requires ${minPlan} subscription or higher.` 
      });
    }

    // Check if subscription is expired
    if (req.user.subscription.expiresAt && new Date() > req.user.subscription.expiresAt) {
      return res.status(403).json({ 
        error: 'Subscription has expired. Please renew to continue.' 
      });
    }

    next();
  };
}; 