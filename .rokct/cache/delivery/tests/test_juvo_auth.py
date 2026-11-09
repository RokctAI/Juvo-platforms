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

"""delivery_sdk 1.3.0: the Juvo auth pages meet the hosting_sdk 1.21.0
standard: a brand panel beside the card inside JuvoFrame, scoped CSS, and
panel copy that only repeats the home page."""

import json
import re
import unittest
from pathlib import Path

SDK = Path(__file__).resolve().parents[1]
T = SDK / "templates/components/custom"


class JuvoAuthTest(unittest.TestCase):
    def test_manifest_installs_panel(self):
        m = json.loads((SDK / "manifest.json").read_text())
        pairs = {(i["from"], i["to"]) for i in m["installs"]}
        self.assertIn(("templates/components/custom/site-shell.tsx", "components/custom/site-shell.tsx"), pairs)
        self.assertIn(("templates/components/custom/juvo-auth", "components/custom/juvo-auth"), pairs)

    def test_shell_contract(self):
        src = (T / "site-shell.tsx").read_text()
        for s in ("export interface SiteShellProps", "export function SiteShell(", "export function SiteShellLogo(", "JuvoFrame", "<JuvoAuthPanel />", 'className="jv-auth ja-card"'):
            self.assertIn(s, src)
        self.assertNotRegex(src, r"server-only|next/headers")
        self.assertIn('"use client";', (T / "juvo-auth/juvo-auth-panel.tsx").read_text())

    def test_css_scoped(self):
        body = re.sub(r"/\*.*?\*/", "", (T / "juvo-auth/juvo-auth.css").read_text(), flags=re.S)
        for sel in re.findall(r"([^{}]+)\{", body):
            if sel.strip().startswith("@media"):
                continue
            for part in sel.split(","):
                self.assertRegex(part.strip(), r"^\.jv \.ja", part)

    def test_points_are_the_home_pages(self):
        copy = (T / "juvo-auth/juvo-auth-copy.ts").read_text()
        home = (T / "juvo/juvo-copy.ts").read_text()
        for fact in ("Billed monthly or yearly in USD", "14-day trial on the yearly plan", "Your own delivery platform."):
            self.assertIn(fact, home)
        self.assertIn('"Billed monthly or yearly in USD"', copy)
        self.assertIn('"14-day trial on the yearly plan"', copy)


if __name__ == "__main__":
    unittest.main()
