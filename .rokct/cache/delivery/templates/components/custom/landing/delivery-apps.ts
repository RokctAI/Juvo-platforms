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

// The three apps the juvo storefront shows off, for the apps section
// (components/custom/delivery-apps-section.tsx) and the header's apps
// group (landing/delivery-header-menu.ts). Ray, 2026-09-09:
// "deliveryplatform will show off three apps paas_customer, paas_manager,
// paas_driver as customer, manager, delivery apps with downloads and demo
// account details for potentials to try them."
//
// The shape is lms 1.12.0's LMS_APPS / LMS_SHOWN_APPS (RokctAI/agent,
// lms/nextjs/templates/components/custom/landing/lms-landing-config.ts):
// one data array, a `shown` flag per platform build, and ONE filtered
// view every surface reads, so the section and the header can never
// disagree about which downloads exist. iOS sits in every list with
// shown: false (Ray, 2026-09-09: "ios is demoted for now") and reaches no
// surface.
//
// Every href is the app's releases PAGE,
// https://github.com/RokctAI/<repo>/releases/latest, the choice lms 1.4.1
// and 1.12.0 made: the assets are named per version (paas_manager and
// paas_driver v1.2.9 carry app-v1.2.9.apk, app-v1.2.9.aab and
// app-windows-v1.2.9.zip), so no releases/latest/download/<file> link is
// stable. No Play or App Store link exists in any source, so none is
// shown: each repo's play-deploy.yml pushes to the Play "internal" track,
// which has no public listing, and marketing/store/listing/en-US/*.txt in
// all three repos still holds only its template comments.
//
// Which builds are shown is what each repo's RELEASE lane publishes
// (.github/workflows/release.yml, the inputs it hands
// RokctAI/shared-workflows universal-pipeline.yml), never what its CI
// build.yml can build: paas_customer declares build_android only,
// paas_manager build_android and build_windows, paas_driver build_android
// and build_hms. A platform with no release lane keeps its entry with
// shown: false and a `// gap:` note naming what is missing.
//
// Every word of a description is the app's own, from its
// marketing/tour/feature-guide.md (the tagline under the title and its
// "Welcome" line) or its README, named beside it. The card labels are
// Ray's words for the three apps.
//
// The try-it block (the one surface that may say "demo account", because
// Ray asked for those details here). Since 1.2.0 it names the demo
// addresses by default: auth_sdk >= 1.13.0 (lib/src/common/services/
// demo_sign_in.dart, in every build of the three apps, release included)
// signs customer@, manager@ and driver@demo.rokct.ai in locally and
// base_sdk's demo interceptor serves the session from the apps' own sample
// data, whatever the password. The environment variables below still
// replace them for a deployment that marks real accounts. What follows is
// the 1.0.x reasoning, kept for the record: the block was rendered from
// environment variable NAMES only. The mechanism it describes exists: users_sdk 1.3.8 (the
// Frappe half, RokctAI/Users users/frappe/fixtures/
// custom_field_user_is_demo_account.json) marks a real account on the
// production backend `is_demo_account`, and auth_sdk 1.11.0 / base_sdk
// 1.61.0 (`DemoSession`) switch the apps to their in-app demo data when
// that account signs in - delivery 1.22.0's driver facades follow it. But
// "nothing seeds an account: an operator ticks the box on the User form of
// the account they choose", the apps' login screens render no credentials
// hint, and the tour's `*@demo.rokct.ai` addresses live only in
// auth_sdk's MockAuthRepository, which a release build compiles out. So
// no source spells a production demo login, and this SDK never writes
// one: the deployment sets the variables below, the block renders what
// they hold, and hides itself entirely while they are unset. NEXT_PUBLIC_
// values are inlined into the client bundle at build time, so they must be
// set where the shell is built.

/** Ray's three apps, in his order. */
export type DeliveryAppId = "customer" | "manager" | "driver";

export type DeliveryBuildId = "android" | "desktop" | "ios";

/**
 * The glyph a header card names, from the closed set base_sdk >= 1.18.0's
 * header bundles (HeaderMenuIcon: "box", "globe", "smartphone",
 * "message-square", "zap", "wrench", "file-text"). Written out here rather
 * than imported, as delivery-site-metadata.ts declares its own shape: an
 * `import type` of an export an older base does not have is a compile
 * error. "smartphone" for the phone build, "box" (a product) for the
 * desktop one - base bundles no monitor glyph (lms 1.12.0 made the same
 * choice).
 */
export type DeliveryAppIcon = "smartphone" | "box";

/** One downloadable build of one app, as the landing offers it. */
export interface DeliveryAppBuild {
  id: DeliveryBuildId;
  label: string;
  href: string;
  external: true;
  /** One line under the label - what the download is. */
  description: string;
  icon: DeliveryAppIcon;
  /**
   * Whether the landing shows this build. `false` keeps the entry in code
   * with no surface rendering it, so a platform that is demoted or has no
   * release lane yet is a one-word change when it gets one.
   */
  shown: boolean;
}

