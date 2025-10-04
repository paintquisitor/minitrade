import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Plus, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { ImageUpload } from './ImageUpload';
import { useAuth } from '@/lib/auth';

export function CreateTrade() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [formData, setFormData] = useState({
    type: 'WTS' as 'WTS' | 'WTB' | 'WTT',
    title: '',
    body: '',
    tags: [] as string[],
    currentTag: '',
    images: [] as File[],
  });

  const handleAddTag = () => {
    if (formData.currentTag.trim() && !formData.tags.includes(formData.currentTag.trim())) {
      setFormData(prev => ({
        ...prev,
        tags: [...prev.tags, prev.currentTag.trim()],
        currentTag: '',
      }));
    }
  };

  const handleRemoveTag = (tagToRemove: string) => {
    setFormData(prev => ({
      ...prev,
      tags: prev.tags.filter(tag => tag !== tagToRemove),
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!user) {
      alert('Musisz być zalogowany, aby utworzyć wymianę');
      navigate('/login');
      return;
    }

    if (!formData.title.trim()) {
      alert('Tytuł jest wymagany');
      return;
    }

    try {
      let imageUrls: string[] = [];

      // Upload images if any
      if (formData.images.length > 0) {
        const formDataUpload = new FormData();
        formData.images.forEach((image, index) => {
          formDataUpload.append(`images`, image);
        });

        console.log('Uploading images...');
        const uploadResponse = await fetch('/api/v1/upload/images', {
          method: 'POST',
          body: formDataUpload,
        });

        if (!uploadResponse.ok) {
          const errorData = await uploadResponse.json();
          throw new Error(errorData.error || 'Failed to upload images');
        }

        const uploadResult = await uploadResponse.json();
        imageUrls = uploadResult.data.imageUrls;
        console.log('Images uploaded successfully:', imageUrls);
      }

      // Prepare form data for API call
      const tradeData = {
        creatorId: user.id,
        type: formData.type,
        title: formData.title,
        body: formData.body,
        tags: formData.tags,
        status: 'open' as const,
        imageUrls: imageUrls,
      };

      console.log('Creating trade:', tradeData);

      // Make API call to create trade
      const response = await fetch('/api/v1/trades', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(tradeData),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to create trade');
      }

      const result = await response.json();
      const newTrade = result.data;

      console.log('Trade created successfully:', newTrade);

      // Redirect to the newly created trade
      navigate(`/trade/${newTrade.id}`);
    } catch (error) {
      console.error('Error creating trade:', error);
      alert(`Wystąpił błąd podczas tworzenia wymiany: ${error}`);
    }
  };

  return (
    <div className="min-h-screen bg-[#1a1b23]">
      <div className="container mx-auto px-4 py-6">
        {/* Header */}
        <div className="mb-8">
          <Button
            variant="ghost"
            onClick={() => navigate('/trades')}
            className="mb-4 text-gray-400 hover:text-white"
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Wróć do listy wymian
          </Button>

          <h1 className="text-3xl font-bold text-white mb-2">Utwórz nową wymianę</h1>
          <p className="text-gray-400">Opisz swoją ofertę i znajdź idealnego partnera do wymiany</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Main Form */}
          <div className="lg:col-span-2">
            <Card className="bg-[#242532] border-gray-700">
              <CardHeader>
                <CardTitle className="text-white">Szczegóły wymiany</CardTitle>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleSubmit} className="space-y-6">
                  {/* Trade Type */}
                  <div className="space-y-2">
                    <label className="text-sm font-medium text-gray-300">Typ wymiany</label>
                    <Select
                      value={formData.type}
                      onValueChange={(value: 'WTS' | 'WTB' | 'WTT') =>
                        setFormData(prev => ({ ...prev, type: value }))
                      }
                    >
                      <SelectTrigger className="bg-[#1e1f2e] border-gray-600 text-white">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent className="bg-[#1e1f2e] border-gray-600">
                        <SelectItem value="WTS">Sprzedaję</SelectItem>
                        <SelectItem value="WTB">Szukam</SelectItem>
                        <SelectItem value="WTT">Wymieniam</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  {/* Title */}
                  <div className="space-y-2">
                    <label className="text-sm font-medium text-gray-300">Tytuł oferty</label>
                    <Input
                      placeholder="Np. Sprzedaję AK-47 Fire Serpent ST MW"
                      value={formData.title}
                      onChange={(e) => setFormData(prev => ({ ...prev, title: e.target.value }))}
                      className="bg-[#1e1f2e] border-gray-600 text-white placeholder-gray-400"
                    />
                  </div>

                  {/* Description */}
                  <div className="space-y-2">
                    <label className="text-sm font-medium text-gray-300">Opis</label>
                    <Textarea
                      placeholder="Opisz swoją ofertę, stan przedmiotów, oczekiwania..."
                      value={formData.body}
                      onChange={(e) => setFormData(prev => ({ ...prev, body: e.target.value }))}
                      rows={4}
                      className="bg-[#1e1f2e] border-gray-600 text-white placeholder-gray-400"
                    />
                  </div>

                  {/* Images */}
                  <div className="space-y-2">
                    <ImageUpload
                      images={formData.images}
                      onImagesChange={(images) => setFormData(prev => ({ ...prev, images }))}
                      maxImages={8}
                    />
                  </div>

                  {/* Tags */}
                  <div className="space-y-2">
                    <label className="text-sm font-medium text-gray-300">Tagi</label>
                    <div className="flex gap-2">
                      <Input
                        placeholder="Dodaj tag..."
                        value={formData.currentTag}
                        onChange={(e) => setFormData(prev => ({ ...prev, currentTag: e.target.value }))}
                        onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), handleAddTag())}
                        className="bg-[#1e1f2e] border-gray-600 text-white placeholder-gray-400"
                      />
                      <Button
                        type="button"
                        onClick={handleAddTag}
                        className="bg-[#6b46c1] hover:bg-[#553c9a] text-white"
                      >
                        <Plus className="h-4 w-4" />
                      </Button>
                    </div>

                    {formData.tags.length > 0 && (
                      <div className="flex flex-wrap gap-2 mt-2">
                        {formData.tags.map((tag) => (
                          <Badge
                            key={tag}
                            variant="secondary"
                            className="bg-[#6b46c1] text-white hover:bg-[#553c9a] cursor-pointer"
                            onClick={() => handleRemoveTag(tag)}
                          >
                            {tag}
                            <X className="h-3 w-3 ml-1" />
                          </Badge>
                        ))}
                      </div>
                    )}
                  </div>

                  {/* Submit Button */}
                  <div className="pt-4">
                    <Button
                      type="submit"
                      className="w-full bg-[#6b46c1] hover:bg-[#553c9a] text-white"
                    >
                      Utwórz wymianę
                    </Button>
                  </div>
                </form>
              </CardContent>
            </Card>
          </div>

          {/* Sidebar with Tips */}
          <div className="lg:col-span-1">
            <Card className="bg-[#242532] border-gray-700">
              <CardHeader>
                <CardTitle className="text-white text-sm">Porady</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4 text-sm text-gray-300">
                <div>
                  <h4 className="font-medium text-white mb-1">Tytuł</h4>
                  <p>Umieść najważniejsze informacje w tytule - markę, model i stan przedmiotu.</p>
                </div>

                <div>
                  <h4 className="font-medium text-white mb-1">Opis</h4>
                  <p>Opisz dokładnie stan przedmiotu, float (jeśli dotyczy), historię i oczekiwania.</p>
                </div>

                <div>
                  <h4 className="font-medium text-white mb-1">Tagi</h4>
                  <p>Dodaj odpowiednie tagi aby Twoja oferta była łatwiejsza do znalezienia.</p>
                </div>

                <div>
                  <h4 className="font-medium text-white mb-1">Zdjęcia</h4>
                  <p>Dodaj maksymalnie 8 zdjęć - po jednym na każdy przedmiot w ofercie.</p>
                </div>
              </CardContent>
            </Card>

            {/* Trade Type Examples */}
            <Card className="bg-[#242532] border-gray-700 mt-4">
              <CardHeader>
                <CardTitle className="text-white text-sm">Przykłady tytułów</CardTitle>
              </CardHeader>
              <CardContent className="space-y-2 text-sm">
                <div className="p-2 bg-[#1e1f2e] rounded">
                  <Badge className="bg-green-500 text-white mb-1">Sprzedaż</Badge>
                  <p className="text-gray-300">"AK-47 Fire Serpent ST MW 0.014"</p>
                </div>

                <div className="p-2 bg-[#1e1f2e] rounded">
                  <Badge className="bg-blue-500 text-white mb-1">Zakup</Badge>
                  <p className="text-gray-300">"Szukam AWP Dragon Lore FN"</p>
                </div>

                <div className="p-2 bg-[#1e1f2e] rounded">
                  <Badge className="bg-purple-500 text-white mb-1">Wymiana</Badge>
                  <p className="text-gray-300">"M4A4 Howl FT za Karambit Fade"</p>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}
