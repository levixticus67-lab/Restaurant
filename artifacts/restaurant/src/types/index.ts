export interface Meal {
  id: string;
  name: string;
  description: string;
  price: number;
  category: string;
  imageUrl: string;
  ingredients?: string[];
  isAvailable: boolean;
  isFeatured?: boolean;
  prepTime?: string;
  calories?: number;
  createdAt?: number;
}

export interface CartItem {
  meal: Meal;
  quantity: number;
}

export type Category =
  | "All"
  | "Starters"
  | "Mains"
  | "Burgers"
  | "Pasta"
  | "Pizza"
  | "Grills"
  | "Seafood"
  | "Desserts"
  | "Drinks";

export interface OrderItem {
  mealId: string;
  mealName: string;
  mealImage: string;
  price: number;
  quantity: number;
}

export type OrderStatus =
  | "pending"
  | "confirmed"
  | "preparing"
  | "ready"
  | "delivered"
  | "cancelled";

export type OrderType = "dine-in" | "delivery" | "takeaway";

export interface Order {
  id: string;
  orderNumber: string;
  customerName: string;
  customerPhone: string;
  orderType: OrderType;
  deliveryAddress?: string;
  notes?: string;
  items: OrderItem[];
  subtotal: number;
  deliveryFee: number;
  total: number;
  status: OrderStatus;
  createdAt: number;
  updatedAt: number;
}
