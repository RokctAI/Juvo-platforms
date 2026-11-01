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

"""Static contract tests for the Juvo Platforms site (delivery/nextjs 1.2.0).

Run from the repository root:

    python3 -m unittest discover -s delivery/nextjs/tests -v

The shape is ``test_location_types_page.py``'s: the templates compile only
inside a host shell, so what is asserted here is the contract between the
templates, the manifest that installs them and the paas repos they read.
Stdlib only.

The rules pinned here are the ones a later edit could break quietly:

* the pictures come from each paas repo's tour output at run time, so no
  screenshot is committed and the proxy route only serves tour file names;
* download links come from each repo's latest GitHub release, never the
  debug APK, the .aab or the update bundle;
* the demo accounts are the three ``@demo.rokct.ai`` logins auth_sdk's
  demo sign-in knows;
* the driver page names no Tasks SDK and no plans; the manager page shows
  the tablet;
* the footer is the site credit, with no wordmark under it;
* icons are Remixicon only.

The two regexes that read the tour output (the feature guide step and the
screenshot file name) are lifted out of ``juvo-tour.ts`` and run here
against a sample, since their JavaScript syntax is also valid Python.
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

VERSION = "1.2.0"

JUVO = "components/custom/juvo"
COPY = JUVO + "/juvo-copy.ts"
ICONS = JUVO + "/juvo-icons.tsx"
TOUR = JUVO + "/juvo-tour.ts"
RELEASES = JUVO + "/juvo-releases.ts"
LOAD = JUVO + "/juvo-load.ts"
PARTS = JUVO + "/juvo-parts.tsx"
CLIENT = JUVO + "/juvo-client.tsx"
APPS = "components/custom/landing/delivery-apps.ts"
ROUTE = "app/juvo/tour/[app]/[device]/[file]/route.ts"
APP_PAGE = "app/apps/[app]/page.tsx"
HOME = "app/(chat)/page.tsx"

INSTALLED_DIRS = ("components/custom/juvo", "app/apps", "app/juvo", "public/juvo")

DEMO_LOGINS = {
    "customer": "customer@demo.rokct.ai",
    "manager": "manager@demo.rokct.ai",
    "driver": "driver@demo.rokct.ai",
}


def read(rel):
    with open(os.path.join(TEMPLATES, rel), encoding="utf-8") as fh:
        return fh.read()


def app_block(copy, app):
    """The source of one JUVO_APP_PAGES entry, up to the next app's key."""
    start = copy.index("export const JUVO_APP_PAGES")
    body = copy[start:]
    m = re.search(r"^  %s: \{$" % app, body, re.M)
    if m is None:
        raise AssertionError("no %s page in JUVO_APP_PAGES" % app)
    rest = body[m.end():]
    nxt = re.search(r"^  (?:customer|manager|driver): \{$|^\};$", rest, re.M)
    return rest[: nxt.start()] if nxt else rest


def js_regex(source, name):
    """A `const NAME = /.../flags;` regex literal from TS source, compiled."""
    m = re.search(r"const %s = /(.+)/([a-z]*);$" % name, source, re.M)
    if m is None:
        raise AssertionError("no regex literal %s" % name)
    flags = re.M if "m" in m.group(2) else 0
    return re.compile(m.group(1), flags)


class ManifestTest(unittest.TestCase):
    def setUp(self):
        with open(MANIFEST, encoding="utf-8") as fh:
            self.manifest = json.load(fh)

    def test_version_and_changelog_head(self):
        self.assertEqual(self.manifest["version"], VERSION)
        with open(CHANGELOG, encoding="utf-8") as fh:
            lines = [l.rstrip("\n") for l in fh if l.strip()]
        self.assertEqual(lines[1], "## %s" % VERSION)

    def test_installs_the_site_directories(self):
        pairs = {(i["from"], i["to"]) for i in self.manifest["installs"]}
        for d in INSTALLED_DIRS:
            self.assertIn(("templates/" + d, d), pairs, d)
            self.assertTrue(os.path.isdir(os.path.join(TEMPLATES, d)), d)

    def test_requires_the_base_seams_it_imports(self):
        req = set(self.manifest["requires"])
        for rel in (
            "components/custom/header-auth-slot.tsx",
            "components/custom/landing/header-auth.ts",
            "components/custom/site-credit.tsx",
            "components/custom/landing/site-credit.ts",
            "components/custom/theme-provider.tsx",
        ):
            self.assertIn(rel, req)


