import { useState } from "react";
import { motion } from "framer-motion";
import { QrCode, Download, Users, Copy, Check } from "lucide-react";

const TABLES = Array.from({ length: 11 }, (_, i) => ({ number: i + 1, seats: [2, 2, 4, 4, 6, 2, 4, 4, 6, 8, 4][i] }));

function getQRUrl(tableNumber: number): string {
  const baseUrl = typeof window !== "undefined" ? window.location.origin : "https://your-app.web.app";
  const tableUrl = `${baseUrl}/menu?table=${tableNumber}`;
  return `https://api.qrserver.com/v1/create-qr-code/?size=300x300&format=png&color=ffffff&bgcolor=080f1c&data=${encodeURIComponent(tableUrl)}`;
}

function getTableUrl(tableNumber: number): string {
  const baseUrl = typeof window !== "undefined" ? window.location.origin : "https://your-app.web.app";
  return `${baseUrl}/menu?table=${tableNumber}`;
}

export default function TableQRManager() {
  const [selected, setSelected] = useState<number | null>(null);
  const [copied, setCopied] = useState<number | null>(null);

  const handleCopy = (n: number) => {
    navigator.clipboard.writeText(getTableUrl(n));
    setCopied(n);
    setTimeout(() => setCopied(null), 2000);
  };

  return (
    <div className="space-y-4">
      <p className="text-white/40 text-sm">
        Each QR code links customers directly to the menu with their table pre-selected. Print and place on tables.
      </p>

      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3">
        {TABLES.map((t) => (
          <motion.div
            key={t.number}
            whileHover={{ y: -2 }}
            onClick={() => setSelected(selected === t.number ? null : t.number)}
            className="rounded-2xl p-4 cursor-pointer"
            style={{
              background: selected === t.number ? "rgba(59,130,246,0.12)" : "rgba(255,255,255,0.04)",
              border: `1px solid ${selected === t.number ? "rgba(59,130,246,0.3)" : "rgba(255,255,255,0.07)"}`,
            }}
          >
            <div className="flex items-center justify-between mb-3">
              <span className="text-white font-bold text-sm">Table {t.number}</span>
              <div className="flex items-center gap-1 text-xs" style={{ color: "rgba(255,255,255,0.4)" }}>
                <Users size={11} />
                {t.seats}
              </div>
            </div>
            <div
              className="w-full aspect-square rounded-xl flex items-center justify-center overflow-hidden mb-3"
              style={{ background: "rgba(255,255,255,0.03)" }}
            >
              <img
                src={getQRUrl(t.number)}
                alt={`Table ${t.number} QR`}
                className="w-full h-full object-contain rounded-xl"
                loading="lazy"
              />
            </div>
            <div className="flex gap-1.5">
              <button
                onClick={(e) => { e.stopPropagation(); handleCopy(t.number); }}
                className="flex-1 flex items-center justify-center gap-1 py-1.5 rounded-lg text-xs font-medium"
                style={{ background: "rgba(255,255,255,0.06)", color: "rgba(255,255,255,0.5)" }}
              >
                {copied === t.number ? <Check size={11} style={{ color: "#10b981" }} /> : <Copy size={11} />}
                {copied === t.number ? "Copied!" : "Copy"}
              </button>
              <a
                href={getQRUrl(t.number)}
                download={`table-${t.number}-qr.png`}
                onClick={(e) => e.stopPropagation()}
                target="_blank"
                rel="noopener noreferrer"
                className="flex-1 flex items-center justify-center gap-1 py-1.5 rounded-lg text-xs font-medium"
                style={{ background: "rgba(59,130,246,0.1)", color: "#60a5fa", border: "1px solid rgba(59,130,246,0.2)" }}
              >
                <Download size={11} />
                Save
              </a>
            </div>
          </motion.div>
        ))}
      </div>
    </div>
  );
}
