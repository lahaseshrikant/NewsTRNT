"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";

export default function AdminCategoriesRedirect() {
  const router = useRouter();

  useEffect(() => {
    router.replace("/admin/content/categories");
  }, [router]);

  return (
    <div className="min-h-screen flex items-center justify-center">
      <p className="text-muted-foreground">Redirecting to Categories...</p>
    </div>
  );
}
