import { useState, useEffect, useCallback } from "react";
import {
  collection,
  addDoc,
  updateDoc,
  doc,
  onSnapshot,
  query,
  orderBy,
  where,
  getDocs,
} from "firebase/firestore";
import { db, isFirebaseConfigured } from "@/lib/firebase";
import { Reservation, RestaurantTable } from "@/types";

const DEFAULT_TABLES: RestaurantTable[] = [
  { id: "t1",  number: 1,  seats: 2, x: 10, y: 15, shape: "round"  },
  { id: "t2",  number: 2,  seats: 2, x: 25, y: 15, shape: "round"  },
  { id: "t3",  number: 3,  seats: 4, x: 42, y: 12, shape: "square" },
  { id: "t4",  number: 4,  seats: 4, x: 62, y: 12, shape: "square" },
  { id: "t5",  number: 5,  seats: 6, x: 78, y: 15, shape: "rect"   },
  { id: "t6",  number: 6,  seats: 2, x: 10, y: 45, shape: "round"  },
  { id: "t7",  number: 7,  seats: 4, x: 28, y: 45, shape: "square" },
  { id: "t8",  number: 8,  seats: 4, x: 48, y: 45, shape: "square" },
  { id: "t9",  number: 9,  seats: 6, x: 68, y: 45, shape: "rect"   },
  { id: "t10", number: 10, seats: 8, x: 30, y: 72, shape: "rect"   },
  { id: "t11", number: 11, seats: 4, x: 65, y: 72, shape: "square" },
];

export function useReservations() {
  const [reservations, setReservations] = useState<Reservation[]>([]);
  const [tables] = useState<RestaurantTable[]>(DEFAULT_TABLES);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!db || !isFirebaseConfigured) return;
    setLoading(true);
    const q = query(collection(db, "reservations"), orderBy("createdAt", "desc"));
    const unsub = onSnapshot(q, (snap) => {
      setReservations(snap.docs.map((d) => ({ id: d.id, ...d.data() } as Reservation)));
      setLoading(false);
    });
    return unsub;
  }, []);

  const getReservationsForDate = useCallback(async (date: string): Promise<Reservation[]> => {
    if (!db || !isFirebaseConfigured) return [];
    const q = query(
      collection(db, "reservations"),
      where("date", "==", date),
      where("status", "==", "confirmed")
    );
    const snap = await getDocs(q);
    return snap.docs.map((d) => ({ id: d.id, ...d.data() } as Reservation));
  }, []);

  const makeReservation = useCallback(
    async (data: Omit<Reservation, "id" | "createdAt">): Promise<string> => {
      if (!db || !isFirebaseConfigured) return "DEMO_RES";
      const ref = await addDoc(collection(db, "reservations"), {
        ...data,
        createdAt: Date.now(),
      });
      return ref.id;
    },
    []
  );

  const cancelReservation = useCallback(async (id: string) => {
    if (!db || !isFirebaseConfigured) return;
    await updateDoc(doc(db, "reservations", id), { status: "cancelled" });
  }, []);

  return { reservations, tables, loading, getReservationsForDate, makeReservation, cancelReservation };
}
