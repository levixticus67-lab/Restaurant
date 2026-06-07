import { Switch, Route, Router as WouterRouter } from "wouter";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { AuthProvider } from "@/contexts/AuthContext";
import { CartProvider } from "@/contexts/CartContext";
import Navbar from "@/components/Navbar";
import Cart from "@/components/Cart";
import ConfigBanner from "@/components/ConfigBanner";
import Home from "@/pages/Home";
import Menu from "@/pages/Menu";
import Login from "@/pages/Login";
import Admin from "@/pages/Admin";
import OrderTracking from "@/pages/OrderTracking";
import Reservations from "@/pages/Reservations";
import GiftCards from "@/pages/GiftCards";
import Loyalty from "@/pages/Loyalty";
import NotFound from "@/pages/NotFound";

const queryClient = new QueryClient();

function Router() {
  return (
    <div className="min-h-screen" style={{ background: "#0d0d0d" }}>
      <Navbar />
      <Cart />
      <ConfigBanner />
      <main className="md:ml-[260px] pb-16 md:pb-0">
        <Switch>
          <Route path="/" component={Home} />
          <Route path="/menu" component={Menu} />
          <Route path="/track" component={OrderTracking} />
          <Route path="/login" component={Login} />
          <Route path="/admin" component={Admin} />
          <Route path="/reservations" component={Reservations} />
          <Route path="/gift-cards" component={GiftCards} />
          <Route path="/loyalty" component={Loyalty} />
          <Route component={NotFound} />
        </Switch>
      </main>
    </div>
  );
}

export default function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <CartProvider>
          <WouterRouter base={import.meta.env.BASE_URL.replace(/\/$/, "")}>
            <Router />
          </WouterRouter>
        </CartProvider>
      </AuthProvider>
    </QueryClientProvider>
  );
}
