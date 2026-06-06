import { useState, useEffect } from "react";
import {
  collection,
  addDoc,
  updateDoc,
  deleteDoc,
  doc,
  onSnapshot,
  query,
  orderBy,
  serverTimestamp,
} from "firebase/firestore";
import { db, isFirebaseConfigured } from "@/lib/firebase";
import { Meal } from "@/types";

const DEMO_MEALS: Meal[] = [
  {
    id: "demo-1",
    name: "Signature Smash Burger",
    description: "Double smash patty, aged cheddar, caramelized onions, house pickles & secret sauce on a brioche bun.",
    price: 18.99,
    category: "Burgers",
    imageUrl: "https://images.unsplash.com/photo-1568901346375-23c9450c58cd?w=600&q=80",
    ingredients: ["Beef patty", "Aged cheddar", "Brioche bun", "Caramelized onions", "Secret sauce"],
    isAvailable: true,
    isFeatured: true,
    prepTime: "12 min",
    calories: 820,
  },
  {
    id: "demo-2",
    name: "Grilled Sea Bass",
    description: "Pan-seared sea bass fillet, lemon caper butter, roasted cherry tomatoes & wilted spinach.",
    price: 28.5,
    category: "Seafood",
    imageUrl: "https://images.unsplash.com/photo-1519708227418-c8fd9a32b7a2?w=600&q=80",
    ingredients: ["Sea bass", "Lemon butter", "Capers", "Cherry tomatoes", "Spinach"],
    isAvailable: true,
    isFeatured: true,
    prepTime: "18 min",
    calories: 460,
  },
  {
    id: "demo-3",
    name: "Truffle Pasta",
    description: "Fresh handmade tagliatelle, black truffle shavings, parmesan cream, toasted pine nuts.",
    price: 24.0,
    category: "Pasta",
    imageUrl: "https://images.unsplash.com/photo-1621996346565-e3dbc646d9a9?w=600&q=80",
    ingredients: ["Tagliatelle", "Black truffle", "Parmesan", "Cream", "Pine nuts"],
    isAvailable: true,
    isFeatured: true,
    prepTime: "15 min",
    calories: 650,
  },
  {
    id: "demo-4",
    name: "Margherita Napoletana",
    description: "Wood-fired Neapolitan pizza, San Marzano tomatoes, fresh mozzarella di bufala, basil & EVOO.",
    price: 21.0,
    category: "Pizza",
    imageUrl: "https://images.unsplash.com/photo-1574071318508-1cdbab80d002?w=600&q=80",
    ingredients: ["San Marzano tomatoes", "Mozzarella di bufala", "Fresh basil", "EVOO"],
    isAvailable: true,
    prepTime: "10 min",
    calories: 720,
  },
  {
    id: "demo-5",
    name: "Wagyu Ribeye",
    description: "200g A4 Wagyu ribeye, truffle butter, roasted garlic mash & seasonal greens.",
    price: 65.0,
    category: "Grills",
    imageUrl: "https://images.unsplash.com/photo-1558030006-450675393462?w=600&q=80",
    ingredients: ["Wagyu ribeye", "Truffle butter", "Garlic mash", "Seasonal greens"],
    isAvailable: true,
    isFeatured: true,
    prepTime: "22 min",
    calories: 980,
  },
  {
    id: "demo-6",
    name: "Burrata Bruschetta",
    description: "Toasted sourdough, creamy burrata, heirloom tomatoes, aged balsamic & fresh basil.",
    price: 14.5,
    category: "Starters",
    imageUrl: "https://images.unsplash.com/photo-1594007654729-407eedc4be65?w=600&q=80",
    ingredients: ["Burrata", "Sourdough", "Heirloom tomatoes", "Aged balsamic", "Basil"],
    isAvailable: true,
    prepTime: "8 min",
    calories: 380,
  },
  {
    id: "demo-7",
    name: "Molten Lava Cake",
    description: "Warm dark chocolate fondant, vanilla bean ice cream & raspberry coulis.",
    price: 12.0,
    category: "Desserts",
    imageUrl: "https://images.unsplash.com/photo-1624353365286-3f8d62daad51?w=600&q=80",
    ingredients: ["Dark chocolate", "Vanilla ice cream", "Raspberry coulis"],
    isAvailable: true,
    prepTime: "12 min",
    calories: 540,
  },
  {
    id: "demo-8",
    name: "Mango Paloma",
    description: "Fresh mango purée, grapefruit juice, elderflower & sparkling water. Refreshingly tropical.",
    price: 8.5,
    category: "Drinks",
    imageUrl: "https://images.unsplash.com/photo-1513558161293-cdaf765ed2fd?w=600&q=80",
    ingredients: ["Mango purée", "Grapefruit juice", "Elderflower", "Sparkling water"],
    isAvailable: true,
    prepTime: "3 min",
    calories: 180,
  },
];

export function useMenu() {
  const [meals, setMeals] = useState<Meal[]>(DEMO_MEALS);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!db || !isFirebaseConfigured) return;
    setLoading(true);
    const q = query(collection(db, "meals"), orderBy("createdAt", "desc"));
    const unsub = onSnapshot(q, (snap) => {
      const data = snap.docs.map((d) => ({ id: d.id, ...d.data() } as Meal));
      setMeals(data.length > 0 ? data : DEMO_MEALS);
      setLoading(false);
    });
    return unsub;
  }, []);

  const addMeal = async (meal: Omit<Meal, "id">) => {
    if (!db) throw new Error("Firebase not configured");
    await addDoc(collection(db, "meals"), { ...meal, createdAt: serverTimestamp() });
  };

  const updateMeal = async (id: string, updates: Partial<Meal>) => {
    if (!db) throw new Error("Firebase not configured");
    await updateDoc(doc(db, "meals", id), updates);
  };

  const deleteMeal = async (id: string) => {
    if (!db) throw new Error("Firebase not configured");
    await deleteDoc(doc(db, "meals", id));
  };

  return { meals, loading, addMeal, updateMeal, deleteMeal };
}
