export interface NutritionInfo {
  protein: number;
  carbs: number;
  fats: number;
  fiber?: number;
  sugar?: number;
  sodium?: number;
}

export interface MealComponent {
  name: string;
  price: number;
  imageUrl?: string;
}

export interface MealComponents {
  bases?: MealComponent[];
  proteins?: MealComponent[];
  sides?: MealComponent[];
  sauces?: MealComponent[];
}

export interface Meal {
  id: string;
  name: string;
  description: string;
  price: number;
  category: string;
  imageUrl: string;
  images?: string[];
  ingredients?: string[];
  allergens?: string[];
  tags?: string[];
  isAvailable: boolean;
  isFeatured?: boolean;
  isChefSpecial?: boolean;
  expiresAt?: number;
  prepTime?: string;
  calories?: number;
  nutrition?: NutritionInfo;
  components?: MealComponents;
  videoUrl?: string;
  sortOrder?: number;
  createdAt?: number;
}

export interface CartItem {
  meal: Meal;
  quantity: number;
  customizations?: Record<string, string>;
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
  tableId?: string;
  tableNumber?: number;
  deliveryAddress?: string;
  notes?: string;
  items: OrderItem[];
  subtotal: number;
  deliveryFee: number;
  tip?: number;
  tax?: number;
  giftCardCode?: string;
  giftCardDiscount?: number;
  total: number;
  status: OrderStatus;
  createdAt: number;
  updatedAt: number;
}

export interface Reservation {
  id: string;
  customerName: string;
  customerPhone: string;
  customerEmail?: string;
  tableId: string;
  tableNumber: number;
  date: string;
  time: string;
  partySize: number;
  notes?: string;
  status: "confirmed" | "cancelled" | "completed";
  createdAt: number;
}

export interface RestaurantTable {
  id: string;
  number: number;
  seats: number;
  x: number;
  y: number;
  shape: "round" | "square" | "rect";
  label?: string;
}

export interface GiftCard {
  id: string;
  code: string;
  originalAmount: number;
  balance: number;
  senderName: string;
  recipientName: string;
  recipientPhone?: string;
  message?: string;
  isUsed: boolean;
  createdAt: number;
  usedAt?: number;
}

export interface LoyaltyCard {
  id: string;
  phone: string;
  name: string;
  stamps: number;
  totalSpent: number;
  rewardsClaimed: number;
  lastOrderAt?: number;
  createdAt: number;
}

export type MoodType = "adventurous" | "comfort" | "healthy" | "celebrating";
