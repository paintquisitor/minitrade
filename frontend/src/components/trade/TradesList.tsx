import { useState } from 'react';
import { Link } from 'react-router-dom';
import { Search, Filter, Plus, Clock } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

interface Trade {
  id: number;
  title: string;
  type: 'WTB' | 'WTS' | 'WTT';
  status: 'open' | 'closed' | 'cancelled' | 'expired';
  creator: string;
  createdAt: string;
  itemCount: number;
  proposalsCount: number;
}

// Mock data for demo
const mockTrades: Trade[] = [
  {
    id: 1,
    title: 'Sprzedaję AK-47 Fire Serpent ST MW',
    type: 'WTS',
    status: 'open',
    creator: 'GamerPro123',
    createdAt: '2024-01-15T10:30:00Z',
    itemCount: 1,
    proposalsCount: 3,
  },
  {
    id: 2,
    title: 'Szukam AWP Dragon Lore',
    type: 'WTB',
    status: 'open',
    creator: 'SkinCollector',
    createdAt: '2024-01-15T09:15:00Z',
    itemCount: 0,
    proposalsCount: 1,
  },
  {
    id: 3,
    title: 'Wymienię M4A4 Howl za Karambit Fade',
    type: 'WTT',
    status: 'closed',
    creator: 'TradeMaster',
    createdAt: '2024-01-14T16:45:00Z',
    itemCount: 2,
    proposalsCount: 5,
  },
  {
    id: 4,
    title: 'Sprzedaję kolekcję noży',
    type: 'WTS',
    status: 'open',
    creator: 'KnifeExpert',
    createdAt: '2024-01-15T08:20:00Z',
    itemCount: 3,
    proposalsCount: 0,
  },
];

export function TradesList() {
  const [searchQuery, setSearchQuery] = useState('');
  const [typeFilter, setTypeFilter] = useState<string>('all');
  const [statusFilter, setStatusFilter] = useState<string>('all');

  const filteredTrades = mockTrades.filter(trade => {
    const matchesSearch = trade.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         trade.creator.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesType = typeFilter === 'all' || trade.type === typeFilter;
    const matchesStatus = statusFilter === 'all' || trade.status === statusFilter;

    return matchesSearch && matchesType && matchesStatus;
  });

  const formatTimeAgo = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffInHours = Math.floor((now.getTime() - date.getTime()) / (1000 * 60 * 60));

    if (diffInHours < 1) return 'mniej niż godzinę temu';
    if (diffInHours < 24) return `${diffInHours}h temu`;
    const diffInDays = Math.floor(diffInHours / 24);
    return `${diffInDays}d temu`;
  };

  const getStatusBadge = (status: Trade['status']) => {
    const statusConfig = {
      open: { label: 'Otwarte', variant: 'default' as const, color: 'bg-green-500' },
      closed: { label: 'Zamknięte', variant: 'secondary' as const, color: 'bg-blue-500' },
      cancelled: { label: 'Anulowane', variant: 'destructive' as const, color: 'bg-red-500' },
      expired: { label: 'Wygasłe', variant: 'outline' as const, color: 'bg-gray-500' },
    };

    const config = statusConfig[status];
    return (
      <Badge variant={config.variant} className={`${config.color} text-white`}>
        {config.label}
      </Badge>
    );
  };

  const getTypeBadge = (type: Trade['type']) => {
    const typeConfig = {
      WTB: { label: 'Szukam', color: 'bg-blue-500' },
      WTS: { label: 'Sprzedaję', color: 'bg-green-500' },
      WTT: { label: 'Wymieniam', color: 'bg-purple-500' },
    };

    const config = typeConfig[type];
    return (
      <Badge variant="outline" className={`${config.color} text-white border-current`}>
        {config.label}
      </Badge>
    );
  };

  return (
    <div className="min-h-screen bg-[#1a1b23]">
      <div className="container mx-auto px-4 py-6">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-white mb-2">Wymiany</h1>
          <p className="text-gray-400">Znajdź interesujące Cię oferty wymiany skórek</p>
        </div>

        {/* Search and Filters */}
        <div className="mb-6 flex flex-col sm:flex-row gap-4">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
            <Input
              placeholder="Wyszukaj wymiany..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10 bg-[#242532] border-gray-600 text-white placeholder-gray-400"
            />
          </div>

          <div className="flex gap-2">
            <Select value={typeFilter} onValueChange={setTypeFilter}>
              <SelectTrigger className="w-[140px] bg-[#242532] border-gray-600 text-white">
                <SelectValue placeholder="Typ" />
              </SelectTrigger>
              <SelectContent className="bg-[#242532] border-gray-600">
                <SelectItem value="all">Wszystkie</SelectItem>
                <SelectItem value="WTS">Sprzedaż</SelectItem>
                <SelectItem value="WTB">Zakup</SelectItem>
                <SelectItem value="WTT">Wymiana</SelectItem>
              </SelectContent>
            </Select>

            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-[140px] bg-[#242532] border-gray-600 text-white">
                <SelectValue placeholder="Status" />
              </SelectTrigger>
              <SelectContent className="bg-[#242532] border-gray-600">
                <SelectItem value="all">Wszystkie</SelectItem>
                <SelectItem value="open">Otwarte</SelectItem>
                <SelectItem value="closed">Zamknięte</SelectItem>
                <SelectItem value="cancelled">Anulowane</SelectItem>
              </SelectContent>
            </Select>

            <Button
              className="bg-[#6b46c1] hover:bg-[#553c9a] text-white"
              onClick={() => window.location.href = '/trades/create'}
            >
              <Plus className="h-4 w-4 mr-2" />
              Utwórz wymianę
            </Button>
          </div>
        </div>

        {/* Trades Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredTrades.map((trade) => (
            <Link key={trade.id} to={`/trade/${trade.id}`}>
              <Card className="bg-[#242532] border-gray-700 hover:border-gray-600 transition-colors cursor-pointer">
                <CardHeader className="pb-3">
                  <div className="flex items-start justify-between">
                    <div className="flex gap-2">
                      {getTypeBadge(trade.type)}
                      {getStatusBadge(trade.status)}
                    </div>
                    <div className="flex items-center text-xs text-gray-400">
                      <Clock className="h-3 w-3 mr-1" />
                      {formatTimeAgo(trade.createdAt)}
                    </div>
                  </div>
                  <CardTitle className="text-white text-lg leading-tight">
                    {trade.title}
                  </CardTitle>
                </CardHeader>

                <CardContent className="pt-0">
                  <div className="space-y-3">
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-gray-400">Utworzył:</span>
                      <span className="text-white font-medium">{trade.creator}</span>
                    </div>

                    <div className="flex items-center justify-between text-sm">
                      <span className="text-gray-400">Przedmioty:</span>
                      <span className="text-white">{trade.itemCount}</span>
                    </div>

                    <div className="flex items-center justify-between text-sm">
                      <span className="text-gray-400">Propozycje:</span>
                      <span className="text-white">{trade.proposalsCount}</span>
                    </div>

                    {trade.status === 'open' && (
                      <div className="mt-4">
                        <Button
                          size="sm"
                          className="w-full bg-[#6b46c1] hover:bg-[#553c9a] text-white"
                        >
                          Zobacz szczegóły
                        </Button>
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>
            </Link>
          ))}
        </div>

        {filteredTrades.length === 0 && (
          <div className="text-center py-12">
            <div className="text-gray-400 mb-4">
              <Filter className="mx-auto h-12 w-12 mb-4 opacity-50" />
              <p>Brak wymian spełniających kryteria</p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