class NoCommittedShotsTest(unittest.TestCase):
    """Pictures come from the tour output, never from this package."""

    def test_no_raster_images_in_templates(self):
        found = []
        for root, _dirs, files in os.walk(TEMPLATES):
            for f in files:
                if f.lower().endswith((".png", ".jpg", ".jpeg", ".webp", ".gif", ".avif")):
                    found.append(os.path.relpath(os.path.join(root, f), TEMPLATES))
        self.assertEqual(found, [])

    def test_images_resolve_through_the_proxy_route(self):
        tour = read(TOUR)
        self.assertIn("`/juvo/tour/${app}/${device}/${file}`", tour)
        self.assertIn('JUVO_TOUR_BRANCH = "main"', tour)
        self.assertIn('"marketing/tour/feature-guide.md"', tour)

    def test_route_validates_before_fetching(self):
        route = read(ROUTE)
        for guard in ("isJuvoAppId", "isJuvoTourDevice", "isJuvoTourFile", "checkJuvoTourBytes"):
            self.assertIn(guard, route)
        self.assertLess(route.index("isJuvoTourFile"), route.index("fetch("))
        self.assertIn("nosniff", route)


class TourParsingTest(unittest.TestCase):
    GUIDE = (
        "# Feature guide\n\n"
        "## 1. Your day on the map\n\n"
        "![Home](screenshots/01-driver_home.png)\n\n"
        "Go online and drive.\nThe next job is a tap away.\n\n"
        "## 2. Every stop\n\n"
        "![Route](screenshots/02-driver_route.png)\n\n"
        "Pickups first, then drop-offs.\n"
    )

    def setUp(self):
        self.tour = read(TOUR)

    def test_step_regex_keeps_multiline_captions(self):
        steps = js_regex(self.tour, "STEP_RE").findall(self.GUIDE)
        self.assertEqual(
            [(n, t, f) for n, t, f, _c in steps],
            [("1", "Your day on the map", "01-driver_home.png"), ("2", "Every stop", "02-driver_route.png")],
        )
        self.assertIn("The next job is a tap away.", steps[0][3])
        self.assertEqual(steps[1][3].strip(), "Pickups first, then drop-offs.")

    def test_shot_names_are_tour_names_only(self):
        shot = js_regex(self.tour, "SHOT_RE")
        self.assertTrue(shot.match("01-driver_home.png"))
        self.assertTrue(shot.match("112-users_profile.png"))
        for bad in ("../secret.png", "01-driver_home.png.exe", "x.png", "01-Driver.png"):
            self.assertIsNone(shot.match(bad), bad)
        svg = js_regex(self.tour, "SVG_RE")
        self.assertTrue(svg.match("driver-profile-dark.clean.svg"))
        self.assertIsNone(svg.match("../a.clean.svg"))


class ReleaseLinksTest(unittest.TestCase):
    def setUp(self):
        src = read(RELEASES)
        self.android = re.compile(re.search(r"android: /(.+)/,$", src, re.M).group(1))
        self.windows = re.compile(re.search(r"windows: /(.+)/,$", src, re.M).group(1))
        self.src = src

    def test_picks_the_release_builds(self):
        for name in ("app-v1.2.12.apk", "app-v2.8.12.apk", "app-v2.7.9.apk"):
            self.assertTrue(self.android.match(name), name)
        for name in (
            "customer-windows-setup-v1.2.12.exe",
            "driver-windows-setup-v2.8.12.exe",
            "manager-windows-setup-v2.7.9.exe",
        ):
            self.assertTrue(self.windows.match(name), name)

    def test_never_the_debug_bundle_or_update(self):
        for name in ("app-debug.apk", "app-v1.2.12-debug.apk.zip", "app-release.aab", "app-v1.2.12.aab"):
            self.assertIsNone(self.android.match(name), name)
        self.assertIsNone(self.windows.match("update_package.zip"))
        self.assertIsNone(self.android.match("app-debug-v1.2.12.apk"))

    def test_links_stay_on_the_repo_release(self):
        self.assertIn("/releases/download/", self.src)
        self.assertIn("/releases/latest", self.src)
        load = read(LOAD)
        self.assertIn("JUVO_GITHUB_TOKEN", load)
        self.assertNotIn("ghp_", load)


