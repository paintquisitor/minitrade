import { Link } from 'react-router-dom';
import { Button } from './button';
import { useAuth } from '@/lib/auth';

export function Navbar() {
  const { user, logout, isLoading } = useAuth();

  return (
    <nav className="bg-[#242532] border-b border-gray-700 px-4 py-3">
      <div className="container mx-auto flex items-center justify-between">
        <div className="flex items-center space-x-6">
          <Link to="/" className="text-xl font-bold text-white">
            Skin Marketplace
          </Link>

          <div className="hidden md:flex space-x-4">
            <Link
              to="/trades"
              className="text-gray-300 hover:text-white transition-colors"
            >
              Wszystkie wymiany
            </Link>
            <Link
              to="/trades/create"
              className="text-gray-300 hover:text-white transition-colors"
            >
              Utwórz wymianę
            </Link>
          </div>
        </div>

        <div className="flex items-center space-x-4">
          {isLoading ? (
            <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-gray-300"></div>
          ) : user ? (
            <div className="flex items-center space-x-4">
              <span className="text-gray-300">
                Witaj, {user.displayName || user.email}
              </span>
              <Button
                variant="outline"
                onClick={logout}
                className="text-gray-300 border-gray-600 hover:bg-gray-700"
              >
                Wyloguj się
              </Button>
            </div>
          ) : (
            <div className="flex items-center space-x-2">
              <Link to="/login">
                <Button variant="outline" className="text-gray-300 border-gray-600 hover:bg-gray-700">
                  Zaloguj się
                </Button>
              </Link>
              <Link to="/register">
                <Button className="bg-[#6b46c1] hover:bg-[#553c9a] text-white">
                  Zarejestruj się
                </Button>
              </Link>
            </div>
          )}
        </div>
      </div>
    </nav>
  );
}
