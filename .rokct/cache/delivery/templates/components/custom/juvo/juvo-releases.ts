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

// The demo downloads on each app page (delivery_sdk 1.2.0). Ray,
// 2026-11-01: each page "links to download the app for Windows and
// Android as demo apps", from the RELEASE builds. Each repo's release lane
// (RokctAI/shared-workflows universal-pipeline.yml) attaches, per tag:
//
//   app-v<ver>.apk                        the signed release APK   <- Android
//   app-debug-v<ver>.apk                  a debug build            (never linked)
//   app-v<ver>.aab                        the Play bundle          (never linked)
//   <app>-windows-setup-v<ver>.exe        the Windows installer    <- Windows
//   update_package.zip                    the in-app updater feed  (never linked)
//
// (paas_customer v1.2.12, paas_driver v2.8.12 and paas_manager v2.7.9 on
// 2026-11-01 each carry both linked files.) The names carry the version,
// so no /releases/latest/download/<file> link is stable: the page asks
// GitHub's releases API for the latest release (juvo-load.ts, cached an
// hour) and links the files it actually lists. When the API cannot be read
// or a release lacks a file, that button links the release page itself,
// /releases/latest, labelled as such - never a guessed file URL.
//
// The pure half: picking the two files out of a release.

import type { JuvoAppId } from "./juvo-tour";
import { JUVO_APP_REPOS } from "./juvo-tour";

export type JuvoBuildId = "android" | "windows";

export const JUVO_BUILD_IDS: readonly JuvoBuildId[] = ["android", "windows"];

/** The release asset each build links, by name. */
export const JUVO_BUILD_PATTERNS: Record<JuvoBuildId, RegExp> = {
  android: /^app-v\d+(?:\.\d+)*(?:[-+][0-9A-Za-z.-]+)?\.apk$/,
  windows: /^[a-z0-9_]+-windows-setup-v\d+(?:\.\d+)*(?:[-+][0-9A-Za-z.-]+)?\.exe$/,
};

/** One downloadable build, as the page shows it. */
export interface JuvoBuild {
  id: JuvoBuildId;
  /** The file itself, or the latest release page when no file could be named. */
  href: string;
  /** Whether `href` is the file (true) or the release page (false). */
  direct: boolean;
  /** The release tag, when known ("v2.8.12"). */
  version?: string;
  /** The file size in bytes, when known. */
  bytes?: number;
}

/** The subset of GitHub's release JSON this module reads. */
export interface GithubRelease {
  tag_name?: unknown;
  draft?: unknown;
  prerelease?: unknown;
  assets?: unknown;
}

interface GithubAsset {
  name: string;
  size: number;
  browser_download_url: string;
}

/** The latest release page of an app's repo. */
export function juvoReleasesPage(app: JuvoAppId): string {
  return `https://github.com/${JUVO_APP_REPOS[app]}/releases/latest`;
}

function assetsOf(release: GithubRelease): GithubAsset[] {
  if (!Array.isArray(release.assets)) return [];
  return release.assets.filter(
    (a): a is GithubAsset =>
      !!a &&
      typeof a === "object" &&
      typeof (a as GithubAsset).name === "string" &&
      typeof (a as GithubAsset).size === "number" &&
      typeof (a as GithubAsset).browser_download_url === "string",
  );
}

/**
 * The two builds of an app from its latest release. A file is linked only
 * when it is listed on that release AND its download URL is on github.com
 * under the app's own repo; anything else falls back to the release page.
 */
export function pickJuvoBuilds(app: JuvoAppId, release: GithubRelease | null): JuvoBuild[] {
  const page = juvoReleasesPage(app);
  const usable = !!release && release.draft !== true && release.prerelease !== true;
  const tag = usable && typeof release!.tag_name === "string" ? (release!.tag_name as string) : undefined;
  const prefix = `https://github.com/${JUVO_APP_REPOS[app]}/releases/download/`;
  const assets = usable ? assetsOf(release!) : [];
  return JUVO_BUILD_IDS.map((id) => {
    const asset = assets.find((a) => JUVO_BUILD_PATTERNS[id].test(a.name) && a.browser_download_url.startsWith(prefix));
    return asset
      ? { id, href: asset.browser_download_url, direct: true, version: tag, bytes: asset.size }
      : { id, href: page, direct: false, version: tag };
  });
}

/** "130 MB" - whole megabytes (10^6), as GitHub's release page rounds them. */
export function formatBuildSize(bytes: number | undefined): string | null {
  if (typeof bytes !== "number" || !Number.isFinite(bytes) || bytes <= 0) return null;
  return `${Math.max(1, Math.round(bytes / 1_000_000))} MB`;
}
