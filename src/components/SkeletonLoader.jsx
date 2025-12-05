import React from "react";

export const SkeletonCard = () => (
  <div className="animate-pulse space-y-4 bg-gray-900/30 p-4 rounded-lg border border-green-700/20">
    <div className="h-48 bg-gray-700/40 rounded-lg" />
    <div className="h-6 bg-gray-700/40 rounded w-3/4" />
    <div className="h-4 bg-gray-700/40 rounded w-1/2" />
    <div className="h-10 bg-green-700/30 rounded w-full" />
  </div>
);

export const SkeletonGrid = ({ count = 6 }) => (
  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
    {Array(count).fill(0).map((_, i) => (
      <SkeletonCard key={i} />
    ))}
  </div>
);

export const SkeletonText = ({ lines = 3, className = "" }) => (
  <div className={`space-y-3 ${className}`}>
    {Array(lines).fill(0).map((_, i) => (
      <div key={i} className={`h-4 bg-gray-700/40 rounded animate-pulse ${i === lines - 1 ? 'w-2/3' : 'w-full'}`} />
    ))}
  </div>
);

export const SkeletonImage = () => (
  <div className="h-64 bg-gray-700/40 rounded-lg animate-pulse" />
);
