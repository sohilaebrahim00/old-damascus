"use client";

import { motion } from "framer-motion";
import { pageTransition } from "@/lib/motion";

export default function Template({ children }: { children: React.ReactNode }) {
  return (
    <motion.div
      initial="initial"
      animate="animate"
      variants={pageTransition}
      // We don't use exit animations here because Next.js App Router 
      // unmounts the old page immediately without AnimatePresence by default.
      // This keeps the transition fast and clean.
    >
      {children}
    </motion.div>
  );
}
