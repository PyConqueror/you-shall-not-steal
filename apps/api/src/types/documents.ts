import type { WithId } from "mongodb";

import type { AgentEntity, LockerEntity, PackageEntity } from "./entities";

export type AgentDocument = WithId<AgentEntity>;
export type LockerDocument = WithId<LockerEntity>;
export type PackageDocument = WithId<PackageEntity>;
