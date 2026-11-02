"use client";

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

// The Juvo site's interactive parts (delivery_sdk 1.2.0): the header (its
// menu on every width, the theme switch and the Log in / Sign up pair
// through base's HeaderAuthSlot), the order walkthrough, the app tabs, the
// device switch on the manager's full tour and the copy button on a demo
// email. Every word arrives as a prop from juvo-copy.ts; every picture
// arrives resolved (juvo-media.tsx).
//
// Motion: the walkthrough autoplays only while it is on screen, not
// hovered, not paused and when the visitor has not asked for reduced
// motion (then it waits on the step buttons); juvo.css drops every
// transition and animation under prefers-reduced-motion.

import { RiArrowRightLine, RiCheckLine, RiCloseLine, RiFileCopyLine, RiMenuLine, RiMoonLine, RiPauseFill, RiPlayFill, RiSunLine } from "@remixicon/react";
import Link from "next/link";
import { useTheme } from "next-themes";
import { useCallback, useEffect, useId, useRef, useState, type ReactNode } from "react";

import { HeaderAuthSlot } from "@/components/custom/header-auth-slot";

import type { JuvoFlowStep, JuvoIcon, JuvoNavLink } from "./juvo-copy";
import { JuvoGlyph } from "./juvo-icons";
import { JuvoImg, type JuvoImage } from "./juvo-media";

/** The pair's classes in the header's own design (juvo.css). */
const AUTH_BAR = { login: "jv-auth-login", signup: "jv-auth-signup" };
const AUTH_PANEL = { login: "jv-auth-panel-login", signup: "jv-auth-panel-signup" };

function usePrefersReducedMotion(): boolean {
  const [reduce, setReduce] = useState(false);
  useEffect(() => {
    const mq = window.matchMedia("(prefers-reduced-motion: reduce)");
    const on = () => setReduce(mq.matches);
    on();
    mq.addEventListener("change", on);
    return () => mq.removeEventListener("change", on);
  }, []);
  return reduce;
}

export function JuvoThemeSwitch({ label }: { label: string }) {
  const { resolvedTheme, setTheme } = useTheme();
  return (
    <button
      type="button"
      className="icon-btn jv-theme"
      aria-label={label}
      onClick={() => setTheme(resolvedTheme === "dark" ? "light" : "dark")}
    >
      <RiMoonLine className="theme-light" size={19} aria-hidden />
      <RiSunLine className="theme-dark" size={19} aria-hidden />
    </button>
  );
}

export function JuvoHeader({
  brand,
  nav,
  current,
  labels,
  cta,
}: {
  brand: { word: string; small: string; mark: string; homeLabel: string };
  nav: JuvoNavLink[];
  current?: string;
  labels: { menuOpen: string; menuClose: string; theme: string };
  cta: { label: string; href: string };
}) {
  const [open, setOpen] = useState(false);
  const panelId = useId();
  const close = useCallback(() => setOpen(false), []);

  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setOpen(false);
    };
    const onResize = () => {
      if (window.innerWidth > 1080) setOpen(false);
    };
    window.addEventListener("keydown", onKey);
    window.addEventListener("resize", onResize);
    return () => {
      window.removeEventListener("keydown", onKey);
      window.removeEventListener("resize", onResize);
    };
  }, [open]);

  return (
    <header className={open ? "nav open" : "nav"}>
      <div className="wrap">
        <Link className="brand" href="/" aria-label={brand.homeLabel}>
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={brand.mark} alt="" width={34} height={34} />
          {brand.word} <small>{brand.small}</small>
        </Link>
        <nav className="menu" aria-label="Main">
          <ul>
            {nav.map((n) => (
              <li key={n.href}>
                <Link href={n.href} aria-current={n.href === current ? "page" : undefined}>
                  {n.label}
                </Link>
              </li>
            ))}
          </ul>
        </nav>
        <div className="actions">
          <JuvoThemeSwitch label={labels.theme} />
          <span className="jv-auth-bar">
            <HeaderAuthSlot variant="bar" classes={AUTH_BAR} />
          </span>
          <Link className="btn btn-brand jv-cta" href={cta.href}>
            {cta.label} <RiArrowRightLine size={18} aria-hidden />
          </Link>
          <button
            type="button"
            className="icon-btn menu-btn"
            aria-label={open ? labels.menuClose : labels.menuOpen}
            aria-expanded={open}
            aria-controls={panelId}
            onClick={() => setOpen((o) => !o)}
          >
            {open ? <RiCloseLine size={20} aria-hidden /> : <RiMenuLine size={20} aria-hidden />}
          </button>
        </div>
      </div>
      <div id={panelId} className="mpanel" hidden={!open}>
        <div className="wrap">
          <ul>
            {nav.map((n) => (
              <li key={n.href}>
                <Link href={n.href} onClick={close} aria-current={n.href === current ? "page" : undefined}>
                  {n.label}
                  <RiArrowRightLine size={18} aria-hidden />
                </Link>
              </li>
            ))}
          </ul>
          <div className="mpanel-auth">
            <HeaderAuthSlot variant="panel" classes={AUTH_PANEL} onNavigate={close} />
          </div>
        </div>
      </div>
    </header>
  );
}

