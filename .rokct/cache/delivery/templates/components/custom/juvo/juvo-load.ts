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

// Server loaders for the Juvo pages (delivery_sdk 1.2.0): today's tour
// steps of an app (its feature guide and gallery skip list, from main) and
// its latest release builds (GitHub's releases API). Both go through
// Next's data cache for an hour, so a page render costs no GitHub call
// once warm, and both degrade instead of throwing: a guide that cannot be
// read gives the snapshot in juvo-tour.ts, a release that cannot be read
// gives buttons that open the release page.
//
// Environment (both optional):
//   JUVO_TOUR_RAW_ORIGIN   where raw repo files are read (default
//                          https://raw.githubusercontent.com)
//   JUVO_RELEASES_API      where the releases API is asked (default
//                          https://api.github.com)
//   JUVO_GITHUB_TOKEN      a read-only token for the releases API. Optional:
//                          the three repos are public, but GitHub allows 60
//                          unauthenticated calls an hour per IP, and a
//                          shared build or function IP can spend that on
//                          someone else's behalf (the buttons then link the
//                          release page). Server-side only; never NEXT_PUBLIC_.

import "server-only";

import { pickJuvoBuilds, type GithubRelease, type JuvoBuild } from "./juvo-releases";
import {
  JUVO_APP_REPOS,
  JUVO_GALLERY_SNAPSHOT,
  JUVO_TOUR_GALLERY,
  JUVO_TOUR_GUIDE,
  JUVO_TOUR_RAW_ORIGIN,
  JUVO_TOUR_REVALIDATE_SECONDS,
  juvoTourRawUrl,
  parseFeatureGuide,
  parseGalleryExclusions,
  snapshotSteps,
  type JuvoAppId,
  type JuvoTourStep,
} from "./juvo-tour";

const TIMEOUT_MS = 8000;

/** An app's tour as the page draws it. */
export interface JuvoTour {
  steps: JuvoTourStep[];
  /** Step names the README gallery leaves out. */
  exclusions: string[];
  /** false while the page is drawing the snapshot. */
  live: boolean;
}

export function juvoRawOrigin(env: Record<string, string | undefined> = process.env): string {
  const set = env.JUVO_TOUR_RAW_ORIGIN?.trim();
  return set && /^https?:\/\//.test(set) ? set : JUVO_TOUR_RAW_ORIGIN;
}

function releasesApi(env: Record<string, string | undefined> = process.env): string {
  const set = env.JUVO_RELEASES_API?.trim();
  return (set && /^https?:\/\//.test(set) ? set : "https://api.github.com").replace(/\/+$/, "");
}

function releaseHeaders(env: Record<string, string | undefined> = process.env): Record<string, string> {
  const headers: Record<string, string> = {
    accept: "application/vnd.github+json",
    "x-github-api-version": "2022-11-28",
    "user-agent": "juvo-platforms-site",
  };
  const token = env.JUVO_GITHUB_TOKEN?.trim();
  if (token) headers.authorization = `Bearer ${token}`;
  return headers;
}

async function readText(url: string): Promise<string> {
  const res = await fetch(url, {
    next: { revalidate: JUVO_TOUR_REVALIDATE_SECONDS },
    signal: AbortSignal.timeout(TIMEOUT_MS),
  });
  if (!res.ok) throw new Error(`${url} answered ${res.status}`);
  return res.text();
}

/** Today's tour of an app, or the snapshot when its guide cannot be read. */
export async function loadJuvoTour(app: JuvoAppId): Promise<JuvoTour> {
  const origin = juvoRawOrigin();
  const [guide, gallery] = await Promise.allSettled([
    readText(juvoTourRawUrl(app, JUVO_TOUR_GUIDE, origin)),
    readText(juvoTourRawUrl(app, JUVO_TOUR_GALLERY, origin)),
  ]);
  const steps = guide.status === "fulfilled" ? parseFeatureGuide(guide.value) : [];
  const exclusions =
    gallery.status === "fulfilled" ? parseGalleryExclusions(gallery.value) : [...JUVO_GALLERY_SNAPSHOT[app]];
  if (steps.length === 0) {
    if (guide.status === "rejected") console.warn(`[juvo] ${app} tour guide: ${String(guide.reason)}; drawing the snapshot`);
    return { steps: snapshotSteps(app), exclusions, live: false };
  }
  return { steps, exclusions, live: true };
}

/** The Android and Windows builds of an app's latest release. */
export async function loadJuvoBuilds(app: JuvoAppId): Promise<JuvoBuild[]> {
  try {
    const res = await fetch(`${releasesApi()}/repos/${JUVO_APP_REPOS[app]}/releases/latest`, {
      headers: releaseHeaders(),
      next: { revalidate: JUVO_TOUR_REVALIDATE_SECONDS },
      signal: AbortSignal.timeout(TIMEOUT_MS),
    });
    if (!res.ok) throw new Error(`releases API answered ${res.status}`);
    return pickJuvoBuilds(app, (await res.json()) as GithubRelease);
  } catch (error) {
    console.warn(`[juvo] ${app} latest release: ${error instanceof Error ? error.message : error}; linking the release page`);
    return pickJuvoBuilds(app, null);
  }
}
