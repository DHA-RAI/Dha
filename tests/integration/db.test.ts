import Database from 'better-sqlite3';

describe('Database Tests', () => {
  let db: Database.Database;

  beforeAll(() => {
    db = new Database(':memory:');
  });

  afterAll(() => {
    db.close();
  });

  it('should connect to database', () => {
    const result = db.prepare('SELECT 1').get();
    expect(result[1]).toBe(1);
  });
});