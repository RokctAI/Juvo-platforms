// Copyright (c) 2026 ROKCT INTELLIGENCE (PTY) LTD
//
// This program is free software: you can redistribute it and/or modify
// it under the terms of the GNU Affero General Public License as published
// by the Free Software Foundation, version 3.
//
// This program is distributed in the hope that it will be useful,
// but WITHOUT ANY WARRANTY; without even the implied warranty of
// MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE. See the
// GNU Affero General Public License for more details.
//
// You should have received a copy of the GNU Affero General Public License
// along with this program. If not, see <https://www.gnu.org/licenses/>.

// The Juvo frame for auth_sdk's pages (login, register, forgot-password).

// delivery_sdk 1.3.0: the words beside the auth card (../site-shell.tsx).
// Every claim is the home page's own (juvo/juvo-copy.ts: the hero, the
// apps, the trust line). The card's own words stay auth_sdk's.

export interface JuvoAuthPanelCopy {
  kicker: string;
  title: string[];
  lede: string;
}

export const JUVO_AUTH_COPY = {
  sideLabel: "About Juvo Platforms",
  login: {
    kicker: "Juvo Platforms · Log in",
    title: ["Welcome", "back."],
    lede: "Log in to your Juvo Platforms account to carry on.",
  },
  register: {
    kicker: "Juvo Platforms · New account",
    title: ["Your own", "delivery platform."],
    lede: "Create a Juvo Platforms account to get started.",
  },
  forgot: {
    kicker: "Juvo Platforms · Account help",
    title: ["Lost your", "password?"],
    lede: "Password reset is not self-service yet. Get in touch with us and we will help you back in.",
  },
  points: [
    "A customer app, a merchant app and a driver app",
    "Billed monthly or yearly in USD",
    "14-day trial on the yearly plan",
  ],
} as const;

/** The panel for the auth page at `pathname` (login when unknown). */
export function juvoAuthPanel(pathname: string | null): JuvoAuthPanelCopy {
  const p = pathname ?? "";
  const c = p.startsWith("/register") ? JUVO_AUTH_COPY.register : p.startsWith("/forgot") ? JUVO_AUTH_COPY.forgot : JUVO_AUTH_COPY.login;
  return { kicker: c.kicker, title: [...c.title], lede: c.lede };
}
