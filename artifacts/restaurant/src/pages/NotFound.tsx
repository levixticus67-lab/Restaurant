import { Link } from "wouter";
import { motion } from "framer-motion";
export default function NotFound() {
  return (
    <div className="min-h-screen flex items-center justify-center"
      style={{ background: "#0d0d0d" }}>
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="relative z-10 text-center px-4"
      >
        <h1 className="text-8xl font-extrabold text-white/10 mb-4">404</h1>
        <h2 className="text-2xl font-bold text-white mb-2">Page not found</h2>
        <p className="text-white/40 mb-8">Looks like this dish isn't on the menu.</p>
        <Link href="/">
          <button className="px-6 py-3 rounded-2xl font-semibold text-white"
            style={{ background: "linear-gradient(135deg, #3b82f6, #8b5cf6)" }}>
            Back to Home
          </button>
        </Link>
      </motion.div>
    </div>
  );
}
