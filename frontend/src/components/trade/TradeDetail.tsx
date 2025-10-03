import { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { useTrade, useTradeProposals } from '@/lib/api/trades';
import { TradeBasket } from './TradeBasket';
import { FilterPanel } from './FilterPanel';
import { InventoryGrid } from './InventoryGrid';
import { TradeStatusBar } from './TradeStatusBar';
import { ProposalCard } from './ProposalCard';
import { ProposalModal } from './ProposalModal';
import { Button } from '@/components/ui/button';
import { Plus } from 'lucide-react';

export function TradeDetail() {
  const { id } = useParams<{ id: string }>();
  const tradeId = parseInt(id || '0', 10);

  const { data: trade, isLoading: tradeLoading } = useTrade(tradeId);
  const { data: tradeWithProposals, isLoading: proposalsLoading } = useTradeProposals(tradeId);

  const [selectedProposal, setSelectedProposal] = useState<any>(null);

  // For demo purposes, if tradeId is 1 and no trade exists, show demo interface
  const isDemoMode = tradeId === 1 && !trade && !tradeLoading;

  if (tradeLoading || proposalsLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (!trade && !isDemoMode) {
    return (
      <div className="min-h-screen bg-background">
        <div className="container mx-auto px-4 py-6">
          <div className="flex items-center justify-center h-96">
            <div className="text-center">
              <h1 className="text-2xl font-bold mb-4">Nie znaleziono wymiany</h1>
              <p className="text-muted-foreground mb-6">
                Wymiana o ID {tradeId} nie istnieje w bazie danych.
              </p>
              <div className="space-x-4">
                <Button
                  onClick={() => window.location.href = '/trade/1'}
                  variant="outline"
                >
                  Zobacz demo (ID: 1)
                </Button>
                <Button>
                  <Plus className="h-4 w-4 mr-2" />
                  Utwórz nową wymianę
                </Button>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Demo mode - show interface even without real trade data
  if (isDemoMode) {
    return (
      <div className="min-h-screen bg-background">
        <div className="container mx-auto px-4 py-6">
          <div className="mb-6">
            <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
              <p className="text-yellow-800 text-sm">
                <strong>Tryb demonstracyjny:</strong> To jest przykładowy interfejs wymiany.
                Żadne dane nie są zapisywane w bazie danych.
              </p>
            </div>
          </div>

          <div className="grid grid-cols-12 gap-4 xl:gap-6">
            {/* LEFT: Basket */}
            <div className="col-span-12 xl:col-span-4">
              <TradeBasket tradeId={tradeId} isCreator={false} />
            </div>

            {/* MIDDLE: Filters */}
            <div className="col-span-12 xl:col-span-2 order-3 xl:order-none">
              <FilterPanel />
            </div>

            {/* RIGHT: Inventory */}
            <div className="col-span-12 xl:col-span-6">
              <div className="space-y-4">
                <InventoryGrid tradeId={tradeId} isCreator={false} />
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Calculate creator status and proposals
  const isCreator = tradeWithProposals?.proposals.length > 0 && tradeWithProposals.proposals.some(p => p.proposal.proposerId !== trade.creatorId);
  const proposals = tradeWithProposals?.proposals || [];

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-6">
        <div className="grid grid-cols-12 gap-4 xl:gap-6">
          {/* LEFT: Basket */}
          <div className="col-span-12 xl:col-span-4">
            <TradeBasket tradeId={tradeId} isCreator={isCreator} />
          </div>

          {/* MIDDLE: Filters */}
          <div className="col-span-12 xl:col-span-2 order-3 xl:order-none">
            <FilterPanel />
          </div>

          {/* RIGHT: Inventory/Proposals */}
          <div className="col-span-12 xl:col-span-6">
            <div className="space-y-4">
              {trade && <TradeStatusBar trade={trade} />}

              {isCreator && proposals.length > 0 ? (
                <div className="space-y-4">
                  <h2 className="text-lg font-semibold">Propozycje ({proposals.length})</h2>
                  <div className="space-y-3">
                    {proposals.map(({ proposal, items }) => (
                      <ProposalCard
                        key={proposal.id}
                        proposal={{ ...proposal, items }}
                        tradeStatus={trade?.status || 'open'}
                        isCreator={isCreator}
                        onClick={() => setSelectedProposal({ ...proposal, items })}
                      />
                    ))}
                  </div>
                </div>
              ) : (
                <InventoryGrid tradeId={tradeId} isCreator={isCreator} />
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Proposal Modal */}
      {selectedProposal && (
        <ProposalModal
          isOpen={!!selectedProposal}
          onClose={() => setSelectedProposal(null)}
          proposal={selectedProposal}
          tradeStatus={trade?.status || 'open'}
          isCreator={isCreator}
        />
      )}
    </div>
  );
}
