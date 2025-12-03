"use client";

import React from "react";
import LinkSkeleton from "./LinkSkeleton";

export default function LinksGridSkeleton() {
  return (
    <div className="grid grid-cols-2 md:grid-cols-3 gap-2 md:gap-4">
      {Array.from({ length: 6 }).map((_, i) => (
        <LinkSkeleton key={i} />
      ))}
    </div>
  );
}
