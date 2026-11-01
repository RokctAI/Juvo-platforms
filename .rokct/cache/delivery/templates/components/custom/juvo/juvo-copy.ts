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

// Every word on the Juvo site (delivery_sdk 1.2.0): the home at `/` and
// the three app pages at /apps/<app>. Ray approved the concept on
// 2026-11-01 ("i cant complain but do v2. and respect the footer rule"),
// with: a real menu in the header, phones included ("menu missing in
// header"); a page per app with its features, its Android and Windows demo
// builds and its demo account; the manager shown on a tablet as well as a
// phone ("when showcasing manager you can then show both phone and
// tablet"); pictures from the apps' tours, never committed shots; and the
// footer rule: `© 2026 Juvo Platforms · Built with ♥ by ROKCT` and no
// giant brand name at the bottom of the page.
//
// Sources. Every feature claim is the apps' own: the tagline, step titles
// and captions of each repo's marketing/tour/feature-guide.md (paas_customer
// "The multi-store marketplace", paas_manager "Run your store from your
// pocket", paas_driver "Deliveries, parcels and payouts in one app"). The
// platform claims are the PaaS plan fixtures' feature lines
// (commerce/merchants/frappe tenant fixtures Subscription_Plan: white
// label, three apps, ERP, CRM and HR in its own container, WhatsApp order
// integration, digital wallet, parcel tracking, USD, Monthly and Yearly,
// a 14-day trial on the yearly record) and zones/delivery/docs (last-mile
// by the platform's own drivers, intercity through integrated logistics
// providers). The demo accounts are the addresses auth_sdk >= 1.13.0 signs
// in locally in every build of the three apps (lib/src/common/services/
// demo_sign_in.dart: customer@, manager@ and driver@demo.rokct.ai), served
// from the apps' own sample data by base_sdk's demo interceptor; the
// password is not checked, only the sign-in form's six-character minimum
// (base_sdk AppValidators.isValidPassword). Ray's rules for them: the
// manager app works standalone, and the driver app carries no Tasks SDK
// and no plans, so its page names neither.
//
// Pictures are named by tour step SLUG ("driver_route"), resolved against
// today's guide (juvo-tour.ts). Icons are Remixicon names, drawn by
// juvo-icons.tsx; nothing here imports React.

import { DELIVERY_DEMO_LOGINS } from "@/components/custom/landing/delivery-apps";

import type { JuvoAppId, JuvoTourDevice } from "./juvo-tour";

/** A Remixicon glyph, by the name juvo-icons.tsx maps. */
export type JuvoIcon =
  | "bag" | "store" | "bike" | "dashboard" | "building" | "contacts" | "team" | "route" | "box"
  | "wallet" | "map" | "whatsapp" | "fire" | "check-circle" | "calendar" | "time" | "shop"
  | "search" | "map-pin-time" | "translate" | "barcode" | "wifi-off" | "list" | "truck" | "funds"
  | "hand-coin" | "bank" | "download" | "brush" | "palette" | "globe" | "smartphone" | "tablet"
  | "stack" | "shapes" | "shape" | "android" | "windows" | "user" | "mail" | "key" | "shield-user";

/** Where the site's own pages live. */
export const JUVO_HOME = "/";
export const juvoAppHref = (app: JuvoAppId) => `/apps/${app}`;

/** The name the footer credits and the header reads. */
export const JUVO_SITE_NAME = "Juvo Platforms";

export const JUVO_BRAND = {
  /** The header's wordmark, beside the mark. */
  word: "juvo",
  small: "platforms",
  /** paas_customer assets/svgs/brand_logo_rounded.svg, Juvo's own mark, installed under public/juvo/. */
  mark: "/juvo/juvo-mark.svg",
  homeLabel: "Juvo Platforms home",
};

export interface JuvoNavLink {
  label: string;
  href: string;
}

/** The header menu (and the phone panel), in order. */
export const JUVO_NAV: JuvoNavLink[] = [
  { label: "How it works", href: "/#flow" },
  { label: "Customer", href: juvoAppHref("customer") },
  { label: "Manager", href: juvoAppHref("manager") },
  { label: "Driver", href: juvoAppHref("driver") },
  { label: "What's included", href: "/#included" },
];

export const JUVO_HEADER = {
  menuOpen: "Open menu",
  menuClose: "Close menu",
  theme: "Switch light or dark theme",
  cta: { label: "Try the apps", href: "/#apps" },
};

