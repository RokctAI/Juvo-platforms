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

// The Juvo site's glyphs (delivery_sdk 1.2.0): Remixicon only, through
// @remixicon/react (the host shell carries it; delivery_sdk 1.1.2 moved
// every icon there). juvo-copy.ts names glyphs by these keys, so the words
// stay free of React and a test can check every name it uses is here.

import {
  RiAndroidLine,
  RiBankLine,
  RiBarcodeLine,
  RiBox3Line,
  RiBrushLine,
  RiBuilding2Line,
  RiCalendarCheckLine,
  RiCheckboxCircleLine,
  RiContactsBook3Line,
  RiDashboard3Line,
  RiDownload2Line,
  RiEBike2Line,
  RiFileList3Line,
  RiFireLine,
  RiFundsLine,
  RiGlobalLine,
  RiHandCoinLine,
  RiKey2Line,
  RiMailLine,
  RiMap2Line,
  RiMapPinTimeLine,
  RiPaletteLine,
  RiRouteLine,
  RiSearchLine,
  RiShapeLine,
  RiShapesLine,
  RiShieldUserLine,
  RiShoppingBag3Line,
  RiSmartphoneLine,
  RiStackLine,
  RiStore2Line,
  RiStore3Line,
  RiTabletLine,
  RiTeamLine,
  RiTimeLine,
  RiTranslate2,
  RiTruckLine,
  RiUser3Line,
  RiWallet3Line,
  RiWhatsappLine,
  RiWifiOffLine,
  RiWindowsLine,
  type RemixiconComponentType,
} from "@remixicon/react";

import type { JuvoIcon } from "./juvo-copy";

type Glyph = RemixiconComponentType;

export const JUVO_ICONS: Record<JuvoIcon, Glyph> = {
  bag: RiShoppingBag3Line,
  store: RiStore2Line,
  bike: RiEBike2Line,
  dashboard: RiDashboard3Line,
  building: RiBuilding2Line,
  contacts: RiContactsBook3Line,
  team: RiTeamLine,
  route: RiRouteLine,
  box: RiBox3Line,
  wallet: RiWallet3Line,
  map: RiMap2Line,
  whatsapp: RiWhatsappLine,
  fire: RiFireLine,
  "check-circle": RiCheckboxCircleLine,
  calendar: RiCalendarCheckLine,
  time: RiTimeLine,
  shop: RiStore3Line,
  search: RiSearchLine,
  "map-pin-time": RiMapPinTimeLine,
  translate: RiTranslate2,
  barcode: RiBarcodeLine,
  "wifi-off": RiWifiOffLine,
  list: RiFileList3Line,
  truck: RiTruckLine,
  funds: RiFundsLine,
  "hand-coin": RiHandCoinLine,
  bank: RiBankLine,
  download: RiDownload2Line,
  brush: RiBrushLine,
  palette: RiPaletteLine,
  globe: RiGlobalLine,
  smartphone: RiSmartphoneLine,
  tablet: RiTabletLine,
  stack: RiStackLine,
  shapes: RiShapesLine,
  shape: RiShapeLine,
  android: RiAndroidLine,
  windows: RiWindowsLine,
  user: RiUser3Line,
  mail: RiMailLine,
  key: RiKey2Line,
  "shield-user": RiShieldUserLine,
};

/** One glyph, decorative: the words beside it carry the meaning. */
export function JuvoGlyph({ name, size, className }: { name: JuvoIcon; size?: number; className?: string }) {
  const G = JUVO_ICONS[name];
  return <G size={size ?? "1em"} className={className} aria-hidden />;
}
