"use client";

import Link from "next/link";
import { motion, AnimatePresence, useReducedMotion } from "framer-motion";

type MobileMenuDrawerProps = {
  open: boolean;
  onClose: () => void;
};

const links = [
  { href: "/shop", label: "Shop" },
  { href: "/account", label: "Account" },
  { href: "/cart", label: "Cart" },
];

export function MobileMenuDrawer({ open, onClose }: MobileMenuDrawerProps) {
  const reducedMotion = useReducedMotion();

  return (
    <AnimatePresence>
      {open ? (
        <>
          <motion.button
            aria-label="Close menu"
            className="fixed inset-0 z-40 bg-black/40 backdrop-blur-sm"
            onClick={onClose}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: reducedMotion ? 0 : 0.2 }}
          />

          <motion.aside
            className="fixed right-0 top-0 z-50 h-full w-72 bg-white p-6 shadow-2xl"
            initial={{ x: reducedMotion ? 0 : 320, opacity: 0.8 }}
            animate={{ x: 0, opacity: 1 }}
            exit={{ x: reducedMotion ? 0 : 320, opacity: 0.8 }}
            transition={{ type: "spring", stiffness: 280, damping: 30 }}
          >
            <div className="mb-8 flex items-center justify-between">
              <p className="font-semibold tracking-wide">Menu</p>
              <button onClick={onClose} className="rounded-full p-2 text-sm text-zinc-700">
                Close
              </button>
            </div>

            <nav className="space-y-4">
              {links.map((link, index) => (
                <motion.div
                  key={link.href}
                  initial={{ x: reducedMotion ? 0 : 16, opacity: 0 }}
                  animate={{ x: 0, opacity: 1 }}
                  transition={{ delay: reducedMotion ? 0 : index * 0.05 }}
                >
                  <Link
                    className="block text-lg font-medium text-zinc-900"
                    href={link.href}
                    onClick={onClose}
                  >
                    {link.label}
                  </Link>
                </motion.div>
              ))}
            </nav>
          </motion.aside>
        </>
      ) : null}
    </AnimatePresence>
  );
}