/** The footer: links and the credit line. No wordmark (Ray's footer rule). */
export const JUVO_FOOTER: { nav: JuvoNavLink[] } = {
  nav: [
    { label: "How it works", href: "/#flow" },
    { label: "Customer app", href: juvoAppHref("customer") },
    { label: "Manager app", href: juvoAppHref("manager") },
    { label: "Driver app", href: juvoAppHref("driver") },
    { label: "Log in", href: "/login" },
  ],
};

/** A picture from an app's tour. */
export interface JuvoShot {
  app: JuvoAppId;
  device: Exclude<JuvoTourDevice, "svg">;
  slug: string;
  alt: string;
}

const shot = (app: JuvoAppId, slug: string, alt: string, device: "phone" | "tablet" = "phone"): JuvoShot => ({
  app,
  device,
  slug,
  alt,
});

// ---------------------------------------------------------------- home

export const JUVO_HERO = {
  eyebrow: "Delivery platform-as-a-service",
  title: "Your own delivery platform.",
  titleParts: ["Three apps.", "One brand.", "Yours."],
  lede:
    "Juvo is a white-label delivery business, ready to run: a marketplace app for your customers, a manager app for every merchant, a driver app for your fleet, and the dashboard, ERP, CRM and HR behind them.",
  primary: { label: "Try the apps", href: "/#apps" },
  secondary: { label: "See an order move", href: "/#flow" },
  trust: [
    { icon: "calendar" as JuvoIcon, text: "Billed monthly or yearly in USD" },
    { icon: "time" as JuvoIcon, text: "14-day trial on the yearly plan" },
  ],
  stageLabel: "The three Juvo apps",
  tablet: shot("manager", "order_queue", "Manager app on a tablet: the order queue as a board of new, accepted, cooking and ready orders", "tablet"),
  phones: [
    shot("customer", "wallet_topup", "Customer app: topping up the wallet"),
    shot("driver", "driver_route", "Driver app: the dispatch route with stops in order"),
  ],
  legend: [
    { icon: "bag" as JuvoIcon, label: "Customer" },
    { icon: "store" as JuvoIcon, label: "Manager" },
    { icon: "bike" as JuvoIcon, label: "Driver" },
  ],
};

export const JUVO_TICKER: { icon: JuvoIcon; label: string }[] = [
  { icon: "bag", label: "Customer app" },
  { icon: "store", label: "Manager app" },
  { icon: "bike", label: "Driver app" },
  { icon: "dashboard", label: "Web dashboard" },
  { icon: "building", label: "ERP" },
  { icon: "contacts", label: "CRM" },
  { icon: "team", label: "HR" },
  { icon: "route", label: "Dispatch" },
  { icon: "box", label: "Parcels" },
  { icon: "wallet", label: "Wallet" },
  { icon: "map", label: "Delivery zones" },
  { icon: "whatsapp", label: "WhatsApp orders" },
];

/** One step of the order walkthrough. */
export interface JuvoFlowStep {
  icon: JuvoIcon;
  title: string;
  text: string;
  /** Which lanes light up: 0 customer, 1 manager, 2 driver. */
  active: number[];
  /** The caption under each lane, in lane order. */
  captions: [string, string, string];
}

