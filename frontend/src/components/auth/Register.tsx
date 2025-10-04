import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useAuth } from '@/lib/auth';

export function Register() {
  const navigate = useNavigate();
  const { register } = useAuth();
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    confirmPassword: '',
    displayName: '',
  });
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (formData.password !== formData.confirmPassword) {
      alert('Hasła nie są identyczne');
      return;
    }

    setIsLoading(true);

    try {
      await register(formData.email, formData.password, formData.displayName);
      navigate('/trades');
    } catch (error) {
      console.error('Registration failed:', error);
      alert('Rejestracja nie powiodła się');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#1a1b23] flex items-center justify-center p-4">
      <Card className="w-full max-w-md bg-[#242532] border-gray-700">
        <CardHeader>
          <CardTitle className="text-white text-center">Zarejestruj się</CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <label className="text-sm font-medium text-gray-300">Nazwa użytkownika</label>
              <Input
                type="text"
                value={formData.displayName}
                onChange={(e) => setFormData(prev => ({ ...prev, displayName: e.target.value }))}
                className="bg-[#1e1f2e] border-gray-600 text-white"
                placeholder="Twoja nazwa użytkownika"
              />
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium text-gray-300">Email</label>
              <Input
                type="email"
                value={formData.email}
                onChange={(e) => setFormData(prev => ({ ...prev, email: e.target.value }))}
                className="bg-[#1e1f2e] border-gray-600 text-white"
                required
              />
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium text-gray-300">Hasło</label>
              <Input
                type="password"
                value={formData.password}
                onChange={(e) => setFormData(prev => ({ ...prev, password: e.target.value }))}
                className="bg-[#1e1f2e] border-gray-600 text-white"
                required
              />
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium text-gray-300">Potwierdź hasło</label>
              <Input
                type="password"
                value={formData.confirmPassword}
                onChange={(e) => setFormData(prev => ({ ...prev, confirmPassword: e.target.value }))}
                className="bg-[#1e1f2e] border-gray-600 text-white"
                required
              />
            </div>

            <Button
              type="submit"
              className="w-full bg-[#6b46c1] hover:bg-[#553c9a] text-white"
              disabled={isLoading}
            >
              {isLoading ? 'Rejestrowanie...' : 'Zarejestruj się'}
            </Button>

            <div className="text-center">
              <button
                type="button"
                onClick={() => navigate('/login')}
                className="text-sm text-gray-400 hover:text-white"
              >
                Masz już konto? Zaloguj się
              </button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
