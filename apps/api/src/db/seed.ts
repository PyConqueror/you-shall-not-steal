import { ObjectId, type Db } from 'mongodb'
import { createMockPackages, mockAgents, mockLockers } from 'shared'
import {
  getAgentsCollection,
  getLockersCollection,
  getPackagesCollection,
} from '@/models'

function getRequiredObjectId(
  mapping: Map<string, ObjectId>,
  key: string,
  fieldName: string,
): ObjectId {
  const value = mapping.get(key)

  if (!value) {
    throw new Error(`Missing seed reference for ${fieldName}: ${key}`)
  }

  return value
}

export async function seedDatabaseIfEmpty(db: Db): Promise<boolean> {
  const agentsCollection = getAgentsCollection(db)
  const lockersCollection = getLockersCollection(db)
  const packagesCollection = getPackagesCollection(db)

  const [agentCount, lockerCount, packageCount] = await Promise.all([
    agentsCollection.countDocuments({}),
    lockersCollection.countDocuments({}),
    packagesCollection.countDocuments({}),
  ])

  if (agentCount > 0 || lockerCount > 0 || packageCount > 0) {
    console.info('Skipping mock data seed because the database already contains data.')
    return false
  }

  const agentObjectIds = new Map(
    mockAgents.map((agent) => [agent.agentId, new ObjectId()] as const),
  )

  const lockerObjectIds = new Map(
    mockLockers.map((locker) => [locker.lockerId, new ObjectId()] as const),
  )

  const packageMocks = createMockPackages()

  const packageDocuments = packageMocks.map((pkg) => ({
    _id: new ObjectId(),
    ...pkg,
    agentId: getRequiredObjectId(agentObjectIds, pkg.agentId, 'agentId'),
    lockerId: getRequiredObjectId(lockerObjectIds, pkg.lockerId, 'lockerId'),
  }))

  const packageObjectIds = new Map(
    packageDocuments.map((pkg) => [pkg.packageId, pkg._id] as const),
  )

  const agentDocuments = mockAgents.map((agent) => ({
    _id: getRequiredObjectId(agentObjectIds, agent.agentId, 'agentId'),
    ...agent,
  }))

  const lockerDocuments = mockLockers.map((locker) => ({
    _id: getRequiredObjectId(lockerObjectIds, locker.lockerId, 'lockerId'),
    ...locker,
    currentPackageId: locker.currentPackageId
      ? getRequiredObjectId(packageObjectIds, locker.currentPackageId, 'currentPackageId')
      : null,
  }))

  await Promise.all([
    agentsCollection.insertMany(agentDocuments),
    lockersCollection.insertMany(lockerDocuments),
    packagesCollection.insertMany(packageDocuments),
  ])

  console.info('Seeded mock data into the empty database.')
  return true
}