export const JUVO_FLOW = {
  eyebrow: "How it works",
  title: "One order.",
  titleIt: "Three apps.",
  titleEnd: "Start to finish.",
  body:
    "Follow a single order through the platform. The customer orders, the merchant cooks, a driver is dispatched and the money is settled, each in the app built for that person. These are real screens from the apps' guided tours.",
  railLabel: "Order steps",
  lanesLabel: "Choose an app",
  play: "Play the walkthrough",
  pause: "Pause the walkthrough",
  stepOf: "Step {i} of {n}",
  steps: [
    {
      icon: "bag",
      title: "Order placed",
      text: "A customer picks a shop in the marketplace and orders.",
      active: [0],
      captions: [
        "Placed. The order lands in the customer's active orders.",
        "The order lands in the merchant's queue as New.",
        "The driver is online, on the map, in their zone.",
      ],
    },
    {
      icon: "fire",
      title: "Kitchen on it",
      text: "The merchant's queue lights up and the kitchen starts cooking.",
      active: [1],
      captions: [
        "The order waits in active orders while the kitchen cooks.",
        "Accepted, cooking, ready: the kitchen queue tracks every dish.",
        "Ready orders nearby appear for drivers to accept.",
      ],
    },
    {
      icon: "route",
      title: "Driver dispatched",
      text: "Dispatch lines up the stops: pickups first, then drop-offs.",
      active: [2],
      captions: [
        "The customer follows the order live, kitchen to door.",
        "The kitchen hands the order over at Ready.",
        "Dispatch lines up the stops: pickups first, then drop-offs.",
      ],
    },
    {
      icon: "check-circle",
      title: "Delivered, settled",
      text: "Tracking closes, cash is recorded and revenue updates.",
      active: [0, 1, 2],
      captions: [
        "Delivered. The order moves to history.",
        "Revenue is charted day by day.",
        "Cash collected shows as owed, then deposited and approved.",
      ],
    },
  ] as JuvoFlowStep[],
  /** Each lane's screens: the steps (0-3) each one shows on. */
  lanes: [
    {
      icon: "bag" as JuvoIcon,
      label: "Customer app",
      short: "Customer",
      device: "phone" as const,
      screens: [
        { ...shot("customer", "customer_orders", "Customer app: active orders"), steps: [0, 1] },
        { ...shot("customer", "customer_order_tracking", "Customer app: live order tracking"), steps: [2, 3] },
      ],
    },
    {
      icon: "store" as JuvoIcon,
      label: "Manager app",
      short: "Manager",
      device: "tablet" as const,
      screens: [
        { ...shot("manager", "order_queue", "Manager app on a tablet: the order queue", "tablet"), steps: [0] },
        { ...shot("manager", "kitchen_queue", "Manager app on a tablet: the kitchen queue and ticket", "tablet"), steps: [1, 2] },
        { ...shot("manager", "revenue_income", "Manager app on a tablet: revenue and profit", "tablet"), steps: [3] },
      ],
    },
    {
      icon: "bike" as JuvoIcon,
      label: "Driver app",
      short: "Driver",
      device: "phone" as const,
      screens: [
        { ...shot("driver", "driver_home", "Driver app: the home map"), steps: [0] },
        { ...shot("driver", "driver_available_orders", "Driver app: orders ready nearby"), steps: [1] },
        { ...shot("driver", "driver_route", "Driver app: the dispatch route"), steps: [2] },
        { ...shot("driver", "driver_deposits", "Driver app: cash owed and deposits"), steps: [3] },
      ],
    },
  ],
};

/** A feature line on the home's app panels. */
export interface JuvoFeature {
  icon: JuvoIcon;
  title: string;
  text: string;
}

export interface JuvoHomePanel {
  app: JuvoAppId;
  tab: string;
  icon: JuvoIcon;
  eyebrow: string;
  title: string;
  tagline: string;
  features: JuvoFeature[];
  /** Phone-only shelf, or (manager) tablet-and-phone pairs. */
  shelf: { title: string; text: string; shots: JuvoShot[] }[];
}

