// components/ScrollHandler.tsx
"use client";

import { useEffect } from "react";
import { useSearchParams } from "next/navigation";

// components/ScrollHandler.tsx

// components/ScrollHandler.tsx

export default function ScrollHandler() {
  const searchParams = useSearchParams();

  useEffect(() => {
    const target = searchParams.get("scrollTo");
    if (target) document.getElementById(target)?.scrollIntoView({ behavior: "smooth" });
  }, [searchParams]);

  return null;
}
