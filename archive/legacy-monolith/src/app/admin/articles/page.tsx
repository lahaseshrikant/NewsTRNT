"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";

export default function AdminArticlesRedirect() {
  const router = useRouter();

  useEffect(() => {
    router.replace("/admin/content/articles");
  }, [router]);

  return (
    <div className="min-h-screen flex items-center justify-center">
      <p className="text-muted-foreground">Redirecting to Articles...</p>
    </div>
  );
}
