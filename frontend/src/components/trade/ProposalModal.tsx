import { useState } from 'react';
import { formatDistanceToNow } from 'date-fns';
import { pl } from 'date-fns/locale';
import { X, Check, AlertTriangle, TrendingUp, TrendingDown } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Separator } from '@/components/ui/separator';
import { useAcceptProposal, useDeclineProposal } from '@/lib/api/trades';

interface ProposalModalProps {
  isOpen: boolean;
  onClose: () => void;
  proposal: {
    id: number;
    proposerId: number;
    creatorCashCents: number;
    proposerCashCents: number;
    status: 'pending' | 'withdrawn' | 'declined' | 'accepted' | 'expired';
    createdAt: string;
    updatedAt: string;
    items?: Array<{
      id: number;
      itemId: number;
      side: 'creator' | 'proposer';
    }>;
  };
  tradeStatus: 'open' | 'closed' | 'cancelled' | 'expired';
  isCreator: boolean;
}

// Mock data for the modal
const mockCreatorItems = [
  { id: 1, name: 'Ultramarine Captain', imageUrl: '/placeholder.svg', estValueCents: 2500 },
  { id: 2, name: 'Tactical Squad', imageUrl: '/placeholder.svg', estValueCents: 1800 },
  { id: 3, name: 'Rhino APC', imageUrl: '/placeholder.svg', estValueCents: 2200 },
  { id: 4, name: 'Dreadnought', imageUrl: '/placeholder.svg', estValueCents: 3000 },
];

const mockProposerItems = [
  { id: 5, name: 'Ork Warboss', imageUrl: '/placeholder.svg', estValueCents: 2800 },
  { id: 6, name: 'Boyz Mob', imageUrl: '/placeholder.svg', estValueCents: 1500 },
  { id: 7, name: 'Trukk', imageUrl: '/placeholder.svg', estValueCents: 1200 },
];

