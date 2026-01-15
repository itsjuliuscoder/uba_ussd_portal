"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";

export default function Home() {
  const router = useRouter();

  useEffect(() => {
    // Redirect root page to login page
    router.push("/login");
  }, [router]);

  return null;
}
