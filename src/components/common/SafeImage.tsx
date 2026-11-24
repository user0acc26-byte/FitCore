import { useState } from 'react';
import { Dumbbell } from 'lucide-react';

interface SafeImageProps {
  src?: string;
  alt: string;
  className?: string;
  fallbackTitle?: string;
}

export function SafeImage({ src, alt, className = '', fallbackTitle }: SafeImageProps) {
  const [failed, setFailed] = useState(false);

  if (!src || failed) {
    return (
      <div
        className={`flex flex-col items-center justify-center bg-[#1B1B1B] border border-white/10 text-center p-4 ${className}`}
        role="img"
        aria-label={alt}
      >
        <Dumbbell className="h-8 w-8 text-[#E51C2A] mb-2" />
        <span className="text-xs font-medium text-[#858585] line-clamp-2">
          {fallbackTitle || alt}
        </span>
      </div>
    );
  }

  return (
    <img
      src={src}
      alt={alt}
      referrerPolicy="no-referrer"
      onError={() => setFailed(true)}
      className={className}
    />
  );
}
