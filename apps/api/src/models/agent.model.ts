import type { Collection, Db } from 'mongodb'

import type { AgentEntity } from '@/types/entities'
import { AGENT_STATUS } from '@/types/enum'

export const AGENT_COLLECTION_NAME = 'agents' as const

export const AgentModelFields = {
  agentId: { type: String, required: true, unique: true },
  name: { type: String, required: true },
  status: { type: String, enum: AGENT_STATUS, required: true, default: AGENT_STATUS.ACTIVE },
}

export function getAgentsCollection(db: Db): Collection<AgentEntity> {
  return db.collection<AgentEntity>(AGENT_COLLECTION_NAME)
}

export async function ensureAgentIndexes(db: Db): Promise<void> {
  await getAgentsCollection(db).createIndex(
    { agentId: 1 },
    { unique: true, name: 'agents_agentId_unique' },
  )
}
