import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';

const API_BASE = '/api';

interface Trade {
  id: number;
  creatorId: number;
  type: 'WTB' | 'WTS' | 'WTT';
  title: string;
  body?: string;
  tags?: string[];
  status: 'open' | 'closed' | 'cancelled' | 'expired';
  expiresAt?: string;
  createdAt: string;
  updatedAt: string;
  proposalsCount?: number;
}

interface ProposalItem {
  id: number;
  proposalId: number;
  itemId: number;
  side: 'creator' | 'proposer';
}

interface Proposal {
  id: number;
  tradeId: number;
  proposerId: number;
  creatorCashCents: number;
  proposerCashCents: number;
  status: 'pending' | 'withdrawn' | 'declined' | 'accepted' | 'expired';
  createdAt: string;
  updatedAt: string;
  items?: ProposalItem[];
}

interface CreateProposalData {
  proposerId: number;
  creatorCashCents?: number;
  proposerCashCents?: number;
  items?: Array<{
    itemId: number;
    side: 'creator' | 'proposer';
  }>;
}

interface TradeWithProposals {
  trade: Trade;
  proposals: Array<{
    proposal: Proposal;
    items: ProposalItem[];
  }>;
}

// Helper function for API calls
async function apiRequest<T>(url: string, options?: RequestInit): Promise<T> {
  const response = await fetch(`${API_BASE}${url}`, {
    headers: {
      'Content-Type': 'application/json',
      ...options?.headers,
    },
    ...options,
  });

  if (!response.ok) {
    const error = await response.json().catch(() => ({ error: 'Network error' }));
    throw new Error(error.error || `HTTP ${response.status}`);
  }

  return response.json();
}

export function useTrade(tradeId: number) {
  return useQuery({
    queryKey: ['trade', tradeId],
    queryFn: () => apiRequest<{ success: true; data: Trade }>(`/v1/trades/${tradeId}`),
    select: (data) => data.data,
    enabled: !!tradeId,
  });
}

export function useTradeProposals(tradeId: number) {
  return useQuery({
    queryKey: ['tradeProposals', tradeId],
    queryFn: () => apiRequest<{ success: true; data: TradeWithProposals }>(`/v1/trades/${tradeId}/proposals`),
    select: (data) => data.data,
    enabled: !!tradeId,
  });
}

export function useAcceptProposal() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ proposalId, actorId }: { proposalId: number; actorId: number }) =>
      apiRequest(`/v1/proposals/${proposalId}/accept`, {
        method: 'POST',
        body: JSON.stringify({ actorId }),
      }),
    onSuccess: (data, variables) => {
      // Invalidate related queries
      queryClient.invalidateQueries({ queryKey: ['trade', variables.proposalId] });
      queryClient.invalidateQueries({ queryKey: ['tradeProposals'] });

      toast.success('Propozycja zaakceptowana!');
    },
    onError: (error: Error) => {
      toast.error(`Błąd: ${error.message}`);
    },
  });
}

export function useDeclineProposal() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ proposalId, actorId }: { proposalId: number; actorId: number }) =>
      apiRequest(`/v1/proposals/${proposalId}/decline`, {
        method: 'POST',
        body: JSON.stringify({ actorId }),
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['tradeProposals'] });
      toast.success('Propozycja odrzucona');
    },
    onError: (error: Error) => {
      toast.error(`Błąd: ${error.message}`);
    },
  });
}

export function useComposeProposal() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ tradeId, data }: { tradeId: number; data: CreateProposalData }) =>
      apiRequest(`/v1/trades/${tradeId}/proposals`, {
        method: 'POST',
        body: JSON.stringify(data),
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['tradeProposals', tradeId] });
      toast.success('Propozycja wysłana!');
    },
    onError: (error: Error) => {
      toast.error(`Błąd: ${error.message}`);
    },
  });
}

export function useWithdrawProposal() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ proposalId, actorId }: { proposalId: number; actorId: number }) =>
      apiRequest(`/v1/proposals/${proposalId}/withdraw`, {
        method: 'PATCH',
        body: JSON.stringify({ actorId }),
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['tradeProposals'] });
      toast.success('Propozycja wycofana');
    },
    onError: (error: Error) => {
      toast.error(`Błąd: ${error.message}`);
    },
  });
}
