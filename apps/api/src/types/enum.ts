export enum RESPONSE_STATUS {
  SUCCESS = "success",
  ERROR = "error",
}

export type ResponseStatus = `${RESPONSE_STATUS}`;

export enum PACKAGE_SIZE {
  SMALL = "small",
  MEDIUM = "medium",
  LARGE = "large",
}

export type PackageSize = `${PACKAGE_SIZE}`;

export enum LOCKER_STATUS {
  AVAILABLE = "available",
  OCCUPIED = "occupied",
  MAINTENANCE = "maintenance",
}

export type LockerStatus = `${LOCKER_STATUS}`;

export enum PACKAGE_STATUS {
  STORED = "stored",
  RETRIEVED = "retrieved",
}

export type PackageStatus = `${PACKAGE_STATUS}`;

export enum AGENT_STATUS {
  ACTIVE = "active",
  INACTIVE = "inactive",
}

export type AgentStatus = `${AGENT_STATUS}`;
