import React from 'react';
import { BikeLoadingSpinner } from './BikeLoadingSpinner';

interface OfferCardSkeletonProps {
  index?: number;
}

export const OfferCardSkeleton: React.FC<OfferCardSkeletonProps> = ({ index = 0 }) => {
  // Slight organic variations between cards to simulate realistic content diversity
  const isEbikish = index % 3 !== 2;
  const isDiscounted = index % 2 === 0;

  return (
    <div
      className="OfferCardSkeleton relative bg-white rounded-2xl border border-slate-200/90 overflow-hidden shadow-xs flex flex-col justify-between animate-skeleton-shimmer will-change-transform"
      aria-hidden="true"
    >
      {/* Media & Badges Container (Aspect 4/3) with Bicycle Loading Spinner */}
      <div className="relative aspect-4/3 bg-gradient-to-b from-slate-100 via-slate-50 to-slate-100/90 overflow-hidden flex flex-col items-center justify-center p-4">
        {/* Centered Bike Loading Spinner with moving tires */}
        <div className="transform hover:scale-105 transition-transform">
          <BikeLoadingSpinner size="md" variant="emerald" showRoad={true} />
        </div>

        {/* Top Left Corner: Inventory Status & Category Pill Skeletons */}
        <div className="absolute top-3 left-3 flex flex-col gap-1.5 z-10 items-start">
          {/* Stock Status Pill */}
          <div className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-white/95 border border-slate-200/80 shadow-xs flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
            <div className="h-2.5 w-14 bg-slate-200 rounded-full"></div>
          </div>

          {/* Category & Propulsion Badges */}
          <div className="flex flex-wrap gap-1">
            <div className="h-4 w-12 rounded-md bg-white/95 border border-slate-200/70 shadow-2xs"></div>
            {isEbikish && (
              <div className="h-4 w-14 rounded-md bg-emerald-50 border border-emerald-200/70 shadow-2xs"></div>
            )}
          </div>
        </div>

        {/* Top Right Corner: Compare & Favorite Button Skeletons */}
        <div className="absolute top-3 right-3 flex items-center gap-1.5 z-10">
          <div className="h-8 px-2.5 rounded-full bg-white/95 border border-slate-200/80 shadow-xs flex items-center gap-1.5">
            <div className="w-3.5 h-3.5 rounded-full bg-slate-200"></div>
            <div className="h-2.5 w-14 bg-slate-200 rounded-full"></div>
          </div>
          <div className="w-8 h-8 rounded-full bg-white/95 border border-slate-200/80 shadow-xs flex items-center justify-center">
            <div className="w-4 h-4 rounded-full bg-slate-200"></div>
          </div>
        </div>

        {/* Subtle bottom tag in photo area */}
        <div className="absolute bottom-2 inset-x-0 text-center">
          <span className="text-[10px] font-semibold text-slate-400/80 uppercase tracking-widest">
            Händlerbestand
          </span>
        </div>
      </div>

      {/* Content Section */}
      <div className="p-4 flex-1 flex flex-col justify-between">
        <div>
          {/* Brand & Model Year */}
          <div className="flex items-center gap-2 mb-2">
            <div className="h-3 w-24 bg-emerald-100/80 rounded"></div>
            <div className="h-3 w-10 bg-slate-200 rounded"></div>
          </div>

          {/* Bike Model Title (2 Lines) */}
          <div className="space-y-1.5 mb-3">
            <div
              className="h-4 bg-slate-200 rounded"
              style={{ width: `${85 - (index % 3) * 10}%` }}
            ></div>
            <div
              className="h-4 bg-slate-200/70 rounded"
              style={{ width: `${55 + (index % 4) * 8}%` }}
            ></div>
          </div>

          {/* Key Technical Specs */}
          <div className="flex flex-wrap gap-2 mb-3">
            {isEbikish && (
              <div className="h-5 px-2 rounded-md bg-slate-100 border border-slate-200/70 flex items-center gap-1.5">
                <div className="w-3 h-3 rounded-full bg-slate-300"></div>
                <div className="h-2.5 w-10 bg-slate-200 rounded"></div>
              </div>
            )}
            {isEbikish && (
              <div className="h-5 px-2 rounded-md bg-slate-100 border border-slate-200/70 flex items-center gap-1.5">
                <div className="w-3 h-3 rounded-full bg-slate-300"></div>
                <div className="h-2.5 w-8 bg-slate-200 rounded"></div>
              </div>
            )}
            <div className="h-5 px-2 rounded-md bg-slate-100 border border-slate-200/70 flex items-center gap-1.5">
              <div className="h-2.5 w-12 bg-slate-200 rounded"></div>
            </div>
          </div>

          {/* Supported Leasing Providers */}
          <div className="mb-4">
            <div className="flex items-center gap-1.5 mb-1.5">
              <div className="w-3 h-3 rounded bg-emerald-200"></div>
              <div className="h-2.5 w-32 bg-slate-200/80 rounded"></div>
            </div>
            <div className="flex flex-wrap gap-1">
              <div className="h-4.5 w-16 rounded bg-emerald-50 border border-emerald-200/70"></div>
              <div className="h-4.5 w-18 rounded bg-emerald-50 border border-emerald-200/70"></div>
              <div className="h-4.5 w-14 rounded bg-slate-100 border border-slate-200/70"></div>
            </div>
          </div>
        </div>

        {/* Price & Dealer Bottom Bar */}
        <div className="pt-3 border-t border-slate-100">
          {/* Dealer & Location Distance */}
          <div className="flex items-center justify-between text-xs mb-2.5">
            <div className="h-3 w-28 bg-slate-200 rounded"></div>
            <div className="h-3 w-14 bg-emerald-100 rounded"></div>
          </div>

          {/* Pricing & CTA Buttons */}
          <div className="flex items-end justify-between gap-2">
            <div>
              {isDiscounted && (
                <div className="h-2.5 w-14 bg-slate-200/60 rounded mb-1"></div>
              )}
              <div className="h-6 w-24 bg-slate-900/80 rounded-md"></div>
            </div>

            <div className="flex items-center gap-1.5">
              <div className="h-7 w-14 rounded-lg bg-slate-100 border border-slate-200"></div>
              <div className="h-7 w-20 rounded-lg bg-emerald-600/85"></div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

interface OfferGridSkeletonProps {
  count?: number;
}

export const OfferGridSkeleton: React.FC<OfferGridSkeletonProps> = ({ count = 8 }) => {
  return (
    <div
      id="bike-grid-skeleton"
      className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6"
    >
      {[...Array(count)].map((_, i) => (
        <OfferCardSkeleton key={i} index={i} />
      ))}
    </div>
  );
};
