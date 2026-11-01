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

// The Juvo home at `/` (delivery_sdk 1.2.0): the concept Ray approved on
// 2026-11-01, in this order - the hero (the manager on a tablet with the
// customer and driver phones), the ticker, the order walkthrough across
// the three apps, the apps with a tab each, the white-label story, what is
// included, and the closing call to sign up or try the demos. Words in
// juvo-copy.ts, tokens in juvo.css, interaction in juvo-client.tsx.

import { RiArrowRightLine, RiDownload2Line, RiPlayCircleLine } from "@remixicon/react";
import Link from "next/link";
import { Fragment } from "react";

import { JuvoFlow, JuvoTabs, type JuvoFlowLane } from "./juvo-client";
import {
  JUVO_APPS_SECTION,
  JUVO_CLOSING,
  JUVO_FLOW,
  JUVO_HERO,
  JUVO_INCLUDED,
  JUVO_STORY,
  JUVO_TICKER,
  juvoAppHref,
  type JuvoHomePanel,
} from "./juvo-copy";
import { JuvoGlyph } from "./juvo-icons";
import { Device, Display, JuvoFrame, Phone, Tablet, resolveShot, type JuvoTours } from "./juvo-parts";

function Hero({ tours }: { tours: JuvoTours }) {
  const [customer, driver] = JUVO_HERO.phones;
  return (
    <section className="hero">
      <div className="wrap">
        <div className="copy-a">
          <span className="eyebrow mono">{JUVO_HERO.eyebrow}</span>
          <h1 className="display">
            {JUVO_HERO.title}{" "}
            <span className="it">
              {JUVO_HERO.titleParts.map((p, i) => (
                <Fragment key={p}>
                  {i > 0 ? " " : null}
                  <span className="nw">{p}</span>
                </Fragment>
              ))}
            </span>
          </h1>
        </div>
        <div className="copy-b">
          <p className="lede">{JUVO_HERO.lede}</p>
          <div className="ctas">
            <Link className="btn btn-brand" href={JUVO_HERO.primary.href}>
              {JUVO_HERO.primary.label} <RiArrowRightLine size={19} aria-hidden />
            </Link>
            <Link className="btn btn-ghost" href={JUVO_HERO.secondary.href}>
              <RiPlayCircleLine size={19} aria-hidden /> {JUVO_HERO.secondary.label}
            </Link>
          </div>
          <div className="trust">
            {JUVO_HERO.trust.map((t) => (
              <span key={t.text}>
                <JuvoGlyph name={t.icon} />
                {t.text}
              </span>
            ))}
          </div>
        </div>
        <div className="stage" aria-label={JUVO_HERO.stageLabel} role="group">
          <div className="sun" aria-hidden />
          <svg className="route-svg" viewBox="0 0 600 640" preserveAspectRatio="none" aria-hidden>
            <path d="M40 600 C 140 520, 120 420, 230 400 S 420 330, 470 220 S 560 90, 590 40" />
          </svg>
          <Tablet img={resolveShot(tours, JUVO_HERO.tablet)} className="t-m" sizes="(max-width: 900px) 92vw, 600px" preload />
          <Phone img={resolveShot(tours, driver)} className="p-d" sizes="(max-width: 900px) 32vw, 190px" preload />
          <Phone img={resolveShot(tours, customer)} className="p-c" sizes="(max-width: 900px) 34vw, 200px" preload />
          <div className="legend" aria-hidden>
            {JUVO_HERO.legend.map((l) => (
              <span key={l.label}>
                <JuvoGlyph name={l.icon} />
                {l.label}
              </span>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}

function Ticker() {
  const run = [...JUVO_TICKER, ...JUVO_TICKER];
  return (
    <div className="ticker" aria-hidden>
      <div className="ticker-track">
        {run.map((t, i) => (
          <span key={`${t.label}-${i}`}>
            <JuvoGlyph name={t.icon} />
            {t.label}
          </span>
        ))}
      </div>
    </div>
  );
}

function Flow({ tours }: { tours: JuvoTours }) {
  const lanes: JuvoFlowLane[] = JUVO_FLOW.lanes.map((l) => ({
    icon: l.icon,
    label: l.label,
    short: l.short,
    device: l.device,
    screens: l.screens.flatMap((s) => {
      const img = resolveShot(tours, s);
      return img ? [{ img, steps: s.steps }] : [];
    }),
  }));
  return (
    <section className="flow sec" id="flow">
      <div className="wrap">
        <div className="head">
          <div>
            <span className="eyebrow mono">{JUVO_FLOW.eyebrow}</span>
            <Display text={JUVO_FLOW.title} it={JUVO_FLOW.titleIt} end={JUVO_FLOW.titleEnd} />
          </div>
          <p>{JUVO_FLOW.body}</p>
        </div>
        <JuvoFlow
          steps={JUVO_FLOW.steps}
          lanes={lanes}
          labels={{ rail: JUVO_FLOW.railLabel, lanes: JUVO_FLOW.lanesLabel, play: JUVO_FLOW.play, pause: JUVO_FLOW.pause, stepOf: JUVO_FLOW.stepOf }}
        />
      </div>
    </section>
  );
}

function Panel({ panel, tours }: { panel: JuvoHomePanel; tours: JuvoTours }) {
  const href = juvoAppHref(panel.app);
  const paired = panel.shelf.some((s) => s.shots.length > 1);
  return (
    <>
      <div>
        <span className="mono eyebrow">{panel.eyebrow}</span>
        <h3 className="display panel-title">{panel.title}</h3>
        <p className="tagl">{panel.tagline}</p>
        <ul className="feat">
          {panel.features.map((f) => (
            <li key={f.title}>
              <span className="fi">
                <JuvoGlyph name={f.icon} />
              </span>
              <div>
                <b>{f.title}</b>
                <span>{f.text}</span>
              </div>
            </li>
          ))}
        </ul>
        <div className="dl">
          <Link className="more" href={href}>
            {JUVO_APPS_SECTION.more(panel.tab)} <RiArrowRightLine size={18} aria-hidden />
          </Link>
          <Link href={`${href}#demo`}>
            <RiDownload2Line size={18} aria-hidden />
            {JUVO_APPS_SECTION.demo}
          </Link>
        </div>
      </div>
      {paired ? (
        <div className="devwrap">
          <p className="devnote mono">
            <JuvoGlyph name="tablet" /> {JUVO_APPS_SECTION.devnote.tablet} <JuvoGlyph name="smartphone" /> {JUVO_APPS_SECTION.devnote.phone}
          </p>
          <div className="shelf wide">
            {panel.shelf.map((s) => (
              <figure key={s.title}>
                <div className="pair">
                  {s.shots.map((sh) => (
                    <Device key={`${sh.device}-${sh.slug}`} tours={tours} shot={sh} sizes={sh.device === "tablet" ? "(max-width: 900px) 80vw, 560px" : "(max-width: 900px) 22vw, 140px"} />
                  ))}
                </div>
                <figcaption>
                  <b>{s.title}</b>
                  {s.text}
                </figcaption>
              </figure>
            ))}
          </div>
        </div>
      ) : (
        <div className="shelf">
          {panel.shelf.map((s) => (
            <figure key={s.title}>
              <Device tours={tours} shot={s.shots[0]} sizes="(max-width: 900px) 46vw, 240px" />
              <figcaption>
                <b>{s.title}</b>
                {s.text}
              </figcaption>
            </figure>
          ))}
        </div>
      )}
    </>
  );
}

function Apps({ tours }: { tours: JuvoTours }) {
  const panels = JUVO_APPS_SECTION.panels;
  return (
    <section className="sec" id="apps">
      <div className="wrap">
        <div className="head">
          <div>
            <span className="eyebrow mono">{JUVO_APPS_SECTION.eyebrow}</span>
            <Display text={JUVO_APPS_SECTION.title} it={JUVO_APPS_SECTION.titleIt} />
          </div>
          <p>{JUVO_APPS_SECTION.body}</p>
        </div>
        <JuvoTabs label={JUVO_APPS_SECTION.tabsLabel} tabs={panels.map((p) => ({ id: p.app, label: p.tab, icon: p.icon }))}>
          {panels.map((p) => (
            <Panel key={p.app} panel={p} tours={tours} />
          ))}
        </JuvoTabs>
      </div>
    </section>
  );
}

function Story({ tours }: { tours: JuvoTours }) {
  return (
    <section className="story sec" id="launch">
      <div className="wrap">
        <div className="brandframe">
          <Phone img={resolveShot(tours, JUVO_STORY.screen)} sizes="(max-width: 720px) 62vw, 290px" />
          {JUVO_STORY.callouts.map((c, i) => (
            <div key={c.label} className={`callout c${i + 1}`}>
              <JuvoGlyph name={c.icon} />
              {c.label}
            </div>
          ))}
        </div>
        <div>
          <span className="eyebrow mono">{JUVO_STORY.eyebrow}</span>
          <Display text={JUVO_STORY.title} it={JUVO_STORY.titleIt} />
          <p className="sub">{JUVO_STORY.body}</p>
          <ol className="steps">
            {JUVO_STORY.steps.map((s) => (
              <li key={s.title}>
                <div>
                  <b>{s.title}</b>
                  <span>{s.text}</span>
                </div>
              </li>
            ))}
          </ol>
        </div>
      </div>
    </section>
  );
}

function Included({ tours }: { tours: JuvoTours }) {
  const inc = JUVO_INCLUDED;
  return (
    <section className="sec" id="included">
      <div className="wrap">
        <div className="head">
          <div>
            <span className="eyebrow mono">{inc.eyebrow}</span>
            <Display text={inc.title} it={inc.titleIt} />
          </div>
          <p>{inc.body}</p>
        </div>
        <div className="bento">
          <div className="tile t-apps">
            <span className="ic">
              <JuvoGlyph name={inc.apps.icon} />
            </span>
            <h4>{inc.apps.title}</h4>
            <p>{inc.apps.text}</p>
            <div className="minis">
              {inc.apps.minis.map((m) => (
                <div key={m.label}>
                  <Phone img={resolveShot(tours, m.shot)} sizes="(max-width: 720px) 28vw, 170px" />
                  <div className="lbl mono">{m.label}</div>
                </div>
              ))}
            </div>
          </div>
          <div className="tile t-erp">
            <span className="ic">
              <JuvoGlyph name={inc.erp.icon} />
            </span>
            <h4>{inc.erp.title}</h4>
            <p>{inc.erp.text}</p>
            <div className="stack">
              {inc.erp.stack.map((s) => (
                <div key={s.label}>
                  {s.label} <JuvoGlyph name={s.icon} />
                </div>
              ))}
            </div>
          </div>
          {inc.tiles.map((t) => (
            <div key={t.title} className={`tile span${t.span}`}>
              <span className="ic">
                <JuvoGlyph name={t.icon} />
              </span>
              <h4>{t.title}</h4>
              <p>{t.text}</p>
            </div>
          ))}
          <div className="tile span3">
            <span className="ic">
              <JuvoGlyph name={inc.details.icon} />
            </span>
            <h4>{inc.details.title}</h4>
            <p>{inc.details.text}</p>
            <div className="chips">
              {inc.details.chips.map((c) => (
                <span key={c}>{c}</span>
              ))}
            </div>
          </div>
        </div>
        <div className="uses">
          {inc.uses.map((u) => (
            <div key={u.title} className="use">
              <Phone img={resolveShot(tours, u.shot)} sizes="96px" />
              <div>
                <b>{u.title}</b>
                <span>{u.text}</span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

function Closing() {
  const c = JUVO_CLOSING;
  return (
    <section className="talk" id="talk">
      <div className="wrap">
        <div className="talkbox">
          <div>
            <span className="eyebrow mono on-night">{c.eyebrow}</span>
            <Display text={c.title} it={c.titleIt} className="talk-title" />
            <p>{c.body}</p>
            <div className="talk-ctas">
              <Link className="btn btn-brand" href={c.primary.href}>
                {c.primary.label} <RiArrowRightLine size={19} aria-hidden />
              </Link>
              <Link className="btn btn-ghost" href={c.secondary.href}>
                {c.secondary.label}
              </Link>
            </div>
          </div>
          <div className="facts">
            {c.facts.map((f) => (
              <div key={f.title} className="fact">
                <JuvoGlyph name={f.icon} />
                <div>
                  <b>{f.title}</b>
                  <span>{f.text}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}

export function JuvoHome({ tours }: { tours: JuvoTours }) {
  return (
    <JuvoFrame current="/">
      <Hero tours={tours} />
      <Ticker />
      <Flow tours={tours} />
      <Apps tours={tours} />
      <Story tours={tours} />
      <Included tours={tours} />
      <Closing />
    </JuvoFrame>
  );
}
