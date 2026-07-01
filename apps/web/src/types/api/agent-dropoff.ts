import type { Locker, PackageSize } from "@/types/domain";
import type { PackageLockerResult, PackageResult } from "@/types/api/common";

export type AgentDropoffLockersResponse = {
  lockers: Locker[];
  recommendedLocker: Locker | null;
};

export type ConfirmAgentDropoffInput = {
  packageSize: PackageSize;
  lockerId: string;
};

export type ConfirmAgentDropoffResponse = PackageLockerResult;

export type SendEmailInput = {
  packageId: string;
  customerEmail: string;
};

export type SendEmailResponse = PackageResult;

export type UpdateAgentDropoffTimeInput = {
  packageId: string;
  droppedOffAt: string;
};

export type UpdateAgentDropoffTimeResponse = PackageResult;
