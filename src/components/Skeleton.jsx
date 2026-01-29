import React from 'react';

export const SkeletonCircle = ({ size = 'w-12 h-12' }) => (
  <div className={`${size} rounded-full skeleton`} />
);

export const SkeletonText = ({ lines = 1, className = '' }) => (
  <div className={`space-y-2 ${className}`}>
    {Array.from({ length: lines }).map((_, i) => (
      <div 
        key={i} 
        className={`h-4 skeleton ${i === lines - 1 && lines > 1 ? 'w-3/4' : 'w-full'}`} 
      />
    ))}
  </div>
);

export const SkeletonCard = () => (
  <div className="card p-4 space-y-3">
    <div className="flex items-center gap-3">
      <SkeletonCircle />
      <SkeletonText lines={2} className="flex-1" />
    </div>
    <div className="h-32 skeleton rounded-xl" />
  </div>
);

export const SkeletonStory = () => (
  <div className="flex flex-col items-center gap-2">
    <SkeletonCircle size="w-16 h-16" />
    <div className="h-3 w-12 skeleton rounded" />
  </div>
);

export const SkeletonMessage = ({ sent = false }) => (
  <div className={`flex ${sent ? 'justify-end' : 'justify-start'}`}>
    <div className={`max-w-[70%] ${sent ? 'items-end' : 'items-start'} flex flex-col gap-1`}>
      <div className={`h-10 skeleton rounded-2xl ${sent ? 'w-32' : 'w-40'}`} />
    </div>
  </div>
);

export const SkeletonFeed = () => (
  <div className="space-y-4 p-4">
    <div className="flex gap-4 overflow-hidden">
      {[1, 2, 3, 4].map(i => <SkeletonStory key={i} />)}
    </div>
    <SkeletonCard />
    <SkeletonCard />
  </div>
);

export const SkeletonProfile = () => (
  <div className="p-4 space-y-4">
    <div className="flex flex-col items-center gap-3">
      <SkeletonCircle size="w-24 h-24" />
      <SkeletonText lines={2} className="w-32" />
    </div>
    <div className="flex justify-center gap-8">
      {[1, 2, 3].map(i => (
        <div key={i} className="flex flex-col items-center gap-1">
          <div className="h-6 w-8 skeleton rounded" />
          <div className="h-3 w-12 skeleton rounded" />
        </div>
      ))}
    </div>
  </div>
);

export default { SkeletonCircle, SkeletonText, SkeletonCard, SkeletonStory, SkeletonMessage, SkeletonFeed, SkeletonProfile };
