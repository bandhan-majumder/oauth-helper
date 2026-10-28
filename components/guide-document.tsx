"use client";

import { Check, ChevronDown, ChevronUp, Clock3, Copy, ExternalLink, ShieldCheck, Sparkles } from "lucide-react";
import { useEffect, useState } from "react";
import type { OAuthGuide } from "@/lib/guide-schema";

function GuideSources({ guide }: { guide: OAuthGuide }) {
  const [expanded, setExpanded] = useState(false);
  const hasMore = guide.sources.length > 4;
  const visibleSources = hasMore && !expanded ? guide.sources.slice(0, 4) : guide.sources;
  const listId = `guide-sources-${guide.slug}`;

  return (
    <section className="mt-9 border-t border-white/[0.08] pt-6">
      <div className="flex flex-wrap items-end justify-between gap-3"><div><h2 className="text-lg font-semibold text-zinc-100">Sources and verification</h2><p className="mt-1 text-xs text-zinc-500">{guide.evidenceNote}</p></div><span className="text-[11px] text-zinc-600">Checked {guide.checkedAt}</span></div>
      <ul id={listId} className="mt-4 space-y-2">
        {visibleSources.map((source) => <li key={source.url}><a href={source.url} target="_blank" rel="noreferrer" className="inline-flex items-center gap-2 text-xs text-emerald-300/90 transition hover:text-emerald-200"><ExternalLink className="size-3 shrink-0" />{source.title}</a></li>)}
      </ul>
      {hasMore && <button type="button" aria-expanded={expanded} aria-controls={listId} onClick={() => setExpanded((value) => !value)} className="mt-3 inline-flex items-center gap-1.5 rounded-md text-xs font-medium text-emerald-300 transition hover:text-emerald-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-400/60">
        {expanded ? <>Show fewer sources <ChevronUp className="size-3.5" /></> : <>Show all {guide.sources.length} sources <ChevronDown className="size-3.5" /></>}
      </button>}
    </section>
  );
}

