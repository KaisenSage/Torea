"use client";
import { useEffect } from "react";

export function AppearOnScroll({ children }: { children: React.ReactNode }) {
  useEffect(() => {
    const elements = document.querySelectorAll(".appear-on-scroll");
    const observer = new window.IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.classList.add("appeared");
        }
      });
    }, { threshold: 0.1 });
    elements.forEach((el) => observer.observe(el));
    return () => observer.disconnect();
  }, []);
  return <>{children}</>;
}
