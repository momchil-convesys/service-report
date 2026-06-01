import { Router } from 'express';
import { requireAuth } from '../middleware/auth.middleware';
import { AuthService } from '../services/auth.service';

const router = Router();

router.post('/auth/login', (req, res) => {
  const { username, password } = req.body || {};

  if (typeof username !== 'string' || typeof password !== 'string') {
    res.status(400).json({ error: 'Username and password are required' });
    return;
  }

  const user = AuthService.authenticate(username, password);

  if (!user) {
    res.status(401).json({ error: 'Invalid username or password' });
    return;
  }

  res.json({
    token: AuthService.signToken(user),
    user: AuthService.toDto(user),
  });
});

router.get('/user', requireAuth, (req, res) => {
  res.json(AuthService.toDto(req.user!));
});

router.get('/users', requireAuth, (req, res) => {
  if (req.user?.role !== 'superuser') {
    res.json([AuthService.toDto(req.user!)]);
    return;
  }

  res.json(AuthService.getAll().map((user) => AuthService.toDto(user)));
});

export default router;
