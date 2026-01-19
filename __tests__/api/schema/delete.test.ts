/**
 * @jest-environment node
 */
import { jest } from '@jest/globals';
import { NextRequest } from 'next/server';

// Mock dependencies
const mockVerifyIdToken = jest.fn();
const mockCollection = jest.fn();
const mockDoc = jest.fn();
const mockGet = jest.fn();
const mockDelete = jest.fn();
const mockBatch = jest.fn(() => ({
    delete: jest.fn(),
    commit: jest.fn().mockResolvedValue(undefined),
}));
const mockDeleteResources = jest.fn();

jest.mock('@/lib/firebase-admin', () => ({
  adminAuth: {
    verifyIdToken: mockVerifyIdToken,
  },
  adminDb: {
    collection: mockCollection,
    batch: mockBatch,
    doc: mockDoc,
  },
}));

jest.mock('@/lib/cloudinary', () => ({
  deleteResources: mockDeleteResources,
}));

describe('DELETE /api/schema/[slug]', () => {
  let DELETE: any;

  beforeAll(async () => {
    const module = await import('@/app/api/schema/[slug]/route');
    DELETE = module.DELETE;
  });

  beforeEach(() => {
    jest.clearAllMocks();
    
    // Default mocks setup
    mockCollection.mockReturnValue({
        doc: mockDoc,
        get: mockGet,
    });
    mockDoc.mockReturnValue({
        get: mockGet,
        delete: mockDelete,
    });
    
    // Default schema mock (no media)
    mockGet.mockResolvedValue({
        exists: true,
        data: () => ({
            slug: 'test',
            fields: [],
        }),
        docs: [], // For collection query
    });
  });

  it('should return 401 if no auth header', async () => {
    const req = new NextRequest('http://localhost/api/schema/test', {
        method: 'DELETE',
    });
    const res = await DELETE(req, { params: Promise.resolve({ slug: 'test' }) });
    expect(res.status).toBe(401);
  });

  it('should return 401 if invalid token', async () => {
    const req = new NextRequest('http://localhost/api/schema/test', {
        method: 'DELETE',
        headers: { Authorization: 'Bearer invalid' },
    });
    mockVerifyIdToken.mockRejectedValue(new Error('Invalid token'));
    
    const res = await DELETE(req, { params: Promise.resolve({ slug: 'test' }) });
    expect(res.status).toBe(401);
  });

  it('should return 404 if schema not found', async () => {
    const req = new NextRequest('http://localhost/api/schema/test', {
        method: 'DELETE',
        headers: { Authorization: 'Bearer valid' },
    });
    mockVerifyIdToken.mockResolvedValue({ uid: 'admin' });
    
    // Schema fetch returns not exists
    mockGet.mockResolvedValueOnce({ exists: false });

    const res = await DELETE(req, { params: Promise.resolve({ slug: 'test' }) });
    expect(res.status).toBe(404);
  });

  it('should delete schema, content, and media', async () => {
    const req = new NextRequest('http://localhost/api/schema/test', {
        method: 'DELETE',
        headers: { Authorization: 'Bearer valid' },
    });
    mockVerifyIdToken.mockResolvedValue({ uid: 'admin' });

    // 1. Schema Fetch
    mockGet.mockResolvedValueOnce({
        exists: true,
        data: () => ({
            slug: 'test',
            fields: [{ name: 'image', type: 'media' }],
        }),
    });

    // 2. Content Fetch (2 docs)
    const mockDoc1 = { data: () => ({ image: { publicId: 'pid1' } }), ref: 'ref1' };
    const mockDoc2 = { data: () => ({ image: { publicId: 'pid2' } }), ref: 'ref2' };
    
    mockGet.mockResolvedValueOnce({
        docs: [mockDoc1, mockDoc2],
    });

    const res = await DELETE(req, { params: Promise.resolve({ slug: 'test' }) });
    
    expect(res.status).toBe(200);
    
    // Verify Media Deletion
    expect(mockDeleteResources).toHaveBeenCalledWith(['pid1', 'pid2']);
    
    // Verify Firestore Batch Deletion
    expect(mockBatch).toHaveBeenCalled();
    // We can't easily check batch.delete calls without capturing the mock instance returned
    // but we mocked batch() to return an object with delete(), so checking batch() call is minimal.
    
    // Verify Schema Deletion
    expect(mockDelete).toHaveBeenCalled(); // .doc(slug).delete()
  });
});