export interface DeliveryApp {
  id: DeliveryAppId;
  /** The GitHub repository the app is built and released from. */
  repo: "paas_customer" | "paas_manager" | "paas_driver";
  /** The card's label: Ray's word for the app. */
  label: string;
  /** The app's own name, as its feature guide titles it. */
  name: string;
  /** One line from the app's own sources (cited beside it). */
  description: string;
  builds: DeliveryAppBuild[];
}

const releasesPage = (repo: DeliveryApp["repo"]) =>
  `https://github.com/RokctAI/${repo}/releases/latest`;

/** The words every card's download buttons share. */
const ANDROID: Pick<DeliveryAppBuild, "id" | "label" | "description" | "icon" | "external"> = {
  id: "android",
  label: "Android app (APK)",
  description: "Direct APK download from the latest release",
  icon: "smartphone",
  external: true,
};

const DESKTOP: Pick<DeliveryAppBuild, "id" | "label" | "description" | "icon" | "external"> = {
  id: "desktop",
  label: "Desktop app",
  description: "Windows build from the latest release",
  icon: "box",
  external: true,
};

const IOS: Pick<DeliveryAppBuild, "id" | "label" | "description" | "icon" | "external"> = {
  id: "ios",
  label: "iOS app",
  description: "Not published yet",
  icon: "smartphone",
  external: true,
};

export const DELIVERY_APPS: DeliveryApp[] = [
  {
    id: "customer",
    repo: "paas_customer",
    label: "Customer app",
    // paas_customer README.md ("Juvo Customer app"), marketing/tour/feature-guide.md ("Juvo — Feature Guide").
    name: "Juvo",
    // paas_customer marketing/tour/feature-guide.md: the tagline "The multi-store marketplace" and
    // step 1, "Juvo is every store in one app - sign in to get started"; README.md, "Juvo is a multi
    // store marketplace."
    description: "Every store in one app: the multi-store marketplace customers order from.",
    builds: [
      // paas_customer .github/workflows/release.yml: build_android: true ("Auto Release (Weekly)";
      // tags v2.8.9, v2.8.9-rc1 are its output).
      { ...ANDROID, href: releasesPage("paas_customer"), shown: true },
      // Since 1.2.0: the release lane attaches the Windows installer (v1.2.12, 2026-10-20, carries
      // customer-windows-setup-v1.2.12.exe).
      { ...DESKTOP, href: releasesPage("paas_customer"), shown: true },
      // demoted for now (Ray, 2026-09-09). gap: no iOS lane in any of the three repos and no App
      // Store listing; the href is the releases page rather than a URL nothing publishes.
      { ...IOS, href: releasesPage("paas_customer"), shown: false },
    ],
  },
  {
    id: "manager",
    repo: "paas_manager",
    label: "Manager app",
    // paas_manager marketing/tour/feature-guide.md ("Manager — Feature Guide").
    name: "Manager",
    // paas_manager marketing/tour/feature-guide.md: the tagline "Run your store from your pocket"
    // and step 1, "Manager runs your whole store from one screen".
    description: "Run your store from your pocket: Manager runs your whole store from one screen.",
    builds: [
      // paas_manager .github/workflows/release.yml: build_android: true; the v1.2.9 release carries
      // app-v1.2.9.apk.
      { ...ANDROID, href: releasesPage("paas_manager"), shown: true },
      // paas_manager .github/workflows/release.yml: build_windows: true ("Build Windows desktop app
      // and attach it to releases"); the v1.2.9 release carries app-windows-v1.2.9.zip.
      { ...DESKTOP, href: releasesPage("paas_manager"), shown: true },
      // demoted for now (Ray, 2026-09-09). gap: no iOS lane, no App Store listing.
      { ...IOS, href: releasesPage("paas_manager"), shown: false },
    ],
  },
  {
    id: "driver",
    repo: "paas_driver",
    label: "Delivery app",
    // paas_driver marketing/tour/feature-guide.md ("Driver — Feature Guide").
    name: "Driver",
    // paas_driver marketing/tour/feature-guide.md: the tagline "Deliveries, parcels and payouts in
    // one app" and step 1, "Driver puts your delivery day in one app".
    description: "Driver puts your delivery day in one app: deliveries, parcels and payouts.",
    builds: [
      // paas_driver .github/workflows/release.yml: build_android: true (and build_hms: true, the
      // Huawei build of the same app); the v1.2.9 release carries app-v1.2.9.apk.
      { ...ANDROID, href: releasesPage("paas_driver"), shown: true },
      // Since 1.2.0: the release lane attaches the Windows installer (v2.8.12, 2026-10-16, carries
      // driver-windows-setup-v2.8.12.exe).
      { ...DESKTOP, href: releasesPage("paas_driver"), shown: true },
      // demoted for now (Ray, 2026-09-09). gap: no iOS lane, no App Store listing.
      { ...IOS, href: releasesPage("paas_driver"), shown: false },
    ],
  },
];