export const JUVO_APPS_SECTION = {
  eyebrow: "The apps",
  title: "Built for the three people",
  titleIt: "every delivery needs.",
  body:
    "Each app is its own product with its own job. Together they are your platform. Every screen below comes from the apps' automated guided tours, so it is always the current app.",
  tabsLabel: "Apps",
  more: (name: string) => `All ${name} features`,
  demo: "Try the demo",
  devnote: { tablet: "Tablet at the counter", phone: "Phone in your pocket" },
  panels: [
    {
      app: "customer",
      tab: "Customer",
      icon: "bag",
      eyebrow: "For your customers",
      title: "The multi-store marketplace",
      tagline: "Every store in one app: the marketplace your customers order from.",
      features: [
        { icon: "shop", title: "Every shop, one home", text: "Deals, categories and every local shop on one screen." },
        { icon: "search", title: "Find it fast", text: "One search across shops and products, with filters a tap away." },
        { icon: "wallet", title: "Top up in seconds", text: "Pick an amount, pick a card, done: money in the wallet in seconds." },
        { icon: "map-pin-time", title: "Track it live", text: "Follow the order from kitchen to door as the status updates." },
        { icon: "translate", title: "Speaks their language", text: "Pick a language once and every screen follows." },
      ],
      shelf: [
        { title: "Your orders", text: "Active up top, history below", shots: [shot("customer", "customer_orders", "Customer app: your orders")] },
        { title: "Top up in seconds", text: "Quick amounts, saved cards", shots: [shot("customer", "wallet_topup", "Customer app: wallet top up")] },
        { title: "Make it yours", text: "Wallet, orders and settings", shots: [shot("customer", "marketplace_profile", "Customer app: profile")] },
        { title: "Track it live", text: "From kitchen to door", shots: [shot("customer", "customer_order_tracking", "Customer app: order tracking")] },
      ],
    },
    {
      app: "manager",
      tab: "Manager",
      icon: "store",
      eyebrow: "For every merchant",
      title: "Run your store from your pocket",
      tagline:
        "Manager runs a whole store from one screen: till, menu, order queue, kitchen and drivers. It also works on its own for a single store.",
      features: [
        { icon: "barcode", title: "Sell straight from the camera", text: "Scan any barcode into the cart; take cash or a pay-link QR." },
        { icon: "wifi-off", title: "Nothing gets lost offline", text: "Sell through an outage; offline work syncs back by itself." },
        { icon: "list", title: "Every order, one queue", text: "New, accepted, ready, on the way, all in one list." },
        { icon: "fire", title: "The kitchen sees every order", text: "Accepted, cooking, ready: every dish tracked on one ticket." },
        { icon: "truck", title: "Your own drivers and loads", text: "Issue stock loads to your drivers and watch them sell down." },
        { icon: "funds", title: "Money at a glance", text: "Today, this week or this month, charted day by day." },
      ],
      shelf: [
        {
          title: "The kitchen sees every order",
          text: "Queue and ticket side by side",
          shots: [
            shot("manager", "kitchen_queue", "Manager app on a tablet: kitchen queue with the ticket open", "tablet"),
            shot("manager", "order_queue", "Manager app on a phone: the order queue"),
          ],
        },
        {
          title: "Cash, QR or offline",
          text: "The till at the counter",
          shots: [
            shot("manager", "pos_checkout", "Manager app on a tablet: checkout with a QR pay link and receipt", "tablet"),
            shot("manager", "pos_scan", "Manager app on a phone: scanning a barcode"),
          ],
        },
        {
          title: "Money at a glance",
          text: "Revenue next to profit by product",
          shots: [
            shot("manager", "revenue_income", "Manager app on a tablet: revenue and profit by product", "tablet"),
            shot("manager", "revenue_income", "Manager app on a phone: revenue"),
          ],
        },
        {
          title: "Your menu, organised",
          text: "Products and detail in one view",
          shots: [
            shot("manager", "menu", "Manager app on a tablet: the menu with product detail", "tablet"),
            shot("manager", "product_detail", "Manager app on a phone: a product"),
          ],
        },
      ],
    },
    {
      app: "driver",
      tab: "Driver",
      icon: "bike",
      eyebrow: "For your fleet",
      title: "Deliveries, parcels and payouts in one app",
      tagline: "Driver puts the whole delivery day in one app, from the first pickup to the last cash deposit.",
      features: [
        { icon: "map", title: "Your day on the map", text: "Zone, current delivery and next job, all on one map." },
        { icon: "hand-coin", title: "Cash to collect, up front", text: "Every accepted delivery shows the customer, total and cash due." },
        { icon: "route", title: "Every stop, in order", text: "Pickups first, then drop-offs, with distance and cash per stop." },
        { icon: "box", title: "Parcels too", text: "Documents and packages, with sender, receiver and fee." },
        { icon: "bank", title: "Cash you owe, plain and simple", text: "Deposits checked and approved, with a clear balance." },
      ],
      shelf: [
        { title: "Your day on the map", text: "Go online and drive", shots: [shot("driver", "driver_home", "Driver app: the map home")] },
        { title: "Deliveries in hand", text: "Cash to collect, up front", shots: [shot("driver", "driver_orders", "Driver app: active deliveries")] },
        { title: "Every stop, in order", text: "Dispatch lines it up", shots: [shot("driver", "driver_route", "Driver app: dispatch route")] },
        { title: "Parcels too", text: "Sender, receiver, fee", shots: [shot("driver", "driver_parcels", "Driver app: parcels")] },
        { title: "Draw where you deliver", text: "Zones on the map", shots: [shot("driver", "driver_delivery_zone", "Driver app: delivery zone on a map")] },
      ],
    },
  ] as JuvoHomePanel[],
};

