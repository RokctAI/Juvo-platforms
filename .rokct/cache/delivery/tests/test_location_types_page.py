# Copyright (c) 2026 ROKCT INTELLIGENCE (PTY) LTD
#
# This program is free software: you can redistribute it and/or modify
# it under the terms of the GNU Affero General Public License as published
# by the Free Software Foundation, version 3.
#
# This program is distributed in the hope that it will be useful,
# but WITHOUT ANY WARRANTY; without even the implied warranty of
# MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE. See the
# GNU Affero General Public License for more details.
#
# You should have received a copy of the GNU Affero General Public License
# along with this program. If not, see <https://www.gnu.org/licenses/>.

"""Static contract tests for delivery/nextjs's Location types admin page.

Run from the repository root:

    python3 -m unittest discover -s delivery/nextjs/tests -v

The shape is crm_sdk's ``tests/test_gateway_calls.py``: this package ships
templates that compile inside a host shell, so what can be asserted here is
the contract between the templates and the backend they call, and between
the templates and the manifest that installs them. Stdlib only.

The one thing a page against a whitelisted API cannot get wrong quietly is
the cmd and the payload keys: a misspelt cmd is a gateway failure at
runtime, and a misspelt key is a TypeError inside the def. Both are spelt
here, from map's manifest aliases (``{app_name}.api.poi.<fn>``, which the
kernel gateway reaches with the prefix-free dotted name) and from the defs'
own signatures.
"""

import json
import os
import re
import unittest

HERE = os.path.dirname(os.path.abspath(__file__))
SDK_ROOT = os.path.abspath(os.path.join(HERE, os.pardir))
MANIFEST = os.path.join(SDK_ROOT, "manifest.json")
CHANGELOG = os.path.join(SDK_ROOT, "CHANGELOG.md")
TEMPLATES = os.path.join(SDK_ROOT, "templates")

VERSION = "1.1.1"

ACTIONS = "templates/app/actions/delivery/admin/location-types.ts"
PAGE = "templates/app/admin/logistics/location-types/page.tsx"
NAV = "templates/components/custom/nav/delivery-admin-nav.tsx"

ROUTE = "/admin/logistics/location-types"

# The five defs map whitelists for the admin surface, as the kernel gateway
# names them: prefix-free dotted cmds resolved against the composed app's
# own whitelist server-side.
ADMIN_CMDS = (
    "api.poi.admin_create_location_type",
    "api.poi.admin_list_custom_types",
    "api.poi.admin_list_location_types",
    "api.poi.admin_promote_custom_type",
    "api.poi.admin_set_type_visibility",
)

# Every keyword argument those five defs take, and nothing else. A key this
# set does not carry is a TypeError inside the def.
ADMIN_PAYLOAD_KEYS = frozenset(
    ("name", "location_type", "custom_type", "customer_visible")
)

# `paasCall<T>("<cmd>", ...)`: the cmd is the first, positional, string
# literal argument. Anything else is a hit.
PAAS_CALL_RE = re.compile(r"\bpaasCall\s*(?:<[^>(]*>)?\s*\(")
PAAS_CALL_SHAPE_RE = re.compile(r"\bpaasCall\s*(?:<[^>(]*>)?\s*\(\s*\"([^\"\n]+)\"")

# The dead shapes crm_sdk 1.0.1 swept out of its own surface, kept out of
# this one: frappe-js-sdk's argument-free `call({...})`, the browser-side
# `frappe.call(`, the `as any` cast that hid the missing overload, and the
# dotted `/api/method/<name>` URL the gateway never takes.
OBJECT_CALL_RE = re.compile(r"\.call\(\s*\{")
FRAPPE_CALL_RE = re.compile(r"\bfrappe\.call\(")
ANY_CAST_CALL_RE = re.compile(r"as any\)\s*\.call\(")
METHOD_URL_RE = re.compile(r"/api/method/")

PAYLOAD_KEY_RE = re.compile(r"^\s*([a-z_]+):", re.MULTILINE)

LICENCE_LINE = "GNU Affero General Public License"

# Words a rendered surface never says.
PLACEHOLDER_WORDS = ("lorem", "ipsum", "placeholder", "todo", "tbd", "fixme")


def read(relative_path):
    with open(os.path.join(SDK_ROOT, relative_path), encoding="utf-8") as fh:
        return fh.read()


def template_sources():
    for root, _dirs, files in os.walk(TEMPLATES):
        for name in sorted(files):
            if name.endswith((".ts", ".tsx")):
                path = os.path.join(root, name)
                with open(path, encoding="utf-8") as fh:
                    yield os.path.relpath(path, SDK_ROOT).replace(os.sep, "/"), fh.read()


def line_of(text, index):
    return text.count("\n", 0, index) + 1


