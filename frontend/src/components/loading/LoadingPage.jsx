import { motion } from "framer-motion";

function LoadingPage({ isLoading }) {
  if (!isLoading) return null; // ← tambahkan ini

  return (
    <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-white/10 backdrop-blur-sm dark:bg-slate-900/80">
      <div className="relative flex flex-col items-center gap-6">
        {/* OUTER GLOW */}
        <motion.div
          className="absolute w-24 h-24 bg-blue-500 rounded-full blur-2xl opacity-40"
          animate={{ scale: [1, 1.6, 1], opacity: [0.3, 0.6, 0.3] }}
          transition={{ duration: 2, repeat: Infinity }}
        />

        {/* MAIN CIRCLE */}
        <motion.div
          className="w-14 h-14 bg-sky-500 rounded-full z-10"
          animate={{ scale: [1, 1.3, 1] }}
          transition={{ duration: 1.2, repeat: Infinity }}
        />

        {/* TEXT */}
        <motion.p
          className="text-sm text-gray-500 dark:text-gray-300"
          animate={{ opacity: [0.5, 1, 0.5] }}
          transition={{ duration: 1.5, repeat: Infinity }}
        >
          Loading..
        </motion.p>
      </div>
    </div>
  );
}

export default LoadingPage;
