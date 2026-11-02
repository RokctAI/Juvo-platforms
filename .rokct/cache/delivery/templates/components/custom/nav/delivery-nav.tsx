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

// The deliveryman's sidebar group, taken from the delivery-frontend shell
// (components/custom/nav/delivery-nav.tsx) - the file base_sdk's
// app-sidebar.tsx imports and gates ("deliveryman" / "Delivery Man" roles
// that are not also sellers) and names in its manifest `requires` as
// "delivery repo (no SDK home in paas-map; stays in the shell until the
// delivery frontend takes it)". This SDK takes it. Its entries now sit
// under /manager, base_sdk >= 1.2.0's tenant dashboard chrome (the paas-era
// /paas/dashboard), the same move merchants_sdk 1.1.0 made for
// merchant-nav.tsx; the pages behind them are not in any source yet (the
// Driver app, RokctAI/paas_driver, is where a driver works today). Labels
// come from the host's i18n (nav.delivery.*), as every nav group's do.

"use client";

import {
  RiDashboardLine,
  RiBox3Line,
  RiMoneyDollarCircleLine,
  RiUserLine,
} from "@remixicon/react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import t from "@/app/lib/i18n";

import {
  SidebarGroup,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from "@/components/ui/sidebar";

const deliveryMenuItems = [
  {
    title: t("nav.delivery.dashboard"),
    url: "/manager/delivery",
    icon: RiDashboardLine,
  },
  {
    title: t("nav.delivery.my_orders"),
    url: "/manager/delivery/orders",
    icon: RiBox3Line,
  },
  {
    title: t("nav.delivery.earnings"),
    url: "/manager/delivery/finance",
    icon: RiMoneyDollarCircleLine,
  },
  {
    title: t("nav.delivery.profile"),
    url: "/manager/delivery/profile",
    icon: RiUserLine,
  },
];

export function DeliveryNav() {
  const pathname = usePathname();

  return (
    <SidebarGroup>
      <SidebarGroupLabel>{t("nav.delivery.panel_label")}</SidebarGroupLabel>
      <SidebarMenu>
        {deliveryMenuItems.map((item) => (
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
