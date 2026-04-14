"use client";

import { use, useEffect } from "react";
import { useRouter } from "next/navigation";

export default function SharedCalendarPage({
  params,
}: {
  params: Promise<{ token: string }>;
}) {
  const { token } = use(params);
  const router = useRouter();

  useEffect(() => {
    router.replace(`/planner?shared=${token}`);
  }, [token, router]);

  return (
    <div className="flex h-screen items-center justify-center text-stone-400 text-sm">
      Loading shared calendar...
    </div>
  );
}
