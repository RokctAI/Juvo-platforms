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

const merged: Record<string, any> = JSON.parse(JSON.stringify(en));
for (const bundle of sdkTranslations) deepMerge(merged, bundle.en || {});

const translations: Record<string, any> = {
  en: merged,
};

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
): string {
  const keys = key.split(".");
  let value: any = translations.en;

  for (const k of keys) {
    if (value && value[k]) {
      value = value[k];
    } else {
      value = humanizeKey(key);
      break;
    }
  }

  if (typeof value === "string" && params) {
    Object.entries(params).forEach(([k, v]) => {
      value = value.replace(`{{${k}}}`, String(v));
    });
  }

  return value || key;
}

export default t;
