import { jest } from '@jest/globals';

jest.mock('cloudinary', () => ({
  v2: {
    config: jest.fn(),
    uploader: {
        destroy: jest.fn(),
    },
    api: {
        delete_resources: jest.fn(),
    },
    url: jest.fn(),
  },
}));

describe('Cloudinary Library', () => {
  beforeEach(() => {
    jest.resetModules();
    jest.clearAllMocks();
  });

  it('deleteFromCloudinary calls uploader.destroy', async () => {
    const cloudinary = require('cloudinary');
    cloudinary.v2.uploader.destroy.mockImplementation((id: any, opts: any, cb: any) => cb(null, { result: 'ok' }));

    // Import library under test AFTER mocking setup
    const { deleteFromCloudinary } = await import('@/lib/cloudinary');
    
    await deleteFromCloudinary('test-id');
    expect(cloudinary.v2.uploader.destroy).toHaveBeenCalledWith('test-id', { resource_type: 'image' }, expect.any(Function));
  });

  it('deleteResources calls api.delete_resources', async () => {
    const cloudinary = require('cloudinary');
    cloudinary.v2.api.delete_resources.mockImplementation((ids: any, opts: any, cb: any) => cb(null, { deleted: {} }));

    const { deleteResources } = await import('@/lib/cloudinary');

    await deleteResources(['id1', 'id2']);
    expect(cloudinary.v2.api.delete_resources).toHaveBeenCalledWith(['id1', 'id2'], { resource_type: 'image' }, expect.any(Function));
  });
  
  it('deleteResources returns early if empty array', async () => {
    const cloudinary = require('cloudinary');
    const { deleteResources } = await import('@/lib/cloudinary');
    
    await deleteResources([]);
    expect(cloudinary.v2.api.delete_resources).not.toHaveBeenCalled();
  });
});
