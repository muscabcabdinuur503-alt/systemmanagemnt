import { Request, Response, NextFunction } from 'express';
import { adminAuth } from '../lib/firebase-admin.ts';

export interface AuthRequest extends Request {
  user?: {
    id: string;
    username: string;
    role: string;
    name: string;
    email?: string | null;
  };
}

// Simple session token manager for the hybrid custom database logins
const sessionStore = new Map<string, { id: string; username: string; role: string; name: string; email?: string | null }>();

export function createSessionToken(user: { id: string; username: string; role: string; name: string; email?: string | null }): string {
  const tokenId = `sess_${Math.random().toString(36).substring(2)}${Date.now().toString(36)}`;
  sessionStore.set(tokenId, user);
  return tokenId;
}

export function removeSession(tokenId: string) {
  sessionStore.delete(tokenId);
}

export const requireAuth = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
) => {
  const authHeader = req.headers.authorization;
  if (!authHeader) {
    return res.status(401).json({ error: 'Unauthorized: Missing registration credentials' });
  }

  // 1. Firebase Auth support
  if (authHeader.startsWith('Bearer ')) {
    const token = authHeader.split('Bearer ')[1];
    try {
      const decodedToken = await adminAuth.verifyIdToken(token);
      req.user = {
        id: decodedToken.uid,
        username: decodedToken.email ? decodedToken.email.split('@')[0] : 'google_user',
        role: (decodedToken.role as string) || 'Parent', // Default Google login is Parent
        name: decodedToken.name || decodedToken.email || 'Google User',
        email: decodedToken.email || null,
      };
      return next();
    } catch (error) {
      console.error('Error verifying Firebase ID token:', error);
      return res.status(401).json({ error: 'Unauthorized: Invalid Firebase session' });
    }
  }

  // 2. Hybrid custom session token support
  if (authHeader.startsWith('Session ')) {
    const token = authHeader.split('Session ')[1];
    const session = sessionStore.get(token);
    if (!session) {
      return res.status(401).json({ error: 'Unauthorized: Session expired or invalid' });
    }
    req.user = session;
    return next();
  }

  return res.status(401).json({ error: 'Unauthorized: Unsupported authentication format' });
};
