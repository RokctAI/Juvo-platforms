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

// The juvo storefront's apps section, registered in base_sdk's
// page-sections registry (components/custom/landing/page-sections.ts):
// Ray, 2026-09-09, "deliveryplatform will show off three apps
// paas_customer, paas_manager, paas_driver as customer, manager, delivery
// apps with downloads and demo account details for potentials to try
// them". One card per app in Ray's order, from DELIVERY_SHOWN_APPS
// (landing/delivery-apps.ts, the one list the header's apps group reads
// too): the app's own line, one download button per build its release
// lane publishes (the APK as the primary, the desktop build outlined, as
// lms-hero-form.tsx draws them; iOS is shown: false and never reaches
// here), and the try-it block.
//
// The try-it block is the ONE place on the page that says "demo account",
// because it is the one place Ray asked for those details. It renders from
// environment variables (readDeliveryDemoDetails: NEXT_PUBLIC_JUVO_DEMO_SITE
// and a _LOGIN / _PASSWORD pair per app, names in DELIVERY_DEMO_ENV) and
// draws nothing for an app whose login is unset - so a shell built without
// them shows the downloads alone and no try-it wording at all. Nothing
// here is a credential of its own: no source spells a production demo
// account (delivery-apps.ts says why), and this SDK never writes one.
//
// The section always belongs on the page (no meta.renders): the three
// apps and their release lanes exist whether or not the try-it variables
// do. Colours route through the shell's theme tokens (primary, zinc
// surfaces), never a literal brand colour.

import React from "react";
import { RiComputerLine, RiSmartphoneLine, type RemixiconComponentType } from "@remixicon/react";

import {
  DELIVERY_SHOWN_APPS,
  readDeliveryDemoDetails,
  type DeliveryAppBuild,
  type DeliveryDemoAccount,
} from "@/components/custom/landing/delivery-apps";
import { DELIVERY_PAGE_SECTIONS } from "@/components/custom/landing/delivery-page-sections";
import type { PageSectionMeta } from "@/components/custom/landing/page-sections";

/** The glyph beside each button: a phone for the phone builds, a monitor for the desktop one. */
const BUILD_GLYPHS: Record<DeliveryAppBuild["id"], RemixiconComponentType> = {
  android: RiSmartphoneLine,
  desktop: RiComputerLine,
  ios: RiSmartphoneLine,
};

const PRIMARY_BUTTON =
  "inline-flex w-full items-center justify-center gap-2 rounded-full bg-primary px-5 py-2.5 text-sm font-semibold text-primary-foreground transition-opacity hover:opacity-90";
const OUTLINED_BUTTON =
  "inline-flex w-full items-center justify-center gap-2 rounded-full border border-zinc-300 px-5 py-2.5 text-sm font-semibold text-zinc-900 transition-colors hover:border-primary hover:text-primary dark:border-zinc-700 dark:text-white";

function TryItBlock({
  site,
  account,
}: {
  site?: string;
  account: DeliveryDemoAccount;
}) {
  const { labels } = DELIVERY_PAGE_SECTIONS.apps;
  const rows: Array<[string, string]> = [];
  if (site) rows.push([labels.site, site]);
  rows.push([labels.login, account.login]);
  if (account.password) rows.push([labels.password, account.password]);
  return (
    <div
      data-testid="delivery-try-it"
      className="flex flex-col gap-2 rounded-xl border border-dashed border-zinc-300 p-4 dark:border-zinc-700"
    >
      <p className="text-sm font-semibold text-zinc-900 dark:text-white">{labels.tryIt}</p>
      <dl className="grid grid-cols-[auto_1fr] gap-x-3 gap-y-1 text-sm">
        {rows.map(([term, value]) => (
          <React.Fragment key={term}>
            <dt className="text-zinc-600 dark:text-zinc-400">{term}</dt>
            <dd className="break-all font-mono text-zinc-900 dark:text-white">{value}</dd>
          </React.Fragment>
        ))}
      </dl>
    </div>
  );
}

export function DeliveryAppsSection({ id }: { id?: string }) {
  const config = DELIVERY_PAGE_SECTIONS.apps;
  if (DELIVERY_SHOWN_APPS.length === 0) return null;
  const demo = readDeliveryDemoDetails();

  return (
    <section id={id} className="w-full bg-zinc-50 py-16 dark:bg-zinc-950 md:py-24">
      <div className="container mx-auto flex max-w-6xl flex-col gap-12 px-4 xl:px-0">
        <div className="flex flex-col items-center gap-5 text-center">
          <h2 className="text-balance text-[32px] font-extrabold leading-[1.1] tracking-tight text-zinc-900 dark:text-white md:text-[48px]">
            {config.heading}
          </h2>
          <p className="max-w-2xl text-lg font-medium text-zinc-600 dark:text-zinc-400 md:text-xl">
            {config.blurb}
          </p>
        </div>

        <div className="grid items-stretch gap-4 md:grid-cols-3">
          {DELIVERY_SHOWN_APPS.map((app) => {
            const account = demo.accounts[app.id];
            return (
              <div
                key={app.id}
                data-testid={`delivery-app-${app.id}`}
                className="flex flex-col gap-5 rounded-2xl border border-zinc-200 bg-white p-6 transition-colors hover:border-primary dark:border-zinc-800 dark:bg-zinc-900"
              >
                <div className="flex flex-col gap-2">
                  <span className="text-xs font-semibold uppercase tracking-wide text-primary">
                    {app.name}
                  </span>
                  <h3 className="text-lg font-bold text-zinc-900 dark:text-white">{app.label}</h3>
                  <p className="text-sm leading-relaxed text-zinc-600 dark:text-zinc-400">
                    {app.description}
                  </p>
                </div>

                <ul className="flex flex-col gap-2">
                  {app.builds.map((build, index) => {
                    const Glyph = BUILD_GLYPHS[build.id];
                    return (
                      <li key={build.id} className="flex flex-col items-center gap-1">
                        <a
                          href={build.href}
                          target={build.external ? "_blank" : undefined}
                          rel={build.external ? "noopener noreferrer" : undefined}
                          title={build.description}
                          className={index === 0 ? PRIMARY_BUTTON : OUTLINED_BUTTON}
                        >
                          <Glyph aria-hidden="true" className="size-4" />
                          {build.label}
                        </a>
                        <span className="text-xs text-zinc-600 dark:text-zinc-400">
                          {build.description}
                        </span>
                      </li>
                    );
                  })}
                </ul>

                {account && (
                  <div className="mt-auto">
                    <TryItBlock site={demo.site} account={account} />
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}

export const meta: PageSectionMeta = {
  order: 50,
  nav: [{ id: "apps", label: "Apps" }],
};

export default DeliveryAppsSection;
