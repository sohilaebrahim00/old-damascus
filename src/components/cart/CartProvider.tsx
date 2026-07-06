"use client";

import { useEffect, useState } from "react";
import { CartDrawer } from "./CartDrawer";

export function CartProvider({ children }: { children: React.ReactNode }) {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    const t = setTimeout(() => setMounted(true), 0);
    return () => clearTimeout(t);
  }, []);

  return (
    <>
      {children}
      {mounted && <CartDrawer />}
    </>
  );
}
