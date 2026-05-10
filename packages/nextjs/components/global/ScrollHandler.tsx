// components/ScrollHandler.tsx
"use client";
import { useSearchParams } from "next/navigation";
import { useEffect } from "react";

export default function ScrollHandler() {
  const searchParams = useSearchParams();

  useEffect(() => {
    const target = searchParams.get("scrollTo");
    if (target) document.getElementById(target)?.scrollIntoView({ behavior: "smooth" });
  }, [searchParams]);

  return null;
}
