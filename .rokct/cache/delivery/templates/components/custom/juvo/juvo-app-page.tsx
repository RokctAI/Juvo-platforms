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

// An app page at /apps/<app> (delivery_sdk 1.2.0). Ray, 2026-11-01: each
// paas app gets "its own page showing off its features", with links to
// download it for Windows and Android as a demo and its demo account; and
// the manager "in tablet mode" as well as on a phone. The page: the hero,
// the feature chapters (their titles and captions are today's tour
// guide's), the full tour in order (every step the README gallery keeps,
// read live; the manager's in both runs), the demo block (the latest
// release's two builds, the demo address and how to sign in) and the
// other two apps.

import { RiAndroidLine, RiArrowRightSLine, RiArrowRightUpLine, RiDownload2Line, RiWindowsLine } from "@remixicon/react";
import Link from "next/link";

import { JuvoCopy, JuvoDeviceSwitch } from "./juvo-client";
import { JUVO_APP_COMMON, JUVO_APP_ORDER, JUVO_APP_PAGES, juvoAppHref, type JuvoAppPage, type JuvoChapter } from "./juvo-copy";
import { JuvoGlyph } from "./juvo-icons";
import type { JuvoTour } from "./juvo-load";
import { Device, Display, JuvoFrame, Phone, Tablet, ThemedScreen, resolveShot, type JuvoTours } from "./juvo-parts";
import { formatBuildSize, type JuvoBuild } from "./juvo-releases";
import { JUVO_TOUR_SIZES, isExcluded, juvoTourSrc, stepFor, type JuvoAppId, type JuvoTourStep } from "./juvo-tour";

/** The steps the full tour shows: the guide's, minus the README gallery's exclusions and the page's own skips. */
export function galleryStepsOf(page: JuvoAppPage, tour: JuvoTour): JuvoTourStep[] {
  return tour.steps.filter((s) => !isExcluded(s, tour.exclusions) && !page.gallerySkip.includes(s.slug));
}

function AppHero({ page, tours }: { page: JuvoAppPage; tours: JuvoTours }) {
  const isTab = page.hero[0]?.device === "tablet";
  return (
    <section className="apphero">
      <div className="wrap">
        <div className="ah-copy">
          <nav className="crumbs mono" aria-label="Breadcrumb">
            <Link href="/">{JUVO_APP_COMMON.crumbs.home}</Link> <RiArrowRightSLine size={14} aria-hidden />{" "}
            <Link href="/#apps">{JUVO_APP_COMMON.crumbs.apps}</Link> <RiArrowRightSLine size={14} aria-hidden />{" "}
            <span aria-current="page">{page.short}</span>
          </nav>
          <span className="eyebrow mono">{page.eyebrow}</span>
          <Display as="h1" text={page.title} it={page.titleIt} />
          <p className="lede">{page.lede}</p>
          <div className="ctas">
            <a className="btn btn-brand" href="#demo">
              <RiDownload2Line size={19} aria-hidden /> {JUVO_APP_COMMON.primary}
            </a>
            <a className="btn btn-ghost" href="#features">
              {JUVO_APP_COMMON.secondary}
            </a>
          </div>
        </div>
        {isTab ? (
          <div className="ah-stage tabstage">
            <div className="sun" aria-hidden />
            <Tablet img={resolveShot(tours, page.hero[0])} className="t-main" sizes="(max-width: 900px) 88vw, 600px" preload />
            <Phone img={resolveShot(tours, page.hero[1])} className="p-over" sizes="(max-width: 900px) 28vw, 190px" preload />
          </div>
        ) : (
          <div className="ah-stage">
            <div className="sun" aria-hidden />
            <Phone img={resolveShot(tours, page.hero[0])} className="p-l" sizes="(max-width: 900px) 32vw, 200px" preload />
            <Phone img={resolveShot(tours, page.hero[1])} className="p-c" sizes="(max-width: 900px) 37vw, 230px" preload />
            <Phone img={resolveShot(tours, page.hero[2])} className="p-r" sizes="(max-width: 900px) 32vw, 200px" preload />
          </div>
        )}
      </div>
    </section>
  );
}

