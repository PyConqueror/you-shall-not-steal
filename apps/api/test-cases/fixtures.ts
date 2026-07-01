import { ObjectId } from "mongodb";

import type {
  AgentDocument,
  LockerDocument,
  PackageDocument,
} from "../src/types/documents";
import {
  AGENT_STATUS,
  LOCKER_STATUS,
  PACKAGE_SIZE,
  PACKAGE_STATUS,
} from "../src/types/enum";

export const agentObjectId = new ObjectId("507f1f77bcf86cd799439011");
export const smallLockerObjectId = new ObjectId("507f1f77bcf86cd799439012");
export const mediumLockerObjectId = new ObjectId("507f1f77bcf86cd799439013");
export const largeLockerObjectId = new ObjectId("507f1f77bcf86cd799439014");
export const occupiedLockerObjectId = new ObjectId("507f1f77bcf86cd799439015");
export const packageObjectId = new ObjectId("507f1f77bcf86cd799439016");
export const retrievedPackageObjectId = new ObjectId("507f1f77bcf86cd799439017");

export const activeAgent: AgentDocument = {
  _id: agentObjectId,
  agentId: "agent-001",
  name: "Test Agent",
  status: AGENT_STATUS.ACTIVE,
};

export const inactiveAgent: AgentDocument = {
  _id: new ObjectId("507f1f77bcf86cd799439018"),
  agentId: "agent-inactive",
  name: "Inactive Agent",
  status: AGENT_STATUS.INACTIVE,
};

export const smallLocker: LockerDocument = {
  _id: smallLockerObjectId,
  id: "locker-small",
  lockerId: "L001",
  size: PACKAGE_SIZE.SMALL,
  status: LOCKER_STATUS.AVAILABLE,
  currentPackageId: null,
};

export const mediumLocker: LockerDocument = {
  _id: mediumLockerObjectId,
  id: "locker-medium",
  lockerId: "L002",
  size: PACKAGE_SIZE.MEDIUM,
  status: LOCKER_STATUS.AVAILABLE,
  currentPackageId: null,
};

export const largeLocker: LockerDocument = {
  _id: largeLockerObjectId,
  id: "locker-large",
  lockerId: "L003",
  size: PACKAGE_SIZE.LARGE,
  status: LOCKER_STATUS.AVAILABLE,
  currentPackageId: null,
};

export const occupiedLocker: LockerDocument = {
  _id: occupiedLockerObjectId,
  id: "locker-occupied",
  lockerId: "L004",
  size: PACKAGE_SIZE.MEDIUM,
  status: LOCKER_STATUS.OCCUPIED,
  currentPackageId: packageObjectId,
};

export const allAvailableLockers: LockerDocument[] = [
  smallLocker,
  mediumLocker,
  largeLocker,
];

export const storedPackage: PackageDocument = {
  _id: packageObjectId,
  packageId: "pkg_test_001",
  agentId: agentObjectId,
  lockerId: occupiedLockerObjectId,
  packageSize: PACKAGE_SIZE.SMALL,
  pickupCode: "123456",
  customerEmail: null,
  status: PACKAGE_STATUS.STORED,
  droppedOffAt: "2026-01-01T10:00:00.000Z",
  retrievedAt: null,
};

export const storedPackageWithEmail: PackageDocument = {
  ...storedPackage,
  customerEmail: "customer@example.com",
};

export const retrievedPackage: PackageDocument = {
  _id: retrievedPackageObjectId,
  packageId: "pkg_test_retrieved",
  agentId: agentObjectId,
  lockerId: occupiedLockerObjectId,
  packageSize: PACKAGE_SIZE.SMALL,
  pickupCode: "654321",
  customerEmail: null,
  status: PACKAGE_STATUS.RETRIEVED,
  droppedOffAt: "2026-01-01T10:00:00.000Z",
  retrievedAt: "2026-01-02T10:00:00.000Z",
};

export const defaultServerConfig = {
  NODE_ENV: "test" as const,
  HOST: "0.0.0.0",
  PORT: 3001,
  LOG_LEVEL: "silent" as const,
  CORS_ORIGIN: "http://localhost:5173",
  MONGODB_URI: "mongodb://localhost:27017",
  MONGODB_DB_NAME: "test",
  MONGODB_SERVER_SELECTION_TIMEOUT_MS: 5000,
  JWT_SECRET: "test-jwt-secret-that-is-at-least-32-chars",
  AGENT_JWT_TTL_MINUTES: 15,
  RESEND_API_KEY: "re_test_key",
  RESEND_FROM_EMAIL: "noreply@example.com",
};

export const mockDb = {} as import("mongodb").Db;
