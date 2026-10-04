"use client";

import { useEffect } from "react";
import { createClient } from "@/lib/supabase/client";

export default function ActivityTracker() {
  useEffect(() => {
    const touch = async () => {
      const s = createClient();
      const { data: { user } } = await s.auth.getUser();
      if (user) await s.rpc("touch_last_seen");
    };
    void touch();
  }, []);
  return null;
}
