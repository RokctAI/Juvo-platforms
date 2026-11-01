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

// The sidebar group for the admin pages THIS SDK adds to the tenant panel,
// beside base_sdk's own nav/admin-nav.tsx rather than inside it: base owns
// that file and its "Delivery management" group, and a copy of 380 lines of
// it here to add one link would go stale the first time base adds a page.
// The group is registered by the two manifest `integrations` lines on
// base_sdk's components/custom/app-sidebar.tsx, which is also where the
// roles are checked - the same two roles map's `api.poi.admin_*` defs
// accept, System Manager and Administrator, so the group is drawn for
// exactly the accounts the pages behind it answer for.
//
// The labels are plain English, as base_sdk's admin PAGES are: the host
// shell's i18n dictionary carries the `nav.*` keys for the groups it
// shipped with, and it has none for a page this SDK adds. A key replaces
// each literal once the shell's dictionary carries one.

"use client";

import { MapPin } from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";

import {
  SidebarGroup,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from "@/components/ui/sidebar";

const deliveryAdminMenuItems = [
  {
    title: "Location types",
    url: "/admin/logistics/location-types",
    icon: MapPin,
  },
];

export function DeliveryAdminNav() {
  const pathname = usePathname();

  return (
    <SidebarGroup>
      <SidebarGroupLabel>Places and rounds</SidebarGroupLabel>
      <SidebarMenu>
        {deliveryAdminMenuItems.map((item) => (
          <SidebarMenuItem key={item.title}>
            <SidebarMenuButton
              asChild
              isActive={pathname === item.url}
              tooltip={item.title}
            >
              <Link href={item.url}>
                {item.icon && <item.icon />}
                {item.title}
              </Link>
            </SidebarMenuButton>
          </SidebarMenuItem>
        ))}
      </SidebarMenu>
    </SidebarGroup>
  );
}