export function ProposalModal({ isOpen, onClose, proposal, tradeStatus, isCreator }: ProposalModalProps) {
  const acceptMutation = useAcceptProposal();
  const declineMutation = useDeclineProposal();
  const canAct = isCreator && tradeStatus === 'open' && proposal.status === 'pending';

  const handleAccept = async () => {
    const actorId = 1; // TODO: get from auth context
    await acceptMutation.mutateAsync({ proposalId: proposal.id, actorId });
    onClose();
  };

  const handleDecline = async () => {
    const actorId = 1; // TODO: get from auth context
    await declineMutation.mutateAsync({ proposalId: proposal.id, actorId });
    onClose();
  };

  const creatorTotal = mockCreatorItems.reduce((sum, item) => sum + item.estValueCents, 0);
  const proposerTotal = mockProposerItems.reduce((sum, item) => sum + item.estValueCents, 0);
  const cashDiff = proposal.proposerCashCents - proposal.creatorCashCents;

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-6xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            Szczegóły propozycji
            <Badge variant={proposal.status === 'pending' ? 'secondary' : 'default'}>
              {proposal.status === 'pending' ? 'Oczekująca' : proposal.status}
            </Badge>
          </DialogTitle>
        </DialogHeader>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Creator Side */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold text-center">Ty oddajesz</h3>

            {/* Items Grid */}
            <div className="grid grid-cols-4 gap-2">
              {mockCreatorItems.map((item) => (
                <div key={item.id} className="aspect-square bg-muted/20 rounded-lg border border-border/40 overflow-hidden">
                  <img
                    src={item.imageUrl}
                    alt={item.name}
                    className="w-full h-full object-cover"
                  />
                  <div className="absolute bottom-0 left-0 right-0 bg-black/60 text-white text-xs p-1 truncate">
                    {item.name}
                  </div>
                </div>
              ))}

              {/* Empty slots */}
              {Array.from({ length: Math.max(0, 12 - mockCreatorItems.length) }, (_, i) => (
                <div key={`empty-creator-${i}`} className="aspect-square bg-muted/10 rounded-lg border-2 border-dashed border-muted-foreground/20 flex items-center justify-center">
                  <span className="text-muted-foreground text-xs">Pusty</span>
                </div>
              ))}
            </div>

            {/* Creator Cash */}
            {proposal.creatorCashCents > 0 && (
              <div className="text-center">
                <Badge variant="outline" className="text-lg px-3 py-1">
                  Dopłata: {proposal.creatorCashCents / 100} zł
                </Badge>
              </div>
            )}

            {/* Creator Total */}
            <div className="text-center">
              <Badge variant="secondary" className="text-sm">
                Wartość: {(creatorTotal / 100).toFixed(2)} zł
              </Badge>
            </div>
          </div>

          {/* Proposer Side */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold text-center">Otrzymasz</h3>

            {/* Items Grid */}
            <div className="grid grid-cols-4 gap-2">
              {mockProposerItems.map((item) => (
                <div key={item.id} className="aspect-square bg-muted/20 rounded-lg border border-border/40 overflow-hidden">
                  <img
                    src={item.imageUrl}
                    alt={item.name}
                    className="w-full h-full object-cover"
                  />
                  <div className="absolute bottom-0 left-0 right-0 bg-black/60 text-white text-xs p-1 truncate">
                    {item.name}
                  </div>
                </div>
              ))}

              {/* Empty slots */}
              {Array.from({ length: Math.max(0, 12 - mockProposerItems.length) }, (_, i) => (
                <div key={`empty-proposer-${i}`} className="aspect-square bg-muted/10 rounded-lg border-2 border-dashed border-muted-foreground/20 flex items-center justify-center">
                  <span className="text-muted-foreground text-xs">Pusty</span>
                </div>
              ))}
            </div>

            {/* Proposer Cash */}
            {proposal.proposerCashCents > 0 && (
              <div className="text-center">
                <Badge variant="outline" className="text-lg px-3 py-1">
                  Otrzymasz: {proposal.proposerCashCents / 100} zł
                </Badge>
              </div>
            )}

            {/* Proposer Total */}
            <div className="text-center">
              <Badge variant="secondary" className="text-sm">
                Wartość: {(proposerTotal / 100).toFixed(2)} zł
              </Badge>
            </div>
          </div>
        </div>

        <Separator />

        {/* Cash Summary */}
        <div className="space-y-4">
          <h4 className="font-medium">Podsumowanie dopłat</h4>

          <div className="flex items-center justify-center gap-4">
            <div className="text-center">
              <div className="text-sm text-muted-foreground">Ty płacisz</div>
              <div className="text-lg font-semibold">
                {proposal.creatorCashCents > 0 ? `${proposal.creatorCashCents / 100} zł` : '0 zł'}
              </div>
            </div>

            <div className="flex items-center gap-2">
              {cashDiff > 0 && <TrendingUp className="h-5 w-5 text-green-600" />}
              {cashDiff < 0 && <TrendingDown className="h-5 w-5 text-red-600" />}
              {cashDiff === 0 && <div className="w-5 h-5" />}
            </div>

            <div className="text-center">
              <div className="text-sm text-muted-foreground">Otrzymujesz</div>
              <div className="text-lg font-semibold">
                {proposal.proposerCashCents > 0 ? `${proposal.proposerCashCents / 100} zł` : '0 zł'}
              </div>
            </div>
          </div>

          {cashDiff !== 0 && (
            <div className="text-center">
              <Badge variant={cashDiff > 0 ? 'default' : 'destructive'}>
                {cashDiff > 0 ? '+' : ''}{cashDiff / 100} zł {cashDiff > 0 ? 'zysku' : 'straty'}
              </Badge>
            </div>
          )}
        </div>

        {/* Info */}
        <div className="bg-muted/20 rounded-lg p-4">
          <div className="flex items-start gap-3">
            <AlertTriangle className="h-5 w-5 text-amber-600 flex-shrink-0 mt-0.5" />
            <div className="text-sm">
              <p className="font-medium mb-1">Uwaga:</p>
              <p className="text-muted-foreground">
                Akceptacja tej propozycji zamknie wymianę i automatycznie odrzuci wszystkie inne oczekujące propozycje.
                Przedmioty zostaną zablokowane do czasu finalizacji transakcji.
              </p>
            </div>
          </div>
        </div>

        {/* Footer Actions */}
        <div className="flex items-center justify-between pt-4 border-t">
          <div className="text-sm text-muted-foreground">
            Propozycja wysłana {formatDistanceToNow(new Date(proposal.createdAt), {
              addSuffix: true,
              locale: pl,
            })}
          </div>

          {canAct && (
            <div className="flex gap-2">
              <Button
                variant="outline"
                className="text-destructive hover:text-destructive"
                onClick={handleDecline}
                disabled={declineMutation.isPending}
              >
                Odrzuć
              </Button>
              <Button
                onClick={handleAccept}
                disabled={acceptMutation.isPending}
              >
                {acceptMutation.isPending ? 'Akceptowanie...' : 'Akceptuj'}
              </Button>
            </div>
          )}

          {!canAct && (
            <Button variant="outline" onClick={onClose}>
              Zamknij
            </Button>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
