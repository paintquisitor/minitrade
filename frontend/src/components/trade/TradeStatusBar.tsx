import { useState, useEffect } from 'react';
import { formatDistanceToNow, isAfter, isBefore } from 'date-fns';
import { pl } from 'date-fns/locale';
import { Clock, CheckCircle, XCircle, AlertCircle, Ban } from 'lucide-react';
import { Badge } from '@/components/ui/badge';

interface TradeStatusBarProps {
  trade: {
    id: number;
    status: 'open' | 'closed' | 'cancelled' | 'expired';
    expiresAt?: string;
    createdAt: string;
    type: 'WTB' | 'WTS' | 'WTT';
  };
}

export function TradeStatusBar({ trade }: TradeStatusBarProps) {
  const [timeLeft, setTimeLeft] = useState<string>('');

  useEffect(() => {
    if (!trade.expiresAt) return;

    const updateTimeLeft = () => {
      const now = new Date();
      const expiresAt = new Date(trade.expiresAt!);

      if (isAfter(now, expiresAt)) {
        setTimeLeft('Wygasła');
      } else {
        setTimeLeft(formatDistanceToNow(expiresAt, {
          addSuffix: true,
          locale: pl,
        }));
      }
    };

    updateTimeLeft();
    const interval = setInterval(updateTimeLeft, 1000);

    return () => clearInterval(interval);
  }, [trade.expiresAt]);

  const getStatusBadge = () => {
    switch (trade.status) {
      case 'open':
        return (
          <Badge variant="secondary" className="bg-green-100 text-green-800 border-green-200">
            <CheckCircle className="h-3 w-3 mr-1" />
            Otwarta
          </Badge>
        );
      case 'closed':
        return (
          <Badge variant="default" className="bg-blue-100 text-blue-800 border-blue-200">
            <CheckCircle className="h-3 w-3 mr-1" />
            Zamknięta
          </Badge>
        );
      case 'cancelled':
        return (
          <Badge variant="destructive" className="bg-red-100 text-red-800 border-red-200">
            <Ban className="h-3 w-3 mr-1" />
            Anulowana
          </Badge>
        );
      case 'expired':
        return (
          <Badge variant="outline" className="bg-gray-100 text-gray-800 border-gray-200">
            <AlertCircle className="h-3 w-3 mr-1" />
            Wygasła
          </Badge>
        );
      default:
        return (
          <Badge variant="outline">
            Nieznany status
          </Badge>
        );
    }
  };

  const getTypeBadge = () => {
    const typeLabels = {
      WTB: 'Szukam',
      WTS: 'Sprzedaję',
      WTT: 'Wymieniam',
    };

    return (
      <Badge variant="outline">
        {typeLabels[trade.type]}
      </Badge>
    );
  };

  return (
    <div className="flex flex-wrap items-center gap-3 py-4">
      {getStatusBadge()}
      {getTypeBadge()}

      {trade.expiresAt && trade.status === 'open' && (
        <div className="flex items-center gap-2 text-sm text-muted-foreground">
          <Clock className="h-4 w-4" />
          <span>
            {timeLeft.includes('Wygasła') ? (
              <span className="text-destructive font-medium">{timeLeft}</span>
            ) : (
              `Wygasa ${timeLeft}`
            )}
          </span>
        </div>
      )}

      <div className="flex items-center gap-2 text-sm text-muted-foreground">
        <span>
          Utworzona {formatDistanceToNow(new Date(trade.createdAt), {
            addSuffix: true,
            locale: pl,
          })}
        </span>
      </div>
    </div>
  );
}
