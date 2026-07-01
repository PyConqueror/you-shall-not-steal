import { mock } from "bun:test";

export type MockFindCursor = {
  toArray: ReturnType<typeof mock>;
  sort?: ReturnType<typeof mock>;
};

export type MockedCollection = {
  findOne: ReturnType<typeof mock>;
  find: ReturnType<typeof mock>;
  findOneAndUpdate: ReturnType<typeof mock>;
  insertOne: ReturnType<typeof mock>;
  updateOne: ReturnType<typeof mock>;
};

function createFindCursor(defaultResults: unknown[] = []): MockFindCursor {
  const cursor: MockFindCursor = {
    toArray: mock(() => Promise.resolve(defaultResults)),
    sort: mock(() => cursor),
  };

  return cursor;
}

function createMockedCollection(): MockedCollection {
  return {
    findOne: mock(() => Promise.resolve(null)),
    find: mock(() => createFindCursor()),
    findOneAndUpdate: mock(() => Promise.resolve(null)),
    insertOne: mock(() => Promise.resolve({ acknowledged: true })),
    updateOne: mock(() => Promise.resolve({ acknowledged: true })),
  };
}

export const mockedAgentsCollection = createMockedCollection();
export const mockedLockersCollection = createMockedCollection();
export const mockedPackagesCollection = createMockedCollection();

export function resetMockedCollections(): void {
  for (const collection of [
    mockedAgentsCollection,
    mockedLockersCollection,
    mockedPackagesCollection,
  ]) {
    collection.findOne.mockReset();
    collection.find.mockReset();
    collection.findOneAndUpdate.mockReset();
    collection.insertOne.mockReset();
    collection.updateOne.mockReset();

    collection.findOne.mockImplementation(() => Promise.resolve(null));
    collection.find.mockImplementation(() => createFindCursor());
    collection.findOneAndUpdate.mockImplementation(() => Promise.resolve(null));
    collection.insertOne.mockImplementation(() =>
      Promise.resolve({ acknowledged: true }),
    );
    collection.updateOne.mockImplementation(() =>
      Promise.resolve({ acknowledged: true }),
    );
  }
}

export function mockFindToArray(
  collection: MockedCollection,
  results: unknown[],
): void {
  collection.find.mockImplementation(() => ({
    toArray: mock(() => Promise.resolve(results)),
    sort: mock(function (this: MockFindCursor) {
      return this;
    }),
  }));
}
