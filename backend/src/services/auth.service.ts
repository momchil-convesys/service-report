import jwt, { SignOptions } from 'jsonwebtoken';
import { config } from '../config';

export type AppRole = 'user' | 'superuser';

export interface AppUser {
  id: string;
  username: string;
  email: string;
  displayName: string;
  role: AppRole;
  permissions: string[];
  relatedPlantIds: string[];
}

export interface AuthTokenPayload {
  sub: string;
  username: string;
  role: AppRole;
}

const serviceReportPermissions = ['service-reports:view', 'service-reports:manage'];

const users: AppUser[] = [
  {
    id: 'user',
    username: 'user',
    email: 'user@example.test',
    displayName: 'User',
    role: 'user',
    permissions: serviceReportPermissions,
    relatedPlantIds: ['plant-1'],
  },
  {
    id: 'superuser',
    username: 'superuser',
    email: 'superuser@example.test',
    displayName: 'Superuser',
    role: 'superuser',
    permissions: [...serviceReportPermissions, 'service-reports:delete', 'admin:manage'],
    relatedPlantIds: ['plant-1'],
  },
];

export class AuthService {
  static authenticate(username: string, password: string): AppUser | undefined {
    const normalizedUsername = username.trim().toLowerCase();
    const user = users.find((item) => item.username === normalizedUsername);

    if (!user || password !== user.username) {
      return undefined;
    }

    return user;
  }

  static findById(userId: string): AppUser | undefined {
    return users.find((user) => user.id === userId);
  }

  static getAll(): AppUser[] {
    return users;
  }

  static signToken(user: AppUser): string {
    const payload: AuthTokenPayload = {
      sub: user.id,
      username: user.username,
      role: user.role,
    };

    const options: SignOptions = { expiresIn: config.jwt.expiry as SignOptions['expiresIn'] };

    return jwt.sign(payload, config.jwt.secret, options);
  }

  static verifyToken(token: string): AuthTokenPayload {
    return jwt.verify(token, config.jwt.secret) as AuthTokenPayload;
  }

  static toDto(user: AppUser) {
    return {
      id: user.id,
      email: user.email,
      displayName: user.displayName,
      role: user.role,
      permissions: user.permissions,
      relatedPlantIds: user.relatedPlantIds,
    };
  }
}
