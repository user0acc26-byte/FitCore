import { Dumbbell } from 'lucide-react';

interface BrandMarkProps {
  size?: 'sm' | 'md' | 'lg';
  light?: boolean;
}

export function BrandMark({ size = 'md', light = false }: BrandMarkProps) {
  const iconBox =
    size === 'lg' ? 'h-10 w-10' : size === 'sm' ? 'h-7 w-7' : 'h-8 w-8';
  const textSize =
    size === 'lg' ? 'text-2xl' : size === 'sm' ? 'text-lg' : 'text-xl';

  return (
    <span className="inline-flex items-center gap-2.5 whitespace-nowrap shrink-0 select-none">
      <span
        className={`${iconBox} inline-flex items-center justify-center rounded bg-[#E51C2A] text-white shrink-0`}
      >
        <Dumbbell className={size === 'sm' ? 'h-4 w-4' : 'h-5 w-5'} />
      </span>
      <span
        className={`font-display font-extrabold tracking-tight uppercase ${textSize} ${
          light ? 'text-[#111111]' : 'text-white'
        }`}
      >
        Fit<span className="text-[#E51C2A]">Core</span>
      </span>
    </span>
  );
}