function Chapter({ chapter, n, flip, app, tours }: { chapter: JuvoChapter; n: number; flip: boolean; app: JuvoAppId; tours: JuvoTours }) {
  const tour = tours[app];
  const caps = chapter.caps.flatMap((slug) => {
    const s = tour ? stepFor(tour.steps, slug) : null;
    return s && s.caption ? [s] : [];
  });
  const hasTab = chapter.screens.some((s) => s.device === "tablet");
  const cls = ["chapter", flip ? "flip" : "", hasTab ? "has-tab" : ""].filter(Boolean).join(" ");
  return (
    <article className={cls}>
      <div className="ch-copy">
        <span className="ch-n mono">{String(n).padStart(2, "0")}</span>
        <span className="ic">
          <JuvoGlyph name={chapter.icon} />
        </span>
        <h3 className="display">{chapter.title}</h3>
        <p>{chapter.text}</p>
        {caps.length > 0 ? (
          <ul className="ch-caps">
            {caps.map((s) => (
              <li key={s.slug}>
                <b>{s.title}</b>
                <span>{s.caption}</span>
              </li>
            ))}
          </ul>
        ) : null}
      </div>
      <div className="ch-devs">
        {chapter.screens.map((sh, i) => (
          <Device
            key={`${sh.device}-${sh.slug}-${i}`}
            tours={tours}
            shot={sh}
            className={hasTab ? undefined : "d-ph"}
            sizes={sh.device === "tablet" ? "(max-width: 900px) 92vw, 620px" : hasTab ? "(max-width: 900px) 28vw, 180px" : "(max-width: 900px) 46vw, 250px"}
          />
        ))}
        {chapter.svg ? <ThemedScreen app={app} light={chapter.svg.light} dark={chapter.svg.dark} alt={chapter.svg.alt} /> : null}
      </div>
    </article>
  );
}

function GalleryGrid({ app, steps, device }: { app: JuvoAppId; steps: JuvoTourStep[]; device: "phone" | "tablet" }) {
  const size = JUVO_TOUR_SIZES[device];
  return (
    <div className={device === "tablet" ? "gallery wide" : "gallery"}>
      {steps.map((s) => {
        const img = { src: juvoTourSrc(app, device, s.file), width: size.width, height: size.height, alt: s.title };
        return (
          <figure key={s.file}>
            {device === "tablet" ? (
              <Tablet img={img} sizes="(max-width: 720px) 92vw, 380px" />
            ) : (
              <Phone img={img} sizes="(max-width: 720px) 44vw, 180px" />
            )}
            <figcaption>
              <b>{s.title}</b>
            </figcaption>
          </figure>
        );
      })}
    </div>
  );
}

function Gallery({ page, tour }: { page: JuvoAppPage; tour: JuvoTour }) {
  const steps = galleryStepsOf(page, tour);
  if (steps.length === 0) return null;
  const c = JUVO_APP_COMMON;
  return (
    <section className="sec gallery-sec">
      <div className="wrap">
        <div className="head">
          <div>
            <span className="eyebrow mono">{c.galleryEyebrow}</span>
            <Display text={c.galleryTitle} it={c.galleryTitleIt} />
          </div>
          <p>{c.galleryBody}</p>
        </div>
        {page.galleryTablet ? (
          <JuvoDeviceSwitch
            label={c.galleryDevices.label}
            options={[
              { id: "tablet", label: c.galleryDevices.tablet, icon: "tablet" },
              { id: "phone", label: c.galleryDevices.phone, icon: "smartphone" },
            ]}
          >
            <GalleryGrid app={page.app} steps={steps} device="tablet" />
            <GalleryGrid app={page.app} steps={steps} device="phone" />
          </JuvoDeviceSwitch>
        ) : (
          <GalleryGrid app={page.app} steps={steps} device="phone" />
        )}
      </div>
    </section>
  );
}

