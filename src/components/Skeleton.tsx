import React from 'react';
import { cn } from '../lib/utils';

interface SkeletonProps {
  className?: string;
  variant?: 'rect' | 'circle' | 'text';
}

export default function Skeleton({ className, variant = 'rect' }: SkeletonProps) {
  return (
    <div 
      className={cn(
        "animate-pulse bg-zinc-200 dark:bg-zinc-800",
        variant === 'circle' ? "rounded-full" : 
        variant === 'text' ? "rounded h-4 w-full" : "rounded-2xl",
        className
      )}
    />
  );
}

export function HistorySkeleton() {
  return (
    <div className="grid gap-3">
      {[1, 2, 3, 4, 5].map(i => (
        <div key={i} className="bg-white dark:bg-zinc-900 p-4 rounded-xl border border-slate-200 dark:border-zinc-800 flex items-center justify-between">
           <div className="flex-1 mr-4">
             <Skeleton className="h-4 w-1/2 mb-2" />
             <div className="flex gap-3">
               <Skeleton className="h-3 w-20" />
               <Skeleton className="h-3 w-16" />
             </div>
           </div>
           <Skeleton className="h-8 w-24" />
        </div>
      ))}
    </div>
  );
}

export function ProfileSkeleton() {
  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      <div className="bg-white dark:bg-zinc-900 rounded-[2.5rem] border border-zinc-200 dark:border-zinc-800 overflow-hidden">
        <Skeleton className="h-32 w-full rounded-none" />
        <div className="pt-16 pb-8 px-8">
           <div className="flex flex-col md:flex-row justify-between gap-6">
             <div>
               <Skeleton className="h-8 w-48 mb-2" />
               <Skeleton className="h-4 w-32" />
             </div>
             <Skeleton className="h-12 w-32" />
           </div>
           <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-12">
             <Skeleton className="h-32" />
             <Skeleton className="h-32" />
             <Skeleton className="h-32" />
           </div>
           <Skeleton className="h-64 mt-12 w-full" />
        </div>
      </div>
    </div>
  );
}
