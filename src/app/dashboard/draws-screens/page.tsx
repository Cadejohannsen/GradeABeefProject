"use client";

import { Shuffle } from "lucide-react";
import { PlayPage } from "@/components/plays/play-page";

export default function DrawsScreensPage() {
  return (
    <PlayPage
      category="draw-screen"
      title="Draws / Screens"
      icon={<Shuffle size={28} className="text-primary-400" />}
    />
  );
}
