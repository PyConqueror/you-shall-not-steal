type MockAgent = {
  agentId: string;
  name: string;
  status: "active" | "inactive";
};

export const mockAgents: MockAgent[] = [
  {
    agentId: "AGT-1001",
    name: "Ali Delivery",
    status: "active",
  },
  {
    agentId: "AGT-1002",
    name: "Siti Express",
    status: "active",
  },
  {
    agentId: "AGT-1003",
    name: "Kumar Logistics",
    status: "active",
  },
];
