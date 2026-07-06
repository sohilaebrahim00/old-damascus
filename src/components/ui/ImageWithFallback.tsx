"use client";

import Image, { ImageProps } from "next/image";
import { useState, useEffect } from "react";

interface ImageWithFallbackProps extends Omit<ImageProps, "onError"> {
  fallbackSrc?: string;
}

export function ImageWithFallback({
  src,
  fallbackSrc,
  alt,
  ...rest
}: ImageWithFallbackProps) {
  const [hasError, setHasError] = useState(false);

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setHasError(false);
  }, [src]);

  // If there's an error and we have a fallback, render the fallback
  if (hasError && fallbackSrc) {
    return (
      <Image
        {...rest}
        src={fallbackSrc}
        alt={alt}
      />
    );
  }

  // If there's an error and NO fallback, return null or an empty div
  if (hasError) {
    return null;
  }

  return (
    <Image
      {...rest}
      src={src}
      alt={alt}
      onError={() => setHasError(true)}
    />
  );
}
