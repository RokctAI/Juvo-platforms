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

// The Juvo site's server-side pieces (delivery_sdk 1.2.0): resolving a
// tour step to a picture, the device frames, the page frame (header, main,
// footer) and the footer itself. The footer follows Ray's rule
// (2026-11-01, "respect the footer rule"): the links and base_sdk's credit
// line, `© 2026 Juvo Platforms · Built with ♥ by ROKCT`, and no brand name
// or wordmark at the bottom of the page.

import "./juvo.css";

import type { ReactNode } from "react";

import { SiteCredit } from "@/components/custom/site-credit";

import { JuvoHeader } from "./juvo-client";
import { JUVO_BRAND, JUVO_FOOTER, JUVO_HEADER, JUVO_NAV, JUVO_SITE_NAME, type JuvoShot } from "./juvo-copy";
import { juvoFontClassName } from "./juvo-fonts";
import type { JuvoTour } from "./juvo-load";
import { JuvoImg, type JuvoImage } from "./juvo-media";
import { JUVO_TOUR_SIZES, juvoTourSrc, stepFor, type JuvoAppId } from "./juvo-tour";

export type JuvoTours = Partial<Record<JuvoAppId, JuvoTour>>;

/** A shot as a picture, or null when today's tour has no such step. */
export function resolveShot(tours: JuvoTours, shot: JuvoShot): JuvoImage | null {
  const tour = tours[shot.app];
  const step = tour ? stepFor(tour.steps, shot.slug) : null;
  if (!step) return null;
  const size = JUVO_TOUR_SIZES[shot.device];
  return { src: juvoTourSrc(shot.app, shot.device, step.file), width: size.width, height: size.height, alt: shot.alt };
}

const PHONE_SIZES = "(max-width: 720px) 46vw, 260px";
const TABLET_SIZES = "(max-width: 900px) 92vw, 720px";

/** A phone frame around one tour picture. */
export function Phone({
  img,
  className,
  sizes = PHONE_SIZES,
  preload,
}: {
  img: JuvoImage | null;
  className?: string;
  sizes?: string;
  preload?: boolean;
}) {
  return (
    <figure className={className ? `phone ${className}` : "phone"}>
      {img ? <JuvoImg img={img} sizes={sizes} preload={preload} /> : <span className="jv-missing" aria-hidden />}
    </figure>
  );
}

/** A tablet frame around one tour picture. */
export function Tablet({
  img,
  className,
  sizes = TABLET_SIZES,
  preload,
}: {
  img: JuvoImage | null;
  className?: string;
  sizes?: string;
  preload?: boolean;
}) {
  return (
    <figure className={className ? `tablet ${className}` : "tablet"}>
      {img ? <JuvoImg img={img} sizes={sizes} preload={preload} /> : <span className="jv-missing" aria-hidden />}
    </figure>
  );
}

/** Whichever frame a shot's run calls for. */
export function Device({ tours, shot, className, sizes }: { tours: JuvoTours; shot: JuvoShot; className?: string; sizes?: string }) {
  const img = resolveShot(tours, shot);
  return shot.device === "tablet" ? (
    <Tablet img={img} className={className} sizes={sizes} />
  ) : (
    <Phone img={img} className={className} sizes={sizes} />
  );
}

/**
 * A screen the app repo renders from code (marketing/tour/svg/*.clean.svg),
 * one file per theme, drawn in the page's theme. The SVG carries its own
 * device bezel; the generator's label row above it is cropped off (the
 * bezel sits at x 24-434, y 58-1137 of the 458-wide canvas).
 */
export function ThemedScreen({ app, light, dark, alt }: { app: JuvoAppId; light: string; dark: string; alt: string }) {
  return (
    <figure className="svgdev" role="img" aria-label={alt}>
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img className="svg-light" src={juvoTourSrc(app, "svg", light)} alt="" loading="lazy" decoding="async" />
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img className="svg-dark" src={juvoTourSrc(app, "svg", dark)} alt="" loading="lazy" decoding="async" />
    </figure>
  );
}

/** A heading with its brand-coloured italic tail. */
export function Display({
  as: Tag = "h2",
  text,
  it,
  end,
  className,
}: {
  as?: "h1" | "h2" | "h3";
  text: string;
  it: string;
  end?: string;
  className?: string;
}) {
  return (
    <Tag className={className ? `display ${className}` : "display"}>
      {text} <span className="it">{it}</span>
      {end ? ` ${end}` : null}
    </Tag>
  );
}

export function JuvoFooter() {
  return (
    <footer className="foot">
      <div className="wrap">
        <nav aria-label="Footer">
          {JUVO_FOOTER.nav.map((n) => (
            <a key={n.href} href={n.href}>
              {n.label}
            </a>
          ))}
        </nav>
        <SiteCredit as="p" siteName={JUVO_SITE_NAME} className="made" heartClassName="heart" />
      </div>
    </footer>
  );
}

/** The page frame every Juvo page shares: the scoped root, the header and the footer. */
export function JuvoFrame({ current, children }: { current?: string; children: ReactNode }) {
  return (
    <div className={`jv ${juvoFontClassName}`}>
      <a className="skip" href="#main">
        Skip to content
      </a>
      <JuvoHeader brand={JUVO_BRAND} nav={JUVO_NAV} current={current} labels={JUVO_HEADER} cta={JUVO_HEADER.cta} />
      <main id="main">{children}</main>
      <JuvoFooter />
    </div>
  );
}