export default function GuideDocument({ guide }: { guide: OAuthGuide }) {
  const [completed, setCompleted] = useState<number[]>([]);
  const [shareCopied, setShareCopied] = useState(false);
  const progressKey = `oauth-guide-progress:v1:${guide.slug}`;

  useEffect(() => {
    window.requestAnimationFrame(() => {
      try {
        const saved = window.localStorage.getItem(progressKey);
        if (saved) {
          const parsed: unknown = JSON.parse(saved);
          if (Array.isArray(parsed) && parsed.every((item) => Number.isInteger(item))) setCompleted(parsed as number[]);
        }
      } catch {
        window.localStorage.removeItem(progressKey);
      }
    });
  }, [progressKey]);

  function toggleStep(index: number) {
    const next = completed.includes(index) ? completed.filter((item) => item !== index) : [...completed, index];
    setCompleted(next);
    try {
      window.localStorage.setItem(progressKey, JSON.stringify(next));
    } catch {
      // Progress remains available for this visit if local storage is unavailable.
    }
  }

  const approvalTone = guide.approval.requirement === "none" ? "border-emerald-400/15 bg-emerald-400/[0.055]" : "border-amber-400/15 bg-amber-400/[0.045]";
  const showRegistrationNotice = guide.origin === "generated" && (guide.registrationAvailability === "not_found" || guide.registrationAvailability === "unclear");

  return (
    <article className="mx-auto w-full max-w-[920px] px-5 py-9 sm:px-9 sm:py-12">
      <div className="flex flex-wrap items-center gap-2 text-[11px] text-zinc-500">
        <span className="rounded-full border border-emerald-400/20 bg-emerald-400/[0.06] px-2.5 py-1 font-medium text-emerald-300">OAuth setup guide</span>
        <span>Checked {guide.checkedAt}</span>
        <span>·</span>
        <span>{guide.origin === "curated" ? "Research-reviewed" : "Generated with web research"}</span>
      </div>

      <div className="mt-5 flex flex-wrap items-start justify-between gap-4">
        <div className="max-w-2xl">
          <p className="text-xs font-medium text-emerald-400">{guide.appDomain}</p>
          <h1 className="mt-2 text-3xl font-semibold tracking-tight text-zinc-100 sm:text-4xl">{guide.appName} OAuth setup</h1>
          <p className="mt-4 max-w-2xl text-sm leading-6 text-zinc-400">{guide.summary}</p>
        </div>
        <div className="flex items-center gap-2">
          <div className="rounded-xl border border-white/[0.08] bg-white/[0.025] px-3.5 py-2.5 text-xs text-zinc-400">
            <span className="text-zinc-500">Difficulty</span><span className="ml-2 capitalize text-zinc-200">{guide.difficulty}</span>
          </div>
          <button type="button" onClick={async () => { try { await navigator.clipboard.writeText(window.location.href); setShareCopied(true); window.setTimeout(() => setShareCopied(false), 1600); } catch { setShareCopied(false); } }} className="inline-flex h-10 items-center gap-2 rounded-xl border border-white/[0.08] px-3 text-xs text-zinc-300 transition hover:bg-white/[0.05]" aria-label="Copy shareable guide link">
            {shareCopied ? <Check className="size-3.5 text-emerald-300" /> : <Copy className="size-3.5" />}{shareCopied ? "Copied link" : "Share guide"}
          </button>
        </div>
      </div>

      {showRegistrationNotice && <section className="mt-7 rounded-xl border border-amber-400/20 bg-amber-400/[0.045] p-4">
        <h2 className="text-sm font-semibold text-zinc-100">{guide.registrationAvailability === "not_found" ? "No public OAuth app registration path found" : "OAuth app registration support is unclear"}</h2>
        <p className="mt-1.5 text-xs leading-5 text-zinc-400">{guide.registrationEvidence}</p>
        <p className="mt-2 text-xs leading-5 text-amber-100/80">This does not prove OAuth is impossible. Confirm directly with the provider before planning implementation; setup and approval times are not estimated.</p>
      </section>}

      {!showRegistrationNotice && <div className="mt-7 grid gap-3 sm:grid-cols-3">
        <div className="rounded-xl border border-white/[0.08] bg-white/[0.025] p-4">
          <div className="flex items-center gap-2 text-[11px] text-zinc-500"><Clock3 className="size-3.5" />Hands-on effort</div>
          <p className="mt-2 text-sm font-medium leading-5 text-zinc-200">{guide.handsOnEstimate}</p>
        </div>
        <div className={`rounded-xl border p-4 ${approvalTone}`}>
          <div className="flex items-center gap-2 text-[11px] text-zinc-500"><ShieldCheck className="size-3.5" />Approval and wait</div>
          <p className="mt-2 text-sm font-medium leading-5 text-zinc-200">{guide.approval.estimate}</p>
          <p className="mt-2 text-[11px] leading-5 text-zinc-500">Depends on: {guide.approval.dependsOn}</p>
        </div>
        <div className="rounded-xl border border-white/[0.08] bg-white/[0.025] p-4">
          <div className="flex items-center gap-2 text-[11px] text-zinc-500"><Clock3 className="size-3.5" />End-to-end estimate</div>
          <p className="mt-2 text-sm font-medium leading-5 text-zinc-200">{guide.elapsedEstimate}</p>
        </div>
      </div>}

      <section className="mt-9 rounded-xl border border-white/[0.08] p-5 sm:p-6">
        <div className="flex items-center justify-between gap-3">
          <div><h2 className="text-base font-semibold text-zinc-100">Before you begin</h2><p className="mt-1 text-xs text-zinc-500">Confirm these inputs before opening the provider dashboard.</p></div>
          <span className="text-xs text-zinc-500">{guide.prerequisites.length} items</span>
        </div>
        <ul className="mt-4 space-y-2.5">
          {guide.prerequisites.map((item) => <li key={item} className="flex gap-2.5 text-sm leading-5 text-zinc-300"><span className="mt-2 size-1.5 shrink-0 rounded-full bg-emerald-400" />{item}</li>)}
        </ul>
      </section>

      <section className="mt-9">
        <div className="flex flex-wrap items-end justify-between gap-3">
          <div><h2 className="text-xl font-semibold text-zinc-100">Setup path</h2><p className="mt-1 text-xs text-zinc-500">Mark steps complete as you work. Progress is saved only in this browser.</p></div>
        </div>
        <ol className="mt-4 flex flex-col gap-3 md:gap-6">
          {guide.steps.map((step, index) => {
            const isComplete = completed.includes(index);
            return (
              <li key={`${guide.slug}-${index}`} className="relative grid grid-cols-[28px_minmax(0,1fr)] items-start gap-x-3 md:grid-cols-[minmax(0,1fr)_48px_minmax(0,1fr)] md:gap-x-5">
                {index < guide.steps.length - 1 && <span aria-hidden="true" className="setup-step-connector absolute -bottom-[38px] left-[13px] top-[26px] z-0 w-px bg-white/15 md:-bottom-[50px] md:left-1/2 md:-translate-x-1/2" />}
                <button type="button" aria-label={isComplete ? `Mark ${step.title} incomplete` : `Mark ${step.title} complete`} aria-pressed={isComplete} onClick={() => toggleStep(index)} className={`setup-step-marker relative z-10 col-start-1 row-start-1 mt-3 flex size-7 shrink-0 items-center justify-center rounded-full border text-xs transition hover:border-emerald-400/50 hover:text-emerald-300 md:col-start-2 md:justify-self-center ${isComplete ? "border-emerald-400/50 bg-emerald-400 text-zinc-950" : "border-white/[0.12] bg-[#101411] text-zinc-400"}`}>
                  {isComplete ? <Check className="size-3.5" strokeWidth={2.5} /> : index + 1}
                </button>
                <div className={`col-start-2 row-start-1 min-w-0 rounded-xl border border-white/[0.08] bg-white/[0.018] p-4 sm:p-5 md:max-w-[22rem] ${index % 2 === 0 ? "md:col-start-1 md:justify-self-end" : "md:col-start-3 md:justify-self-start"}`}>
                  <div className="flex flex-wrap items-center gap-2"><span className="text-[10px] font-semibold uppercase tracking-widest text-zinc-600">Step {index + 1}</span>{step.responsible === "agent" && <span className="rounded-full bg-violet-400/10 px-2 py-0.5 text-[10px] text-violet-300">Agent can prepare</span>}</div>
                  <h3 className={`mt-2 text-sm font-medium ${isComplete ? "text-zinc-500 line-through" : "text-zinc-200"}`}>{step.title}</h3>
                  <p className="mt-1.5 text-[13px] leading-6 text-zinc-400">{step.detail}</p>
                  <p className="mt-2 text-[11px] leading-5 text-zinc-500"><span className="font-medium text-zinc-400">Done when:</span> {step.doneWhen}</p>
                </div>
              </li>
            );
          })}
        </ol>
      </section>

      {guide.blockers.length > 0 && <section className="mt-9"><h2 className="text-xl font-semibold text-zinc-100">If you get blocked</h2><div className="mt-4 grid gap-3 md:grid-cols-2">{guide.blockers.map((blocker) => <div key={blocker.title} className="rounded-xl border border-white/[0.08] p-4"><h3 className="text-sm font-medium text-zinc-200">{blocker.title}</h3><p className="mt-2 text-xs leading-5 text-zinc-500">{blocker.symptom}</p><p className="mt-2 text-xs leading-5 text-zinc-300">Next: {blocker.nextStep}</p></div>)}</div></section>}

      <div className="mt-9 grid gap-3 md:grid-cols-2">
        <section className="rounded-xl border border-emerald-400/15 bg-emerald-400/[0.035] p-5"><div className="flex items-center gap-2"><Sparkles className="size-4 text-emerald-300" /><h2 className="text-sm font-semibold text-zinc-100">What the agent can do</h2></div><ul className="mt-3 space-y-2">{guide.agentCanDo.map((item) => <li key={item} className="text-xs leading-5 text-zinc-400">• {item}</li>)}</ul></section>
        <section className="rounded-xl border border-white/[0.08] p-5"><h2 className="text-sm font-semibold text-zinc-100">Where you take over</h2><ul className="mt-3 space-y-2">{guide.developerMustDo.map((item) => <li key={item} className="text-xs leading-5 text-zinc-400">• {item}</li>)}</ul></section>
      </div>

      {guide.alternativeNotes.length > 0 && <section className="mt-8 rounded-xl border border-white/[0.08] p-5"><h2 className="text-sm font-semibold text-zinc-100">Important distinctions</h2><ul className="mt-3 space-y-2">{guide.alternativeNotes.map((item) => <li key={item} className="text-xs leading-5 text-zinc-400">• {item}</li>)}</ul></section>}

      {guide.uncertainties.length > 0 && <section className="mt-8 rounded-xl border border-amber-400/15 bg-amber-400/[0.025] p-5"><h2 className="text-sm font-semibold text-zinc-100">Estimates and open questions</h2><ul className="mt-3 space-y-2">{guide.uncertainties.map((item) => <li key={item} className="text-xs leading-5 text-zinc-400">• {item}</li>)}</ul></section>}

      <GuideSources key={guide.slug} guide={guide} />
    </article>
  );
}
