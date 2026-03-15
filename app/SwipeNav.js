"use client";
import { useEffect, useRef } from "react";
import { useRouter } from "next/navigation";

export default function SwipeNav({ children }) {
  const router = useRouter();
  const touchStartX = useRef(null);

  useEffect(() => {
    const SWIPE_THRESHOLD = 60;
    const EDGE_ZONE = 40; // px from screen edge to initiate swipe

    function onTouchStart(e) {
      const touch = e.touches[0];
      touchStartX.current = touch.clientX;
    }

    function onTouchEnd(e) {
      if (touchStartX.current === null) return;
      const endX = e.changedTouches[0].clientX;
      const delta = endX - touchStartX.current;

      if (delta > SWIPE_THRESHOLD && touchStartX.current < EDGE_ZONE) {
        router.back();
      } else if (delta < -SWIPE_THRESHOLD && touchStartX.current > window.innerWidth - EDGE_ZONE) {
        router.forward();
      }

      touchStartX.current = null;
    }

    document.addEventListener("touchstart", onTouchStart, { passive: true });
    document.addEventListener("touchend", onTouchEnd, { passive: true });
    return () => {
      document.removeEventListener("touchstart", onTouchStart);
      document.removeEventListener("touchend", onTouchEnd);
    };
  }, [router]);

  return children;
}
