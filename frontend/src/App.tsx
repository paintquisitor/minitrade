import { Routes, Route, Navigate } from 'react-router-dom';
import { TradeDetail } from '@/components/trade';
import { TradesList } from '@/components/trade/TradesList';
import { CreateTrade } from '@/components/trade/CreateTrade';
import { Login } from '@/components/auth/Login';
import { Register } from '@/components/auth/Register';
import { ProtectedRoute } from '@/components/auth/ProtectedRoute';
import { AuthProvider, useAuth } from '@/lib/auth';
import { Navbar } from '@/components/ui/navbar';

function AppContent() {
  const { user, isLoading } = useAuth();

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (user) {
    return (
      <Routes>
        <Route path="/trades/create" element={<CreateTrade />} />
        <Route path="/trades" element={<TradesList />} />
        {/* Redirect /trade/ to /trade/1 */}
        <Route path="/trade" element={<Navigate to="/trade/1" replace />} />
        <Route path="/trade/:id" element={<TradeDetail />} />
        <Route path="/" element={<Navigate to="/trades" replace />} />
      </Routes>
    );
  }

  return (
    <Routes>
      <Route path="/login" element={<Login />} />
      <Route path="/register" element={<Register />} />
      <Route path="/" element={<Navigate to="/login" replace />} />
      <Route path="*" element={<Navigate to="/login" replace />} />
    </Routes>
  );
}

function App() {
  return (
    <AuthProvider>
      <div className="min-h-screen bg-background font-sans antialiased">
        <Navbar />
        <AppContent />
      </div>
    </AuthProvider>
  );
}

export default App;
