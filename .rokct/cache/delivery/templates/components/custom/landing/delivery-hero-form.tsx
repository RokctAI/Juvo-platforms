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

"use client";

// The delivery platform storefront's hero body, for base_sdk's hero-form
// registry (components/custom/landing/hero-form.ts, base_sdk >= 1.7.0). The
// base hero is a frame whose body the home SDK injects (Ray, 2026-09-08);
// with nothing registered it renders no call to action at all, and the
// trust line it carries is only drawn beside store badges this product has
// none of. So, as hosting-hero-form.tsx and lms-hero-form.tsx do, this body
// is two calls to action and no input: the pricing section on this page,
// and the login - a tenant's people (sellers, drivers, administrators) sign
// in to the portal from here, while the storefront sells the platform to
// everyone else (Ray, 2026-09-09).
//
// The login link is LANDING_CONFIG.loginUrl, the same route base's header
// draws, so a host that moves its login moves this button with it. The two
// buttons route through the shell's theme tokens (bg-primary /
// text-primary-foreground and the border token), never a literal colour.
//
// 1.1.1: the pricing call to action is an in-page anchor, and the pricing
// section is not always on the page - it turns itself down when there are
// no plans to price. So the button is drawn from `nav` (base_sdk >= 1.48.0),
// the page's live section list, and when pricing is not on it the login
// takes the primary style rather than the hero offering a button that
// scrolls nowhere.

import React from "react";
import Link from "next/link";

import type { HeroFormProps } from "@/components/custom/landing/hero-form";
import { LANDING_CONFIG } from "@/components/custom/landing/landing-config";

const PRICING_SECTION_ID = "pricing";
const PRICING_ANCHOR = `#${PRICING_SECTION_ID}`;

const PRIMARY_CLASS =
  "inline-flex w-full items-center justify-center rounded-full bg-primary px-8 py-3 text-base font-semibold text-primary-foreground transition-opacity hover:opacity-90 sm:w-auto";
const SECONDARY_CLASS =
  "inline-flex w-full items-center justify-center rounded-full border border-zinc-300 px-8 py-3 text-base font-semibold text-zinc-900 transition-colors hover:border-primary hover:text-primary dark:border-zinc-700 dark:text-white sm:w-auto";

export default function DeliveryHeroForm({ hero, nav }: HeroFormProps) {
  // "See pricing" is an in-page anchor, so it is drawn only when the pricing
  // section is actually on this render. The section turns itself down when
  // there are no plans to price (delivery-pricing-section.tsx `meta.renders`),
  // which is what the storefront shows whenever the platform's plan catalog
  // cannot be read - every deployment does, before its backend is up. The
  // button used to stay and scroll nowhere; now the login takes the primary
  // style so the hero still leads somewhere that works. `nav` absent (a host
  // older than base_sdk 1.48.0) keeps the button, as before.
  const hasPricing = nav
    ? nav.some((item) => item.id === PRICING_SECTION_ID)
    : true;

  return (
    <div className="flex flex-col items-center gap-6">
      <div className="flex w-full flex-col items-center justify-center gap-3 sm:w-auto sm:flex-row">
        {hasPricing && (
          <a href={PRICING_ANCHOR} className={PRIMARY_CLASS}>
            See pricing
          </a>
        )}
        <Link
          href={LANDING_CONFIG.loginUrl}
          className={hasPricing ? SECONDARY_CLASS : PRIMARY_CLASS}
        >
          Log in to your portal
        </Link>
      </div>

      {hero.trustLine.length > 0 && (
        <p className="text-sm font-medium text-zinc-600 dark:text-zinc-400">
          {hero.trustLine.join(" · ")}
        </p>
      )}
    </div>
  );
}
