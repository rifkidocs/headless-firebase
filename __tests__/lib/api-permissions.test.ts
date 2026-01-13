import { getPublicPermissions, updatePublicPermissions, checkPublicPermission } from '@/lib/permissions';
import { db } from '@/lib/firebase';
import { doc, getDoc, setDoc } from 'firebase/firestore';

// Mock firebase/firestore
jest.mock('firebase/firestore', () => ({
  doc: jest.fn(),
  getDoc: jest.fn(),
  setDoc: jest.fn(),
  collection: jest.fn(),
  getFirestore: jest.fn(),
}));

jest.mock('@/lib/firebase', () => ({
  db: {},
}));

describe('Public Permissions', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('getPublicPermissions', () => {
    it('should return default permissions if document does not exist', async () => {
      (getDoc as jest.Mock).mockResolvedValue({
        exists: () => false,
      });

      const permissions = await getPublicPermissions('posts');
      expect(permissions).toEqual({
        find: false,
        findOne: false,
        create: false,
        update: false,
        delete: false,
      });
    });

    it('should return stored permissions if document exists', async () => {
      (getDoc as jest.Mock).mockResolvedValue({
        exists: () => true,
        data: () => ({
          find: true,
          findOne: true,
          create: false,
          update: false,
          delete: false,
        }),
      });

      const permissions = await getPublicPermissions('posts');
      expect(permissions).toEqual({
        find: true,
        findOne: true,
        create: false,
        update: false,
        delete: false,
      });
    });
  });

  describe('updatePublicPermissions', () => {
    it('should save permissions to firestore', async () => {
      const permissions = {
        find: true,
        findOne: true,
        create: false,
        update: false,
        delete: false,
      };

      await updatePublicPermissions('posts', permissions);

      expect(doc).toHaveBeenCalledWith(db, '_permissions', 'posts');
      expect(setDoc).toHaveBeenCalledWith(expect.anything(), permissions, { merge: true });
    });
  });

  describe('checkPublicPermission', () => {
    it('should return true if action is allowed', async () => {
      (getDoc as jest.Mock).mockResolvedValue({
        exists: () => true,
        data: () => ({
          find: true,
        }),
      });

      const allowed = await checkPublicPermission('posts', 'find');
      expect(allowed).toBe(true);
    });

    it('should return false if action is not allowed', async () => {
      (getDoc as jest.Mock).mockResolvedValue({
        exists: () => true,
        data: () => ({
          find: false,
        }),
      });

      const allowed = await checkPublicPermission('posts', 'find');
      expect(allowed).toBe(false);
    });
  });
});
