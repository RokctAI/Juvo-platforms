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

// /juvo/tour/<app>/<device>/<file> (delivery_sdk 1.2.0): one picture from
// an app's guided tour, read from the app repo's main branch, so the Juvo
// pages always show the app as its latest tour captured it (Ray,
// 2026-11-01: "it will just take images from tour of its apps to always
// have latest"). See components/custom/juvo/juvo-tour.ts for the folders.
//
// Only an app this site shows, a run it has (phone, tablet, svg) and a
// file name of that run's shape are fetched; the bytes must be a PNG (or,
// for svg, an SVG document) under the size cap before anything is served,
// and the answer names its own type, since raw.githubusercontent.com
// answers everything as text/plain. The fetch goes through Next's data
// cache for an hour and the answer carries a CDN lifetime, so GitHub is
// asked at most hourly per file and a failed check keeps serving the
// last good copy the CDN holds (stale-while-revalidate / stale-if-error).
// A file that cannot be had answers 404 or 502 and is never cached; the
// page's frame stays drawn around the missing picture.

import { juvoRawOrigin } from "@/components/custom/juvo/juvo-load";
import {
  JUVO_TOUR_REVALIDATE_SECONDS,
  checkJuvoTourBytes,
  isJuvoAppId,
  isJuvoTourDevice,
  isJuvoTourFile,
  juvoTourContentType,
  juvoTourFileUrl,
} from "@/components/custom/juvo/juvo-tour";

export const dynamic = "force-dynamic";

const CACHE = `public, max-age=${JUVO_TOUR_REVALIDATE_SECONDS}, s-maxage=${JUVO_TOUR_REVALIDATE_SECONDS}, stale-while-revalidate=604800, stale-if-error=604800`;

function refuse(status: number, reason: string): Response {
  return new Response(reason, {
    status,
    headers: { "content-type": "text/plain; charset=utf-8", "cache-control": "no-store" },
  });
}

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ app: string; device: string; file: string }> },
) {
  const { app, device, file } = await params;
  if (!isJuvoAppId(app) || !isJuvoTourDevice(device) || !isJuvoTourFile(device, file)) {
    return refuse(404, "Not found");
  }
  const url = juvoTourFileUrl(app, device, file, juvoRawOrigin());
  let bytes: Uint8Array;
  try {
    const res = await fetch(url, {
      next: { revalidate: JUVO_TOUR_REVALIDATE_SECONDS },
      signal: AbortSignal.timeout(15000),
    });
    if (res.status === 404) return refuse(404, "Not in the tour");
    if (!res.ok) return refuse(502, `Tour file answered ${res.status}`);
    bytes = new Uint8Array(await res.arrayBuffer());
  } catch (error) {
    console.warn(`[juvo] tour ${app}/${device}/${file}: ${error instanceof Error ? error.message : error}`);
    return refuse(502, "Tour file unavailable");
  }
  const checked = checkJuvoTourBytes(device, bytes);
  if (!checked.ok) {
    console.warn(`[juvo] tour ${app}/${device}/${file} refused: ${checked.reason}`);
    return refuse(502, "Tour file refused");
  }
  return new Response(checked.value as BodyInit, {
    headers: {
      "content-type": juvoTourContentType(device),
      "cache-control": CACHE,
      "x-content-type-options": "nosniff",
      // An SVG is only ever drawn as an image; as a document it may run nothing.
      "content-security-policy": "default-src 'none'; img-src data:; style-src 'unsafe-inline'; sandbox",
    },
  });
}