/** One lane of the walkthrough, with its screens resolved. */
export interface JuvoFlowLane {
  icon: JuvoIcon;
  label: string;
  short: string;
  device: "phone" | "tablet";
  screens: { img: JuvoImage; steps: number[] }[];
}

const STEP_MS = 4600;

export function JuvoFlow({
  steps,
  lanes,
  labels,
}: {
  steps: JuvoFlowStep[];
  lanes: JuvoFlowLane[];
  labels: { rail: string; lanes: string; play: string; pause: string; stepOf: string };
}) {
  const reduce = usePrefersReducedMotion();
  const [cur, setCur] = useState(0);
  const [userPaused, setUserPaused] = useState(false);
  const [hovering, setHovering] = useState(false);
  const [inView, setInView] = useState(false);
  const [manualLane, setManualLane] = useState<number | null>(null);
  const [tick, setTick] = useState(0);
  const rootRef = useRef<HTMLDivElement>(null);
  const railRef = useRef<HTMLDivElement>(null);
  const [fill, setFill] = useState({ left: 0, width: 0 });

  const playing = inView && !hovering && !userPaused && !reduce;

  useEffect(() => {
    const el = rootRef.current;
    if (!el || !("IntersectionObserver" in window)) {
      setInView(true);
      return;
    }
    const io = new IntersectionObserver((es) => setInView(es[0]?.isIntersecting ?? false), { threshold: 0.35 });
    io.observe(el);
    return () => io.disconnect();
  }, []);

  useEffect(() => {
    if (!playing) return;
    const t = window.setTimeout(() => {
      setManualLane(null);
      setCur((c) => (c + 1) % steps.length);
      setTick((k) => k + 1);
    }, STEP_MS);
    return () => window.clearTimeout(t);
  }, [playing, cur, tick, steps.length]);

  const measure = useCallback(() => {
    const rail = railRef.current;
    if (!rail) return;
    const pins = rail.querySelectorAll<HTMLElement>(".pin");
    const first = pins[0]?.getBoundingClientRect();
    const at = pins[cur]?.getBoundingClientRect();
    const box = rail.getBoundingClientRect();
    if (!first || !at) return;
    const left = first.left + first.width / 2 - box.left;
    setFill({ left, width: Math.max(0, at.left + at.width / 2 - (first.left + first.width / 2)) });
  }, [cur]);

  useEffect(() => {
    measure();
    window.addEventListener("resize", measure);
    return () => window.removeEventListener("resize", measure);
  }, [measure]);

  const step = steps[cur];
  const shownLane = manualLane ?? step.active[step.active.length === lanes.length ? 1 : 0];
  const stepLabel = labels.stepOf.replace("{i}", String(cur + 1)).replace("{n}", String(steps.length));

  return (
    <div ref={rootRef}>
      <div className="rail" role="tablist" aria-label={labels.rail} ref={railRef}>
        <div className="fill" style={{ left: fill.left, width: fill.width }} />
        {steps.map((s, k) => (
          <button
            key={s.title}
            type="button"
            role="tab"
            aria-selected={k === cur}
            className={`stop${k === cur ? " on" : ""}${k < cur ? " done" : ""}`}
            onClick={() => {
              setUserPaused(true);
              setManualLane(null);
              setCur(k);
            }}
          >
            <span className="pin">
              <JuvoGlyph name={s.icon} />
            </span>
            <b>{s.title}</b>
            <span className="d">{s.text}</span>
          </button>
        ))}
      </div>

      <p className="stepdesc" aria-live="polite">
        {step.text}
      </p>

      <div className="mtabs" role="group" aria-label={labels.lanes}>
        {lanes.map((l, k) => (
          <button
            key={l.label}
            type="button"
            aria-pressed={k === shownLane}
            onClick={() => {
              setUserPaused(true);
              setManualLane(k);
            }}
          >
            {l.short}
          </button>
        ))}
      </div>

      <div className="trio" onMouseEnter={() => setHovering(true)} onMouseLeave={() => setHovering(false)}>
        {lanes.map((l, k) => (
          <div
            key={l.label}
            className={`lane${step.active.includes(k) ? " on" : ""}${k === shownLane ? " mshow" : ""}`}
          >
            <div className="who">
              <JuvoGlyph name={l.icon} />
              {l.label}
            </div>
            <div className={l.device}>
              {l.screens.map((sc) => (
                <JuvoImg
                  key={sc.img.src}
                  img={sc.img}
                  sizes={l.device === "tablet" ? "(max-width: 720px) 92vw, 46vw" : "(max-width: 720px) 76vw, 280px"}
                  className={sc.steps.includes(cur) ? "show" : undefined}
                />
              ))}
            </div>
            <p className="cap">{step.captions[k]}</p>
          </div>
        ))}
      </div>

      <div className="flow-ctrl">
        <button
          type="button"
          className="icon-btn"
          aria-label={playing ? labels.pause : labels.play}
          onClick={() => setUserPaused(playing)}
        >
          {playing ? <RiPauseFill size={19} aria-hidden /> : <RiPlayFill size={19} aria-hidden />}
        </button>
        <span className={playing ? "tbar run" : "tbar"} key={`${cur}-${tick}-${playing}`} style={{ ["--dur" as string]: `${STEP_MS}ms` }}>
          <i />
        </span>
        <span className="mono">{stepLabel}</span>
      </div>
    </div>
  );
}

