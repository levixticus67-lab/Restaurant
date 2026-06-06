import {
  createContext,
  useContext,
  useState,
  ReactNode,
} from "react";
import { CartItem, Meal } from "@/types";

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
}

const CartContext = createContext<CartContextType | null>(null);

export function CartProvider({ children }: { children: ReactNode }) {
  const [items, setItems] = useState<CartItem[]>([]);
  const [isOpen, setIsOpen] = useState(false);

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
    setIsOpen(true);
  };

  const removeItem = (mealId: string) =>
    setItems((prev) => prev.filter((i) => i.meal.id !== mealId));

  const updateQty = (mealId: string, qty: number) => {
    if (qty <= 0) return removeItem(mealId);
    setItems((prev) =>
      prev.map((i) => (i.meal.id === mealId ? { ...i, quantity: qty } : i))
    );
  };

  const clearCart = () => setItems([]);

  const total = items.reduce(
    (sum, i) => sum + i.meal.price * i.quantity,
    0
  );
  const count = items.reduce((sum, i) => sum + i.quantity, 0);

  return (
    <CartContext.Provider
      value={{ items, addItem, removeItem, updateQty, clearCart, total, count, isOpen, setIsOpen }}
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