class DemoAccountsTest(unittest.TestCase):
    def test_demo_logins_are_the_three_demo_addresses(self):
        apps = read(APPS)
        block = apps[apps.index("export const DELIVERY_DEMO_LOGINS"):]
        block = block[: block.index("};")]
        found = dict(re.findall(r"(\w+): \"([^\"]+)\"", block))
        self.assertEqual(found, DEMO_LOGINS)

    def test_every_app_page_signs_in_with_its_own_login(self):
        copy = read(COPY)
        for app in DEMO_LOGINS:
            self.assertIn("email: DELIVERY_DEMO_LOGINS.%s" % app, app_block(copy, app))


class AppPagesTest(unittest.TestCase):
    def setUp(self):
        self.copy = read(COPY)

    def test_driver_page_names_no_tasks_and_no_plans(self):
        driver = app_block(self.copy, "driver")
        for word in ("productivity_", "subscription", "plan", "Plan", "Tasks", "tasks"):
            self.assertNotIn(word, driver, word)

    def test_manager_page_shows_the_tablet(self):
        manager = app_block(self.copy, "manager")
        self.assertIn('"tablet")', manager)
        self.assertIn("galleryTablet: true", manager)

    def test_static_params_cover_the_three_apps(self):
        page = read(APP_PAGE)
        self.assertIn("generateStaticParams", page)
        self.assertIn("dynamicParams = false", page)

    def test_home_renders_the_site_not_a_redirect(self):
        home = read(HOME)
        self.assertIn("<JuvoHome", home)


class FooterAndBrandTest(unittest.TestCase):
    def test_footer_is_the_site_credit_alone(self):
        parts = read(PARTS)
        footer = parts[parts.index("export function JuvoFooter"):]
        footer = footer[: footer.index("\n}\n")]
        self.assertIn("<SiteCredit", footer)
        self.assertIn("siteName={JUVO_SITE_NAME}", footer)
        self.assertNotIn("<img", footer)
        self.assertNotIn("brand.word", footer)
        self.assertIn('JUVO_SITE_NAME = "Juvo Platforms"', read(COPY))

    def test_header_logo_goes_home_and_uses_the_auth_slot(self):
        client = read(CLIENT)
        self.assertIn('className="brand" href="/"', client)
        self.assertIn('<HeaderAuthSlot variant="bar"', client)
        self.assertIn('<HeaderAuthSlot variant="panel"', client)


class IconsTest(unittest.TestCase):
    def test_remixicon_only(self):
        for root, _dirs, files in os.walk(os.path.join(TEMPLATES, JUVO)):
            for f in files:
                with open(os.path.join(root, f), encoding="utf-8", errors="ignore") as fh:
                    self.assertNotIn("lucide", fh.read(), f)

    def test_every_icon_named_in_the_copy_is_drawn(self):
        icons = read(ICONS)
        table = icons[icons.index("export const JUVO_ICONS"):]
        table = table[: table.index("};")]
        drawn = set(re.findall(r"^\s+\"?([a-z0-9-]+)\"?: Ri\w+,$", table, re.M))
        used = set(re.findall(r"icon: \"([a-z0-9-]+)\"", read(COPY)))
        self.assertTrue(used)
        self.assertEqual(used - drawn, set())


if __name__ == "__main__":
    unittest.main()
