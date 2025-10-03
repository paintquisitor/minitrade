import { useState } from 'react';
import { formatDistanceToNow } from 'date-fns';
import { pl } from 'date-fns/locale';
import { Check, X, Clock, User, CreditCard } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { useAcceptProposal, useDeclineProposal } from '@/lib/api/trades';

interface ProposalCardProps {
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
  onClick?: () => void;
}

// Mock data for proposer info and items
const mockProposer = {
  id: 2,
  name: 'Jan Kowalski',
  avatar: '/avatar-placeholder.svg',
  rating: 4.8,
};

const mockItems = [
  { id: 1, name: 'Space Marine', imageUrl: '/placeholder.svg' },
  { id: 2, name: 'Ork Boy', imageUrl: '/placeholder.svg' },
  { id: 3, name: 'Eldar Guardian', imageUrl: '/placeholder.svg' },
  { id: 4, name: 'Necron Warrior', imageUrl: '/placeholder.svg' },
];

export function ProposalCard({ proposal, tradeStatus, isCreator, onClick }: ProposalCardProps) {
  const [showAllItems, setShowAllItems] = useState(false);
  const acceptMutation = useAcceptProposal();
  const declineMutation = useDeclineProposal();

  const canAct = isCreator && tradeStatus === 'open' && proposal.status === 'pending';

  const handleAccept = async () => {
    const actorId = 1; // TODO: get from auth context
    await acceptMutation.mutateAsync({ proposalId: proposal.id, actorId });
  };

  const handleDecline = async () => {
    const actorId = 1; // TODO: get from auth context
    await declineMutation.mutateAsync({ proposalId: proposal.id, actorId });
  };

  const getStatusBadge = () => {
    switch (proposal.status) {
      case 'pending':
        return <Badge variant="secondary">Oczekująca</Badge>;
      case 'accepted':
        return <Badge variant="default">Zaakceptowana</Badge>;
      case 'declined':
        return <Badge variant="destructive">Odrzucona</Badge>;
      case 'withdrawn':
        return <Badge variant="outline">Wycofana</Badge>;
      default:
        return <Badge variant="outline">{proposal.status}</Badge>;
    }
  };

  const totalCash = proposal.creatorCashCents + proposal.proposerCashCents;
  const netCash = proposal.proposerCashCents - proposal.creatorCashCents;

  return (
    <div className="bg-card rounded-2xl border border-border/40 p-4 hover:border-border transition-colors">
      <div className="flex items-start gap-4">
        {/* Proposer Info */}
        <div className="flex items-center gap-3 flex-shrink-0">
          <Avatar className="h-12 w-12">
            <AvatarImage src={mockProposer.avatar} alt={mockProposer.name} />
            <AvatarFallback>
              <User className="h-6 w-6" />
            </AvatarFallback>
          </Avatar>
          <div>
            <p className="font-medium text-sm">{mockProposer.name}</p>
            <div className="flex items-center gap-1">
              <span className="text-xs text-muted-foreground">★ {mockProposer.rating}</span>
            </div>
          </div>
        </div>

        {/* Items Preview */}
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-2">
            {mockItems.slice(0, 4).map((item, index) => (
              <div key={item.id} className="relative">
                <div className="w-12 h-12 bg-muted rounded border border-border/40 overflow-hidden">
                  <img
                    src={item.imageUrl}
                    alt={item.name}
                    className="w-full h-full object-cover"
                  />
                </div>
                {index === 3 && mockItems.length > 4 && (
                  <div className="absolute inset-0 bg-black/60 flex items-center justify-center text-white text-xs font-medium">
                    +{mockItems.length - 3}
                  </div>
                )}
              </div>
            ))}
          </div>

          {/* Cash Summary */}
          {totalCash > 0 && (
            <div className="flex items-center gap-2 mb-2">
              <CreditCard className="h-4 w-4 text-muted-foreground" />
              <span className="text-sm">
                {netCash !== 0 && (
                  <span className={netCash > 0 ? 'text-green-600' : 'text-red-600'}>
                    {netCash > 0 ? '+' : ''}{netCash / 100} zł
                  </span>
                )}
                {netCash === 0 && `${totalCash / 100} zł`}
              </span>
            </div>
          )}

          {/* Status and Time */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              {getStatusBadge()}
              <span className="text-xs text-muted-foreground">
                {formatDistanceToNow(new Date(proposal.createdAt), {
                  addSuffix: true,
                  locale: pl,
                })}
              </span>
            </div>
          </div>
        </div>

        {/* Actions */}
        {canAct && (
          <div className="flex items-center gap-2 flex-shrink-0">
            <Button
              size="sm"
              variant="outline"
              className="text-destructive hover:text-destructive"
              onClick={handleDecline}
              disabled={declineMutation.isPending}
              aria-label="Odrzuć propozycję"
            >
              <X className="h-4 w-4" />
            </Button>
            <Button
              size="sm"
              onClick={handleAccept}
              disabled={acceptMutation.isPending}
              aria-label="Akceptuj propozycję"
            >
              <Check className="h-4 w-4" />
            </Button>
          </div>
        )}

        {!canAct && (
          <div className="flex-shrink-0">
            <Clock className="h-4 w-4 text-muted-foreground" />
          </div>
        )}
      </div>

      {/* Click to open modal */}
      {onClick && (
        <button
          onClick={onClick}
          className="absolute inset-0 w-full h-full cursor-pointer"
          aria-label="Zobacz szczegóły propozycji"
        />
      )}
    </div>
  );
}
