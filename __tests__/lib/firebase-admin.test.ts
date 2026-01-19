import { jest } from '@jest/globals';

// Mock firebase-admin
jest.mock('firebase-admin', () => {
  const firestore = jest.fn(() => ({
    collection: jest.fn(),
  }));
  const auth = jest.fn();
  const storage = jest.fn();
  const credential = {
    cert: jest.fn(),
  };
  const app = {
    firestore,
    auth,
    storage,
  };

  return {
    apps: [],
    initializeApp: jest.fn(() => app),
    credential,
    firestore,
    auth,
    storage,
  };
});

describe('Firebase Admin Initialization', () => {
  const originalEnv = process.env;

  beforeEach(() => {
    jest.resetModules();
    process.env = { ...originalEnv };
    delete process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID;
    process.env.FIREBASE_PROJECT_ID = 'test-project';
    process.env.FIREBASE_CLIENT_EMAIL = 'test@example.com';
    process.env.FIREBASE_PRIVATE_KEY = '-----BEGIN PRIVATE KEY-----\nMIIEvgIBADANBgkqhkiG9w0BAQEFAASCBKgwggSkAgEAAoIBAQD\n-----END PRIVATE KEY-----';
  });

  afterEach(() => {
    process.env = originalEnv;
  });

  it('should initialize firebase-admin with credentials', async () => {
    const admin = require('firebase-admin');
    
    // This MUST succeed for the test to pass.
    // Since the file doesn't exist yet, this import will throw "Cannot find module"
    // which causes the test to FAIL (Red).
    await import('@/lib/firebase-admin');

    expect(admin.initializeApp).toHaveBeenCalled();
    expect(admin.credential.cert).toHaveBeenCalledWith({
      projectId: 'test-project',
      clientEmail: 'test@example.com',
      privateKey: expect.stringContaining('PRIVATE KEY'),
    });
  });
});