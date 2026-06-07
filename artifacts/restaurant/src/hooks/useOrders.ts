import { useState, useEffect } from "react";
import {
  collection,
  addDoc,
  updateDoc,
  doc,
  onSnapshot,
  query,
  orderBy,
  serverTimestamp,
  where,
  getDocs,
} from "firebase/firestore";
import { db, isFirebaseConfigured } from "@/lib/firebase";
import { Order, OrderItem, OrderType } from "@/types";

function generateOrderNumber(): string {
  const chars = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";
  let result = "";
  for (let i = 0; i < 6; i++) {
    result += chars[Math.floor(Math.random() * chars.length)];
  }
  return result;
}

export interface PlaceOrderPayload {
  customerName: string;
  customerPhone: string;
  orderType: OrderType;
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
}

export function useOrders() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!db || !isFirebaseConfigured) return;
    setLoading(true);
    const q = query(collection(db, "orders"), orderBy("createdAt", "desc"));
    const unsub = onSnapshot(q, (snap) => {
      const data = snap.docs.map((d) => ({ id: d.id, ...d.data() } as Order));
      setOrders(data);
      setLoading(false);
    });
    return unsub;
  }, []);

  const placeOrder = async (payload: PlaceOrderPayload): Promise<string> => {
    if (!db || !isFirebaseConfigured) {
      const fakeNumber = generateOrderNumber();
      return fakeNumber;
    }
    const orderNumber = generateOrderNumber();
    const now = Date.now();
    await addDoc(collection(db, "orders"), {
      ...payload,
      orderNumber,
      status: "pending",
      createdAt: serverTimestamp(),
      updatedAt: now,
    });
    return orderNumber;
  };

  const updateOrderStatus = async (orderId: string, status: Order["status"]) => {
    if (!db || !isFirebaseConfigured) return;
    await updateDoc(doc(db, "orders", orderId), {
      status,
      updatedAt: Date.now(),
    });
  };

  const findOrderByNumber = async (orderNumber: string): Promise<Order | null> => {
    if (!db || !isFirebaseConfigured) return null;
    const q = query(
      collection(db, "orders"),
      where("orderNumber", "==", orderNumber.toUpperCase())
    );
    const snap = await getDocs(q);
    if (snap.empty) return null;
    const d = snap.docs[0];
    return { id: d.id, ...d.data() } as Order;
  };

  return { orders, loading, placeOrder, updateOrderStatus, findOrderByNumber };
}
