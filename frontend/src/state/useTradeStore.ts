import { create } from 'zustand';

export interface Item {
  id: number;
  name: string;
  imageUrl?: string;
  faction?: string;
  condition?: string;
  tags?: string[];
  estValueCents?: number;
  available: boolean;
}

interface TradeStore {
  selectedItems: Item[];
  cashCents: number;
  addItem: (item: Item) => void;
  removeItem: (id: number) => void;
  setCash: (amount: number) => void;
  clear: () => void;
}

export const useTradeStore = create<TradeStore>((set, get) => ({
  selectedItems: [],
  cashCents: 0,

  addItem: (item: Item) => {
    const { selectedItems } = get();
    if (selectedItems.length >= 12) return;

    const exists = selectedItems.some(i => i.id === item.id);
    if (exists) return;

    set({ selectedItems: [...selectedItems, item] });
  },

  removeItem: (id: number) => {
    const { selectedItems } = get();
    set({ selectedItems: selectedItems.filter(i => i.id !== id) });
  },

  setCash: (amount: number) => {
    set({ cashCents: Math.max(0, amount) });
  },

  clear: () => {
    set({ selectedItems: [], cashCents: 0 });
  },
}));
