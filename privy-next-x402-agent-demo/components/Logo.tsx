'use client';

import Image from 'next/image';

interface LogoProps {
  className?: string;
  width?: number;
  height?: number;
}

export function Logo({ className = '', width = 100, height = 22 }: LogoProps) {
  return (
    <Image
      src="/privy-wordmark.svg"
      alt="Privy"
      width={width}
      height={height}
      className={className}
      priority
    />
  );
}
