"use client";

/*
 * Copyright (c) 2026 ROKCT INTELLIGENCE (PTY) LTD
 *
 * This program is free software: you can redistribute it and/or modify
 * it under the terms of the GNU Affero General Public License as published
 * by the Free Software Foundation, version 3.
 *
 * This program is distributed in the hope that it will be useful,
 * but WITHOUT ANY WARRANTY; without even the implied warranty of
 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE. See the
 * GNU Affero General Public License for more details.
 *
 * You should have received a copy of the GNU Affero General Public License
 * along with this program. If not, see <https://www.gnu.org/licenses/>.
 */

// One tour picture inside a device frame (delivery_sdk 1.2.0). The picture
// is fetched live through /juvo/tour/... (juvo-tour.ts) and sized by Next's
// image optimizer, so a 1080 x 1920 tour PNG reaches a phone frame as a
// small WebP. When the route cannot hand the picture over (GitHub down
// before any copy was cached, a step renamed since the guide was read), the
// <img> is dropped and the frame keeps its screen-coloured face instead of
// a broken-image glyph.

import Image from "next/image";
import { useState } from "react";

/** A tour picture, resolved against today's guide. */
export interface JuvoImage {
  src: string;
  width: number;
  height: number;
  alt: string;
}

export function JuvoImg({
  img,
  sizes,
  preload = false,
  className,
}: {
  img: JuvoImage;
  sizes: string;
  preload?: boolean;
  className?: string;
}) {
  const [failed, setFailed] = useState(false);
  if (failed) return <span className="jv-missing" role="img" aria-label={img.alt} />;
  return (
    <Image
      src={img.src}
      width={img.width}
      height={img.height}
      alt={img.alt}
      sizes={sizes}
      preload={preload}
      className={className}
      onError={() => setFailed(true)}
    />
  );
}
