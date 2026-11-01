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

"use server";

// The location-type vocabulary a driver files a point of interest against,
// maintained from the tenant admin panel rather than the Frappe desk.
//
// Every call here is one of map's five `api.poi.admin_*` whitelisted defs,
// reached through base_sdk >= 1.3.0's kernel gateway (`paasCall`: the
// signed-in session's tenant site and API credentials, prefix-free dotted
// cmd). The defs themselves assert the roles - System Manager or
// Administrator - so this module adds no gate of its own and no gate here
// could be trusted if it did: the server is where that decision lives.
//
// The payload keys are the defs' own parameter names, and the visibility
// flag is sent as 1 or 0 because the backend stores a Frappe Check.
//
// Reads log and RE-THROW rather than answering with an empty list, unlike
// the admin reads base_sdk's own settings actions make: this page has to
// tell "no types yet" from "the call did not answer", and a [] fallback
// makes those two the same screen.

import { paasCall } from "@/app/services/base/platform-gateway";
import { revalidatePath } from "next/cache";

/** A row of the vocabulary, as `admin_list_location_types` answers it. */
export interface AdminLocationType {
  /** The Location Type name, which is the type's text verbatim. */
  name: string;
  location_type_name: string;
  /** Core's Location Type carries a required industry link; it may be null. */
  industry: string | null;
  /** 1 when the type shows on the customer map. */
  customer_visible: 0 | 1;
  /** Active points of interest filed under this type. */
  poi_count: number;
  /** A type map seeds, which comes back if it is deleted. */
  is_seeded: boolean;
  /** The one type that carries the driver's own words for the place. */
  takes_custom_type: boolean;
}

/** A free text drivers have been typing, as `admin_list_custom_types` answers it. */
export interface AdminCustomType {
  custom_type: string;
  count: number;
  last_seen: string | null;
}

export async function listLocationTypes(): Promise<AdminLocationType[]> {
  try {
    const rows = await paasCall<AdminLocationType[]>(
      "api.poi.admin_list_location_types",
    );
    return Array.isArray(rows) ? rows : [];
  } catch (error) {
    console.error("Failed to fetch location types:", error);
    throw error;
  }
}

export async function listCustomTypes(): Promise<AdminCustomType[]> {
  try {
    const rows = await paasCall<AdminCustomType[]>(
      "api.poi.admin_list_custom_types",
    );
    return Array.isArray(rows) ? rows : [];
  } catch (error) {
    console.error("Failed to fetch driver-typed places:", error);
    throw error;
  }
}

export async function createLocationType(
  name: string,
  customerVisible: boolean,
) {
  try {
    const result = await paasCall("api.poi.admin_create_location_type", {
      name,
      customer_visible: customerVisible ? 1 : 0,
    });
    revalidatePath("/admin/logistics/location-types");
    return result;
  } catch (error) {
    console.error("Failed to add location type:", error);
    throw error;
  }
}

export async function setTypeVisibility(
  locationType: string,
  customerVisible: boolean,
) {
  try {
    const result = await paasCall("api.poi.admin_set_type_visibility", {
      location_type: locationType,
      customer_visible: customerVisible ? 1 : 0,
    });
    revalidatePath("/admin/logistics/location-types");
    return result;
  } catch (error) {
    console.error("Failed to set location type visibility:", error);
    throw error;
  }
}

export async function promoteCustomType(
  customType: string,
  locationType: string | null,
  customerVisible: boolean,
) {
  try {
    // `location_type` is optional server-side and defaults to the text, so
    // an admin who did not rename the place sends null and the def names
    // the new type after the driver's own words.
    const result = await paasCall("api.poi.admin_promote_custom_type", {
      custom_type: customType,
      location_type: locationType,
      customer_visible: customerVisible ? 1 : 0,
    });
    revalidatePath("/admin/logistics/location-types");
    return result;
  } catch (error) {
    console.error("Failed to promote a driver-typed place:", error);
    throw error;
  }
}
