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

// The juvo storefront's site metadata, for base_sdk's
// site-metadata registry (components/custom/landing/site-metadata.ts,
// base_sdk >= 1.15.0): the <title>, description and social-card facts the
// host layout, the landing page and the generated Open Graph / Twitter
// image read from ONE registered module.
//
// The shape is written out here rather than imported from base's file, as
// hosting-site-metadata.ts, lms-site-metadata.ts and agent-site-metadata.ts
// do: an `import type` of a module that is not on disk is a compile error,
// and the registry checks the default export structurally when it loads
// this module.
//
// `icon` (since 1.2.0) is Juvo's own mark, the customer app's
// brand_logo_rounded.svg, which this SDK installs at public/juvo/; until
// then base_sdk >= 1.17.0 drew the letter favicon. No `still`, no `logo`,
// no `ogImage`: there is no delivery artwork in the sources, and base's
// generated card draws the tagline on its own. Every claim in the
// description is a source fact:
// the two delivery services (zones/delivery/docs, terms 1.1 and 1.2), the
// Driver app's dispatch and delivery-zone screens (paas_driver feature
// guide), the PaaS plan fixtures' feature lines (white label, WhatsApp order
// integration, parcel tracking sync, digital wallet), USD, Monthly and
// Yearly, and trial_period_days 14 on the yearly record.
//
// The name and the URL are Ray's ruling of 2026-09-09: "deliveryplatform
// will be juvo so i will point juvo.app to it". `siteName` was "juvo" until 1.2.0
// exactly as he wrote it - lower-case, no wordmark, no tagline of its own
// and no capitalisation invented here (paas_customer's own README titles
// the customer app "Juvo"; the storefront keeps Ray's spelling) - and
// `url` is https://juvo.app, the host he named, so base's canonical and
// social-card URLs resolve there instead of the shell's NEXT_PUBLIC_SITE_URL.
// The title leads with the site name the way hosting's and lms's do. The
// terms document is a South African one (POPIA, rand), hence the locale.

/** The subset of base_sdk >= 1.15.0's SiteMetadataCopy this module fills. */
export interface DeliverySiteMetadata {
  title: string;
  description: string;
  tagline: string;
  siteName?: string;
  url?: string;
  keywords?: string[];
  /** A ready-made png/jpg preview; none here, base generates one. */
  ogImage?: string;
  /** Asset path drawn into the generated preview image; none here. */
  logo?: string;
  /** The favicon (base_sdk >= 1.17.0): Juvo's own mark since 1.2.0. */
  icon?: string;
  locale?: string;
}

const DELIVERY_SITE_METADATA: DeliverySiteMetadata = {
  // Ray, 2026-09-09: "deliveryplatform will be juvo so i will point juvo.app to it". Since 1.2.0
  // the site is Juvo Platforms, live at platform.juvo.app (the shell repo is RokctAI/Juvo-platforms),
  // and the name matches the footer's credit line, `© 2026 Juvo Platforms`.
  siteName: "Juvo Platforms",
  url: "https://platform.juvo.app",
  title: "Juvo Platforms — your own white-label delivery platform",
  // paas_customer assets/svgs/brand_logo_rounded.svg, installed by this SDK under public/juvo/.
  icon: "/juvo/juvo-mark.svg",
  tagline: "Last-mile deliveries, intercity parcels and driver dispatch on a white-label delivery platform",
  description:
    "A white-label delivery platform on a PaaS plan: last-mile deliveries by drivers on your own delivery network, intercity parcels through integrated logistics providers, driver dispatch and delivery zones, cash on delivery, WhatsApp order integration, parcel tracking sync and a digital wallet. Billed monthly or yearly in USD, with a 14-day trial on the yearly plan.",
  keywords: [
    "juvo",
    "delivery platform",
    "white label delivery",
    "last-mile delivery",
    "intercity delivery",
    "parcel delivery",
    "driver dispatch",
    "Rokct",
  ],
  locale: "en_ZA",
};

export default DELIVERY_SITE_METADATA;
