"use client";

import { useState } from "react";
import { createClient } from "@/lib/supabase/client";

export function LogoutButton() {
  const [loading, setLoading] = useState(false);

  async function logout() {
    setLoading(true);
    const supabase = createClient();
    await supabase.auth.signOut();
    window.location.assign("/login");
  }

  return (
    <button className="secondary-button" type="button" onClick={logout} disabled={loading}>
      {loading ? "..." : "로그아웃"}
    </button>
  );
}