/** An app with only the builds the landing shows, in the order the buttons draw them. */
export interface DeliveryShownApp extends Omit<DeliveryApp, "builds"> {
  builds: DeliveryAppBuild[];
}

/**
 * The apps the landing offers, each with its shown builds only - the ONLY
 * list a surface reads. An app with no shown build would drop out here; all
 * three have their Android release lane, so all three are in.
 */
export const DELIVERY_SHOWN_APPS: DeliveryShownApp[] = DELIVERY_APPS.map((app) => ({
  ...app,
  builds: app.builds.filter((build) => build.shown),
})).filter((app) => app.builds.length > 0);

/**
 * The environment variable NAMES the try-it block reads, one login and
 * password pair per app and one site for all three (the tenant the demo
 * accounts are marked on, as the apps' sign-in asks for it). Documented
 * in this SDK's CHANGELOG; the values are the deployment's.
 */
export const DELIVERY_DEMO_ENV = {
  site: "NEXT_PUBLIC_JUVO_DEMO_SITE",
  customer: {
    login: "NEXT_PUBLIC_JUVO_DEMO_CUSTOMER_LOGIN",
    password: "NEXT_PUBLIC_JUVO_DEMO_CUSTOMER_PASSWORD",
  },
  manager: {
    login: "NEXT_PUBLIC_JUVO_DEMO_MANAGER_LOGIN",
    password: "NEXT_PUBLIC_JUVO_DEMO_MANAGER_PASSWORD",
  },
  driver: {
    login: "NEXT_PUBLIC_JUVO_DEMO_DRIVER_LOGIN",
    password: "NEXT_PUBLIC_JUVO_DEMO_DRIVER_PASSWORD",
  },
} as const;

/**
 * The demo addresses every build of the three apps signs in locally
 * (auth_sdk >= 1.13.0 demo_sign_in.dart), one per app, used when the
 * deployment sets no login of its own (1.2.0).
 */
export const DELIVERY_DEMO_LOGINS: Record<DeliveryAppId, string> = {
  customer: "customer@demo.rokct.ai",
  manager: "manager@demo.rokct.ai",
  driver: "driver@demo.rokct.ai",
};

export interface DeliveryDemoAccount {
  login: string;
  /** Absent when the password variable is unset: the block then shows the login alone. */
  password?: string;
}

export interface DeliveryDemoDetails {
  /** The site the accounts sign in to; absent when unset. */
  site?: string;
  /** Only the apps whose login variable is set. */
  accounts: Partial<Record<DeliveryAppId, DeliveryDemoAccount>>;
}

const trimmed = (value: string | undefined): string | undefined => {
  const text = (value ?? "").trim();
  return text ? text : undefined;
};

const account = (
  login: string | undefined,
  password: string | undefined,
): DeliveryDemoAccount | undefined => {
  const name = trimmed(login);
  if (!name) return undefined;
  const secret = trimmed(password);
  return secret ? { login: name, password: secret } : { login: name };
};

/**
 * Reads the try-it details from the environment. Each `process.env.NEXT_PUBLIC_*`
 * is spelled out literally because Next.js inlines only literal references
 * into the client bundle; `process.env[name]` would read nothing there.
 * Everything unset is simply absent, and a section with no accounts draws
 * no try-it block at all.
 */
export function readDeliveryDemoDetails(): DeliveryDemoDetails {
  const accounts: DeliveryDemoDetails["accounts"] = {};
  const customer = account(
    process.env.NEXT_PUBLIC_JUVO_DEMO_CUSTOMER_LOGIN || DELIVERY_DEMO_LOGINS.customer,
    process.env.NEXT_PUBLIC_JUVO_DEMO_CUSTOMER_PASSWORD,
  );
  if (customer) accounts.customer = customer;
  const manager = account(
    process.env.NEXT_PUBLIC_JUVO_DEMO_MANAGER_LOGIN || DELIVERY_DEMO_LOGINS.manager,
    process.env.NEXT_PUBLIC_JUVO_DEMO_MANAGER_PASSWORD,
  );
  if (manager) accounts.manager = manager;
  const driver = account(
    process.env.NEXT_PUBLIC_JUVO_DEMO_DRIVER_LOGIN || DELIVERY_DEMO_LOGINS.driver,
    process.env.NEXT_PUBLIC_JUVO_DEMO_DRIVER_PASSWORD,
  );
  if (driver) accounts.driver = driver;
  return { site: trimmed(process.env.NEXT_PUBLIC_JUVO_DEMO_SITE), accounts };
}
