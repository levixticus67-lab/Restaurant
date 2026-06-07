import { useState, useEffect, useCallback } from "react";
import {
  collection,
  doc,
  getDoc,
  setDoc,
  updateDoc,
  query,
  orderBy,
  onSnapshot,
  serverTimestamp,
} from "firebase/firestore";
import { db, isFirebaseConfigured } from "@/lib/firebase";
import { LoyaltyCard } from "@/types";

export const STAMPS_FOR_REWARD = 10;

export function useLoyalty() {
  const [cards, setCards] = useState<LoyaltyCard[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!db || !isFirebaseConfigured) return;
    setLoading(true);
    const q = query(collection(db, "loyalty"), orderBy("createdAt", "desc"));
    const unsub = onSnapshot(q, (snap) => {
      setCards(snap.docs.map((d) => ({ id: d.id, ...d.data() } as LoyaltyCard)));
      setLoading(false);
    });
    return unsub;
  }, []);

  const getLoyaltyCard = useCallback(async (phone: string): Promise<LoyaltyCard | null> => {
    if (!db || !isFirebaseConfigured) return null;
    const ref = doc(db, "loyalty", phone);
    const snap = await getDoc(ref);
    if (!snap.exists()) return null;
    return { id: snap.id, ...snap.data() } as LoyaltyCard;
  }, []);

  const addStamp = useCallback(async (phone: string, name: string, amountSpent: number) => {
    if (!db || !isFirebaseConfigured) return;
    const ref = doc(db, "loyalty", phone);
    const snap = await getDoc(ref);
    if (snap.exists()) {
      const data = snap.data() as LoyaltyCard;
      await updateDoc(ref, {
        stamps: data.stamps + 1,
        totalSpent: data.totalSpent + amountSpent,
        lastOrderAt: Date.now(),
      });
    } else {
      await setDoc(ref, {
        phone,
        name,
        stamps: 1,
        totalSpent: amountSpent,
        rewardsClaimed: 0,
        lastOrderAt: Date.now(),
        createdAt: Date.now(),
      });
    }
  }, []);

  const claimReward = useCallback(async (phone: string) => {
    if (!db || !isFirebaseConfigured) return;
    const ref = doc(db, "loyalty", phone);
    const snap = await getDoc(ref);
    if (!snap.exists()) return;
    const data = snap.data() as LoyaltyCard;
    await updateDoc(ref, {
      stamps: data.stamps - STAMPS_FOR_REWARD,
      rewardsClaimed: data.rewardsClaimed + 1,
    });
  }, []);

  return { cards, loading, getLoyaltyCard, addStamp, claimReward };
}
