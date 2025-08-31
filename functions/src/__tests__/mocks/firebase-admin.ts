// 模擬 Firebase Admin SDK
export const admin = {
  initializeApp: jest.fn(),
  firestore: jest.fn(() => ({
    collection: jest.fn().mockReturnThis(),
    doc: jest.fn().mockReturnThis(),
    get: jest.fn().mockResolvedValue({
      exists: true,
      data: () => ({ test: 'data' }),
      id: 'test-doc-id'
    }),
    set: jest.fn().mockResolvedValue({}),
    update: jest.fn().mockResolvedValue({}),
    delete: jest.fn().mockResolvedValue({}),
    add: jest.fn().mockResolvedValue({ id: 'test-doc-id' }),
    where: jest.fn().mockReturnThis(),
    orderBy: jest.fn().mockReturnThis(),
    limit: jest.fn().mockReturnThis(),
    offset: jest.fn().mockReturnThis()
  })),
  auth: jest.fn(() => ({
    verifyIdToken: jest.fn().mockResolvedValue({
      uid: 'test-user-id',
      email: 'test@example.com'
    }),
    createCustomToken: jest.fn().mockResolvedValue('test-custom-token'),
    setCustomUserClaims: jest.fn().mockResolvedValue({})
  }))
};

export default admin;
