import type { Db } from 'mongodb'

import { ensureAgentIndexes } from './agent.model'
import { ensureLockerIndexes } from './locker.model'
import { ensurePackageIndexes } from './package.model'

export * from './agent.model'
export * from './locker.model'
export * from './package.model'

export async function ensureDatabaseIndexes(db: Db): Promise<void> {
  await Promise.all([
    ensureAgentIndexes(db),
    ensureLockerIndexes(db),
    ensurePackageIndexes(db),
  ])
}
