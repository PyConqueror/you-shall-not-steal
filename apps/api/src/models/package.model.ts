import { ObjectId, type Collection, type Db } from 'mongodb'

import type { PackageEntity } from '@/types/entities'
import { PACKAGE_SIZE, PACKAGE_STATUS } from '@/types/enum'

export const PACKAGE_COLLECTION_NAME = 'packages' as const

export const PackageModelFields = {
  packageId: { type: String, required: true, unique: true },
  agentId: { type: ObjectId, ref: 'agents', required: true },
  lockerId: { type: ObjectId, ref: 'lockers', required: true },
  packageSize: { type: String, enum: PACKAGE_SIZE, required: true },
  pickupCode: { type: String, required: true },
  customerEmail: { type: String, required: false },
  status: { type: String, enum: PACKAGE_STATUS, required: true },
  droppedOffAt: { type: String, required: true },
  retrievedAt: { type: String, required: false },
  storageChargeAmount: { type: Number, required: false },
  chargeableDays: { type: Number, required: false },
}

export function getPackagesCollection(db: Db): Collection<PackageEntity> {
  return db.collection<PackageEntity>(PACKAGE_COLLECTION_NAME)
}

export async function ensurePackageIndexes(db: Db): Promise<void> {
  await Promise.all([
    getPackagesCollection(db).createIndex(
      { lockerId: 1, pickupCode: 1, status: 1 },
      { name: 'packages_lookup_idx' },
    ),
    getPackagesCollection(db).createIndex(
      { pickupCode: 1, status: 1 },
      { name: 'packages_active_pickupCode_idx' },
    ),
    getPackagesCollection(db).createIndex(
      { status: 1 },
      { name: 'packages_status_idx' },
    ),
  ])
}
