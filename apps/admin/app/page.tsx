"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { getSession } from "@/lib/auth";

export default function AdminPage() {
  const router = useRouter();

  useEffect(() => {
    getSession().then(({ session }) => {
      if (session) {
        router.push("/add_class_test");
      } else {
        router.push("/login");
      }
    });
  }, [router]);

  return (
    <div className="flex items-center justify-center w-full h-screen">
      <p>Loading...</p>
    </div>
  );
}
