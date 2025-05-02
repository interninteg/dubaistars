import 'express-session';

declare module 'express-session' {
  interface SessionData {
    userId?: number;
    username?: string;
  }
}

// No need to redefine the session type in Express namespace