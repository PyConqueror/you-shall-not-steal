import { ObjectId, type Collection, type Db } from 'mongodb'

import type { LockerEntity } from '@/types/entities'
import { LOCKER_STATUS, PACKAGE_SIZE } from '@/types/enum'

export const LOCKER_COLLECTION_NAME = 'lockers' as const

export const LockerModelFields = {
  id: { type: String, required: true, index: true },
  lockerId: { type: String, required: true, unique: true },
  size: { type: String, enum: PACKAGE_SIZE, required: true },
  status: { type: String, enum: LOCKER_STATUS, required: true, default: LOCKER_STATUS.AVAILABLE },
  currentPackageId: { type: ObjectId, ref: 'packages', required: false },
}

export function getLockersCollection(db: Db): Collection<LockerEntity> {
  return db.collection<LockerEntity>(LOCKER_COLLECTION_NAME)
}

export async function ensureLockerIndexes(db: Db): Promise<void> {
  await getLockersCollection(db).createIndex(
    { lockerId: 1 },
    { unique: true, name: 'lockers_lockerId_unique' },
  )
}