export const JUVO_STORY = {
  eyebrow: "Launch yours",
  title: "Launch your own branded",
  titleIt: "delivery platform.",
  body:
    "This is the welcome screen in Juvo's colours. On your platform the apps carry your name, and your merchants and drivers sign in to a business that is yours.",
  screen: shot("customer", "welcome", "The Juvo welcome screen: One Click Away"),
  callouts: [
    { icon: "brush" as JuvoIcon, label: "Your name and logo" },
    { icon: "palette" as JuvoIcon, label: "Your colours" },
    { icon: "globe" as JuvoIcon, label: "Your own domain" },
  ],
  steps: [
    { title: "Your platform, your domain", text: "Your own instance, with a portal that opens on your own domain for you and your merchants." },
    { title: "Your brand on three apps", text: "Customer, manager and driver apps, white-labelled for your business." },
    { title: "Bring your merchants", text: "Restaurants and shops run their stores on the Manager app and sell through your marketplace." },
    { title: "Put drivers on the road", text: "Draw delivery zones, dispatch routes, carry parcels and settle cash on delivery." },
  ],
};

export const JUVO_INCLUDED = {
  eyebrow: "What's included",
  title: "Everything a delivery business runs on,",
  titleIt: "in one box.",
  body:
    "Not just apps. Every platform runs in its own container with the back office included, so the business behind the deliveries runs in the same place.",
  apps: {
    icon: "smartphone" as JuvoIcon,
    title: "Three apps, your brand",
    text: "A customer marketplace, a merchant manager and a driver app, on Android and Windows.",
    minis: [
      { label: "Customer", shot: shot("customer", "wallet_topup", "Customer app: wallet top up") },
      { label: "Manager", shot: shot("manager", "kitchen_detail", "Manager app: kitchen ticket") },
      { label: "Driver", shot: shot("driver", "driver_orders", "Driver app: deliveries in hand") },
    ],
  },
  erp: { icon: "stack" as JuvoIcon, title: "The back office, built in", text: "Every tenant platform ships with ERP, CRM and HR in its own container.", stack: [
    { label: "ERP", icon: "building" as JuvoIcon },
    { label: "CRM", icon: "contacts" as JuvoIcon },
    { label: "HR", icon: "team" as JuvoIcon },
  ] },
  tiles: [
    { icon: "dashboard" as JuvoIcon, title: "Web dashboard", text: "An admin dashboard for you and a manager portal for merchants, on your own domain.", span: 2 },
    { icon: "truck" as JuvoIcon, title: "Last-mile and intercity", text: "Deliveries inside your zones by your drivers, and city-to-city through integrated logistics providers.", span: 2 },
    { icon: "wallet" as JuvoIcon, title: "Money that adds up", text: "A digital wallet, QR pay links and cash on delivery, remitted through the platform.", span: 2 },
    { icon: "whatsapp" as JuvoIcon, title: "Orders from WhatsApp", text: "WhatsApp order integration alongside the apps, so customers can order where they already talk.", span: 3 },
  ],
  details: {
    icon: "shapes" as JuvoIcon,
    title: "Details that matter on the ground",
    text: "The things that make a delivery day work.",
    chips: ["Delivery zones", "Route dispatch", "Parcel tracking", "Offline sales sync", "Kitchen queue", "Driver stock loads", "Multi-language"],
  },
  uses: [
    { title: "Restaurants", text: "Order queue, kitchen tickets, dine-in, takeaway and delivery.", shot: shot("manager", "kitchen_queue", "Manager app: kitchen queue") },
    { title: "Shops", text: "Barcode till, stock updates and receipts, online or offline.", shot: shot("manager", "pos_cart", "Manager app: point of sale cart") },
    { title: "Van sales", text: "Stock loads issued to drivers, sold at the door, returns counted.", shot: shot("manager", "order_loads", "Manager app: open driver loads") },
  ],
};

export const JUVO_CLOSING = {
  eyebrow: "Plans",
  title: "Ready when",
  titleIt: "you are.",
  body:
    "Start your platform on a monthly or yearly plan, or try all three apps first with the demo accounts: no sign-up, sample data built in.",
  primary: { label: "Sign up", href: "/register" },
  secondary: { label: "Log in to your portal", href: "/login" },
  facts: [
    { icon: "calendar" as JuvoIcon, title: "Monthly or yearly", text: "Plans billed in USD" },
    { icon: "time" as JuvoIcon, title: "14-day trial", text: "On the yearly plan" },
    { icon: "download" as JuvoIcon, title: "Try the apps today", text: "Android and Windows demo builds, with demo logins" },
  ],
};

