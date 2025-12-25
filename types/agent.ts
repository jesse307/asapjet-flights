export type Agent = {
  id: string;
  name: string;
  email: string;
  phone: string;
  on_call: boolean;
  active: boolean;
  created_at: string;
  updated_at: string;
};

export type AgentInput = Omit<Agent, 'id' | 'created_at' | 'updated_at'>;

export type AgentUpdate = Partial<AgentInput>;
