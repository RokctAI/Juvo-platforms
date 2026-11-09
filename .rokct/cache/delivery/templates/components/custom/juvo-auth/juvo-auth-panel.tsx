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

// delivery_sdk 1.3.0: the brand panel beside the auth card. A client
// component only because the copy follows the route (usePathname); the
// frame around it (JuvoFrame) stays as site-shell.tsx draws it.

"use client";

import { usePathname } from "next/navigation";

import { JUVO_AUTH_COPY, juvoAuthPanel } from "@/components/custom/juvo-auth/juvo-auth-copy";

export function JuvoAuthPanel() {
  const panel = juvoAuthPanel(usePathname());
  return (
    <aside className="ja-side" aria-label={JUVO_AUTH_COPY.sideLabel}>
      <span className="mono eyebrow">{panel.kicker}</span>
      <p className="display ja-h">
        {panel.title.map((line, i) =>
          i === panel.title.length - 1 ? (
            <span key={line} className="it">
              {line}
            </span>
          ) : (
            <span key={line}>{line}</span>
          ),
        )}
      </p>
      <p className="ja-lede">{panel.lede}</p>
      <ul className="ja-pts">
        {JUVO_AUTH_COPY.points.map((p) => (
          <li key={p}>{p}</li>
        ))}
      </ul>
    </aside>
  );
}
