import type { ObjectId } from 'mongodb'

import type {
  AgentStatus,
  LockerStatus,
  PackageSize,
  PackageStatus,
  ResponseStatus,
} from './enum'

export interface AgentEntity {
  agentId: string
  name: string
  status: AgentStatus
}

export interface LockerEntity {
  id: string
  lockerId: string
  size: PackageSize
  status: LockerStatus
  currentPackageId?: ObjectId | null
}

export interface PackageEntity {
  packageId: string
  agentId: ObjectId
  lockerId: ObjectId
  packageSize: PackageSize
  pickupCode: string
  customerEmail?: string | null
  status: PackageStatus
  droppedOffAt: string
  retrievedAt?: string | null
  storageChargeAmount?: number
  chargeableDays?: number
}

export type Agent = AgentEntity

export type Locker = LockerEntity

export type PackageRecord = PackageEntity

export type ApiError = {
  code: string
  message: string
  details?: Record<string, unknown>
}

export type ResponseModel<TData = unknown> = {
  status: ResponseStatus
  statusCode: number
  data: TData | null
  error?: ApiError
}
