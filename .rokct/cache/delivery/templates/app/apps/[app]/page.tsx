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

// /apps/customer, /apps/manager and /apps/driver (delivery_sdk 1.2.0):
// one page per Juvo app - its features from today's guided tour, its
// latest release builds for Android and Windows, and its demo account.
// The page is static and regenerated at most hourly, the cadence of the
// tour and release lookups it reads (components/custom/juvo/juvo-load.ts).

import type { Metadata } from "next";
import { notFound } from "next/navigation";

import { JuvoAppPageView } from "@/components/custom/juvo/juvo-app-page";
import { JUVO_APP_PAGES, JUVO_SITE_NAME, juvoAppHref } from "@/components/custom/juvo/juvo-copy";
import { loadJuvoBuilds, loadJuvoTour } from "@/components/custom/juvo/juvo-load";
import { JUVO_APP_IDS, isJuvoAppId } from "@/components/custom/juvo/juvo-tour";

export const revalidate = 3600;
export const dynamicParams = false;

export function generateStaticParams() {
  return JUVO_APP_IDS.map((app) => ({ app }));
}

export async function generateMetadata({ params }: { params: Promise<{ app: string }> }): Promise<Metadata> {
  const { app } = await params;
  if (!isJuvoAppId(app)) return {};
  const page = JUVO_APP_PAGES[app];
  return {
    title: { absolute: `${page.metaTitle} · ${JUVO_SITE_NAME}` },
    description: page.metaDescription,
    alternates: { canonical: juvoAppHref(app) },
  };
}

export default async function Page({ params }: { params: Promise<{ app: string }> }) {
  const { app } = await params;
  if (!isJuvoAppId(app)) notFound();
  const [customer, manager, driver, builds] = await Promise.all([
    loadJuvoTour("customer"),
    loadJuvoTour("manager"),
    loadJuvoTour("driver"),
    loadJuvoBuilds(app),
  ]);
  return <JuvoAppPageView app={app} tours={{ customer, manager, driver }} builds={builds} />;
}
