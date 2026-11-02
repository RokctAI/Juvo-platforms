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

// The app pictures on the Juvo site (delivery_sdk 1.2.0), straight from
// each app's guided tour. Ray, 2026-11-01: "it will just take images from
// tour of its apps to always have latest". Every merge to main in
// paas_customer, paas_manager and paas_driver walks the app's guided tour
// on an emulator and commits what it captured back to main
// ("docs: refresh guided tour screenshots and feature guide"):
//
//   marketing/tour/feature-guide.md            numbered steps: title, file, caption
//   marketing/tour/readme_gallery.yml          steps the README gallery leaves out
//   marketing/tour/screenshots/NN-<slug>.png   the phone run, 1080 x 1920
//   marketing/tour/tablet/screenshots/...      the tablet run, 2560 x 1600, same files
//   marketing/tour/svg/<screen>-<theme>.clean.svg
//                                              a screen rendered from code (paas_driver,
//                                              paas_manager): the screen is an embedded
//                                              PNG, every label vector text
//
// So nothing here is a committed picture. The site reads the feature guide
// (juvo-load.ts) to learn which file each step is today, and draws every
// picture through its own route, app/juvo/tour/[app]/[device]/[file], which
// fetches the file from the repo's main branch and keeps the last good
// copy. A step is named by its SLUG ("driver_route"), never by its number,
// so a tour that gains or loses a step renumbers the files and the page
// still finds each one.
//
// The pure half: the repos, the file rules, the guide and gallery parsers
// and the snapshot the page falls back to while a guide cannot be read. No
// Next import, so the route, the pages and the tests reach the same answer.

/** The three apps, in Ray's order. */
export type JuvoAppId = "customer" | "manager" | "driver";

/** Which run of the tour a picture comes from. */
export type JuvoTourDevice = "phone" | "tablet" | "svg";

export const JUVO_APP_IDS: readonly JuvoAppId[] = ["customer", "manager", "driver"];

export const JUVO_TOUR_DEVICES: readonly JuvoTourDevice[] = ["phone", "tablet", "svg"];

/** The repo each app is built, toured and released from. */
export const JUVO_APP_REPOS: Record<JuvoAppId, string> = {
  customer: "RokctAI/paas_customer",
  manager: "RokctAI/paas_manager",
  driver: "RokctAI/paas_driver",
};

/** The branch the tour commits its output to. */
export const JUVO_TOUR_BRANCH = "main";

/** Where raw repo files are read from unless JUVO_TOUR_RAW_ORIGIN says otherwise. */
export const JUVO_TOUR_RAW_ORIGIN = "https://raw.githubusercontent.com";

/** How often a cached tour file is checked against the repo (seconds). */
export const JUVO_TOUR_REVALIDATE_SECONDS = 3600;

/** No tour file this size or bigger is served. */
export const JUVO_TOUR_MAX_BYTES = 4_000_000;

/** The folder of each run, under the repo root. */
export const JUVO_TOUR_DIRS: Record<JuvoTourDevice, string> = {
  phone: "marketing/tour/screenshots",
  tablet: "marketing/tour/tablet/screenshots",
  svg: "marketing/tour/svg",
};

/** The guide that numbers the phone run (the tablet run shares its files). */
export const JUVO_TOUR_GUIDE = "marketing/tour/feature-guide.md";

/** The README gallery's skip list. */
export const JUVO_TOUR_GALLERY = "marketing/tour/readme_gallery.yml";

/** The pixel size of each run's pictures. */
export const JUVO_TOUR_SIZES: Record<"phone" | "tablet", { width: number; height: number }> = {
  phone: { width: 1080, height: 1920 },
  tablet: { width: 2560, height: 1600 },
};

const SHOT_RE = /^(\d{2,3})-([a-z0-9_]+)\.png$/;
const SVG_RE = /^[a-z0-9]+(?:-[a-z0-9]+)*\.(?:clean|annotated)\.svg$/;

export function isJuvoAppId(id: string): id is JuvoAppId {
  return (JUVO_APP_IDS as readonly string[]).includes(id);
}

