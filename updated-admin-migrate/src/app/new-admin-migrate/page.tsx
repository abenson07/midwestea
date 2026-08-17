"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAdminBasePath } from "@/components/patterns/client-templates/shared";
import { homeViewPath, readHomeView } from "@/lib/preferences/homeView";

export default function DemoIndexPage() {
  const router = useRouter();
  const basePath = useAdminBasePath();

  useEffect(() => {
    const home = readHomeView();
    const path = home === "inbox" ? "/overview" : homeViewPath(home);
    router.replace(`${basePath}${path}`);
  }, [basePath, router]);

  return null;
}
