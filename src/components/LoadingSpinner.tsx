'use client';

import React from 'react';

interface LoadingSpinnerProps {
  size?: 'sm' | 'md' | 'lg' | 'xl';
  className?: string;
  text?: string;
}

const sizeClasses = {
  sm: 'w-4 h-4',
  md: 'w-6 h-6',
  lg: 'w-8 h-8',
  xl: 'w-16 h-16',
};

export default function LoadingSpinner({ size = 'md', className = '', text }: LoadingSpinnerProps) {
  return (
    <div className={`flex items-center justify-center ${className}`}>
      <div className="flex flex-col items-center gap-3">
        <div
          className={`${sizeClasses[size]} border-4 border-blue-200 border-t-blue-600 rounded-full animate-spin`}
        ></div>
        {text && (
          <p className="text-sm text-gray-500 dark:text-gray-400 font-medium">
            {text}
          </p>
        )}
      </div>
    </div>
  );
}

export function TableRowSkeleton({ columns = 11 }: { columns?: number }) {
  return (
    <tr className="animate-pulse">
      {Array.from({ length: columns }).map((_, index) => (
        <td key={index} className="px-6 py-4 whitespace-nowrap">
          <div className="h-4 bg-gray-200 dark:bg-gray-600 rounded"></div>
        </td>
      ))}
    </tr>
  );
}

export function SectorCardSkeleton() {
  return (
    <div className="animate-pulse bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-600 rounded-lg shadow-sm p-6">
      <div className="flex justify-between items-center mb-4">
        <div className="flex items-center gap-3">
          <div className="w-3 h-3 bg-gray-300 dark:bg-gray-600 rounded-full"></div>
          <div className="h-6 bg-gray-300 dark:bg-gray-600 rounded w-32"></div>
          <div className="h-4 bg-gray-300 dark:bg-gray-600 rounded w-16"></div>
        </div>
        <div className="flex items-center gap-4">
          <div className="text-right">
            <div className="h-6 bg-gray-300 dark:bg-gray-600 rounded w-24 mb-1"></div>
            <div className="h-4 bg-gray-300 dark:bg-gray-600 rounded w-16"></div>
          </div>
        </div>
      </div>
      <div className="grid grid-cols-3 gap-4">
        {Array.from({ length: 3 }).map((_, index) => (
          <div key={index} className="text-center">
            <div className="h-4 bg-gray-300 dark:bg-gray-600 rounded w-16 mx-auto mb-2"></div>
            <div className="h-5 bg-gray-300 dark:bg-gray-600 rounded w-20 mx-auto"></div>
          </div>
        ))}
      </div>
    </div>
  );
}

export function ButtonSpinner({ className = 'w-4 h-4' }: { className?: string }) {
  return (
    <div
      className={`${className} border-2 border-white border-t-transparent rounded-full animate-spin`}
    ></div>
  );
}

export function LoadingOverlay({ text = 'Loading...' }: { text?: string }) {
  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white dark:bg-gray-800 rounded-lg p-8 shadow-xl">
        <LoadingSpinner size="xl" text={text} />
      </div>
    </div>
  );
}