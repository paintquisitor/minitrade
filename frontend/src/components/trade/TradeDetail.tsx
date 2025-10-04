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

  // For demo purposes, if tradeId is one of our mock trades and no trade exists, show demo interface
  const mockTradeIds = [1, 2, 3, 4];
  const isDemoMode = mockTradeIds.includes(tradeId) && !trade && !tradeLoading;

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
                <Button onClick={() => window.location.href = '/trades/create'}>
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

  // Demo mode - show interface with mock trade data
  if (isDemoMode) {
    // Mock trade data based on the TradesList data
    const mockTradesData = {
      1: {
        id: 1,
        title: 'Sprzedaję AK-47 Fire Serpent ST MW',
        type: 'WTS',
        status: 'open',
        creatorId: 1,
        creator: 'GamerPro123',
        createdAt: '2024-01-15T10:30:00Z',
        body: 'Doskonały stan, niski float, StatTrak. Cena negocjowalna.',
        tags: ['AK-47', 'Fire Serpent', 'StatTrak', 'Minimal Wear'],
      },
      2: {
        id: 2,
        title: 'Szukam AWP Dragon Lore',
        type: 'WTB',
        status: 'open',
        creatorId: 2,
        creator: 'SkinCollector',
        createdAt: '2024-01-15T09:15:00Z',
        body: 'Poszukuję AWP Dragon Lore w dobrym stanie. Płace dobrze!',
        tags: ['AWP', 'Dragon Lore', 'Souvenir'],
      },
      3: {
        id: 3,
        title: 'Wymienię M4A4 Howl za Karambit Fade',
        type: 'WTT',
        status: 'closed',
        creatorId: 3,
        creator: 'TradeMaster',
        createdAt: '2024-01-14T16:45:00Z',
        body: 'M4A4 Howl FT + dopłata za Karambit Fade FN.',
        tags: ['M4A4', 'Howl', 'Karambit', 'Fade'],
      },
      4: {
        id: 4,
        title: 'Sprzedaję kolekcję noży',
        type: 'WTS',
        status: 'open',
        creatorId: 4,
        creator: 'KnifeExpert',
        createdAt: '2024-01-15T08:20:00Z',
        body: 'Karambit, Butterfly, M9 Bayonet - różne skiny i warunki.',
        tags: ['Karambit', 'Butterfly', 'M9 Bayonet', 'Kolekcja'],
      },
    };

    const mockTrade = mockTradesData[tradeId as keyof typeof mockTradesData];
    const isCreator = mockTrade?.creatorId === 1; // Assume current user is creator for demo

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
            <div className="col-span-12 xl:col-span-5">
              <TradeBasket tradeId={tradeId} isCreator={isCreator} />
            </div>

            {/* RIGHT: Trade Details & Inventory/Proposals */}
            <div className="col-span-12 xl:col-span-7">
              <div className="space-y-4">
                {/* Trade Items Display */}
                {mockTrade && (
                  <div className="bg-[#242532] rounded-lg border border-gray-700 p-4">
                    <h2 className="text-lg font-semibold text-white mb-4">
                      {isCreator ? 'Oferta wymiany' : 'Przedmioty w wymianie'}
                    </h2>

                    {/* Trade Items */}
                    <div className="space-y-4">
                      {/* Creator's Items (if creator) or Trade Items */}
                      {isCreator && mockTrade.type === 'WTS' && (
                        <div>
                          <h3 className="text-sm font-medium text-gray-300 mb-2">Oferuję:</h3>
                          <div className="grid grid-cols-4 gap-2">
                            {/* Mock creator items */}
                            <div className="bg-[#1e1f2e] rounded border border-gray-600 p-2">
                              <img src="/placeholder.svg" alt="AK-47 Fire Serpent" className="w-full aspect-square object-cover rounded mb-2" />
                              <div className="text-xs text-white text-center">AK-47 Fire Serpent</div>
                              <div className="text-xs text-green-400 text-center">48 205 zł</div>
                            </div>
                          </div>
                        </div>
                      )}

                      {isCreator && mockTrade.type === 'WTB' && (
                        <div>
                          <h3 className="text-sm font-medium text-gray-300 mb-2">Szukam:</h3>
                          <div className="text-center py-4 text-gray-400">
                            <p className="text-sm">Szukam AWP Dragon Lore</p>
                            <p className="text-xs">w dobrym stanie</p>
                          </div>
                        </div>
                      )}

                      {isCreator && mockTrade.type === 'WTT' && (
                        <div className="grid grid-cols-2 gap-4">
                          <div>
                            <h3 className="text-sm font-medium text-gray-300 mb-2">Oferuję:</h3>
                            <div className="grid grid-cols-2 gap-1">
                              <div className="bg-[#1e1f2e] rounded border border-gray-600 p-1">
                                <img src="/placeholder.svg" alt="M4A4 Howl" className="w-full aspect-square object-cover rounded" />
                              </div>
                            </div>
                          </div>
                          <div>
                            <h3 className="text-sm font-medium text-gray-300 mb-2">Chcę:</h3>
                            <div className="grid grid-cols-2 gap-1">
                              <div className="bg-[#1e1f2e] rounded border border-gray-600 p-1">
                                <img src="/placeholder.svg" alt="Karambit Fade" className="w-full aspect-square object-cover rounded" />
                              </div>
                            </div>
                          </div>
                        </div>
                      )}

                      {!isCreator && (
                        <div className="text-center py-4 text-gray-400">
                          <p className="text-sm">Zobacz szczegóły tej wymiany</p>
                          <p className="text-xs mt-1">Kliknij aby zobaczyć przedmioty</p>
                        </div>
                      )}

                      {/* Trade Description */}
                      {mockTrade.body && (
                        <div className="mt-4 p-3 bg-[#1e1f2e] rounded border border-gray-600">
                          <p className="text-sm text-gray-300">{mockTrade.body}</p>
                        </div>
                      )}
                    </div>
                  </div>
                )}

                {mockTrade && <TradeStatusBar trade={mockTrade} />}

                {isCreator ? (
                  <div className="space-y-4">
                    <h2 className="text-lg font-semibold">Propozycje ({mockTrade?.proposalsCount || 0})</h2>
                    <div className="space-y-3">
                      {/* Mock proposals would go here */}
                      <div className="text-center py-8 text-muted-foreground">
                        Brak propozycji dla tej wymiany (demo)
                      </div>
                    </div>
                  </div>
                ) : (
                  <InventoryGrid tradeId={tradeId} isCreator={isCreator} />
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Calculate creator status and proposals
  const isCreator = tradeWithProposals?.proposals && tradeWithProposals.proposals.length > 0 && tradeWithProposals.proposals.some(p => p.proposal.proposerId !== trade.creatorId);
  const proposals = tradeWithProposals?.proposals || [];

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-6">
        <div className="grid grid-cols-12 gap-4 xl:gap-6">
          {/* LEFT: Basket */}
          <div className="col-span-12 xl:col-span-5">
            <TradeBasket tradeId={tradeId} isCreator={isCreator} />
          </div>

          {/* RIGHT: Trade Details & Inventory/Proposals */}
          <div className="col-span-12 xl:col-span-7">
            <div className="space-y-4">
              {/* Trade Items Display */}
              <div className="bg-[#242532] rounded-lg border border-gray-700 p-4">
                <h2 className="text-lg font-semibold text-white mb-4">
                  Szczegóły wymiany
                </h2>

                {/* Trade Items */}
                <div className="space-y-4">
                  {/* Trade Description */}
                  {trade.body && (
                    <div className="p-3 bg-[#1e1f2e] rounded border border-gray-600">
                      <p className="text-sm text-gray-300">{trade.body}</p>
                    </div>
                  )}

                  {/* Trade Items Preview */}
                  <div className="text-center py-4 text-gray-400">
                    <p className="text-sm">Przedmioty w wymianie będą widoczne po implementacji</p>
                    <p className="text-xs mt-1">Aktualnie w trybie demonstracyjnym</p>
                  </div>
                </div>
              </div>

              {trade && <TradeStatusBar trade={trade} />}

              {/* Trade Images */}
              {trade && trade.imageUrls && Array.isArray(trade.imageUrls) && trade.imageUrls.length > 0 && (
                <div className="bg-[#242532] rounded-lg border border-gray-700 p-4">
                  <h3 className="text-lg font-semibold text-white mb-4">Zdjęcia przedmiotów</h3>
                  <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                    {trade.imageUrls.map((imageUrl: string, index: number) => (
                      <div key={index} className="aspect-square bg-[#1e1f2e] rounded border border-gray-600 overflow-hidden relative">
                        <img
                          src={`${imageUrl}`}
                          alt={`Trade item ${index + 1}`}
                          className="w-full h-full object-cover"
                          onLoad={(e) => {
                            console.log('Image loaded successfully:', imageUrl);
                            // Hide loading placeholder when image loads
                            (e.target as HTMLImageElement).nextElementSibling?.classList.add('hidden');
                          }}
                          onError={(e) => {
                            console.warn('Image failed to load after trying:', `${imageUrl}`);
                            // Hide the broken image and show a placeholder
                            (e.target as HTMLImageElement).style.display = 'none';
                            (e.target as HTMLImageElement).nextElementSibling?.classList.remove('hidden');
                          }}
                        />
                        <div className="absolute inset-0 bg-gray-600 flex items-center justify-center text-gray-400 text-sm">
                          Loading...
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

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
