import { useState } from 'react';
import { ChevronDown, RotateCcw } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from '@/components/ui/collapsible';
import { Checkbox } from '@/components/ui/checkbox';
import { Slider } from '@/components/ui/slider';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

const colorSwatches = [
  '#FF6B6B', '#4ECDC4', '#45B7D1', '#FFA07A', '#98D8C8',
  '#F7DC6F', '#BB8FCE', '#85C1E9', '#F8C471', '#82E0AA',
];

interface FilterState {
  priceRange: [number, number];
  types: string[];
  conditions: string[];
  colors: string[];
  factions: string[];
  categories: string[];
  patterns: string[];
}

export function FilterPanel() {
  const [isOpen, setIsOpen] = useState(true);
  const [filters, setFilters] = useState<FilterState>({
    priceRange: [0, 1000],
    types: [],
    conditions: [],
    colors: [],
    factions: [],
    categories: [],
    patterns: [],
  });

  const updateFilters = (key: keyof FilterState, value: any) => {
    setFilters(prev => ({ ...prev, [key]: value }));
  };

  const resetFilters = () => {
    setFilters({
      priceRange: [0, 1000],
      types: [],
      conditions: [],
      colors: [],
      factions: [],
      categories: [],
      patterns: [],
    });
  };

  const hasActiveFilters = Object.values(filters).some((value) => {
    if (Array.isArray(value)) return value.length > 0;
    if (typeof value === 'object' && value !== null) {
      return Object.values(value).some(v => v !== 0 && v !== 1000);
    }
    return false;
  });

  return (
    <div className="bg-card rounded-2xl border border-border/40 p-4 h-fit">
      <Collapsible open={isOpen} onOpenChange={setIsOpen}>
        <CollapsibleTrigger asChild>
          <Button variant="ghost" className="w-full justify-between p-0 h-auto">
            <h3 className="font-medium">Filtry</h3>
            <ChevronDown className={`h-4 w-4 transition-transform ${isOpen ? 'rotate-180' : ''}`} />
          </Button>
        </CollapsibleTrigger>

        <CollapsibleContent className="space-y-6 mt-4">
          {/* Price Range */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <label className="text-sm font-medium">Cena</label>
              <div className="flex items-center space-x-2">
                <Checkbox id="match-funds" />
                <label htmlFor="match-funds" className="text-xs text-muted-foreground">
                  Dopasuj do moich funduszy
                </label>
              </div>
            </div>
            <div className="space-y-2">
              <Slider
                value={filters.priceRange}
                onValueChange={(value) => updateFilters('priceRange', value as [number, number])}
                max={1000}
                step={10}
                className="w-full"
              />
              <div className="flex justify-between text-xs text-muted-foreground">
                <span>{filters.priceRange[0]} zł</span>
                <span>{filters.priceRange[1]} zł</span>
              </div>
            </div>
          </div>

          {/* Types */}
          <div className="space-y-3">
            <label className="text-sm font-medium">Typ</label>
            <div className="space-y-2">
              {['Space Marines', 'Orks', 'Eldar', 'Necrons'].map((type) => (
                <div key={type} className="flex items-center space-x-2">
                  <Checkbox
                    id={`type-${type}`}
                    checked={filters.types.includes(type)}
                    onCheckedChange={(checked) => {
                      if (checked) {
                        updateFilters('types', [...filters.types, type]);
                      } else {
                        updateFilters('types', filters.types.filter(t => t !== type));
                      }
                    }}
                  />
                  <label htmlFor={`type-${type}`} className="text-sm">
                    {type}
                  </label>
                </div>
              ))}
            </div>
          </div>

          {/* Appearance/Condition */}
          <div className="space-y-3">
            <label className="text-sm font-medium">Wygląd/Stan</label>
            <div className="space-y-2">
              {['New in Box', 'Painted', 'Assembled', 'Damaged'].map((condition) => (
                <div key={condition} className="flex items-center space-x-2">
                  <Checkbox
                    id={`condition-${condition}`}
                    checked={filters.conditions.includes(condition)}
                    onCheckedChange={(checked) => {
                      if (checked) {
                        updateFilters('conditions', [...filters.conditions, condition]);
                      } else {
                        updateFilters('conditions', filters.conditions.filter(c => c !== condition));
                      }
                    }}
                  />
                  <label htmlFor={`condition-${condition}`} className="text-sm">
                    {condition}
                  </label>
                </div>
              ))}
            </div>
          </div>

          {/* Colors */}
          <div className="space-y-3">
            <label className="text-sm font-medium">Kolor</label>
            <div className="grid grid-cols-5 gap-2">
              {colorSwatches.map((color, index) => (
                <button
                  key={index}
                  className={`w-8 h-8 rounded-full border-2 transition-all ${
                    filters.colors.includes(color)
                      ? 'border-primary scale-110'
                      : 'border-muted-foreground/20 hover:border-muted-foreground/40'
                  }`}
                  style={{ backgroundColor: color }}
                  onClick={() => {
                    if (filters.colors.includes(color)) {
                      updateFilters('colors', filters.colors.filter(c => c !== color));
                    } else {
                      updateFilters('colors', [...filters.colors, color]);
                    }
                  }}
                  aria-label={`Kolor ${color}`}
                />
              ))}
            </div>
          </div>

          {/* Quality/Condition */}
          <div className="space-y-3">
            <label className="text-sm font-medium">Jakość/Condition</label>
            <Select value={filters.categories[0] || ''} onValueChange={(value) => updateFilters('categories', [value])}>
              <SelectTrigger>
                <SelectValue placeholder="Wybierz jakość" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="mint">Mint</SelectItem>
                <SelectItem value="excellent">Excellent</SelectItem>
                <SelectItem value="good">Good</SelectItem>
                <SelectItem value="fair">Fair</SelectItem>
                <SelectItem value="poor">Poor</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* System -> Faction -> Category */}
          <div className="space-y-3">
            <label className="text-sm font-medium">System</label>
            <Select value={filters.factions[0] || ''} onValueChange={(value) => updateFilters('factions', [value])}>
              <SelectTrigger>
                <SelectValue placeholder="Wybierz frakcję" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="imperium">Imperium</SelectItem>
                <SelectItem value="chaos">Chaos</SelectItem>
                <SelectItem value="xenos">Xenos</SelectItem>
                <SelectItem value="orks">Orks</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Rare Items / Pattern */}
          <div className="space-y-3">
            <label className="text-sm font-medium">Rzadkie przedmioty / Pattern</label>
            <Select value={filters.patterns[0] || ''} onValueChange={(value) => updateFilters('patterns', [value])}>
              <SelectTrigger>
                <SelectValue placeholder="Wybierz pattern" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="standard">Standard</SelectItem>
                <SelectItem value="limited">Limited Edition</SelectItem>
                <SelectItem value="exclusive">Exclusive</SelectItem>
                <SelectItem value="prototype">Prototype</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Reset Button */}
          <div className="pt-4 border-t">
            <Button
              variant="outline"
              size="sm"
              onClick={resetFilters}
              disabled={!hasActiveFilters}
              className="w-full"
            >
              <RotateCcw className="h-4 w-4 mr-2" />
              Reset
            </Button>
          </div>
        </CollapsibleContent>
      </Collapsible>

      {hasActiveFilters && (
        <div className="mt-4 flex flex-wrap gap-1">
          <Badge variant="secondary" className="text-xs">
            {Object.values(filters).reduce((count, value) => {
              if (Array.isArray(value)) return count + value.length;
              return count;
            }, 0)} filtrów aktywnych
          </Badge>
        </div>
      )}
    </div>
  );
}
