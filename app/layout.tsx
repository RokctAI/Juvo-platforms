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

import React from "react";
import { Toaster } from "sonner";
import localFont from "next/font/local";

// Seeded for the deliveryplatform shell from rokctai_frontend's root layout.
// The AI-chat chrome (AiProvider, VisitorTracker, marketing Navbar/Footer) is
// not part of this shell and was trimmed out; product surfaces arrive via
// composed SDKs (base_sdk's /landing, /admin and /manager, auth_sdk's
// /login and /register, delivery_sdk's / and the storefront sections).
import { buildSiteMetadata } from "@/app/lib/site-metadata";
import { SessionProvider } from "@/components/custom/session-provider";
import { ThemeProvider } from "@/components/custom/theme-provider";

import "./globals.css";
import { getRequestLocale } from "@/app/lib/i18n/server";

const geistSans = localFont({
  src: "../public/fonts/geist.woff2",
  variable: "--font-geist-sans",
  weight: "100 900",
});

const geistMono = localFont({
  src: "../public/fonts/geist-mono.woff2",
  variable: "--font-geist-mono",
  weight: "100 900",
});

// The <title>, description, Open Graph and Twitter cards, the generated
// 1200x630 preview and the favicon all come from the copy the home SDK
// (delivery_sdk) registered at components/custom/landing/site-metadata.ts,
// through base_sdk's composed app/lib/site-metadata.ts. Nothing is overridden
// here: no product copy lives in this file, and the canonical origin is
// NEXT_PUBLIC_SITE_URL when the deployment sets one (https://juvo.app), else
// the copy's own url.
export const generateMetadata = () => buildSiteMetadata();

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const lang = await getRequestLocale();
  return (
    <html lang={lang} className={`${geistSans.variable} ${geistMono.variable}`}>
      <head></head>
      <body className="font-sans antialiased">
        <SessionProvider>
          <ThemeProvider
            attribute="class"
            defaultTheme="system"
            enableSystem
            disableTransitionOnChange
          >
            <Toaster position="top-center" />
            {children}
          </ThemeProvider>
        </SessionProvider>
      </body>
    </html>
  );
}