export function isJuvoTourDevice(id: string): id is JuvoTourDevice {
  return (JUVO_TOUR_DEVICES as readonly string[]).includes(id);
}

/** Whether `file` is a name the route may fetch for `device`: nothing else ever leaves the repo's tour folder. */
export function isJuvoTourFile(device: JuvoTourDevice, file: string): boolean {
  return device === "svg" ? SVG_RE.test(file) : SHOT_RE.test(file);
}

/** The step slug of a screenshot file: "08-driver_route.png" -> "driver_route". */
export function tourSlugOf(file: string): string | null {
  const m = SHOT_RE.exec(file);
  return m ? m[2] : null;
}

/** The raw URL of a repo file on the tour branch. */
export function juvoTourRawUrl(app: JuvoAppId, path: string, origin: string = JUVO_TOUR_RAW_ORIGIN): string {
  return `${origin.replace(/\/+$/, "")}/${JUVO_APP_REPOS[app]}/${JUVO_TOUR_BRANCH}/${path}`;
}

/** The raw URL of one tour picture. */
export function juvoTourFileUrl(
  app: JuvoAppId,
  device: JuvoTourDevice,
  file: string,
  origin: string = JUVO_TOUR_RAW_ORIGIN,
): string {
  return juvoTourRawUrl(app, `${JUVO_TOUR_DIRS[device]}/${file}`, origin);
}

/** Where the site loads a tour picture from: its own route, never GitHub. */
export function juvoTourSrc(app: JuvoAppId, device: JuvoTourDevice, file: string): string {
  return `/juvo/tour/${app}/${device}/${file}`;
}

/** The content type the route answers a tour file with. */
export function juvoTourContentType(device: JuvoTourDevice): string {
  return device === "svg" ? "image/svg+xml" : "image/png";
}

const PNG_MAGIC = [0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a];

export type Checked<T> = { ok: true; value: T } | { ok: false; reason: string };

/**
 * Whether fetched bytes are what the route may serve: a PNG for the phone
 * and tablet runs, an SVG document for the svg folder, under the size cap.
 * raw.githubusercontent.com answers every file as text/plain, so the route
 * names the type itself - and only after the bytes say it is that type.
 */
export function checkJuvoTourBytes(device: JuvoTourDevice, bytes: Uint8Array): Checked<Uint8Array> {
  if (bytes.byteLength === 0) return { ok: false, reason: "empty file" };
  if (bytes.byteLength >= JUVO_TOUR_MAX_BYTES) return { ok: false, reason: `too large (${bytes.byteLength} bytes)` };
  if (device === "svg") {
    const head = new TextDecoder().decode(bytes.subarray(0, 512)).replace(/^﻿/, "").trimStart();
    const root = head.startsWith("<?xml") ? head.slice(head.indexOf("?>") + 2).trimStart() : head;
    if (!root.startsWith("<svg")) return { ok: false, reason: "not an SVG document" };
    return { ok: true, value: bytes };
  }
  for (let i = 0; i < PNG_MAGIC.length; i++) {
    if (bytes[i] !== PNG_MAGIC[i]) return { ok: false, reason: "not a PNG" };
  }
  return { ok: true, value: bytes };
}

/** One step of a tour, as its feature guide lists it. */
export interface JuvoTourStep {
  /** The step's number in the guide. */
  n: number;
  /** "08-driver_route.png" */
  file: string;
  /** "driver_route" */
  slug: string;
  /** The step's heading. */
  title: string;
  /** The paragraph under the screenshot ("" when the guide gives none). */
  caption: string;
}

const STEP_RE = /^## (\d+)\. (.+)\n+!\[[^\]]*\]\(screenshots\/([^)\s]+)\)\n*([\s\S]*?)(?=\n## \d+\. |\s*(?![\s\S]))/gm;

/**
 * The steps of a feature guide, in order. The guide is generated on every
 * merge (`## N. Title`, the screenshot, one paragraph), so the parse is
 * strict: a heading without a screenshot, or a file that is not a tour
 * screenshot name, is not a step.
 */
