'use client';

interface LoadingSpinnerProps {
  size?: 'sm' | 'md' | 'lg';
  className?: string;
}

export function LoadingSpinner({ size = 'md', className = '' }: LoadingSpinnerProps) {
  const sizeClasses = {
    sm: 'w-4 h-4 border-2',
    md: 'w-8 h-8 border-2',
    lg: 'w-12 h-12 border-3',
  };

  return (
    <div
      className={`inline-block animate-spin rounded-full border-[#D4AF37] border-t-transparent ${sizeClasses[size]} ${className}`}
      role="status"
      aria-label="loading"
    >
      <span className="sr-only">Loading...</span>
    </div>
  );
}

export function LoadingOverlay({ message = 'Loading...' }: { message?: string }) {
  return (
    <div className="fixed inset-0 bg-[#0A0A0F]/80 backdrop-blur-sm flex items-center justify-center z-50">
      <div className="text-center">
        <LoadingSpinner size="lg" className="mx-auto mb-4" />
        <p className="text-[#D4AF37] text-lg">{message}</p>
      </div>
    </div>
  );
}

export function SkeletonCard() {
  return (
    <div className="bg-[#1A1A24] border border-[#D4AF37]/10 rounded-xl p-6 animate-pulse">
      <div className="h-4 bg-[#D4AF37]/10 rounded w-1/4 mb-4"></div>
      <div className="h-6 bg-[#D4AF37]/10 rounded w-3/4 mb-4"></div>
      <div className="h-20 bg-[#D4AF37]/10 rounded mb-4"></div>
      <div className="flex gap-2">
        <div className="h-10 bg-[#D4AF37]/10 rounded flex-1"></div>
        <div className="h-10 bg-[#D4AF37]/10 rounded flex-1"></div>
      </div>
    </div>
  );
}

export function SkeletonTable({ rows = 3 }: { rows?: number }) {
  return (
    <div className="space-y-3">
      {Array.from({ length: rows }).map((_, i) => (
        <div key={i} className="bg-[#1A1A24] border border-[#D4AF37]/10 rounded-lg p-4 animate-pulse">
          <div className="flex items-center gap-4">
            <div className="w-10 h-10 bg-[#D4AF37]/10 rounded-full"></div>
            <div className="flex-1 space-y-2">
              <div className="h-4 bg-[#D4AF37]/10 rounded w-1/3"></div>
              <div className="h-3 bg-[#D4AF37]/10 rounded w-1/2"></div>
            </div>
            <div className="h-8 bg-[#D4AF37]/10 rounded w-20"></div>
          </div>
        </div>
      ))}
    </div>
  );
}
