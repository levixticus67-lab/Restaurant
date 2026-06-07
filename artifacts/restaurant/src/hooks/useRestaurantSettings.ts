import { useState, useEffect } from "react";
import { doc, setDoc, onSnapshot } from "firebase/firestore";
import { db, isFirebaseConfigured } from "@/lib/firebase";

export interface RestaurantSettings {
  address: string;
  lat: number;
  lng: number;
  zoom: number;
  phone: string;
  email: string;
  hours: { breakfast: string; lunch: string; dinner: string };
  name: string;
  tagline: string;
  logoUrl: string;
  heroImageUrl: string;
  primaryColor: string;
}

const DEFAULTS: RestaurantSettings = {
  address: "123 Gourmet Lane, Food District, New York, NY 10001",
  lat: 40.758,
  lng: -73.9855,
  zoom: 16,
  phone: "+1 (555) 234-5678",
  email: "hello@saveur.restaurant",
  hours: { breakfast: "7am – 11am", lunch: "12pm – 3pm", dinner: "6pm – 11pm" },
  name: "Saveur",
  tagline: "Crafted with passion, served with pride",
  logoUrl: "",
  heroImageUrl:
    "https://images.unsplash.com/photo-1504674900247-0877df9cc836?w=1600&q=80",
  primaryColor: "#D4A853",
};

export function useRestaurantSettings() {
  const [settings, setSettings] = useState<RestaurantSettings>(DEFAULTS);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (!db || !isFirebaseConfigured) return;
    setLoading(true);
    const ref = doc(db, "settings", "restaurant");
    const unsub = onSnapshot(ref, (snap) => {
      if (snap.exists()) {
        setSettings({ ...DEFAULTS, ...(snap.data() as Partial<RestaurantSettings>) });
      }
      setLoading(false);
    });
    return unsub;
  }, []);

  const saveSettings = async (updates: Partial<RestaurantSettings>) => {
    if (!db || !isFirebaseConfigured) return;
    setSaving(true);
    try {
      await setDoc(doc(db, "settings", "restaurant"), updates, { merge: true });
    } finally {
      setSaving(false);
    }
  };

  return { settings, loading, saving, saveSettings };
}
