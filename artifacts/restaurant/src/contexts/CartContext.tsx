import {
  createContext,
  useContext,
  useState,
  useEffect,
  ReactNode,
} from "react";
import { CartItem, Meal, Order } from "@/types";

interface GiftCardApplied {
  id: string;
  code: string;
  discount: number;
}

interface CartContextType {
  items: CartItem[];
  addItem: (meal: Meal) => void;
  removeItem: (mealId: string) => void;
  updateQty: (mealId: string, qty: number) => void;
  clearCart: () => void;
  total: number;
  count: number;
  isOpen: boolean;
  setIsOpen: (v: boolean) => void;
  tip: number;
  setTip: (v: number) => void;
  giftCard: GiftCardApplied | null;
  setGiftCard: (v: GiftCardApplied | null) => void;
  orderHistory: Order[];
  addToHistory: (order: Order) => void;
  lastAddedMeal: Meal | null;
}

const CartContext = createContext<CartContextType | null>(null);

const HISTORY_KEY = "saveur_order_history";

export function CartProvider({ children }: { children: ReactNode }) {
  const [items, setItems] = useState<CartItem[]>([]);
  const [isOpen, setIsOpen] = useState(false);
  const [tip, setTip] = useState(0);
  const [giftCard, setGiftCard] = useState<GiftCardApplied | null>(null);
  const [orderHistory, setOrderHistory] = useState<Order[]>([]);
  const [lastAddedMeal, setLastAddedMeal] = useState<Meal | null>(null);

  useEffect(() => {
    try {
      const stored = localStorage.getItem(HISTORY_KEY);
      if (stored) setOrderHistory(JSON.parse(stored));
    } catch {}
  }, []);

  const addItem = (meal: Meal) => {
    setItems((prev) => {
      const existing = prev.find((i) => i.meal.id === meal.id);
      if (existing) {
        return prev.map((i) =>
          i.meal.id === meal.id ? { ...i, quantity: i.quantity + 1 } : i
        );
      }
      return [...prev, { meal, quantity: 1 }];
    });
    setLastAddedMeal(meal);
    setIsOpen(true);
    setTimeout(() => setLastAddedMeal(null), 8000);
  };

  const removeItem = (mealId: string) =>
    setItems((prev) => prev.filter((i) => i.meal.id !== mealId));

  const updateQty = (mealId: string, qty: number) => {
    if (qty <= 0) return removeItem(mealId);
    setItems((prev) =>
      prev.map((i) => (i.meal.id === mealId ? { ...i, quantity: qty } : i))
    );
  };

  const clearCart = () => {
    setItems([]);
    setTip(0);
    setGiftCard(null);
  };

  const addToHistory = (order: Order) => {
    setOrderHistory((prev) => {
      const updated = [order, ...prev].slice(0, 20);
      try { localStorage.setItem(HISTORY_KEY, JSON.stringify(updated)); } catch {}
      return updated;
    });
  };

  const subtotal = items.reduce((sum, i) => sum + i.meal.price * i.quantity, 0);
  const total = subtotal;
  const count = items.reduce((sum, i) => sum + i.quantity, 0);

  return (
    <CartContext.Provider
      value={{
        items,
        addItem,
        removeItem,
        updateQty,
        clearCart,
        total,
        count,
        isOpen,
        setIsOpen,
        tip,
        setTip,
        giftCard,
        setGiftCard,
        orderHistory,
        addToHistory,
        lastAddedMeal,
      }}
    >
      {children}
    </CartContext.Provider>
  );
}

export function useCart() {
  const ctx = useContext(CartContext);
  if (!ctx) throw new Error("useCart must be used within CartProvider");
  return ctx;
}