// ---------------------------------------------------------- app pages

/** One chapter of an app page: a feature, its words and its screens. */
export interface JuvoChapter {
  icon: JuvoIcon;
  title: string;
  text: string;
  /** Tour steps whose titles and captions sit under the copy, in order. */
  caps: string[];
  /** The screens: a phone pair, or (manager) a tablet with a phone on it. */
  screens: JuvoShot[];
  /** A screen rendered from code (marketing/tour/svg), drawn in the page's theme. */
  svg?: { light: string; dark: string; alt: string };
}

export interface JuvoAppPage {
  app: JuvoAppId;
  /** The app's name on the page ("Customer app"). */
  name: string;
  short: string;
  icon: JuvoIcon;
  eyebrow: string;
  title: string;
  titleIt: string;
  lede: string;
  metaTitle: string;
  metaDescription: string;
  /** The hero: three phones, or (manager) a tablet and a phone. */
  hero: JuvoShot[];
  chapters: JuvoChapter[];
  /** Steps the full tour leaves out on this page, beyond the README gallery's list (left out at concept review). */
  gallerySkip: string[];
  /** Whether the full tour offers the tablet run too. */
  galleryTablet: boolean;
  demo: { email: string; steps: string[] };
  /** A Ray rule worth saying on the page, if any. */
  note?: { icon: JuvoIcon; title: string; text: string };
}

export const JUVO_APP_COMMON = {
  crumbs: { home: "Juvo", apps: "Apps" },
  primary: "Try the demo",
  secondary: "See the features",
  featuresEyebrow: "Features",
  featuresTitle: (short: string) => `What the ${short} app`,
  featuresTitleIt: "does.",
  featuresBody: "Every screen here comes from the app's automated guided tour, so the page always shows the current app.",
  galleryEyebrow: "The full tour",
  galleryTitle: "Every screen,",
  galleryTitleIt: "in order.",
  galleryBody: "The guided tour walks the app on every merge to main. These are its screens, start to finish.",
  galleryDevices: { label: "Device", phone: "Phone", tablet: "Tablet" },
  demoEyebrow: "Try the demo",
  demoTitle: "Take it for",
  demoTitleIt: "a spin.",
  demoBody: (name: string) =>
    `Download the latest release of the ${name} and sign in with its demo account. The demo runs on sample data inside the app, so it works offline and never touches a real store.`,
  builds: {
    android: { label: "Android app", kind: "APK" },
    windows: { label: "Windows app", kind: "Installer" },
    page: "Latest release on GitHub",
  },
  signIn: "Demo sign-in",
  email: "Email",
  password: "Password",
  passwordText: "Any password of six characters or more",
  copy: "Copy the demo email",
  copied: "Copied",
  fine: "Builds come straight from the app's latest GitHub release.",
  othersEyebrow: "The other apps",
};

