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

// The Juvo site's two faces (delivery_sdk 1.2.0), self-hosted through
// next/font so no request leaves for a font CDN: Archivo (Omnibus-Type,
// SIL OFL 1.1, fonts/OFL-archivo.txt), a grotesque with a width axis the
// display type stretches to 118-120%, upright and italic; and IBM Plex Mono
// 500 (IBM, SIL OFL 1.1, fonts/OFL-ibm-plex-mono.txt) for the small
// uppercase labels. juvo.css reads them as --jv-sans and --jv-mono.

import localFont from "next/font/local";

const archivo = localFont({
  src: [
    { path: "./fonts/Archivo-normal.woff2", style: "normal", weight: "100 900" },
    { path: "./fonts/Archivo-italic.woff2", style: "italic", weight: "100 900" },
  ],
  variable: "--font-jv-sans",
  display: "swap",
  declarations: [{ prop: "font-stretch", value: "62% 125%" }],
  fallback: ["system-ui", "Segoe UI", "Helvetica Neue", "Arial", "sans-serif"],
});

const plexMono = localFont({
  src: [{ path: "./fonts/IBMPlexMono-500.woff2", style: "normal", weight: "500" }],
  variable: "--font-jv-mono",
  display: "swap",
  fallback: ["ui-monospace", "SFMono-Regular", "Menlo", "monospace"],
});

/** Both faces' variable classes, for the site's root element. */
export const juvoFontClassName = `${archivo.variable} ${plexMono.variable}`;