class GatewayCallTests(unittest.TestCase):
    """What the page sends, and where it sends it."""

    def setUp(self):
        self.actions = read(ACTIONS)
        self.sources = list(template_sources())
        self.assertTrue(self.sources, "no template sources found")

    def test_actions_are_server_only(self):
        self.assertTrue(self.actions.lstrip().startswith("/*"))
        self.assertIn('"use server";', self.actions)

    def test_gateway_is_the_kernel_one(self):
        self.assertIn(
            'import { paasCall } from "@/app/services/base/platform-gateway";',
            self.actions,
        )

    def test_every_paas_call_names_its_cmd_positionally(self):
        uses = [m.start() for m in PAAS_CALL_RE.finditer(self.actions)]
        shaped = [m.start() for m in PAAS_CALL_SHAPE_RE.finditer(self.actions)]
        self.assertEqual(
            [line_of(self.actions, i) for i in uses],
            [line_of(self.actions, i) for i in shaped],
            'every paasCall must be paasCall("<cmd>", ...)',
        )

    def test_the_five_admin_cmds_and_no_others(self):
        called = sorted(
            {m.group(1) for m in PAAS_CALL_SHAPE_RE.finditer(self.actions)}
        )
        self.assertEqual(called, sorted(ADMIN_CMDS))

    def test_each_admin_cmd_is_called_once(self):
        called = [m.group(1) for m in PAAS_CALL_SHAPE_RE.finditer(self.actions)]
        self.assertEqual(len(called), len(set(called)))
        self.assertEqual(len(called), len(ADMIN_CMDS))

    def test_payload_keys_are_the_defs_parameter_names(self):
        keys = {m.group(1) for m in PAYLOAD_KEY_RE.finditer(self.actions)}
        sent = keys & ADMIN_PAYLOAD_KEYS
        self.assertEqual(sent, set(ADMIN_PAYLOAD_KEYS))
        unknown = {
            key
            for key in keys
            if key.islower() and "_" in key and key not in ADMIN_PAYLOAD_KEYS
        }
        # The interfaces describe the ANSWER, whose fields are not payload
        # keys; they are the only other snake_case names in the module.
        self.assertEqual(
            unknown,
            {
                "location_type_name",
                "customer_visible",
                "poi_count",
                "is_seeded",
                "takes_custom_type",
                "custom_type",
                "last_seen",
            }
            - ADMIN_PAYLOAD_KEYS,
        )

    def test_visibility_travels_as_a_check(self):
        # The backend stores a Frappe Check, so the flag is 1 or 0 on the
        # wire and never a JSON boolean.
        self.assertEqual(
            self.actions.count("customer_visible: customerVisible ? 1 : 0"), 3
        )
        self.assertNotIn("customer_visible: customerVisible,", self.actions)

    def test_no_dead_call_shapes_anywhere_in_the_package(self):
        for pattern in (
            OBJECT_CALL_RE,
            FRAPPE_CALL_RE,
            ANY_CAST_CALL_RE,
            METHOD_URL_RE,
        ):
            hits = [
                "%s:%d" % (rel, line_of(text, m.start()))
                for rel, text in self.sources
                for m in pattern.finditer(text)
            ]
            self.assertEqual(hits, [], pattern.pattern)

    def test_only_the_actions_reach_the_gateway(self):
        for rel, text in self.sources:
            if rel in (ACTIONS, "templates/app/lib/paas-gateway.ts"):
                continue
            with self.subTest(file=rel):
                self.assertNotIn("paasCall", text)


