import { Request, Response, NextFunction } from 'express';
import { randomUUID } from 'crypto';

const sessions = new Set<string>();

export function isAuthEnabled() {
  return Boolean(process.env.AUTH_USERNAME && process.env.AUTH_PASSWORD);
}

export function authMiddleware(req: Request, res: Response, next: NextFunction) {
  if (!isAuthEnabled()) return next();
  const token = req.cookies?.auth;
  if (token && sessions.has(token)) {
    return next();
  }
  res.status(401).end();
}

export function loginRoute(req: Request, res: Response) {
  if (!isAuthEnabled()) {
    res.status(404).end();
    return;
  }
  const { username, password } = req.body as { username?: string; password?: string };
  if (
    username === process.env.AUTH_USERNAME &&
    password === process.env.AUTH_PASSWORD
  ) {
    const token = randomUUID();
    sessions.add(token);
    res.cookie('auth', token, { httpOnly: true });
    res.json({ success: true });
  } else {
    res.status(401).json({ error: 'Invalid credentials' });
  }
}

export function logoutRoute(req: Request, res: Response) {
  const token = req.cookies?.auth;
  if (token) sessions.delete(token);
  res.clearCookie('auth');
  res.json({ success: true });
}

export function authRequiredInfo(_req: Request, res: Response) {
  res.json({ required: isAuthEnabled() });
}
