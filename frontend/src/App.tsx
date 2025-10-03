import { Routes, Route, Navigate } from 'react-router-dom';
import { TradeDetail } from '@/components/trade';

function App() {
  return (
    <div className="min-h-screen bg-background font-sans antialiased">
      <Routes>
        {/* Redirect /trade/ to /trade/1 */}
        <Route path="/trade" element={<Navigate to="/trade/1" replace />} />
        <Route path="/trade/:id" element={<TradeDetail />} />
        <Route path="/" element={
          <div className="flex items-center justify-center h-screen">
            <div className="text-center">
              <h1 className="text-4xl font-bold mb-4">Warhammer Marketplace</h1>
              <p className="text-muted-foreground mb-8">
                Przejdź do <code>/trade/1</code> aby zobaczyć przykład wymiany
              </p>
              <a
                href="/trade/1"
                className="inline-flex items-center justify-center rounded-md text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 bg-primary text-primary-foreground hover:bg-primary/90 h-10 px-4 py-2"
              >
                Zobacz przykład
              </a>
            </div>
          </div>
        } />
      </Routes>
    </div>
  );
}

export default App;
