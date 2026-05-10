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

export function ResultSkeleton() {
  return (
    <div className="max-w-4xl mx-auto w-full pb-24 px-4 md:px-6 pt-10">
      <Skeleton className="h-8 w-36 rounded-full mb-8" />
      <div className="bg-white dark:bg-zinc-900 rounded-[3rem] p-8 md:p-16 border border-zinc-200 dark:border-zinc-800 mb-10 flex flex-col items-center gap-8">
        <Skeleton className="w-48 h-48 rounded-full" variant="circle" />
        <div className="w-full max-w-xs flex flex-col gap-3">
          <Skeleton className="h-12 w-full" />
          <Skeleton className="h-5 w-3/4 mx-auto" variant="text" />
          <div className="flex gap-3 mt-4">
            <Skeleton className="h-12 flex-1" />
            <Skeleton className="h-12 flex-1" />
          </div>
        </div>
      </div>
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-10">
        {[1,2,3,4].map(i => <Skeleton key={i} className="h-24" />)}
      </div>
      <div className="flex flex-col gap-4">
        {[1,2,3].map(i => <Skeleton key={i} className="h-40" />)}
      </div>
    </div>
  );
}

export function QuizSkeleton() {
  return (
    <div className="min-h-screen bg-white dark:bg-zinc-950">
      <div className="border-b border-zinc-200 dark:border-zinc-800 px-6 py-4 flex items-center justify-between">
        <div>
          <Skeleton className="h-5 w-40 mb-1" />
          <Skeleton className="h-3 w-24" variant="text" />
        </div>
        <Skeleton className="h-9 w-24 rounded-xl" />
      </div>
      <div className="max-w-4xl mx-auto p-4 md:p-8">
        <div className="flex flex-wrap gap-2 justify-center bg-zinc-50 dark:bg-zinc-900 p-4 rounded-3xl border border-zinc-200 dark:border-zinc-800 mb-8">
          {[1,2,3,4,5,6,7,8,9,10].map(i => <Skeleton key={i} className="w-8 h-8 rounded-xl" />)}
        </div>
        <div className="bg-white dark:bg-zinc-900 rounded-[2.5rem] border border-zinc-200 dark:border-zinc-800 p-8 md:p-12">
          <Skeleton className="h-7 w-3/4 mb-12" />
          <div className="flex flex-col gap-3">
            {[1,2,3,4].map(i => <Skeleton key={i} className="h-16" />)}
          </div>
        </div>
      </div>
    </div>
  );
}
