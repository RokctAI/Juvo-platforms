/*
 * Copyright (c) 2026 ROKCT INTELLIGENCE (PTY) LTD
 *
 * Permission is hereby granted, free of charge, to any person obtaining a copy
 * of this software and associated documentation files (the "Software"), to deal
 * in the Software without restriction, including without limitation the rights
 * to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
 * copies of the Software, and to permit persons to whom the Software is
 * furnished to do so, subject to the following conditions:
 *
 * The above copyright notice and this permission notice shall be included in all
 * copies or substantial portions of the Software.
 *
 * THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
 * IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
 * FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
 * AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
 * LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
 * OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
 * SOFTWARE.
 */

// Server side of the language switch. t() is synchronous and is called from
// hundreds of server and client components, but Next's cookies() is async.
// So the root layout awaits the cookie once (getRequestLocale, which also
// makes the route dynamic) and this module installs a resolver that t()
// reads synchronously. The resolver reads Next's own per-request store, so
// concurrent requests never see each other's language; anything it cannot
// read falls back to English.
import "server-only";
import { cookies } from "next/headers";
import { workUnitAsyncStorage } from "next/dist/server/app-render/work-unit-async-storage.external";
import { LANG_COOKIE, normalizeLocale, type Locale } from "./index";

(globalThis as Record<string, unknown>).__rokctLocaleResolver = (): Locale => {
  const store = workUnitAsyncStorage.getStore() as
    | { cookies?: { get(name: string): { value: string } | undefined } }
    | undefined;
  return normalizeLocale(store?.cookies?.get?.(LANG_COOKIE)?.value);
};

export async function getRequestLocale(): Promise<Locale> {
  const jar = await cookies();
  return normalizeLocale(jar.get(LANG_COOKIE)?.value);
}
