export interface Team {
  id: string;

  leadsVisited: Array<{ leadId: string; address: string; timestamp: number }>;

  distinctLeadsCount: number;
}
