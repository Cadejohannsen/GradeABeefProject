"use client";

import { Zap } from "lucide-react";
import { PlayPage } from "@/components/plays/play-page";

export default function RunsPage() {
  return (
    <PlayPage
      category="run"
      title="Run Game"
      icon={<Zap size={28} className="text-primary-400" />}
    />
  );
}
