import { AppError } from '@shared/utils/AppError';
import { authService } from '@apps/sso/server/src/services/auth.service';


export const requireAuth = (options = {}) => {
  return async (req, res, next) => {
    try {
      const sessionToken = req.cookies?.session_token;
      
      if (!sessionToken) {
        if (options.optional) return next();
        throw new AppError('No session token provided', 401);
      }

      const session = await authService.validateSession(sessionToken);
      
      if (!session) {
        res.clearCookie('session_token');
        throw new AppError('Invalid or expired session', 401);
      }

      if (options.role) {
        const requiredRoles = Array.isArray(options.role) ? options.role : [options.role];
        if (!requiredRoles.includes(session.role)) {
          throw new AppError('Insufficient permissions', 403);
        }
      }

      req.user = {
        id: session.userId,
        username: session.username,
        role: session.role
      };
      
      if (sessionToken) {
        await authService.refreshSession(sessionToken);
      }

      next();
    } catch (error) {
      next(error);
    }
  };
};

export const checkAuth = async (req, res, next) => {
  try {
    const sessionToken = req.cookies?.session_token;
    if (sessionToken) {
      const session = await authService.validateSession(sessionToken);
      if (session) {
        req.user = {
          id: session.userId,
          username: session.username,
          role: session.role
        };
        await authService.refreshSession(sessionToken);
      }
    }
  } catch (error) {
    console.error('Auth check error:', error);
  }
  next();
};
