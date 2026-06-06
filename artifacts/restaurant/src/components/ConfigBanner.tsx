import { AlertCircle } from "lucide-react";
import { isFirebaseConfigured } from "@/lib/firebase";

export default function ConfigBanner() {
  if (isFirebaseConfigured) return null;

  return (
    <div
      className="fixed bottom-4 left-4 right-4 sm:left-auto sm:right-4 sm:max-w-sm z-50 p-4 rounded-2xl flex items-start gap-3"
      style={{
        background: "rgba(245,158,11,0.15)",
        border: "1px solid rgba(245,158,11,0.3)",
        backdropFilter: "blur(12px)",
      }}
    >
      <AlertCircle size={18} style={{ color: "#f59e0b", marginTop: 2 }} className="shrink-0" />
      <div>
        <p className="text-sm font-semibold" style={{ color: "#f59e0b" }}>Demo Mode</p>
        <p className="text-xs text-white/60 mt-0.5">
          Add your Firebase &amp; Cloudinary env vars to unlock live data, admin uploads &amp; auth.
        </p>
      </div>
    </div>
  );
}
