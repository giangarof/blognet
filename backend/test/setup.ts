import { vi } from 'vitest';

// Mock JWT generator
vi.mock('../config/generateToken.js');

// Mock database pool
vi.mock('../config/dbConfig.js');


vi.mock('../middleware/auth', () => ({
  protect: (req: any, res: any, next: any) => {
    req.user = { id: 1, is_admin: false }; // fake logged-in user
    next();
  },
  adminOrOwnerPost: (req: any, res: any, next: any) => next(),
  adminOrOwnerUser: (req: any, res: any, next: any) => next(),
  adminOrOwnerComment: (req: any, res: any, next: any) => next(),
  admin: (req: any, res: any, next: any) => next(),
}));