import { useState, useMemo } from 'react';
import { Search, SortAsc, Heart, Plus, Clock } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useTradeStore } from '@/state/useTradeStore';
import { toast } from 'sonner';

interface InventoryGridProps {
  tradeId: number;
  isCreator: boolean;
}

// Mock inventory data - in real app this would come from API
const mockInventory: Array<{
  id: number;
  name: string;
  imageUrl?: string;
  faction: string;
  condition: string;
  tags: string[];
  estValueCents: number;
  available: boolean;
  days: number;
}> = [
  {
    id: 1,
    name: 'Space Marine Captain',
    faction: 'Space Marines',
    condition: 'Painted',
    tags: ['HQ', 'Character'],
    estValueCents: 2500,
    available: true,
    days: 3,
  },
  {
    id: 2,
    name: 'Ork Boyz Squad',
    faction: 'Orks',
    condition: 'Assembled',
    tags: ['Troops'],
    estValueCents: 1800,
    available: true,
    days: 1,
  },
  {
    id: 3,
    name: 'Eldar Wraithlord',
    faction: 'Eldar',
    condition: 'New in Box',
    tags: ['Elite', 'Monstrous'],
    estValueCents: 3500,
    available: false,
    days: 7,
  },
  {
    id: 4,
    name: 'Necron Warriors',
    faction: 'Necrons',
    condition: 'Painted',
    tags: ['Troops'],
    estValueCents: 2200,
    available: true,
    days: 2,
  },
];

export function InventoryGrid({ tradeId, isCreator }: InventoryGridProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const [sortBy, setSortBy] = useState('default');
  const [showFavorites, setShowFavorites] = useState(false);
  const { addItem, selectedItems } = useTradeStore();

  const filteredItems = useMemo(() => {
    let filtered = mockInventory.filter(item => {
      if (!item.available) return false;
      if (searchQuery) {
        return item.name.toLowerCase().includes(searchQuery.toLowerCase());
      }
      return true;
    });

    if (showFavorites) {
      // Mock: filter by favorites - in real app would check user preferences
      filtered = filtered.filter(item => item.id === 1 || item.id === 4);
    }

    switch (sortBy) {
      case 'price-low':
        filtered.sort((a, b) => a.estValueCents - b.estValueCents);
        break;
      case 'price-high':
        filtered.sort((a, b) => b.estValueCents - a.estValueCents);
        break;
      case 'name':
        filtered.sort((a, b) => a.name.localeCompare(b.name));
        break;
      default:
        filtered.sort((a, b) => a.id - b.id);
    }

    return filtered;
  }, [searchQuery, sortBy, showFavorites]);

  const handleAddToBasket = (item: typeof mockInventory[0]) => {
    if (selectedItems.length >= 12) {
      toast.error('Maksymalnie 12 przedmiotów w ofercie');
      return;
    }

    const exists = selectedItems.some(i => i.id === item.id);
    if (exists) {
      toast.error('Przedmiot już jest w ofercie');
      return;
    }

    addItem({
      id: item.id,
      name: item.name,
      imageUrl: item.imageUrl,
      faction: item.faction,
      condition: item.condition,
      tags: item.tags,
      estValueCents: item.estValueCents,
      available: item.available,
    });

    toast.success(`${item.name} dodany do oferty`);
  };

  return (
    <div className="bg-card rounded-2xl border border-border/40 p-6">
      {/* Search/Sort Bar */}
      <div className="sticky top-0 z-20 backdrop-blur bg-background/60 border-b border-border/40 -m-6 mb-6 px-6 py-4">
        <div className="flex flex-col sm:flex-row gap-3">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Wyszukaj…"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10"
            />
          </div>

          <div className="flex gap-2">
            <Select value={sortBy} onValueChange={setSortBy}>
              <SelectTrigger className="w-[180px]">
                <SelectValue placeholder="Domyślne sortowanie" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="default">Domyślne sortowanie</SelectItem>
                <SelectItem value="price-low">Cena: od najniższej</SelectItem>
                <SelectItem value="price-high">Cena: od najwyższej</SelectItem>
                <SelectItem value="name">Nazwa: A-Z</SelectItem>
              </SelectContent>
            </Select>

            <Button
              variant={showFavorites ? "default" : "outline"}
              size="sm"
              onClick={() => setShowFavorites(!showFavorites)}
              aria-label={showFavorites ? "Pokaż wszystkie" : "Pokaż ulubione"}
            >
              <Heart className={`h-4 w-4 ${showFavorites ? 'fill-current' : ''}`} />
            </Button>
          </div>
        </div>
      </div>

      {/* Items Grid */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-3 xl:grid-cols-3 gap-3">
        {filteredItems.map((item) => (
          <div
            key={item.id}
            className="bg-muted/20 rounded-lg border border-border/40 overflow-hidden hover:border-border transition-colors"
          >
            <div className="aspect-square relative">
              <img
                src={item.imageUrl || '/placeholder.svg'}
                alt={item.name}
                className="w-full h-full object-cover"
              />
              <div className="absolute top-2 left-2">
                <Badge variant="secondary" className="text-xs">
                  {item.faction}
                </Badge>
              </div>
              <div className="absolute top-2 right-2">
                <Badge variant="outline" className="text-xs bg-background/80">
                  {item.days}d
                </Badge>
              </div>
            </div>

            <div className="p-3 space-y-2">
              <h3 className="font-medium text-sm leading-tight line-clamp-2">
                {item.name}
              </h3>

              <div className="flex flex-wrap gap-1">
                {item.tags.slice(0, 2).map((tag) => (
                  <Badge key={tag} variant="outline" className="text-xs">
                    {tag}
                  </Badge>
                ))}
              </div>

              <div className="flex items-center justify-between">
                <div className="text-sm font-medium">
                  {(item.estValueCents / 100).toFixed(0)} zł
                </div>

                <Button
                  size="sm"
                  onClick={() => handleAddToBasket(item)}
                  disabled={!item.available}
                  aria-label={`Dodaj ${item.name} do oferty`}
                >
                  <Plus className="h-4 w-4 mr-1" />
                  Dodaj
                </Button>
              </div>
            </div>
          </div>
        ))}
      </div>

      {filteredItems.length === 0 && (
        <div className="text-center py-12">
          <Clock className="mx-auto h-12 w-12 text-muted-foreground mb-4" />
          <p className="text-muted-foreground">Brak przedmiotów spełniających kryteria</p>
        </div>
      )}
    </div>
  );
}