export function JuvoTabs({
  tabs,
  label,
  children,
}: {
  tabs: { id: string; label: string; icon: JuvoIcon }[];
  label: string;
  children: ReactNode[];
}) {
  const [on, setOn] = useState(0);
  const base = useId();
  return (
    <>
      <div className="tabs" role="tablist" aria-label={label}>
        {tabs.map((t, k) => (
          <button
            key={t.id}
            type="button"
            role="tab"
            id={`${base}-t-${t.id}`}
            aria-controls={`${base}-p-${t.id}`}
            aria-selected={k === on}
            tabIndex={k === on ? 0 : -1}
            className="tab"
            onClick={() => setOn(k)}
            onKeyDown={(e) => {
              if (e.key !== "ArrowRight" && e.key !== "ArrowLeft") return;
              const next = (on + (e.key === "ArrowRight" ? 1 : tabs.length - 1)) % tabs.length;
              setOn(next);
              document.getElementById(`${base}-t-${tabs[next].id}`)?.focus();
            }}
          >
            <JuvoGlyph name={t.icon} />
            {t.label}
          </button>
        ))}
      </div>
      {tabs.map((t, k) => (
        <div
          key={t.id}
          className={k === on ? "panel on" : "panel"}
          role="tabpanel"
          id={`${base}-p-${t.id}`}
          aria-labelledby={`${base}-t-${t.id}`}
          hidden={k !== on}
        >
          {children[k]}
        </div>
      ))}
    </>
  );
}

export function JuvoDeviceSwitch({
  label,
  options,
  children,
}: {
  label: string;
  options: { id: string; label: string; icon: JuvoIcon }[];
  children: ReactNode[];
}) {
  const [on, setOn] = useState(0);
  return (
    <>
      <div className="devswitch" role="group" aria-label={label}>
        {options.map((o, k) => (
          <button key={o.id} type="button" aria-pressed={k === on} onClick={() => setOn(k)}>
            <JuvoGlyph name={o.icon} />
            {o.label}
          </button>
        ))}
      </div>
      {options.map((o, k) => (
        <div key={o.id} hidden={k !== on}>
          {children[k]}
        </div>
      ))}
    </>
  );
}

export function JuvoCopy({ value, label, done }: { value: string; label: string; done: string }) {
  const [copied, setCopied] = useState(false);
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null);
  useEffect(() => () => {
    if (timer.current) clearTimeout(timer.current);
  }, []);
  const mark = () => {
    setCopied(true);
    if (timer.current) clearTimeout(timer.current);
    timer.current = setTimeout(() => setCopied(false), 1600);
  };
  return (
    <button
      type="button"
      className={copied ? "copy done" : "copy"}
      aria-label={copied ? done : label}
      onClick={() => {
        if (navigator.clipboard?.writeText) navigator.clipboard.writeText(value).then(mark, mark);
        else mark();
      }}
    >
      {copied ? <RiCheckLine size={17} aria-hidden /> : <RiFileCopyLine size={17} aria-hidden />}
    </button>
  );
}
