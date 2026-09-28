import { Img, Section } from '@react-email/components';
import * as React from 'react';

interface HeroImageProps {
  src: string;
  alt: string;
}

/** Dynamic class photo, 1280:720 aspect ratio, rounded corners — 472x266 within the 600px column. */
export function HeroImage({ src, alt }: HeroImageProps) {
  return (
    <Section style={{ padding: '24px 64px' }}>
      <Img
        src={src}
        alt={alt}
        width={472}
        height={266}
        style={{ width: '100%', maxWidth: 472, height: 'auto', borderRadius: 6, display: 'block' }}
      />
    </Section>
  );
}
