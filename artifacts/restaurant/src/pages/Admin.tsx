import { useState, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Plus, Pencil, Trash2, LogOut, Upload, X, CheckCircle,
  UtensilsCrossed, ToggleLeft, ToggleRight, ImageIcon,
  ClipboardList, ChevronDown, Package, ChefHat, Truck,
  Settings, MapPin, ExternalLink, Phone, Mail, Clock,
  QrCode, BarChart3, Star, CheckSquare, Square, Flame,
  Video, Tag, Shield, Dumbbell, ArrowUp, ArrowDown,
} from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { useMenu } from "@/hooks/useMenu";
import { useOrders } from "@/hooks/useOrders";
import { useRestaurantSettings } from "@/hooks/useRestaurantSettings";
import { useLoyalty, STAMPS_FOR_REWARD } from "@/hooks/useLoyalty";
import { uploadImage, isCloudinaryConfigured } from "@/lib/cloudinary";
import { isFirebaseConfigured } from "@/lib/firebase";
import { Meal, Order, OrderStatus } from "@/types";
import { Link } from "wouter";
import AnimatedDots from "@/components/AnimatedDots";
import TableQRManager from "@/components/TableQRManager";
import PeakHoursHeatmap from "@/components/PeakHoursHeatmap";
import LoyaltyCard from "@/components/LoyaltyCard";

const EMPTY_FORM = {
  name: "", description: "", price: "", category: "Mains", imageUrl: "",
  ingredients: "", allergens: "", tags: "",
  isAvailable: true, isFeatured: false, isChefSpecial: false,
  expiresAt: "", prepTime: "", calories: "",
  protein: "", carbs: "", fats: "", fiber: "",
  videoUrl: "",
};

const ORDER_STATUS_FLOW: OrderStatus[] = ["pending", "confirmed", "preparing", "ready", "delivered"];

const STATUS_META: Record<OrderStatus, { label: string; color: string; bg: string; icon: React.ReactNode }> = {
  pending:   { label: "Pending",   color: "#f59e0b", bg: "rgba(245,158,11,0.12)",  icon: <Package size={13} /> },
  confirmed: { label: "Confirmed", color: "#60a5fa", bg: "rgba(59,130,246,0.12)",  icon: <CheckCircle size={13} /> },
  preparing: { label: "Preparing", color: "#a78bfa", bg: "rgba(139,92,246,0.12)",  icon: <ChefHat size={13} /> },
  ready:     { label: "Ready",     color: "#34d399", bg: "rgba(16,185,129,0.12)",  icon: <UtensilsCrossed size={13} /> },
  delivered: { label: "Delivered", color: "#10b981", bg: "rgba(16,185,129,0.08)",  icon: <Truck size={13} /> },
  cancelled: { label: "Cancelled", color: "#f87171", bg: "rgba(239,68,68,0.1)",    icon: <X size={13} /> },
};

const ORDER_TYPE_LABEL: Record<string, string> = {
  "dine-in": "🍽️ Dine In",
  "delivery": "🛵 Delivery",
  "takeaway": "🥡 Takeaway",
};

function nextStatus(current: OrderStatus): OrderStatus | null {
  const idx = ORDER_STATUS_FLOW.indexOf(current);
  if (idx === -1 || idx === ORDER_STATUS_FLOW.length - 1) return null;
  return ORDER_STATUS_FLOW[idx + 1];
}

function timeAgo(ts: number): string {
  const diff = Date.now() - ts;
  const mins = Math.floor(diff / 60000);
  if (mins < 1) return "Just now";
  if (mins < 60) return `${mins}m ago`;
  const hrs = Math.floor(mins / 60);
  return `${hrs}h ${mins % 60}m ago`;
}

type AdminTab = "menu" | "orders" | "settings" | "qr" | "analytics" | "loyalty";

