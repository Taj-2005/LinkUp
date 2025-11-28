"use client";

import React from "react";

interface SkeletonLoaderProps {
  variant?: "circle" | "line" | "rect" | "text";
  width?: string | number;
  height?: string | number;
  className?: string;
  animated?: boolean;
  "aria-label"?: string;
}

export default function SkeletonLoader({
  variant = "line",
  width,
  height,
  className = "",
  animated = true,
  "aria-label": ariaLabel = "Loading content",
}: SkeletonLoaderProps) {
  const baseClasses = "bg-gray-300 dark:bg-gray-700";
  const variantClasses = {
    circle: "rounded-full",
    line: "rounded-md",
    rect: "rounded-lg",
    text: "rounded",
  };

  const animationClass = animated ? "skeleton-wiggle" : "";
  const shimmerClass = animated ? "relative overflow-hidden" : "";

  const style: React.CSSProperties = {
    width: width ? (typeof width === "number" ? `${width}px` : width) : undefined,
    height: height ? (typeof height === "number" ? `${height}px` : height) : undefined,
  };

  return (
    <div
      className={`${baseClasses} ${variantClasses[variant]} ${animationClass} ${shimmerClass} ${className}`}
      style={style}
      role="status"
      aria-label={ariaLabel}
      aria-live="polite"
      aria-busy="true"
    >
      {animated && (
        <div
          className="absolute inset-0 animate-shimmer opacity-60 pointer-events-none"
          aria-hidden="true"
        />
      )}
    </div>
  );
}

export function SkeletonCircle({
  size = 50,
  className = "",
  animated = true,
}: {
  size?: number;
  className?: string;
  animated?: boolean;
}) {
  return (
    <SkeletonLoader
      variant="circle"
      width={size}
      height={size}
      className={`skeleton-circle ${className}`}
      animated={animated}
      aria-label="Loading avatar"
    />
  );
}

export function SkeletonLine({
  width = "100%",
  height = 16,
  className = "",
  animated = true,
}: {
  width?: string | number;
  height?: number;
  className?: string;
  animated?: boolean;
}) {
  return (
    <SkeletonLoader
      variant="line"
      width={width}
      height={height}
      className={`skeleton-line ${className}`}
      animated={animated}
      aria-label="Loading text"
    />
  );
}

export function SkeletonText({
  lines = 3,
  className = "",
  animated = true,
}: {
  lines?: number;
  className?: string;
  animated?: boolean;
}) {
  return (
    <div className={`flex flex-col gap-2 ${className}`} role="status" aria-label="Loading text content">
      {Array.from({ length: lines }).map((_, i) => (
        <SkeletonLine
          key={i}
          width={i === lines - 1 ? "80%" : "100%"}
          height={16}
          animated={animated}
        />
      ))}
    </div>
  );
}

