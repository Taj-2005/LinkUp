"use client";

import React from "react";

export default function Loading() {
  return (
    <div className="w-[85%] m-2 min-h-[98vh] rounded-2xl flex flex-row overflow-hidden bg-right-nav-light dark:bg-right-nav-dark">
      {/* Left Section (70%) - Stories Skeleton */}
      <div className="w-[70%] bg-left-nav-light dark:bg-right-nav-dark p-6 flex flex-col gap-6">
        {/* Top Stories header shimmer */}
        <div className="h-10 w-1/3 rounded-lg shimmer"></div>

        {/* Story cards shimmer */}
        <div className="flex gap-6 flex-wrap">
          {Array.from({ length: 6 }).map((_, i) => (
            <div
              key={i}
              className="w-[30%] h-48 rounded-2xl shimmer shadow-md"
            ></div>
          ))}
        </div>

        {/* Extra section placeholders */}
        <div className="h-40 w-full rounded-2xl shimmer mt-6"></div>
      </div>

      {/* Right Section (30%) - Profile + Ads Skeleton */}
      <div className="w-[30%] border border-primary-light/30 dark:border-primary-dark/30 flex flex-col">
        {/* Toggle Switch placeholder */}
        <div className="flex justify-end items-end m-4">
          <div className="h-6 w-12 rounded-full shimmer"></div>
        </div>

        {/* Profile Card skeleton */}
        <div className="flex flex-col items-center gap-3 px-4 mt-4">
          <div className="w-24 h-24 rounded-full shimmer"></div>
          <div className="h-5 w-32 rounded shimmer"></div>
          <div className="h-4 w-24 rounded shimmer"></div>
        </div>

        {/* Ads placeholder */}
        <div className="flex flex-col gap-4 p-4 mt-8">
          <div className="h-32 rounded-xl shimmer"></div>
          <div className="h-32 rounded-xl shimmer"></div>
        </div>
      </div>

      {/* shimmer animation styles */}
      <style jsx global>{`
        @keyframes shimmer {
          0% {
            transform: translateX(-100%);
          }
          50% {
            transform: translateX(0%);
          }
          100% {
            transform: translateX(100%);
          }
        }
        .shimmer {
          position: relative;
          overflow: hidden;
          background-color: rgba(255, 255, 255, 0.06);
        }
        .shimmer::after {
          content: "";
          position: absolute;
          top: 0;
          left: -100%;
          height: 100%;
          width: 120%;
          background: linear-gradient(
            90deg,
            rgba(255, 255, 255, 0.05) 0%,
            rgba(255, 255, 255, 0.15) 50%,
            rgba(255, 255, 255, 0.05) 100%
          );
          animation: shimmer 1.3s ease-in-out infinite;
        }

        @media (prefers-color-scheme: dark) {
          .shimmer {
            background-color: rgba(255, 255, 255, 0.04);
          }
          .shimmer::after {
            background: linear-gradient(
              90deg,
              rgba(0, 0, 0, 0.05) 0%,
              rgba(255, 255, 255, 0.08) 50%,
              rgba(0, 0, 0, 0.05) 100%
            );
          }
        }
      `}</style>
    </div>
  );
}
