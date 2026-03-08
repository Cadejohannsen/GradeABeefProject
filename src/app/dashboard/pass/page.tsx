"use client";

import { Shield } from "lucide-react";
import { PlayPage } from "@/components/plays/play-page";

export default function PassPage() {
  return (
    <PlayPage
      category="pass"
      title="Pass Protection"
      icon={<Shield size={28} className="text-primary-400" />}
    />
  );
}
