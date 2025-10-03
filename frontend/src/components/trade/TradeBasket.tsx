import { useState } from 'react';
import { Search, X, CreditCard } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { useTradeStore } from '@/state/useTradeStore';
import { useComposeProposal } from '@/lib/api/trades';
import { toast } from 'sonner';

interface TradeBasketProps {
  tradeId: number;
  isCreator: boolean;
}

export function TradeBasket({ tradeId, isCreator }: TradeBasketProps) {
  const { selectedItems, cashCents, removeItem, setCash, clear } = useTradeStore();
  const [cashInput, setCashInput] = useState(cashCents.toString());

  const composeMutation = useComposeProposal();

  const handleCashChange = (value: string) => {
    const num = parseInt(value) || 0;
    setCashInput(value);
    setCash(num);
  };

  const handlePropose = async () => {
    if (selectedItems.length === 0 && cashCents === 0) {
      toast.error('Dodaj przynajmniej jeden przedmiot lub dopłatę');
      return;
    }

    if (selectedItems.length > 12) {
      toast.error('Maksymalnie 12 przedmiotów');
      return;
    }

    const proposerId = 1; // TODO: get from auth context

    await composeMutation.mutateAsync({
      tradeId,
      data: {
        proposerId,
        creatorCashCents: cashCents,
        proposerCashCents: 0,
        items: selectedItems.map(item => ({
          itemId: item.id,
          side: 'proposer' as const,
        })),
      },
    });

    clear();
  };

  const totalValue = selectedItems.reduce((sum, item) => sum + (item.estValueCents || 0), 0);

  return (
    <div className="bg-card rounded-2xl border border-border/40 p-6 h-fit">
      <h2 className="text-xl font-semibold mb-4">Twoja oferta</h2>

      {selectedItems.length === 0 ? (
        <div className="text-center py-12">
          <Search className="mx-auto h-12 w-12 text-muted-foreground mb-4" />
          <h3 className="text-lg font-medium mb-2">Znajduj modele szybciej niż kiedykolwiek</h3>
          <p className="text-sm text-muted-foreground mb-4">
            Potężne filtry i intuicyjny interfejs — znajdź idealne elementy wymiany.
          </p>
          <Button variant="outline">Zaloguj się</Button>
        </div>
      ) : (
        <div className="space-y-4">
          {/* Items Grid */}
          <div className="grid grid-cols-3 gap-2">
            {Array.from({ length: 12 }, (_, i) => {
              const item = selectedItems[i];
              return (
                <div
                  key={i}
                  className={`aspect-square bg-muted/20 rounded-lg border-2 border-dashed flex items-center justify-center ${
                    item ? 'border-primary/50 bg-primary/5' : 'border-muted-foreground/20'
                  }`}
                >
                  {item ? (
                    <div className="relative w-full h-full p-1">
                      <img
                        src={item.imageUrl || '/placeholder.svg'}
                        alt={item.name}
                        className="w-full h-full object-cover rounded"
                      />
                      <Button
                        size="sm"
                        variant="ghost"
                        className="absolute -top-1 -right-1 h-6 w-6 p-0 bg-background/80 hover:bg-destructive hover:text-destructive-foreground"
                        onClick={() => removeItem(item.id)}
                        aria-label={`Usuń ${item.name}`}
                      >
                        <X className="h-3 w-3" />
                      </Button>
                      <div className="absolute bottom-0 left-0 right-0 bg-black/60 text-white text-xs p-1 truncate">
                        {item.name}
                      </div>
                    </div>
                  ) : (
                    <div className="text-muted-foreground text-xs">Pusty</div>
                  )}
                </div>
              );
            })}
          </div>

          {/* Footer */}
          <div className="space-y-3 pt-4 border-t">
            <div className="flex justify-between items-center">
              <span className="text-sm text-muted-foreground">Szacowana wartość:</span>
              <Badge variant="secondary">{(totalValue / 100).toFixed(2)} zł</Badge>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium">Dopłata</label>
              <div className="relative">
                <CreditCard className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  type="number"
                  placeholder="0"
                  value={cashInput}
                  onChange={(e) => handleCashChange(e.target.value)}
                  className="pl-10"
                  min="0"
                />
                <span className="absolute right-3 top-1/2 transform -translate-y-1/2 text-sm text-muted-foreground">
                  zł
                </span>
              </div>
            </div>

            <Button
              className="w-full"
              onClick={handlePropose}
              disabled={composeMutation.isPending}
            >
              {composeMutation.isPending ? 'Wysyłanie...' : 'Zaproponuj wymianę'}
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}