class PageTests(unittest.TestCase):
    """What the page draws, and what it never says."""

    def setUp(self):
        self.page = read(PAGE)
        self.nav = read(NAV)

    def test_page_is_a_client_component(self):
        self.assertIn('"use client";', self.page)

    def test_page_calls_only_its_own_actions(self):
        self.assertIn(
            'from "@/app/actions/delivery/admin/location-types"', self.page
        )
        for action in (
            "listLocationTypes",
            "listCustomTypes",
            "createLocationType",
            "setTypeVisibility",
            "promoteCustomType",
        ):
            self.assertIn(action, self.page)

    def test_page_has_the_three_states(self):
        # Loading, could-not-load and nothing-here are distinct screens: an
        # empty vocabulary and an unanswered call must not read the same.
        self.assertIn("animate-spin", self.page)
        self.assertIn("did not load", self.page)
        self.assertIn("No kinds of place yet", self.page)
        self.assertIn("Nothing to promote", self.page)

    def test_page_draws_the_vocabulary_columns(self):
        for column in (
            "Kind of place",
            "Industry",
            "Points filed",
            "Shown to customers",
        ):
            self.assertIn(column, self.page)

    def test_page_draws_the_driver_typed_columns(self):
        for column in ("What the driver typed", "Last used", "Promote"):
            self.assertIn(column, self.page)
        self.assertIn("Typed by drivers", self.page)

    def test_seeded_types_are_badged(self):
        self.assertIn("Seeded", self.page)
        self.assertIn("is_seeded", self.page)
        self.assertIn("takes_custom_type", self.page)

    def test_promotion_reports_the_points_it_moved(self):
        self.assertIn("retyped", self.page)
        self.assertIn("pointsFiled(retyped)", self.page)

    def test_no_type_name_is_hard_coded(self):
        # The seeds are the backend's words (and there is no `competitor`
        # among them); the page renders whatever the site answers with.
        lowered = self.page.lower()
        for seeded in ("spaza shop", "stockist", "landmark", '"gate"', "competitor"):
            self.assertNotIn(seeded, lowered)

    def test_no_placeholder_copy(self):
        for rel in (PAGE, NAV, ACTIONS):
            lowered = read(rel).lower()
            for word in PLACEHOLDER_WORDS:
                with self.subTest(file=rel, word=word):
                    self.assertNotIn(word, lowered)

    def test_nav_group_points_at_the_page(self):
        self.assertIn('url: "%s"' % ROUTE, self.nav)
        self.assertIn("Location types", self.nav)
        self.assertIn("export function DeliveryAdminNav()", self.nav)

    def test_nav_group_carries_no_role_check_of_its_own(self):
        # The roles are checked where the group is rendered (the sidebar) and
        # asserted where it matters (the defs); a second copy here would be a
        # second thing to keep in step.
        self.assertNotIn("useSession", self.nav)
        for shape in ("roles.some", "roles.includes", "roles:", "roles}"):
            self.assertNotIn(shape, self.nav)

    def test_every_new_source_carries_the_licence_header(self):
        for rel in (ACTIONS, PAGE, NAV):
            self.assertIn(LICENCE_LINE, read(rel), rel)


class ManifestTests(unittest.TestCase):
    """What the installer does with the three files."""

    def setUp(self):
        with open(MANIFEST, encoding="utf-8") as fh:
            self.manifest = json.load(fh)

    def test_version(self):
        self.assertEqual(self.manifest["version"], VERSION)

    def test_changelog_leads_with_this_version(self):
        with open(CHANGELOG, encoding="utf-8") as fh:
            lines = [line.strip() for line in fh if line.strip()]
        self.assertEqual(lines[0], "# Changelog")
        self.assertEqual(lines[1], "## %s" % VERSION)

    def test_installs_place_the_three_files(self):
        installs = {
            entry["from"]: entry["to"] for entry in self.manifest["installs"]
        }
        self.assertEqual(installs[ACTIONS], ACTIONS[len("templates/"):])
        self.assertEqual(installs[PAGE], PAGE[len("templates/"):])
        self.assertEqual(installs[NAV], NAV[len("templates/"):])

    def test_every_install_source_exists(self):
        for entry in self.manifest["installs"]:
            path = os.path.join(SDK_ROOT, entry["from"])
            self.assertTrue(os.path.isfile(path), entry["from"])

    def test_requires_the_gateway_and_the_primitives_the_page_draws_with(self):
        required = self.manifest["requires"]
        for item in (
            "app/services/base/platform-gateway.ts",
            "components/custom/app-sidebar.tsx",
            "components/ui/badge.tsx",
            "components/ui/button.tsx",
            "components/ui/card.tsx",
            "components/ui/input.tsx",
            "components/ui/label.tsx",
            "components/ui/sidebar.tsx",
            "components/ui/switch.tsx",
            "components/ui/table.tsx",
        ):
            self.assertIn(item, required)

    def test_every_require_is_explained(self):
        comments = self.manifest["_comment"]
        for item in self.manifest["requires"]:
            self.assertIn(item, comments)

    def test_the_nav_group_is_registered_on_the_sidebar(self):
        sidebar = [
            entry
            for entry in self.manifest["integrations"]
            if entry["target"] == "components/custom/app-sidebar.tsx"
        ]
        self.assertEqual(len(sidebar), 2)
        placeholders = [entry["placeholder"] for entry in sidebar]
        self.assertIn(
            'import { DeliveryNav } from "@/components/custom/nav/delivery-nav";',
            placeholders,
        )
        self.assertIn("<SidebarContent>", placeholders)
        replacements = " ".join(entry["replacement"] for entry in sidebar)
        self.assertIn("DeliveryAdminNav", replacements)
        # The gate names the two roles the defs accept, and only those.
        self.assertIn('"System Manager", "Administrator"', replacements)

    def test_no_new_dependency(self):
        # The page draws with the host shell's own primitives, lucide-react
        # and sonner, which the shell already carries: this SDK has declared
        # no dependency of its own since 1.0.0 and still declares none.
        self.assertEqual(self.manifest["dependencies"], {})
        self.assertEqual(self.manifest["devDependencies"], {})


if __name__ == "__main__":
    unittest.main()
