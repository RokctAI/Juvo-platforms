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

import en from "./en.json";
import { sdkTranslations } from "./sdk-registry";

// SDK copy: each SDK ships app/lib/i18n/sdk/<sdk>.json ({"en": {...},
// "af": {...}}) and scripts/compose.sh lists them in sdk-registry.ts. The
// shell's own en.json wins where both define a key.
function deepMerge(target: Record<string, any>, source: Record<string, any>) {
  for (const [k, v] of Object.entries(source || {})) {
    if (v && typeof v === "object" && !Array.isArray(v)) {
      if (!target[k] || typeof target[k] !== "object") target[k] = {};
      deepMerge(target[k], v);
    } else if (target[k] === undefined) {
      target[k] = v;
    }
  }
  return target;
}

export type Locale = "en" | "af";
export const LOCALES: Locale[] = ["en", "af"];
// The visitor's language lives in this cookie (set by base_sdk's
// LanguageToggle in the header, kept for a year).
export const LANG_COOKIE = "rk-lang";

export function normalizeLocale(value: unknown): Locale {
  return value === "af" ? "af" : "en";
}

const merged: Record<string, any> = JSON.parse(JSON.stringify(en));
for (const bundle of sdkTranslations) deepMerge(merged, bundle.en || {});

// Afrikaans: every SDK ships an "af" side next to its "en" side. Keys
// without Afrikaans copy fall back to English, then to humanizeKey.
const mergedAf: Record<string, any> = {};
for (const bundle of sdkTranslations) deepMerge(mergedAf, bundle.af || {});

const translations: Record<Locale, Record<string, any>> = {
  en: merged,
  af: mergedAf,
};

// Which language this render is in. In the browser it is <html lang>, which
// the root layout writes from the cookie, so server HTML and hydration
// agree. On the server, app/lib/i18n/server.ts (imported by the root
// layout, server only) installs a resolver that reads the request's cookie.
type Resolver = () => Locale;
const RESOLVER_KEY = "__rokctLocaleResolver";

export function currentLocale(): Locale {
  if (typeof window !== "undefined") {
    return normalizeLocale(document.documentElement.lang);
  }
  const resolve = (globalThis as Record<string, unknown>)[RESOLVER_KEY] as
    Resolver | undefined;
  try {
    return resolve ? resolve() : "en";
  } catch {
    return "en";
  }
}

function lookup(tree: Record<string, any>, keys: string[]): unknown {
  let value: any = tree;
  for (const k of keys) {
    if (value && typeof value === "object" && k in value) value = value[k];
    else return undefined;
  }
  return value;
}

// A key nobody translated shows as words, not as "app.x.some_key":
// "app.agent.memory_title" -> "Memory title".
export function humanizeKey(key: string): string {
  const last = key.split(".").pop() || key;
  const words = last.replace(/_/g, " ").trim();
  return words ? words.charAt(0).toUpperCase() + words.slice(1) : key;
}

export function t(
  key: string,
  params?: Record<string, string | number>,
  locale?: Locale,
): string {
  const keys = key.split(".");
  const lang = locale ?? currentLocale();
  let value: unknown =
    lang === "en" ? undefined : lookup(translations[lang], keys);
  if (typeof value !== "string") value = lookup(translations.en, keys);
  if (typeof value !== "string") value = humanizeKey(key);

  let out = value as string;
  if (params) {
    Object.entries(params).forEach(([k, v]) => {
      out = out.replace(`{{${k}}}`, String(v));
    });
  }
  return out || key;
}

export default t;
