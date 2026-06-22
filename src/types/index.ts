export type ContractStatus =
  | "PENDING_DELIVERY"
  | "DELIVERED"
  | "AGENT_EVALUATING"
  | "APPROVED"
  | "DISPUTED"
  | "SETTLED"
  | "REFUNDED";

export interface Freelancer {
  id: string;
  name: string;
  walletAddress: string;
  circleWalletId?: string | null;
  bio?: string | null;
  avatarColor: string;
  createdAt: string;
}

export interface Service {
  id: string;
  slug: string;
  title: string;
  description: string;
  priceUsdc: number;
  freelancer: Freelancer;
  isActive: boolean;
  createdAt: string;
}

export interface Contract {
  id: string;
  serviceId: string;
  service: Service;
  freelancerId: string;
  clientName: string;
  clientEmail?: string | null;
  brief: string;
  amountUsdc: number;
  platformFee: number;
  netAmountUsdc: number;
  status: ContractStatus;
  escrowTxHash?: string | null;
  settleTxHash?: string | null;
  agentScore?: number | null;
  agentReasoning?: string | null;
  deliveryNote?: string | null;
  deliveredAt?: string | null;
  settledAt?: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface DashboardStats {
  totalEarned: number;
  contractsSettled: number;
  contractsPending: number;
  avgSettlementMs: number;
  recentContracts: Contract[];
}