export default function Admin() {
  const { user, signOut } = useAuth();
  const { meals, addMeal, updateMeal, deleteMeal } = useMenu();
  const { orders, updateOrderStatus } = useOrders();
  const { settings, saving: savingSettings, saveSettings } = useRestaurantSettings();
  const { cards: loyaltyCards, getLoyaltyCard, addStamp, claimReward } = useLoyalty();

  const [activeTab, setActiveTab] = useState<AdminTab>("menu");
  const [form, setForm] = useState(EMPTY_FORM);
  const [editing, setEditing] = useState<string | null>(null);
  const [showForm, setShowForm] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [toast, setToast] = useState("");
  const [updatingOrder, setUpdatingOrder] = useState<string | null>(null);
  const [orderFilter, setOrderFilter] = useState<OrderStatus | "all">("all");
  const [selectedMeals, setSelectedMeals] = useState<Set<string>>(new Set());
  const [loyaltyPhone, setLoyaltyPhone] = useState("");
  const [loyaltyData, setLoyaltyData] = useState<{ stamps: number; name: string; totalSpent: number; rewardsClaimed: number } | null>(null);
  const fileRef = useRef<HTMLInputElement>(null);

  const [settingsForm, setSettingsForm] = useState({
    address: settings.address, lat: String(settings.lat), lng: String(settings.lng),
    zoom: String(settings.zoom), phone: settings.phone, email: settings.email,
    hoursBreakfast: settings.hours.breakfast, hoursLunch: settings.hours.lunch, hoursDinner: settings.hours.dinner,
  });
  const [settingsDirty, setSettingsDirty] = useState(false);
  const [mapPreviewKey, setMapPreviewKey] = useState(0);
  const [synced, setSynced] = useState(false);

  if (!synced && settings.address !== "123 Gourmet Lane, Food District, New York, NY 10001") {
    setSynced(true);
    setSettingsForm({
      address: settings.address, lat: String(settings.lat), lng: String(settings.lng),
      zoom: String(settings.zoom), phone: settings.phone, email: settings.email,
      hoursBreakfast: settings.hours.breakfast, hoursLunch: settings.hours.lunch, hoursDinner: settings.hours.dinner,
    });
  }

  if (!user && isFirebaseConfigured) {
    return (
      <div className="min-h-screen flex items-center justify-center" style={{ background: "#080f1c" }}>
        <div className="text-center">
          <p className="text-white/50 mb-4">Please log in to access the admin portal.</p>
          <Link href="/login">
            <button className="px-6 py-3 rounded-2xl font-semibold text-white"
              style={{ background: "linear-gradient(135deg, #3b82f6, #8b5cf6)" }}>
              Go to Login
            </button>
          </Link>
        </div>
      </div>
    );
  }

  const showToast = (msg: string) => { setToast(msg); setTimeout(() => setToast(""), 3500); };
  const setSF = (key: keyof typeof settingsForm, val: string) => { setSettingsForm((f) => ({ ...f, [key]: val })); setSettingsDirty(true); };

  const handleSaveSettings = async () => {
    if (!isFirebaseConfigured) { showToast("Firebase not configured — demo mode"); return; }
    const lat = parseFloat(settingsForm.lat), lng = parseFloat(settingsForm.lng);
    if (isNaN(lat) || isNaN(lng)) { showToast("Enter valid lat/lng numbers"); return; }
    await saveSettings({ address: settingsForm.address.trim(), lat, lng, zoom: parseInt(settingsForm.zoom) || 16,
      phone: settingsForm.phone.trim(), email: settingsForm.email.trim(),
      hours: { breakfast: settingsForm.hoursBreakfast.trim(), lunch: settingsForm.hoursLunch.trim(), dinner: settingsForm.hoursDinner.trim() } });
    setSettingsDirty(false); setMapPreviewKey((k) => k + 1);
    showToast("Settings saved! Map updated on the home page.");
  };

  const handleImageUpload = async (file: File) => {
    if (!isCloudinaryConfigured) {
      showToast("Cloudinary not configured — using demo image URL");
      setForm((f) => ({ ...f, imageUrl: "https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=600&q=80" }));
      return;
    }
    setUploading(true);
    try {
      const url = await uploadImage(file);
      setForm((f) => ({ ...f, imageUrl: url }));
      showToast("Image uploaded successfully");
    } catch (e: unknown) {
      showToast(e instanceof Error ? e.message : "Upload failed");
    } finally { setUploading(false); }
  };

  const openEdit = (meal: Meal) => {
    setEditing(meal.id);
    const n = meal.nutrition;
    setForm({
      name: meal.name, description: meal.description, price: String(meal.price),
      category: meal.category, imageUrl: meal.imageUrl,
      ingredients: meal.ingredients?.join(", ") || "",
      allergens: meal.allergens?.join(", ") || "",
      tags: meal.tags?.join(", ") || "",
      isAvailable: meal.isAvailable, isFeatured: meal.isFeatured || false,
      isChefSpecial: meal.isChefSpecial || false,
      expiresAt: meal.expiresAt ? new Date(meal.expiresAt).toISOString().slice(0, 16) : "",
      prepTime: meal.prepTime || "", calories: String(meal.calories || ""),
      protein: String(n?.protein || ""), carbs: String(n?.carbs || ""), fats: String(n?.fats || ""), fiber: String(n?.fiber || ""),
      videoUrl: meal.videoUrl || "",
    });
    setShowForm(true);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const resetForm = () => { setForm(EMPTY_FORM); setEditing(null); setShowForm(false); };

  const handleSave = async () => {
    if (!form.name || !form.price || !form.imageUrl) { showToast("Name, price and image are required."); return; }
    setSaving(true);
    try {
      const hasNutrition = form.protein || form.carbs || form.fats;
      const payload: Omit<Meal, "id"> = {
        name: form.name, description: form.description, price: parseFloat(form.price),
        category: form.category, imageUrl: form.imageUrl,
        ingredients: form.ingredients.split(",").map((s) => s.trim()).filter(Boolean),
        allergens: form.allergens.split(",").map((s) => s.trim()).filter(Boolean),
        tags: form.tags.split(",").map((s) => s.trim()).filter(Boolean),
        isAvailable: form.isAvailable, isFeatured: form.isFeatured,
        isChefSpecial: form.isChefSpecial,
        expiresAt: form.expiresAt ? new Date(form.expiresAt).getTime() : undefined,
        prepTime: form.prepTime, calories: form.calories ? parseInt(form.calories) : undefined,
        videoUrl: form.videoUrl || undefined,
        nutrition: hasNutrition ? {
          protein: parseFloat(form.protein) || 0,
          carbs: parseFloat(form.carbs) || 0,
          fats: parseFloat(form.fats) || 0,
          fiber: form.fiber ? parseFloat(form.fiber) : undefined,
        } : undefined,
      };
      if (editing) {
        if (!isFirebaseConfigured) { showToast("Firebase not configured — demo mode"); return; }
        await updateMeal(editing, payload); showToast("Meal updated!");
      } else {
        if (!isFirebaseConfigured) { showToast("Firebase not configured — demo mode"); return; }
        await addMeal(payload); showToast("Meal added!");
      }
      resetForm();
    } catch (e: unknown) { showToast(e instanceof Error ? e.message : "Save failed"); }
    finally { setSaving(false); }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Delete this meal?")) return;
    if (!isFirebaseConfigured) { showToast("Firebase not configured — demo mode"); return; }
    await deleteMeal(id); showToast("Meal deleted.");
    setSelectedMeals((prev) => { const n = new Set(prev); n.delete(id); return n; });
  };

  const handleAdvanceOrder = async (order: Order) => {
    const next = nextStatus(order.status);
    if (!next) return;
    setUpdatingOrder(order.id);
    try { await updateOrderStatus(order.id, next); showToast(`Order #${order.orderNumber} → ${STATUS_META[next].label}`); }
    catch { showToast("Failed to update order status"); }
    finally { setUpdatingOrder(null); }
  };

  const handleCancelOrder = async (order: Order) => {
    if (!confirm(`Cancel order #${order.orderNumber}?`)) return;
    setUpdatingOrder(order.id);
    try { await updateOrderStatus(order.id, "cancelled"); showToast(`Order #${order.orderNumber} cancelled`); }
    catch { showToast("Failed to cancel order"); }
    finally { setUpdatingOrder(null); }
  };

  // Bulk actions
  const toggleSelectAll = () => {
    if (selectedMeals.size === meals.length) { setSelectedMeals(new Set()); }
    else { setSelectedMeals(new Set(meals.map((m) => m.id))); }
  };
  const toggleSelect = (id: string) => {
    setSelectedMeals((prev) => { const n = new Set(prev); if (n.has(id)) n.delete(id); else n.add(id); return n; });
  };
  const handleBulkDelete = async () => {
    if (!isFirebaseConfigured) { showToast("Firebase not configured — demo mode"); return; }
    if (!confirm(`Delete ${selectedMeals.size} meals?`)) return;
    for (const id of selectedMeals) await deleteMeal(id);
    setSelectedMeals(new Set()); showToast(`Deleted ${selectedMeals.size} meals`);
  };
  const handleBulkToggleAvail = async (available: boolean) => {
    if (!isFirebaseConfigured) { showToast("Firebase not configured — demo mode"); return; }
    for (const id of selectedMeals) {
      const meal = meals.find((m) => m.id === id);
      if (meal) await updateMeal(id, { ...meal, isAvailable: available });
    }
    showToast(`${available ? "Enabled" : "Disabled"} ${selectedMeals.size} meals`);
    setSelectedMeals(new Set());
  };

  const handleMoveMeal = async (meal: Meal, dir: "up" | "down") => {
    if (!isFirebaseConfigured) { showToast("Demo mode"); return; }
    const current = meal.sortOrder ?? 0;
    await updateMeal(meal.id, { sortOrder: dir === "up" ? current - 1 : current + 1 });
  };

  const handleLoyaltyLookup = async () => {
    if (!loyaltyPhone.trim()) return;
    const card = await getLoyaltyCard(loyaltyPhone.trim());
    if (card) {
      setLoyaltyData({ stamps: card.stamps, name: card.name, totalSpent: card.totalSpent, rewardsClaimed: card.rewardsClaimed });
    } else {
      setLoyaltyData(null); showToast("No loyalty card found for this phone.");
    }
  };

  const filteredOrders = orderFilter === "all" ? orders : orders.filter((o) => o.status === orderFilter);
  const pendingCount = orders.filter((o) => ["pending", "confirmed", "preparing"].includes(o.status)).length;

  const Field = ({ label, children }: { label: string; children: React.ReactNode }) => (
    <div>
      <label className="block text-white/50 text-xs uppercase tracking-wider mb-1.5">{label}</label>
      {children}
    </div>
  );
  const inputCls = "w-full px-4 py-3 rounded-xl text-white text-sm outline-none placeholder-white/25";
  const inputStyle = { background: "rgba(255,255,255,0.06)", border: "1px solid rgba(255,255,255,0.1)" };
  const setF = (k: keyof typeof form, v: string | boolean) => setForm((f) => ({ ...f, [k]: v }));

  const TABS: { id: AdminTab; label: string; icon: React.ReactNode; badge?: number }[] = [
    { id: "menu",      label: "Menu",      icon: <UtensilsCrossed size={14} /> },
    { id: "orders",    label: "Orders",    icon: <ClipboardList size={14} />,  badge: pendingCount || undefined },
    { id: "settings",  label: "Settings",  icon: <Settings size={14} /> },
    { id: "qr",        label: "QR Codes",  icon: <QrCode size={14} /> },
    { id: "analytics", label: "Analytics", icon: <BarChart3 size={14} /> },
    { id: "loyalty",   label: "Loyalty",   icon: <Star size={14} /> },
  ];

  return (
    <div className="relative min-h-screen" style={{ background: "#080f1c" }}>
      <AnimatedDots />

      {/* Toast */}
      <AnimatePresence>
        {toast && (
          <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -20 }}
            className="fixed top-20 left-1/2 -translate-x-1/2 z-50 px-5 py-3 rounded-2xl text-sm font-semibold text-white"
            style={{ background: "rgba(16,185,129,0.9)", backdropFilter: "blur(8px)", boxShadow: "0 8px 24px rgba(0,0,0,0.4)" }}>
            ✓ {toast}
          </motion.div>
        )}
      </AnimatePresence>

      <div className="relative z-10 max-w-7xl mx-auto px-4 pt-24 pb-20">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-2xl font-extrabold text-white">Admin Portal</h1>
            <p className="text-white/40 text-sm">{user?.email || "Demo mode"}</p>
          </div>
          {user && (
            <button onClick={signOut}
              className="flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-semibold text-white/60 hover:text-white"
              style={{ background: "rgba(255,255,255,0.06)", border: "1px solid rgba(255,255,255,0.08)" }}>
              <LogOut size={14} />
              Sign Out
            </button>
          )}
        </div>

        {/* Tabs */}
        <div className="flex gap-2 overflow-x-auto pb-2 mb-8 scrollbar-none">
          {TABS.map((tab) => (
            <button key={tab.id} onClick={() => setActiveTab(tab.id)}
              className="relative shrink-0 flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-semibold transition-all"
              style={activeTab === tab.id
                ? { background: "linear-gradient(135deg, #3b82f6, #8b5cf6)", color: "white" }
                : { background: "rgba(255,255,255,0.05)", color: "rgba(255,255,255,0.5)", border: "1px solid rgba(255,255,255,0.07)" }}>
              {tab.icon}
              {tab.label}
              {tab.badge ? (
                <span className="absolute -top-1 -right-1 w-5 h-5 rounded-full text-xs font-bold flex items-center justify-center"
                  style={{ background: "#ef4444", color: "white" }}>{tab.badge}</span>
              ) : null}
            </button>
          ))}
        </div>

        {/* ─── MENU TAB ─── */}
        {activeTab === "menu" && (
          <div>
            <div className="flex items-center justify-between mb-5">
              <div className="flex items-center gap-3">
                <h2 className="text-white font-bold">Menu Items ({meals.length})</h2>
                {selectedMeals.size > 0 && (
                  <div className="flex items-center gap-2">
                    <span className="text-xs text-white/50">{selectedMeals.size} selected</span>
                    <button onClick={handleBulkDelete}
                      className="px-3 py-1.5 rounded-lg text-xs font-semibold" style={{ background: "rgba(239,68,68,0.2)", color: "#f87171" }}>
                      Delete All
                    </button>
                    <button onClick={() => handleBulkToggleAvail(true)}
                      className="px-3 py-1.5 rounded-lg text-xs font-semibold" style={{ background: "rgba(16,185,129,0.15)", color: "#34d399" }}>
                      Enable
                    </button>
                    <button onClick={() => handleBulkToggleAvail(false)}
                      className="px-3 py-1.5 rounded-lg text-xs font-semibold" style={{ background: "rgba(245,158,11,0.15)", color: "#f59e0b" }}>
                      Disable
                    </button>
                  </div>
                )}
              </div>
              <div className="flex items-center gap-2">
                <button onClick={toggleSelectAll}
                  className="flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-semibold"
                  style={{ background: "rgba(255,255,255,0.05)", color: "rgba(255,255,255,0.5)", border: "1px solid rgba(255,255,255,0.08)" }}>
                  {selectedMeals.size === meals.length && meals.length > 0 ? <CheckSquare size={12} /> : <Square size={12} />}
                  {selectedMeals.size === meals.length && meals.length > 0 ? "Deselect All" : "Select All"}
                </button>
                <button onClick={() => { resetForm(); setShowForm(true); }}
                  className="flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-semibold text-white"
                  style={{ background: "linear-gradient(135deg, #3b82f6, #8b5cf6)" }}>
                  <Plus size={14} />
                  Add Meal
                </button>
              </div>
            </div>

            {/* Meal form */}
            <AnimatePresence>
              {showForm && (
                <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -20 }}
                  className="rounded-3xl p-6 mb-6"
                  style={{ background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.1)" }}>
                  <div className="flex items-center justify-between mb-5">
                    <h3 className="font-bold text-white">{editing ? "Edit Meal" : "Add New Meal"}</h3>
                    <button onClick={resetForm} className="p-2 rounded-full" style={{ background: "rgba(255,255,255,0.06)" }}>
                      <X size={14} className="text-white/60" />
                    </button>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <Field label="Meal Name *">
                      <input className={inputCls} style={inputStyle} placeholder="e.g. Truffle Risotto"
                        value={form.name} onChange={(e) => setF("name", e.target.value)} />
                    </Field>
                    <Field label="Price ($) *">
                      <input className={inputCls} style={inputStyle} type="number" placeholder="0.00"
                        value={form.price} onChange={(e) => setF("price", e.target.value)} />
                    </Field>
                    <div className="sm:col-span-2">
                      <Field label="Description">
                        <textarea className={inputCls} style={{ ...inputStyle, resize: "none" }} rows={2}
                          placeholder="Short description..." value={form.description}
                          onChange={(e) => setF("description", e.target.value)} />
                      </Field>
                    </div>
                    <Field label="Category">
                      <select className={inputCls} style={inputStyle} value={form.category}
                        onChange={(e) => setF("category", e.target.value)}>
                        {["Starters","Mains","Burgers","Pasta","Pizza","Grills","Seafood","Desserts","Drinks"].map((c) => (
                          <option key={c} value={c} style={{ background: "#0c1a2e" }}>{c}</option>
                        ))}
                      </select>
                    </Field>
                    <div className="flex items-end gap-3">
                      <Field label="Prep Time">
                        <input className={inputCls} style={inputStyle} placeholder="e.g. 20 min"
                          value={form.prepTime} onChange={(e) => setF("prepTime", e.target.value)} />
                      </Field>
                      <Field label="Calories">
                        <input className={inputCls} style={inputStyle} type="number" placeholder="kcal"
                          value={form.calories} onChange={(e) => setF("calories", e.target.value)} />
                      </Field>
                    </div>

                    {/* Image upload */}
                    <div className="sm:col-span-2">
                      <Field label="Image *">
                        <div className="flex gap-3">
                          <input className={inputCls} style={inputStyle} placeholder="https://..."
                            value={form.imageUrl} onChange={(e) => setF("imageUrl", e.target.value)} />
                          <button onClick={() => fileRef.current?.click()} disabled={uploading}
                            className="shrink-0 flex items-center gap-2 px-4 py-3 rounded-xl text-sm font-semibold"
                            style={{ background: "rgba(139,92,246,0.2)", border: "1px solid rgba(139,92,246,0.3)", color: "#a78bfa" }}>
                            {uploading ? <motion.div animate={{ rotate: 360 }} transition={{ duration: 1, repeat: Infinity }}><Upload size={14} /></motion.div> : <Upload size={14} />}
                            Upload
                          </button>
                          <input ref={fileRef} type="file" accept="image/*" className="hidden"
                            onChange={(e) => e.target.files?.[0] && handleImageUpload(e.target.files[0])} />
                        </div>
                        {form.imageUrl && (
                          <img src={form.imageUrl} alt="Preview" className="w-24 h-24 rounded-xl object-cover mt-2" />
                        )}
                      </Field>
                    </div>

                    {/* Video URL */}
                    <div className="sm:col-span-2">
                      <Field label="Chef Video URL (optional)">
                        <div className="relative">
                          <Video size={14} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-white/30" />
                          <input className={inputCls} style={{ ...inputStyle, paddingLeft: "2.25rem" }}
                            placeholder="YouTube embed URL..." value={form.videoUrl}
                            onChange={(e) => setF("videoUrl", e.target.value)} />
                        </div>
                      </Field>
                    </div>

                    <Field label="Ingredients (comma-separated)">
                      <input className={inputCls} style={inputStyle} placeholder="truffle, arborio rice..."
                        value={form.ingredients} onChange={(e) => setF("ingredients", e.target.value)} />
                    </Field>
                    <Field label="Allergens (comma-separated)">
                      <div className="relative">
                        <Shield size={13} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-white/30" />
                        <input className={inputCls} style={{ ...inputStyle, paddingLeft: "2.25rem" }}
                          placeholder="nuts, dairy, gluten..." value={form.allergens}
                          onChange={(e) => setF("allergens", e.target.value)} />
                      </div>
                    </Field>
                    <div className="sm:col-span-2">
                      <Field label="Tags (comma-separated)">
                        <div className="relative">
                          <Tag size={13} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-white/30" />
                          <input className={inputCls} style={{ ...inputStyle, paddingLeft: "2.25rem" }}
                            placeholder="spicy, vegan, healthy, comfort, premium..." value={form.tags}
                            onChange={(e) => setF("tags", e.target.value)} />
                        </div>
                      </Field>
                    </div>

                    {/* Nutrition */}
                    <div className="sm:col-span-2">
                      <label className="block text-white/50 text-xs uppercase tracking-wider mb-2">
                        <Dumbbell size={11} className="inline mr-1" />
                        Nutrition (grams)
                      </label>
                      <div className="grid grid-cols-4 gap-2">
                        {([["protein","Protein"], ["carbs","Carbs"], ["fats","Fats"], ["fiber","Fiber"]] as const).map(([k, l]) => (
                          <div key={k}>
                            <p className="text-white/30 text-xs mb-1">{l}</p>
                            <input type="number" className={inputCls} style={{ ...inputStyle, paddingLeft: "0.75rem", paddingRight: "0.5rem" }}
                              placeholder="0" value={form[k as keyof typeof form] as string}
                              onChange={(e) => setF(k as keyof typeof form, e.target.value)} />
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* Toggles */}
                    <div className="sm:col-span-2 flex flex-wrap gap-3">
                      {([
                        ["isAvailable",   "Available",     "rgba(16,185,129,0.2)",   "#34d399"],
                        ["isFeatured",    "Chef's Pick ⭐", "rgba(245,158,11,0.2)",   "#f59e0b"],
                        ["isChefSpecial", "Chef's Special 🔥", "rgba(239,68,68,0.2)", "#f87171"],
                      ] as const).map(([key, label, bg, col]) => (
                        <button key={key} onClick={() => setF(key, !form[key as keyof typeof form])}
                          className="flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-semibold"
                          style={(form[key as keyof typeof form] as boolean)
                            ? { background: bg, color: col, border: `1px solid ${col}44` }
                            : { background: "rgba(255,255,255,0.05)", color: "rgba(255,255,255,0.4)", border: "1px solid rgba(255,255,255,0.08)" }}>
                          {(form[key as keyof typeof form] as boolean) ? <ToggleRight size={14} /> : <ToggleLeft size={14} />}
                          {label}
                        </button>
                      ))}
                    </div>

                    {form.isChefSpecial && (
                      <div className="sm:col-span-2">
                        <Field label="Special Expires At">
                          <input type="datetime-local" className={inputCls} style={inputStyle}
                            value={form.expiresAt} onChange={(e) => setF("expiresAt", e.target.value)} />
                        </Field>
                      </div>
                    )}
                  </div>

                  <div className="flex gap-3 mt-5">
                    <motion.button whileTap={{ scale: 0.97 }} onClick={handleSave} disabled={saving}
                      className="flex-1 py-3 rounded-2xl font-bold text-white"
                      style={{ background: saving ? "rgba(255,255,255,0.06)" : "linear-gradient(135deg, #3b82f6, #8b5cf6)" }}>
                      {saving ? "Saving..." : editing ? "Update Meal" : "Add Meal"}
                    </motion.button>
                    <button onClick={resetForm} className="px-5 py-3 rounded-2xl font-semibold"
                      style={{ background: "rgba(255,255,255,0.06)", color: "rgba(255,255,255,0.5)" }}>
                      Cancel
                    </button>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>

            {/* Meals list */}
            <div className="space-y-3">
              {meals.map((meal) => (
                <motion.div key={meal.id} layout
                  className="flex items-center gap-4 p-4 rounded-2xl"
                  style={{
                    background: selectedMeals.has(meal.id) ? "rgba(59,130,246,0.08)" : "rgba(255,255,255,0.04)",
                    border: `1px solid ${selectedMeals.has(meal.id) ? "rgba(59,130,246,0.3)" : "rgba(255,255,255,0.07)"}`,
                  }}>
                  <button onClick={() => toggleSelect(meal.id)} className="shrink-0">
                    {selectedMeals.has(meal.id) ? <CheckSquare size={16} style={{ color: "#60a5fa" }} /> : <Square size={16} className="text-white/20" />}
                  </button>
                  <img src={meal.imageUrl} alt={meal.name} className="w-16 h-16 rounded-xl object-cover shrink-0" />
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <p className="text-white font-semibold text-sm">{meal.name}</p>
                      {meal.isFeatured && <span className="text-xs px-1.5 py-0.5 rounded-full" style={{ background: "rgba(245,158,11,0.15)", color: "#f59e0b" }}>⭐</span>}
                      {meal.isChefSpecial && <span className="text-xs px-1.5 py-0.5 rounded-full" style={{ background: "rgba(239,68,68,0.15)", color: "#f87171" }}>🔥 Special</span>}
                    </div>
                    <p className="text-white/40 text-xs">{meal.category} · ${meal.price.toFixed(2)}</p>
                    <div className="flex items-center gap-2 mt-1 flex-wrap">
                      <span className="text-xs px-2 py-0.5 rounded-full font-medium"
                        style={{ background: meal.isAvailable ? "rgba(16,185,129,0.12)" : "rgba(239,68,68,0.1)", color: meal.isAvailable ? "#34d399" : "#f87171" }}>
                        {meal.isAvailable ? "Available" : "Unavailable"}
                      </span>
                      {meal.calories && <span className="text-white/30 text-xs">{meal.calories} kcal</span>}
                      {meal.prepTime && <span className="text-white/30 text-xs">{meal.prepTime}</span>}
                    </div>
                  </div>
                  <div className="flex flex-col gap-1.5 shrink-0">
                    <div className="flex gap-1.5">
                      <button onClick={() => openEdit(meal)}
                        className="p-2 rounded-xl transition-all" style={{ background: "rgba(59,130,246,0.12)", border: "1px solid rgba(59,130,246,0.2)" }}>
                        <Pencil size={13} style={{ color: "#60a5fa" }} />
                      </button>
                      <button onClick={() => updateMeal(meal.id, { isAvailable: !meal.isAvailable })}
                        className="p-2 rounded-xl transition-all" style={{ background: "rgba(255,255,255,0.06)", border: "1px solid rgba(255,255,255,0.08)" }}>
                        {meal.isAvailable ? <ToggleRight size={13} style={{ color: "#34d399" }} /> : <ToggleLeft size={13} className="text-white/40" />}
                      </button>
                      <button onClick={() => handleDelete(meal.id)}
                        className="p-2 rounded-xl transition-all" style={{ background: "rgba(239,68,68,0.1)", border: "1px solid rgba(239,68,68,0.15)" }}>
                        <Trash2 size={13} style={{ color: "#ef4444" }} />
                      </button>
                    </div>
                    <div className="flex gap-1">
                      <button onClick={() => handleMoveMeal(meal, "up")} className="flex-1 py-1 rounded-lg flex items-center justify-center" style={{ background: "rgba(255,255,255,0.04)" }}>
                        <ArrowUp size={11} className="text-white/30" />
                      </button>
                      <button onClick={() => handleMoveMeal(meal, "down")} className="flex-1 py-1 rounded-lg flex items-center justify-center" style={{ background: "rgba(255,255,255,0.04)" }}>
                        <ArrowDown size={11} className="text-white/30" />
                      </button>
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
          </div>
        )}

        {/* ─── ORDERS TAB ─── */}
        {activeTab === "orders" && (
          <div>
            <div className="flex items-center gap-2 mb-5 flex-wrap">
              {(["all", "pending", "confirmed", "preparing", "ready", "delivered", "cancelled"] as const).map((f) => (
                <button key={f} onClick={() => setOrderFilter(f as typeof orderFilter)}
                  className="px-3 py-1.5 rounded-xl text-xs font-semibold transition-all capitalize"
                  style={orderFilter === f
                    ? { background: "linear-gradient(135deg, #3b82f6, #8b5cf6)", color: "white" }
                    : { background: "rgba(255,255,255,0.05)", color: "rgba(255,255,255,0.4)", border: "1px solid rgba(255,255,255,0.07)" }}>
                  {f === "all" ? `All (${orders.length})` : f}
                </button>
              ))}
            </div>
            <div className="space-y-4">
              {filteredOrders.length === 0 ? (
                <p className="text-center text-white/30 py-12">No orders in this category.</p>
              ) : filteredOrders.map((order) => {
                const meta = STATUS_META[order.status];
                const next = nextStatus(order.status);
                const isUpdating = updatingOrder === order.id;
                return (
                  <motion.div key={order.id} layout
                    className="rounded-3xl p-5"
                    style={{ background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.07)" }}>
                    <div className="flex items-start justify-between mb-4 flex-wrap gap-3">
                      <div>
                        <div className="flex items-center gap-3 flex-wrap">
                          <span className="font-mono font-bold text-white text-lg tracking-widest" style={{ color: "#a78bfa" }}>
                            #{order.orderNumber}
                          </span>
                          <span className="flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold"
                            style={{ background: meta.bg, color: meta.color }}>
                            {meta.icon} {meta.label}
                          </span>
                        </div>
                        <p className="text-white/50 text-sm mt-1">
                          {order.customerName} · {order.customerPhone} · {ORDER_TYPE_LABEL[order.orderType]}
                        </p>
                        <p className="text-white/30 text-xs mt-0.5">{timeAgo(order.createdAt)}</p>
                        {order.deliveryAddress && <p className="text-white/30 text-xs">{order.deliveryAddress}</p>}
                        {order.notes && <p className="text-white/40 text-xs mt-1 italic">"{order.notes}"</p>}
                      </div>
                      <div className="text-right">
                        <p className="text-xl font-bold" style={{ color: "#f59e0b" }}>${order.total.toFixed(2)}</p>
                        <p className="text-white/30 text-xs">{order.items.length} item{order.items.length !== 1 ? "s" : ""}</p>
                      </div>
                    </div>
                    <div className="flex flex-wrap gap-2 mb-4">
                      {order.items.map((item, i) => (
                        <div key={i} className="flex items-center gap-2 px-2.5 py-1.5 rounded-xl"
                          style={{ background: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.08)" }}>
                          <img src={item.mealImage} alt={item.mealName} className="w-7 h-7 rounded-lg object-cover" />
                          <span className="text-white text-xs">{item.mealName} ×{item.quantity}</span>
                        </div>
                      ))}
                    </div>
                    <div className="flex gap-2">
                      {next && (
                        <motion.button whileTap={{ scale: 0.97 }} onClick={() => handleAdvanceOrder(order)} disabled={isUpdating}
                          className="flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl text-sm font-semibold text-white"
                          style={{ background: isUpdating ? "rgba(255,255,255,0.06)" : "linear-gradient(135deg, #3b82f6, #8b5cf6)" }}>
                          {isUpdating ? "..." : `→ Mark ${STATUS_META[next].label}`}
                        </motion.button>
                      )}
                      {order.status !== "cancelled" && order.status !== "delivered" && (
                        <button onClick={() => handleCancelOrder(order)} disabled={isUpdating}
                          className="px-4 py-2.5 rounded-xl text-sm font-semibold"
                          style={{ background: "rgba(239,68,68,0.1)", color: "#f87171", border: "1px solid rgba(239,68,68,0.2)" }}>
                          Cancel
                        </button>
                      )}
                    </div>
                  </motion.div>
                );
              })}
            </div>
          </div>
        )}

        {/* ─── SETTINGS TAB ─── */}
        {activeTab === "settings" && (
          <div className="max-w-2xl">
            <h2 className="text-white font-bold mb-5">Restaurant Settings</h2>
            <div className="rounded-2xl p-6 space-y-4"
              style={{ background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.08)" }}>
              <Field label="Address"><input className={inputCls} style={inputStyle} value={settingsForm.address} onChange={(e) => setSF("address", e.target.value)} /></Field>
              <div className="grid grid-cols-3 gap-3">
                <Field label="Latitude"><input className={inputCls} style={inputStyle} value={settingsForm.lat} onChange={(e) => setSF("lat", e.target.value)} /></Field>
                <Field label="Longitude"><input className={inputCls} style={inputStyle} value={settingsForm.lng} onChange={(e) => setSF("lng", e.target.value)} /></Field>
                <Field label="Zoom"><input className={inputCls} style={inputStyle} type="number" value={settingsForm.zoom} onChange={(e) => setSF("zoom", e.target.value)} /></Field>
              </div>
              <Field label="Phone">
                <div className="relative">
                  <Phone size={13} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-white/30" />
                  <input className={inputCls} style={{ ...inputStyle, paddingLeft: "2.25rem" }} value={settingsForm.phone} onChange={(e) => setSF("phone", e.target.value)} />
                </div>
              </Field>
              <Field label="Email">
                <div className="relative">
                  <Mail size={13} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-white/30" />
                  <input className={inputCls} style={{ ...inputStyle, paddingLeft: "2.25rem" }} value={settingsForm.email} onChange={(e) => setSF("email", e.target.value)} />
                </div>
              </Field>
              <div>
                <label className="block text-white/50 text-xs uppercase tracking-wider mb-2">
                  <Clock size={11} className="inline mr-1" />
                  Opening Hours
                </label>
                <div className="grid grid-cols-3 gap-2">
                  {[["Breakfast", "hoursBreakfast"], ["Lunch", "hoursLunch"], ["Dinner", "hoursDinner"]].map(([l, k]) => (
                    <div key={k}>
                      <p className="text-white/30 text-xs mb-1">{l}</p>
                      <input className={inputCls} style={{ ...inputStyle, fontSize: 11, padding: "0.5rem 0.75rem" }}
                        placeholder="7am – 11am" value={settingsForm[k as keyof typeof settingsForm]}
                        onChange={(e) => setSF(k as keyof typeof settingsForm, e.target.value)} />
                    </div>
                  ))}
                </div>
              </div>
              <motion.button whileTap={{ scale: 0.97 }} onClick={handleSaveSettings} disabled={savingSettings || !settingsDirty}
                className="w-full py-3 rounded-2xl font-bold text-white"
                style={{ background: settingsDirty ? "linear-gradient(135deg, #3b82f6, #8b5cf6)" : "rgba(255,255,255,0.06)" }}>
                {savingSettings ? "Saving..." : "Save Settings"}
              </motion.button>
            </div>
          </div>
        )}

        {/* ─── QR CODES TAB ─── */}
        {activeTab === "qr" && (
          <div>
            <h2 className="text-white font-bold mb-5">Table QR Codes</h2>
            <TableQRManager />
          </div>
        )}

        {/* ─── ANALYTICS TAB ─── */}
        {activeTab === "analytics" && (
          <div>
            <h2 className="text-white font-bold mb-2">Peak Hours Heatmap</h2>
            <p className="text-white/40 text-sm mb-6">
              Order frequency by day and hour — identifies your busiest times.
            </p>
            <PeakHoursHeatmap orders={orders} />

            {/* Quick stats */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mt-6">
              {[
                { label: "Total Orders",    value: orders.length },
                { label: "Active Today",    value: orders.filter((o) => Date.now() - o.createdAt < 86400000).length },
                { label: "Revenue Today",   value: `$${orders.filter((o) => Date.now() - o.createdAt < 86400000 && o.status !== "cancelled").reduce((s, o) => s + o.total, 0).toFixed(2)}` },
                { label: "Avg Order Value", value: orders.length > 0 ? `$${(orders.reduce((s, o) => s + o.total, 0) / orders.length).toFixed(2)}` : "$0" },
              ].map(({ label, value }) => (
                <div key={label} className="p-4 rounded-2xl text-center"
                  style={{ background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.07)" }}>
                  <p className="text-white font-bold text-xl">{value}</p>
                  <p className="text-white/40 text-xs mt-1">{label}</p>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* ─── LOYALTY TAB ─── */}
        {activeTab === "loyalty" && (
          <div>
            <h2 className="text-white font-bold mb-5">Loyalty Programme</h2>
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Lookup */}
              <div className="rounded-2xl p-5" style={{ background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.08)" }}>
                <h3 className="text-white font-bold mb-4">Customer Lookup</h3>
                <div className="flex gap-2 mb-4">
                  <input className={inputCls} style={inputStyle} placeholder="+1 555 000 0000" type="tel"
                    value={loyaltyPhone} onChange={(e) => setLoyaltyPhone(e.target.value)}
                    onKeyDown={(e) => e.key === "Enter" && handleLoyaltyLookup()} />
                  <button onClick={handleLoyaltyLookup}
                    className="px-4 py-2.5 rounded-xl text-sm font-semibold text-white"
                    style={{ background: "linear-gradient(135deg, #f59e0b, #ef4444)", whiteSpace: "nowrap" }}>
                    Look Up
                  </button>
                </div>
                {loyaltyData && (
                  <div className="rounded-xl p-4" style={{ background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.07)" }}>
                    <p className="text-white font-semibold">{loyaltyData.name}</p>
                    <p className="text-white/40 text-xs mb-3">{loyaltyPhone}</p>
                    <div className="grid grid-cols-3 gap-3 mb-4">
                      {[
                        { label: "Stamps",    value: loyaltyData.stamps },
                        { label: "Spent",     value: `$${loyaltyData.totalSpent.toFixed(2)}` },
                        { label: "Rewards",   value: loyaltyData.rewardsClaimed },
                      ].map(({ label, value }) => (
                        <div key={label} className="text-center p-2 rounded-xl" style={{ background: "rgba(255,255,255,0.05)" }}>
                          <p className="text-white font-bold">{value}</p>
                          <p className="text-white/30 text-xs">{label}</p>
                        </div>
                      ))}
                    </div>
                    <div className="flex gap-2">
                      <button onClick={() => addStamp(loyaltyPhone, loyaltyData.name, 0).then(() => showToast("Stamp added!"))}
                        className="flex-1 py-2 rounded-xl text-xs font-semibold" style={{ background: "rgba(245,158,11,0.2)", color: "#f59e0b" }}>
                        + Add Stamp
                      </button>
                      {loyaltyData.stamps >= STAMPS_FOR_REWARD && (
                        <button onClick={() => claimReward(loyaltyPhone).then(() => { showToast("Reward claimed!"); })}
                          className="flex-1 py-2 rounded-xl text-xs font-semibold" style={{ background: "rgba(16,185,129,0.2)", color: "#34d399" }}>
                          🎁 Claim Reward
                        </button>
                      )}
                    </div>
                  </div>
                )}
              </div>

              {/* Top members */}
              <div className="rounded-2xl p-5" style={{ background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.08)" }}>
                <h3 className="text-white font-bold mb-4">Top Members ({loyaltyCards.length})</h3>
                <div className="space-y-3 max-h-96 overflow-y-auto pr-1">
                  {loyaltyCards.slice(0, 20).sort((a, b) => b.stamps - a.stamps).map((card) => (
                    <div key={card.id} className="flex items-center gap-3 p-3 rounded-xl"
                      style={{ background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.06)" }}>
                      <div className="w-8 h-8 rounded-full flex items-center justify-center shrink-0"
                        style={{ background: "linear-gradient(135deg, #f59e0b, #ef4444)" }}>
                        <span className="text-white text-xs font-bold">{card.name.charAt(0)}</span>
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-white text-sm font-semibold truncate">{card.name}</p>
                        <p className="text-white/40 text-xs">{card.phone}</p>
                      </div>
                      <div className="text-right shrink-0">
                        <p className="text-xs font-bold" style={{ color: "#f59e0b" }}>{card.stamps} ⭐</p>
                        <p className="text-white/30 text-xs">${card.totalSpent.toFixed(0)} spent</p>
                      </div>
                    </div>
                  ))}
                  {loyaltyCards.length === 0 && (
                    <p className="text-center text-white/30 text-sm py-8">No loyalty members yet.</p>
                  )}
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