export function parseFeatureGuide(markdown: string): JuvoTourStep[] {
  const text = markdown.replace(/\r\n/g, "\n");
  const steps: JuvoTourStep[] = [];
  for (const m of text.matchAll(STEP_RE)) {
    const file = m[3];
    const slug = tourSlugOf(file);
    if (!slug) continue;
    const caption = m[4]
      .split(/\n\s*\n/)[0]
      .replace(/\s*\n\s*/g, " ")
      .trim();
    steps.push({ n: Number(m[1]), file, slug, title: m[2].trim(), caption });
  }
  return steps;
}

/** The step names readme_gallery.yml leaves out (`exclude:` list items, comments ignored). */
export function parseGalleryExclusions(yaml: string): string[] {
  const out: string[] = [];
  let inList = false;
  for (const raw of yaml.replace(/\r\n/g, "\n").split("\n")) {
    const line = raw.replace(/\s+#.*$/, "").replace(/^#.*$/, "");
    if (!line.trim()) continue;
    if (/^exclude:\s*$/.test(line)) {
      inList = true;
      continue;
    }
    if (/^\S/.test(line)) {
      inList = false;
      continue;
    }
    const item = /^\s*-\s*["']?([A-Za-z0-9_.-]+)["']?\s*$/.exec(line);
    if (inList && item) out.push(item[1].replace(/\.png$/, ""));
  }
  return out;
}

/** Whether a step is on the exclusion list (named "08-driver_route", with or without .png). */
export function isExcluded(step: JuvoTourStep, exclusions: readonly string[]): boolean {
  const stem = step.file.replace(/\.png$/, "");
  return exclusions.includes(stem) || exclusions.includes(step.slug);
}

/** The step for a slug, or null when today's tour has none. */
export function stepFor(steps: readonly JuvoTourStep[], slug: string): JuvoTourStep | null {
  return steps.find((s) => s.slug === slug) ?? null;
}

/**
 * The tour as it stood when this SDK version was cut (each repo's
 * feature-guide.md on main, 2026-11-01): the page draws these files while
 * a guide cannot be read, so a GitHub outage costs the newest captions,
 * never the pictures. File names and titles only - the pictures are still
 * fetched live.
 */
export const JUVO_TOUR_SNAPSHOT: Record<JuvoAppId, ReadonlyArray<readonly [string, string]>> = {
  customer: [
    ["01-welcome.png", "Welcome to Juvo"],
    ["02-auth_login.png", "Sign in"],
    ["03-auth_register.png", "Create an account"],
    ["04-auth_reset_password.png", "Reset your password"],
    ["05-marketplace_home.png", "Every shop, one home"],
    ["06-marketplace_category.png", "Shop by category"],
    ["07-marketplace_search.png", "Find it fast"],
    ["08-marketplace_favourites.png", "Your favourites, kept"],
    ["09-marketplace_profile.png", "Make it yours"],
    ["10-comms_language.png", "Speak your language"],
    ["11-wallet_topup.png", "Top up in seconds"],
    ["12-wallet_history.png", "Every transaction, in order"],
    ["13-customer_orders.png", "Your orders"],
    ["14-customer_order_tracking.png", "Track it live"],
  ],
  manager: [
    ["01-welcome.png", "Welcome to Manager"],
    ["02-auth_login.png", "Sign in"],
    ["03-auth_register.png", "Create an account"],
    ["04-auth_reset_password.png", "Reset your password"],
    ["05-pos_scan.png", "Sell straight from the camera"],
    ["06-pos_cart.png", "The cart keeps up"],
    ["07-pos_checkout.png", "Cash, QR - or offline by code"],
    ["08-pos_receipt_preview.png", "See the receipt before it prints"],
    ["09-restaurant_hub.png", "Everything else, one tap away"],
    ["10-sync_issues.png", "Nothing gets lost offline"],
    ["11-quick_flow.png", "Let the shop run itself"],
    ["12-menu.png", "Your menu, organised"],
    ["13-add_product.png", "List a product in minutes"],
    ["14-product_detail.png", "Open a product"],
    ["15-quick_stock.png", "Fix the shelf in one pass"],
    ["16-order_queue.png", "Every order, one queue"],
    ["17-order_history.png", "The paper trail, kept"],
    ["18-order_pos_products.png", "Start a walk-in order"],
    ["19-order_pos_cart.png", "Review the order"],
    ["20-order_pos_shipping.png", "Who is it for, and how"],
    ["21-order_pos_customer.png", "Pick the customer"],
    ["22-order_pos_section.png", "Dine-in: pick the section"],
    ["23-order_pos_delivery_time.png", "When, and how it is paid"],
    ["24-order_loads.png", "Stock out on the road, accounted for"],
    ["25-order_issue_load.png", "Issue a load in a few taps"],
    ["26-order_shop_drivers.png", "Your own drivers"],
    ["27-kitchen_queue.png", "The kitchen sees every order"],
    ["28-kitchen_detail.png", "Every dish on one ticket"],
    ["29-comms_language.png", "Speak your language"],
    ["30-comms_notifications.png", "Everything that needs you, in one list"],
    ["31-revenue_income.png", "Money at a glance"],
    ["32-revenue_product_profit.png", "Which products really earn"],
    ["33-subscriptions_plans.png", "Plans without surprises"],
    ["34-productivity_tasks.png", "Plan your day in seconds"],
    ["35-productivity_task_compose.png", "A service run from a template"],
    ["36-productivity_maintenance_readings.png", "Readings before it goes back to service"],
    ["37-productivity_maintenance_photo.png", "A photo and a note, if you want them"],
    ["38-productivity_plan.png", "The whole plan on one page"],
    ["39-productivity_mastery.png", "Grow yourself, goal by goal"],
    ["40-calc_keypad.png", "A calculator, right where you work"],
  ],
  driver: [
    ["01-welcome.png", "Welcome to Driver"],
    ["02-auth_login.png", "Sign in"],
    ["03-auth_register.png", "Create an account"],
    ["04-auth_reset_password.png", "Reset your password"],
    ["05-driver_home.png", "Your day on the map"],
    ["06-driver_orders.png", "Deliveries in hand"],
    ["07-driver_available_orders.png", "The next job is waiting"],
    ["08-driver_route.png", "Every stop, in order"],
    ["09-driver_order_history.png", "Proof of every drop"],
    ["10-driver_parcels.png", "Parcels too"],
    ["11-driver_available_parcels.png", "Pick up a parcel"],
    ["12-driver_parcel_history.png", "Parcel trail"],
    ["13-driver_deposits.png", "Cash you owe, plain and simple"],
    ["14-driver_load.png", "The van, by the numbers"],
    ["15-driver_load_sell.png", "Sell at the door"],
    ["16-driver_load_return.png", "Bring back what's left"],
    ["17-driver_delivery_zone.png", "Draw where you deliver"],
    ["18-revenue_income.png", "Money at a glance"],
    ["19-calc_keypad.png", "A calculator, right where you work"],
    ["20-users_profile.png", "Your account at a glance"],
    ["21-users_profile_settings.png", "Keep your details fresh"],
  ],
};

/** The snapshot of one app as tour steps (captions empty: the chapters carry their own words). */
export function snapshotSteps(app: JuvoAppId): JuvoTourStep[] {
  return JUVO_TOUR_SNAPSHOT[app].map(([file, title], i) => ({
    n: i + 1,
    file,
    slug: tourSlugOf(file) ?? file,
    title,
    caption: "",
  }));
}

/**
 * The README gallery's exclusions as they stood at the snapshot (sign-in
 * forms fleet-wide, placeholder captures), used while the live list cannot
 * be read.
 */
export const JUVO_GALLERY_SNAPSHOT: Record<JuvoAppId, readonly string[]> = {
  customer: ["02-auth_login", "03-auth_register", "04-auth_reset_password", "05-marketplace_home", "06-marketplace_category", "07-marketplace_search", "08-marketplace_favourites"],
  manager: ["01-welcome", "02-auth_login", "03-auth_register", "04-auth_reset_password"],
  driver: ["01-welcome", "02-auth_login", "03-auth_register", "04-auth_reset_password"],
};