function BuildLink({ build }: { build: JuvoBuild }) {
  const c = JUVO_APP_COMMON.builds;
  const words = c[build.id];
  const detail = build.direct
    ? [words.kind, build.version, formatBuildSize(build.bytes)].filter(Boolean).join(" · ")
    : c.page;
  return (
    <a className="dlbig" href={build.href} rel="noopener" {...(build.direct ? {} : { target: "_blank" })}>
      {build.id === "android" ? <RiAndroidLine size={28} aria-hidden /> : <RiWindowsLine size={28} aria-hidden />}
      <div>
        <b>{words.label}</b>
        <span>{detail}</span>
      </div>
      {build.direct ? <RiDownload2Line className="go" size={20} aria-hidden /> : <RiArrowRightUpLine className="go" size={20} aria-hidden />}
    </a>
  );
}

function Demo({ page, builds }: { page: JuvoAppPage; builds: JuvoBuild[] }) {
  const c = JUVO_APP_COMMON;
  return (
    <section className="talk" id="demo">
      <div className="wrap">
        <div className="talkbox demo">
          <div>
            <span className="eyebrow mono on-night">{c.demoEyebrow}</span>
            <Display text={c.demoTitle} it={c.demoTitleIt} className="talk-title" />
            <p>{c.demoBody(page.name)}</p>
            <div className="dls">
              {builds.map((b) => (
                <BuildLink key={b.id} build={b} />
              ))}
            </div>
          </div>
          <div className="login">
            <span className="mono">{c.signIn}</span>
            <ol className="demo-steps">
              {page.demo.steps.map((s) => (
                <li key={s}>{s}</li>
              ))}
            </ol>
            <div className="field">
              <span className="flabel">{c.email}</span>
              <div className="val">
                <code>{page.demo.email}</code>
                <JuvoCopy value={page.demo.email} label={c.copy} done={c.copied} />
              </div>
            </div>
            <div className="field">
              <span className="flabel">{c.password}</span>
              <div className="val gap">
                <span>{c.passwordText}</span>
              </div>
            </div>
            <p className="fine">{c.fine}</p>
          </div>
        </div>
      </div>
    </section>
  );
}

function Others({ app }: { app: JuvoAppId }) {
  return (
    <section className="others-sec">
      <div className="wrap">
        <span className="eyebrow mono">{JUVO_APP_COMMON.othersEyebrow}</span>
        <div className="others">
          {JUVO_APP_ORDER.filter((a) => a !== app).map((a) => {
            const p = JUVO_APP_PAGES[a];
            return (
              <Link key={a} className="other" href={juvoAppHref(a)}>
                <span className="ic">
                  <JuvoGlyph name={p.icon} />
                </span>
                <div>
                  <span className="mono">{p.eyebrow}</span>
                  <b>{p.name}</b>
                </div>
                <RiArrowRightUpLine className="go" size={22} aria-hidden />
              </Link>
            );
          })}
        </div>
      </div>
    </section>
  );
}

export function JuvoAppPageView({ app, tours, builds }: { app: JuvoAppId; tours: JuvoTours; builds: JuvoBuild[] }) {
  const page = JUVO_APP_PAGES[app];
  const tour = tours[app];
  const c = JUVO_APP_COMMON;
  return (
    <JuvoFrame current={juvoAppHref(app)}>
      <div className={`app-page app-${app}`}>
        <AppHero page={page} tours={tours} />
        <section className="sec feat-sec" id="features">
          <div className="wrap">
            <div className="head">
              <div>
                <span className="eyebrow mono">{c.featuresEyebrow}</span>
                <Display text={c.featuresTitle(page.short)} it={c.featuresTitleIt} />
              </div>
              <p>{c.featuresBody}</p>
            </div>
            {page.note ? (
              <div className="note-card">
                <span className="ic">
                  <JuvoGlyph name={page.note.icon} />
                </span>
                <div>
                  <b>{page.note.title}</b>
                  <span>{page.note.text}</span>
                </div>
              </div>
            ) : null}
            {page.chapters.map((ch, i) => (
              <Chapter key={ch.title} chapter={ch} n={i + 1} flip={i % 2 === 1} app={app} tours={tours} />
            ))}
          </div>
        </section>
        {tour ? <Gallery page={page} tour={tour} /> : null}
        <Demo page={page} builds={builds} />
        <Others app={app} />
      </div>
    </JuvoFrame>
  );
}
