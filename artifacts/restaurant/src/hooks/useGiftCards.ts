import { useState, useCallback } from "react";
import {
  collection,
  addDoc,
  updateDoc,
  doc,
  query,
  where,
  getDocs,
  onSnapshot,
  orderBy,
} from "firebase/firestore";
import { useEffect } from "react";
import { db, isFirebaseConfigured } from "@/lib/firebase";
import { GiftCard } from "@/types";

function generateCode(): string {
  const chars = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";
  let code = "";
  for (let i = 0; i < 12; i++) {
    if (i === 4 || i === 8) code += "-";
    code += chars[Math.floor(Math.random() * chars.length)];
  }
  return code;
}

export function useGiftCards() {
  const [cards, setCards] = useState<GiftCard[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!db || !isFirebaseConfigured) return;
    setLoading(true);
    const q = query(collection(db, "giftCards"), orderBy("createdAt", "desc"));
    const unsub = onSnapshot(q, (snap) => {
      setCards(snap.docs.map((d) => ({ id: d.id, ...d.data() } as GiftCard)));
      setLoading(false);
    });
    return unsub;
  }, []);

  const issueGiftCard = useCallback(
    async (data: {
      amount: number;
      senderName: string;
      recipientName: string;
      recipientPhone?: string;
      message?: string;
    }): Promise<GiftCard> => {
      const card: Omit<GiftCard, "id"> = {
        code: generateCode(),
        originalAmount: data.amount,
        balance: data.amount,
        senderName: data.senderName,
        recipientName: data.recipientName,
        recipientPhone: data.recipientPhone,
        message: data.message,
        isUsed: false,
        createdAt: Date.now(),
      };
      if (!db || !isFirebaseConfigured) {
        return { ...card, id: "demo-" + Date.now() };
      }
      const ref = await addDoc(collection(db, "giftCards"), card);
      return { ...card, id: ref.id };
    },
    []
  );

  const validateGiftCard = useCallback(async (code: string): Promise<GiftCard | null> => {
    if (!db || !isFirebaseConfigured) return null;
    const q = query(collection(db, "giftCards"), where("code", "==", code.toUpperCase()));
    const snap = await getDocs(q);
    if (snap.empty) return null;
    const d = snap.docs[0];
    return { id: d.id, ...d.data() } as GiftCard;
  }, []);

  const redeemGiftCard = useCallback(async (cardId: string, amountUsed: number): Promise<void> => {
    if (!db || !isFirebaseConfigured) return;
    const ref = doc(db, "giftCards", cardId);
    const snap = await getDocs(query(collection(db, "giftCards"), where("__name__", "==", cardId)));
    if (snap.empty) return;
    const card = snap.docs[0].data() as GiftCard;
    const newBalance = Math.max(0, card.balance - amountUsed);
    await updateDoc(ref, {
      balance: newBalance,
      isUsed: newBalance === 0,
      usedAt: newBalance === 0 ? Date.now() : null,
    });
  }, []);

  return { cards, loading, issueGiftCard, validateGiftCard, redeemGiftCard };
}