export const JUVO_APP_PAGES: Record<JuvoAppId, JuvoAppPage> = {
  customer: {
    app: "customer",
    name: "Customer app",
    short: "Customer",
    icon: "bag",
    eyebrow: "For your customers",
    title: "The multi-store",
    titleIt: "marketplace.",
    lede: "Every store in one app. Your customers browse, pay from their wallet and follow every order to the door, in the language they choose.",
    metaTitle: "Customer app",
    metaDescription: "The multi-store marketplace: the Juvo Customer app, its features, and its Android and Windows demo builds.",
    hero: [
      shot("customer", "customer_orders", "Customer app: your orders"),
      shot("customer", "wallet_topup", "Customer app: top up in seconds"),
      shot("customer", "customer_order_tracking", "Customer app: track it live"),
    ],
    chapters: [
      {
        icon: "wallet",
        title: "Pay your way",
        text: "A wallet built into the app: top up with a card in seconds and every transaction stays in order.",
        caps: ["wallet_topup", "wallet_history"],
        screens: [shot("customer", "wallet_topup", "Customer app: top up in seconds"), shot("customer", "wallet_history", "Customer app: every transaction, in order")],
      },
      {
        icon: "map-pin-time",
        title: "Orders you can follow",
        text: "Active orders up top, history below, and live tracking from kitchen to door.",
        caps: ["customer_orders", "customer_order_tracking"],
        screens: [shot("customer", "customer_orders", "Customer app: your orders"), shot("customer", "customer_order_tracking", "Customer app: track it live")],
      },
      {
        icon: "translate",
        title: "Set up their way",
        text: "Addresses, language, currency and more. Pick a language once and every screen follows.",
        caps: ["marketplace_profile", "comms_language"],
        screens: [shot("customer", "marketplace_profile", "Customer app: make it yours"), shot("customer", "comms_language", "Customer app: speak your language")],
      },
    ],
    gallerySkip: [],
    galleryTablet: false,
    demo: {
      email: DELIVERY_DEMO_LOGINS.customer,
      steps: ["Install the build for your device.", "Sign in with email, using the address below.", "Shop, top up and track sample orders."],
    },
  },
  manager: {
    app: "manager",
    name: "Manager app",
    short: "Manager",
    icon: "store",
    eyebrow: "For every merchant",
    title: "Run your store",
    titleIt: "from your pocket.",
    lede:
      "Manager runs a whole store from one screen: till, menu, order queue, kitchen, drivers and money. On a tablet at the counter or a phone in your hand.",
    metaTitle: "Manager app",
    metaDescription: "Run your store from your pocket: the Juvo Manager app on tablet and phone, its features, and its Android and Windows demo builds.",
    hero: [
      shot("manager", "order_queue", "Manager app on a tablet: every order, one queue", "tablet"),
      shot("manager", "kitchen_queue", "Manager app on a phone: the kitchen sees every order"),
    ],
    chapters: [
      {
        icon: "barcode",
        title: "A till in your hand",
        text: "Scan a barcode into the cart, take cash or a QR pay link, and see the receipt before it prints. Offline, a code confirms the sale and it syncs later.",
        caps: ["pos_checkout", "pos_scan"],
        screens: [shot("manager", "pos_checkout", "Manager app on a tablet: cash, QR or offline by code", "tablet"), shot("manager", "pos_scan", "Manager app on a phone: sell straight from the camera")],
      },
      {
        icon: "fire",
        title: "Every order, every dish",
        text: "New, accepted, cooking, ready: the order queue and the kitchen queue track every order and every dish on one ticket.",
        caps: ["kitchen_queue", "order_queue"],
        screens: [shot("manager", "kitchen_queue", "Manager app on a tablet: the kitchen sees every order", "tablet"), shot("manager", "order_queue", "Manager app on a phone: every order, one queue")],
      },
      {
        icon: "list",
        title: "Menu and stock",
        text: "Products, add-ons and extras on their own tabs, and a quick stock pass to fix the shelf in one go.",
        caps: ["menu", "quick_stock"],
        screens: [shot("manager", "menu", "Manager app on a tablet: your menu, organised", "tablet"), shot("manager", "quick_stock", "Manager app on a phone: fix the shelf in one pass")],
      },
      {
        icon: "truck",
        title: "Your own drivers",
        text: "Keep a roster of your drivers, issue them stock loads and watch each load sell down.",
        caps: ["order_loads", "order_shop_drivers"],
        screens: [shot("manager", "order_loads", "Manager app on a tablet: stock out on the road, accounted for", "tablet"), shot("manager", "order_shop_drivers", "Manager app on a phone: your own drivers")],
      },
      {
        icon: "funds",
        title: "Money at a glance",
        text: "Today, this week or this month, charted day by day, with the products that really earn.",
        caps: ["revenue_income", "revenue_product_profit"],
        screens: [shot("manager", "revenue_income", "Manager app on a tablet: money at a glance", "tablet"), shot("manager", "revenue_product_profit", "Manager app on a phone: which products really earn")],
      },
      {
        icon: "wifi-off",
        title: "Let the shop run itself",
        text: "Auto-accept, auto-complete and keypad dialling take the repeat taps out of every order. Offline work syncs back by itself.",
        caps: ["quick_flow", "sync_issues"],
        screens: [shot("manager", "quick_flow", "Manager app on a tablet: let the shop run itself", "tablet"), shot("manager", "quick_flow", "Manager app on a phone: let the shop run itself")],
      },
      {
        icon: "calendar",
        title: "Plan the work",
        text: "Tasks, maintenance runs with readings and photos, and the whole plan on one page.",
        caps: ["productivity_tasks", "productivity_maintenance_readings"],
        screens: [shot("manager", "productivity_tasks", "Manager app on a tablet: plan your day in seconds", "tablet"), shot("manager", "productivity_maintenance_readings", "Manager app on a phone: readings before it goes back to service")],
      },
    ],
    gallerySkip: ["sync_issues", "order_pos_cart", "order_pos_customer", "order_pos_section", "comms_notifications"],
    galleryTablet: true,
    demo: {
      email: DELIVERY_DEMO_LOGINS.manager,
      steps: ["Install the build for your tablet, phone or Windows PC.", "On the sign-in screen, choose Email and use the address below.", "Ring up a sale, run the kitchen and check the day's money."],
    },
    note: {
      icon: "store",
      title: "Works on its own",
      text: "Manager runs a single store on its own, with no marketplace or platform behind it. The demo account signs in to a store of its own.",
    },
  },
  driver: {
    app: "driver",
    name: "Driver app",
    short: "Driver",
    icon: "bike",
    eyebrow: "For your fleet",
    title: "Deliveries, parcels and payouts",
    titleIt: "in one app.",
    lede: "Driver puts the whole delivery day in one app: the map, the next job, every stop in order, parcels on the side and the cash settled at the end.",
    metaTitle: "Driver app",
    metaDescription: "Deliveries, parcels and payouts in one app: the Juvo Driver app, its features, and its Android and Windows demo builds.",
    hero: [
      shot("driver", "driver_orders", "Driver app: deliveries in hand"),
      shot("driver", "driver_route", "Driver app: every stop, in order"),
      shot("driver", "driver_home", "Driver app: your day on the map"),
    ],
    chapters: [
      {
        icon: "map",
        title: "Your day on the map",
        text: "Go online and drive. The zone, the current delivery and the next job live on one map, and ready orders nearby are a tap away.",
        caps: ["driver_home", "driver_available_orders"],
        screens: [shot("driver", "driver_home", "Driver app: your day on the map"), shot("driver", "driver_available_orders", "Driver app: the next job is waiting")],
      },
      {
        icon: "route",
        title: "Every stop, in order",
        text: "Dispatch lines up the stops, pickups first then drop-offs, with distance and the cash to collect at each one.",
        caps: ["driver_route", "driver_orders"],
        screens: [shot("driver", "driver_route", "Driver app: every stop, in order"), shot("driver", "driver_orders", "Driver app: deliveries in hand")],
      },
      {
        icon: "box",
        title: "Parcels too",
        text: "Documents and packages ride along, with sender, receiver and fee on every parcel and a trail kept for each.",
        caps: ["driver_parcels", "driver_available_parcels"],
        screens: [shot("driver", "driver_parcels", "Driver app: parcels too"), shot("driver", "driver_available_parcels", "Driver app: pick up a parcel")],
      },
      {
        icon: "hand-coin",
        title: "Cash, plain and simple",
        text: "What you owe, what you deposited and what was approved, plus earnings for today, this week or this month.",
        caps: ["driver_deposits", "revenue_income"],
        screens: [shot("driver", "driver_deposits", "Driver app: cash you owe, plain and simple"), shot("driver", "revenue_income", "Driver app: money at a glance")],
      },
      {
        icon: "shape",
        title: "Draw where you deliver",
        text: "Your delivery zone on the map, redrawn whenever your patch changes, and your account and vehicle in one place.",
        caps: ["driver_delivery_zone", "users_profile"],
        screens: [shot("driver", "driver_delivery_zone", "Driver app: draw where you deliver")],
        // paas_driver marketing/tour/svg: the courier profile rendered from code, in both themes.
        svg: { light: "driver-profile-light.clean.svg", dark: "driver-profile-dark.clean.svg", alt: "Driver app: the courier profile, with balance, last profit and delivered orders" },
      },
    ],
    gallerySkip: ["driver_order_history", "driver_parcel_history", "driver_load", "driver_load_sell", "driver_load_return"],
    galleryTablet: false,
    demo: {
      email: DELIVERY_DEMO_LOGINS.driver,
      steps: ["Install the build for your phone or Windows PC.", "Sign in with email, using the address below.", "Go online, take a sample job and settle the cash."],
    },
  },
};

/** The order the "other apps" cards and the pages follow. */
export const JUVO_APP_ORDER: JuvoAppId[] = ["customer", "manager", "driver"];
