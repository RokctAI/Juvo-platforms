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
//
// auth_sdk >= 1.12.0 wraps those pages in SiteShell from this path and
// installs a generic default here. delivery_sdk is the home SDK, so the
// installer keeps this copy: the auth card sits inside the same header,
// footer and brand tokens as the home page (JuvoFrame). The header's own
// Log in / Sign up come from its HeaderAuthSlot, so the page's handlers are
// not needed here.

import type { ReactNode } from "react";

import { JuvoFrame } from "@/components/custom/juvo/juvo-parts";
import { JUVO_BRAND } from "@/components/custom/juvo/juvo-copy";

export interface SiteShellProps {
  children: ReactNode;
  openLoginPopup?: () => void;
  openSignupPopup?: () => void;
}

export function SiteShell({ children }: SiteShellProps) {
  return (
    <JuvoFrame>
      <div className="jv-auth">{children}</div>
    </JuvoFrame>
  );
}

/** The mark above the auth card: Juvo's own, the one the header shows. */
export function SiteShellLogo({ size = 56 }: { size?: number }) {
  // eslint-disable-next-line @next/next/no-img-element
  return <img src={JUVO_BRAND.mark} alt="" width={size} height={size} />;
}
