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

// The page that serves `/` in a shell whose home SDK is delivery_sdk. Same
// role as lms_sdk's app/page.tsx for Supacharge and agent_sdk's
// app/(chat)/page.tsx for rokctapp: the home SDK owns the root route (Ray,
// 2026-09-03: each home SDK holds its own landing page). It lands on
// app/(chat)/page.tsx rather than app/page.tsx because that is where the
// delivery-frontend shell keeps its holding copy of `/` (its own comment:
// moving it to app/page.tsx would leave two "/" routes at compose time), so
// the composer overwrites the shell copy instead of colliding with it.
//
// Ray, 2026-09-09: the landing "will be selling a delivery platform not
// selling to merchants, his portal is the one that sell to merchants". So
// `/` does three things and no more:
//
//  1. A signed-in session goes to the tenant portal - base_sdk's manager
//     shell at /manager (the paas-era /paas/dashboard, which base_sdk 1.2.0
//     carries as app/manager/layout.tsx and app/manager/page.tsx).
//  2. A visitor who names a tenant (`?site_name=`) - or arrives on a
//     tenant's own domain, which base's tenant-host lookup maps to a site
//     (ROKCT_TENANT_HOSTS or a registered resolver) - gets auth_sdk's
//     PaaSLogin, the tenant login form. The host case is answered by a
//     redirect carrying the resolved site so PaaSLogin reads it the one way
//     it knows, from the query.
//  3. Everyone else gets the Juvo home (since 1.2.0, Ray, 2026-11-01:
//     "do v2" of the approved concept): components/custom/juvo/juvo-home.tsx,
//     the storefront that sells the platform, with the three app pages
//     under /apps. Until 1.1.2 this step redirected to base_sdk's composed
//     /landing, which still answers (its registered sections are unchanged)
//     but is no longer where `/` sends a visitor; the header logo of every
//     Juvo page links back here.
//
// The session is read through the kernel seam (app/services/base/session.ts),
// never through app/(auth) directly, so this page builds identically with
// and without the auth surface installed.

import { headers } from "next/headers";
import { redirect } from "next/navigation";

import { getPlatformSession } from "@/app/services/base/session";
import {
  hasTenantHostLookup,
  hostFromHeaders,
  lookupTenantHost,
} from "@/app/services/base/tenant-hosts";
import { JuvoHome } from "@/components/custom/juvo/juvo-home";
import { loadJuvoTour } from "@/components/custom/juvo/juvo-load";
import { PaaSLogin } from "@/components/custom/paas-login";

export const dynamic = "force-dynamic";

/** Where a signed-in session lands: base_sdk's manager shell. */
const PORTAL_HOME = "/manager";

export default async function Page({
  searchParams,
}: {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}) {
  const session = await getPlatformSession();
  if (session?.user) {
    redirect(PORTAL_HOME);
  }

  const params = await searchParams;
  const siteName = params?.site_name;
  if (typeof siteName === "string" && siteName.trim()) {
    return <PaaSLogin />;
  }

  // A tenant's own domain opens that tenant's portal: resolve the request
  // host the way the gateway does and hand PaaSLogin the site it maps to.
  if (hasTenantHostLookup()) {
    const tenantSite = await lookupTenantHost(hostFromHeaders(await headers()));
    if (tenantSite) {
      redirect(`/?site_name=${encodeURIComponent(tenantSite)}`);
    }
  }

  const [customer, manager, driver] = await Promise.all([
    loadJuvoTour("customer"),
    loadJuvoTour("manager"),
    loadJuvoTour("driver"),
  ]);
  return <JuvoHome tours={{ customer, manager, driver }} />;
}
