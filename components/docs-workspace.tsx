"use client";

import { useChat } from "@ai-sdk/react";
import { DefaultChatTransport, type UIMessage } from "ai";
import { useRouter } from "next/navigation";
import Link from "next/link";
import {
  BookOpen,
  Check,
  ChevronDown,
  ChevronRight,
  Command,
  Copy,
  ThumbsDown,
  ThumbsUp,
  Sun,
  Moon,
  Menu,
  Monitor,
  Search,
  Send,
  Sparkles,
  Trash2,
  X,
} from "lucide-react";
import { FormEvent, useEffect, useRef, useState } from "react";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogDescription, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { assistantAnswerSchema, type AssistantAnswer } from "@/lib/assistant-answer-schema";
import { cn } from "@/lib/utils";
import type { OAuthGuide } from "@/lib/guide-schema";
import GuideDocument from "@/components/guide-document";

const themeStorageKey = "docs-theme:v1";
type ThemeMode = "system" | "light" | "dark";

type DocsWorkspaceProps = { featuredGuides: OAuthGuide[]; activeGuide?: OAuthGuide | null };

function BrandMark() {
  return (
    <div className="flex size-7 items-center justify-center rounded-lg bg-emerald-400/15 text-emerald-400">
      <BookOpen className="size-4" strokeWidth={2.2} />
    </div>
  );
}

function SidebarContent({ guides, activeSlug, onNavigate }: { guides: OAuthGuide[]; activeSlug?: string; onNavigate?: () => void }) {
  return (
    <div className="flex h-full flex-col">
      <Link href="/" onClick={onNavigate} className="flex h-[68px] items-center gap-2.5 border-b border-white/[0.07] px-6">
        <BrandMark />
        <span className="text-[15px] font-semibold tracking-tight text-zinc-100">OAuth<span className="text-emerald-400">Path</span></span>
      </Link>
      <nav aria-label="OAuth guide library" className="flex-1 overflow-y-auto px-3 py-6">
        <p className="mb-2 px-3 text-[11px] font-semibold uppercase tracking-[0.13em] text-zinc-500">Guide library</p>
        <ul className="space-y-1">
          <li><Link href="/" onClick={onNavigate} className={cn("flex h-9 items-center rounded-md px-3 text-[13px] transition", !activeSlug ? "bg-emerald-400/[0.09] font-medium text-emerald-300" : "text-zinc-400 hover:bg-white/[0.04] hover:text-zinc-100")}>Explore apps</Link></li>
          {guides.map((guide) => <li key={guide.slug}><Link href={`/guides/${guide.slug}`} onClick={onNavigate} className={cn("flex h-9 items-center justify-between rounded-md px-3 text-[13px] transition", activeSlug === guide.slug ? "bg-emerald-400/[0.09] font-medium text-emerald-300" : "text-zinc-400 hover:bg-white/[0.04] hover:text-zinc-100")}><span>{guide.appName}</span><ChevronRight className="size-3.5 text-zinc-600" /></Link></li>)}
        </ul>
        <div className="mt-8 rounded-xl border border-white/[0.08] bg-white/[0.02] p-3.5">
          <p className="text-xs font-medium text-zinc-200">Do you need your own OAuth app?</p>
          <p className="mt-2 text-[11px] leading-5 text-zinc-500">Some integration platforms provide managed OAuth apps. A custom app may still be needed for your own branding, scopes, or quota.</p>
          <a href="https://docs.composio.dev/toolkits/managed-auth" target="_blank" rel="noreferrer" className="mt-2 inline-flex items-center gap-1 text-[11px] text-emerald-300">Composio managed OAuth <ChevronRight className="size-3" /></a>
        </div>
      </nav>
      <div className="border-t border-white/[0.07] p-3">
        <button className="flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-left transition hover:bg-white/[0.04]">
          <div className="flex size-8 items-center justify-center rounded-full bg-zinc-800 text-xs font-semibold text-zinc-300">DS</div>
          <div className="min-w-0 flex-1">
            <p className="truncate text-xs font-medium text-zinc-300">Documentation</p>
            <p className="mt-0.5 text-[11px] text-zinc-500">Workspace</p>
          </div>
          <ChevronDown className="size-4 text-zinc-500" />
        </button>
      </div>
    </div>
  );
}

function messageText(message: UIMessage) {
  return message.parts
    .filter((part) => part.type === "text")
    .map((part) => part.text)
    .join("\n");
}

function parseAssistantAnswer(text: string): AssistantAnswer | null {
  try {
    const result = assistantAnswerSchema.safeParse(JSON.parse(text));
    return result.success ? result.data : null;
  } catch {
    return null;
  }
}

function AssistantAnswerView({ answer, guide }: { answer: AssistantAnswer; guide: OAuthGuide | null }) {
  const sources = guide?.sources.map((source, index) => ({ ...source, id: `source-${index + 1}` })) ?? [];
  const allowed = new Map(sources.map((source) => [source.id, source]));
  const citedSources = answer.sourceIds.flatMap((id) => {
    const source = allowed.get(id);
    return source ? [source] : [];
  });

  return (
    <div className="space-y-3">
      <p className="whitespace-pre-wrap">{answer.answer}</p>
      {answer.steps.length > 0 && <div><p className="mb-1 text-[10px] font-semibold uppercase tracking-wider text-zinc-500">Next steps</p><ol className="list-decimal space-y-1 pl-5 text-[13px] leading-5">{answer.steps.map((step, index) => <li key={`${index}-${step}`}>{step}</li>)}</ol></div>}
      {answer.caveats.length > 0 && <div className="rounded-lg border border-amber-400/15 bg-amber-400/[0.04] px-3 py-2.5 text-xs leading-5 text-amber-100/80"><p className="mb-1 font-medium text-amber-100">Conditions and caveats</p>{answer.caveats.map((caveat, index) => <p key={`${index}-${caveat}`}>{caveat}</p>)}</div>}
      {citedSources.length > 0 && <div><p className="mb-1 text-[10px] font-semibold uppercase tracking-wider text-zinc-500">Guide sources</p><div className="flex flex-wrap gap-2">{citedSources.map((source) => <a key={source.id} href={source.url} target="_blank" rel="noreferrer" className="rounded-full border border-white/[0.08] px-2.5 py-1 text-[10px] text-emerald-300 hover:bg-white/[0.04]">{source.title}</a>)}</div></div>}
    </div>
  );
}

function answerCopyText(answer: AssistantAnswer, guide: OAuthGuide | null) {
  const sourceMap = new Map((guide?.sources ?? []).map((source, index) => [`source-${index + 1}`, source]));
  const sources = answer.sourceIds.flatMap((id) => {
    const source = sourceMap.get(id);
    return source ? [`${source.title}: ${source.url}`] : [];
  });
  return [answer.answer, ...(answer.steps.length ? [`Next steps:\n${answer.steps.map((step, index) => `${index + 1}. ${step}`).join("\n")}`] : []), ...(answer.caveats.length ? [`Conditions and caveats:\n${answer.caveats.join("\n")}`] : []), ...(sources.length ? [`Sources:\n${sources.join("\n")}`] : [])].join("\n\n");
}

function AssistantThinking() {
  return (
    <span className="flex items-center gap-1" aria-hidden="true">
      <i className="size-1 animate-bounce rounded-full bg-emerald-300 [animation-delay:0ms]" />
      <i className="size-1 animate-bounce rounded-full bg-emerald-300 [animation-delay:120ms]" />
      <i className="size-1 animate-bounce rounded-full bg-emerald-300 [animation-delay:240ms]" />
    </span>
  );
}

export default function DocsWorkspace({ featuredGuides, activeGuide = null }: DocsWorkspaceProps) {
  const router = useRouter();
  const [assistantOpen, setAssistantOpen] = useState(false);
  const [mobileNavOpen, setMobileNavOpen] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const [question, setQuestion] = useState("");
  const [historyLoaded, setHistoryLoaded] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [searchResults, setSearchResults] = useState<Pick<OAuthGuide, "slug" | "appName" | "appDomain" | "summary" | "origin" | "difficulty">[]>([]);
  const [generatingGuide, setGeneratingGuide] = useState(false);
  const [guideError, setGuideError] = useState<string | null>(null);
  const [themeMode, setThemeMode] = useState<ThemeMode>("system");
  const [systemIsDark, setSystemIsDark] = useState(true);
  const [themeMenuOpen, setThemeMenuOpen] = useState(false);
  const [copiedMessageId, setCopiedMessageId] = useState<string | null>(null);
  const [reactions, setReactions] = useState<Record<string, "like" | "dislike">>({});
  const panelInputRef = useRef<HTMLTextAreaElement>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const themeMenuRef = useRef<HTMLDivElement>(null);
  const chatStorageKey = `docs-assistant-chat:v1:${activeGuide?.slug ?? "directory"}`;
  const resolvedTheme = themeMode === "system" ? (systemIsDark ? "dark" : "light") : themeMode;
  const { messages, sendMessage, setMessages, status, error, clearError } = useChat({
    id: `oauth-assistant-${activeGuide?.slug ?? "directory"}`,
    transport: new DefaultChatTransport({ api: "/api/chat", body: { guideSlug: activeGuide?.slug ?? null } }),
    onError: () => undefined,
  });
  const busy = status === "submitted" || status === "streaming";

  useEffect(() => {
    try {
      const saved = window.localStorage.getItem(chatStorageKey);
      if (saved) {
        const parsed: unknown = JSON.parse(saved);
        if (Array.isArray(parsed)) setMessages(parsed as UIMessage[]);
      }
    } catch {
      window.localStorage.removeItem(chatStorageKey);
    } finally {
      setHistoryLoaded(true);
    }
  }, [setMessages, chatStorageKey]);

  useEffect(() => {
    const savedTheme = window.localStorage.getItem(themeStorageKey);
    const preference = window.matchMedia("(prefers-color-scheme: dark)");
    const updateSystemTheme = () => setSystemIsDark(preference.matches);
    window.requestAnimationFrame(() => {
      if (savedTheme === "system" || savedTheme === "light" || savedTheme === "dark") setThemeMode(savedTheme);
      updateSystemTheme();
    });
    preference.addEventListener("change", updateSystemTheme);
    return () => preference.removeEventListener("change", updateSystemTheme);
  }, []);

  useEffect(() => {
    document.documentElement.dataset.theme = resolvedTheme;
  }, [resolvedTheme]);

  useEffect(() => {
    if (!themeMenuOpen) return;
    function closeWhenClickingOutside(event: PointerEvent) {
      if (event.target instanceof Node && !themeMenuRef.current?.contains(event.target)) setThemeMenuOpen(false);
    }
    window.addEventListener("pointerdown", closeWhenClickingOutside);
    return () => window.removeEventListener("pointerdown", closeWhenClickingOutside);
  }, [themeMenuOpen]);

  useEffect(() => {
    if (!historyLoaded) return;
    try {
      window.localStorage.setItem(chatStorageKey, JSON.stringify(messages));
    } catch {
      // Chat remains available for this page view if browser storage is unavailable.
    }
  }, [historyLoaded, messages, chatStorageKey]);

  useEffect(() => {
    const query = searchQuery.trim();
    const timer = window.setTimeout(async () => {
      const local = featuredGuides.filter((guide) => `${guide.appName} ${guide.appDomain}`.toLowerCase().includes(query.toLowerCase()));
      if (query.length < 2) {
        setSearchResults(local);
        return;
      }
      try {
        const response = await fetch(`/api/guides?query=${encodeURIComponent(query)}`);
        if (!response.ok) throw new Error("Guide search unavailable");
        const data = await response.json() as { guides?: typeof searchResults };
        setSearchResults(data.guides ?? local);
      } catch {
        setSearchResults(local);
      }
    }, 180);
    return () => window.clearTimeout(timer);
  }, [searchQuery, featuredGuides]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth", block: "end" });
  }, [messages, assistantOpen]);

  useEffect(() => {
    if (assistantOpen) panelInputRef.current?.focus();
  }, [assistantOpen]);

  useEffect(() => {
    function handleShortcut(event: KeyboardEvent) {
      if (!(event.metaKey || event.ctrlKey) || event.altKey) return;

      const target = event.target;
      if (target instanceof HTMLElement && (
        target.isContentEditable ||
        target instanceof HTMLInputElement ||
        target instanceof HTMLTextAreaElement ||
        target instanceof HTMLSelectElement
      )) return;

      const key = event.key.toLowerCase();
      if (key === "k") {
        event.preventDefault();
        setSearchOpen(true);
      } else if (key === "i") {
        event.preventDefault();
        setAssistantOpen((open) => !open);
      }
    }

    window.addEventListener("keydown", handleShortcut);
    return () => window.removeEventListener("keydown", handleShortcut);
  }, []);

  async function submitQuestion(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const trimmed = question.trim();
    if (!trimmed || busy) return;
    setAssistantOpen(true);
    setQuestion("");
    clearError();
    await sendMessage({ text: trimmed });
  }

  function clearConversation() {
    setMessages([]);
    clearError();
    window.localStorage.removeItem(chatStorageKey);
  }

  function openGuideSearch(query: string) {
    let normalized = query.trim();
    try {
      const url = new URL(/^https?:\/\//i.test(normalized) ? normalized : `https://${normalized}`);
      if (url.hostname.includes(".")) normalized = url.hostname.replace(/^www\./, "");
    } catch {
      // Keep app names and non-URL text as entered.
    }
    setSearchQuery(normalized);
    setGuideError(null);
    setSearchOpen(true);
  }

  async function generateGuide() {
    const appNameOrUrl = searchQuery.trim();
    if (!appNameOrUrl || generatingGuide) return;
    setGeneratingGuide(true);
    setGuideError(null);
    try {
      const response = await fetch("/api/guides/generate", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ appNameOrUrl }),
      });
      const data = await response.json() as { guideUrl?: string; error?: string };
      if (!response.ok || !data.guideUrl) throw new Error(data.error || "Could not generate this guide. Try again.");
      setSearchOpen(false);
      router.push(data.guideUrl);
    } catch (cause) {
      setGuideError(cause instanceof Error ? cause.message : "Could not generate this guide. Try again.");
    } finally {
      setGeneratingGuide(false);
    }
  }

  function submitGuideSearch() {
    const normalized = searchQuery.trim().toLowerCase().replace(/^https?:\/\//, "").replace(/^www\./, "").replace(/\/$/, "");
    const exactMatch = searchResults.find((guide) => guide.appName.toLowerCase() === searchQuery.trim().toLowerCase() || guide.appDomain.toLowerCase().replace(/^www\./, "") === normalized);
    if (exactMatch) {
      setSearchOpen(false);
      router.push(`/guides/${exactMatch.slug}`);
      return;
    }
    void generateGuide();
  }

  const sidebarGuides = activeGuide && !featuredGuides.some((guide) => guide.slug === activeGuide.slug)
    ? [activeGuide, ...featuredGuides]
    : featuredGuides;

  async function copyMessage(id: string, text: string) {
    try {
      await window.navigator.clipboard.writeText(text);
      setCopiedMessageId(id);
      window.setTimeout(() => {
        setCopiedMessageId((current) => current === id ? null : current);
      }, 1500);
    } catch {
      setCopiedMessageId(null);
    }
  }

  function setReaction(id: string, reaction: "like" | "dislike") {
    setReactions((current) => {
      if (current[id] === reaction) {
        const next = { ...current };
        delete next[id];
        return next;
      }
      return { ...current, [id]: reaction };
    });
  }

  function chooseTheme(mode: ThemeMode) {
    setThemeMode(mode);
    window.localStorage.setItem(themeStorageKey, mode);
    setThemeMenuOpen(false);
  }

  function composer(placement: "bottom" | "panel") {
    const panel = placement === "panel";
    return (
      <form onSubmit={submitQuestion} className={cn("app-composer group flex items-end gap-2 rounded-2xl border bg-[#0b0e0c] p-2 transition-colors", panel ? "border-emerald-400/45 focus-within:border-emerald-400/70" : "border-white/[0.11] hover:border-white/[0.18] focus-within:border-emerald-400/50")}>
        <Textarea
          ref={panel ? panelInputRef : undefined}
          value={question}
          onChange={(event) => setQuestion(event.target.value)}
          onKeyDown={(event) => {
            if (event.key === "Enter" && !event.shiftKey && !event.nativeEvent.isComposing) {
              event.preventDefault();
              event.currentTarget.form?.requestSubmit();
            }
          }}
          placeholder={activeGuide ? `Ask about ${activeGuide.appName} OAuth...` : "Ask an OAuth question..."}
          aria-label={activeGuide ? `Ask about ${activeGuide.appName} OAuth setup` : "Ask an OAuth question"}
          rows={1}
          className={cn("max-h-36 min-h-9 flex-1 px-3 py-2", panel && "min-h-[52px]")}
          disabled={busy}
        />
        <Button type="submit" size="icon" aria-label="Send question" disabled={busy || !question.trim()} className="mb-0.5 size-8 rounded-full bg-emerald-500 text-zinc-950 hover:bg-emerald-400">
          {busy ? <span className="size-3 rounded-sm bg-current" /> : <Send className="size-3.5" />}
        </Button>
      </form>
    );
  }

  return (
    <div data-theme={resolvedTheme} className="app-shell flex h-dvh w-full overflow-hidden bg-[#080a09] text-zinc-100">
      <aside className="app-sidebar hidden h-full w-[252px] shrink-0 border-r border-white/[0.07] bg-[#0a0c0b] lg:block">
        <SidebarContent guides={sidebarGuides} activeSlug={activeGuide?.slug} />
      </aside>

      {mobileNavOpen && (
        <div className="fixed inset-0 z-40 lg:hidden">
          <button className="absolute inset-0 bg-black/65" aria-label="Close navigation" onClick={() => setMobileNavOpen(false)} />
          <aside className="app-sidebar relative h-full w-[min(84vw,300px)] border-r border-white/10 bg-[#0a0c0b] shadow-2xl">
            <button onClick={() => setMobileNavOpen(false)} aria-label="Close navigation" className="absolute right-3 top-4 z-10 rounded p-2 text-zinc-500 hover:text-zinc-100"><X className="size-4" /></button>
            <SidebarContent guides={sidebarGuides} activeSlug={activeGuide?.slug} onNavigate={() => setMobileNavOpen(false)} />
          </aside>
        </div>
      )}

      <div className="flex h-full min-h-0 min-w-0 flex-1">
        <section className="flex h-full min-h-0 min-w-0 flex-1 flex-col">
          <header className="app-header flex h-[68px] shrink-0 items-center gap-3 border-b border-white/[0.07] px-4 sm:px-6">
            <Button variant="ghost" size="icon" className="lg:hidden" aria-label="Open navigation" onClick={() => setMobileNavOpen(true)}><Menu className="size-4" /></Button>
            <div className="hidden items-center gap-2 text-xs text-zinc-500 sm:flex">
              <span>OAuth guides</span><ChevronRight className="size-3" /><span className="text-zinc-300">{activeGuide?.appName ?? "Explore apps"}</span>
            </div>
            <div className="flex-1" />
            <Button variant="outline" className="h-9 gap-2 px-3 text-zinc-400" onClick={() => openGuideSearch("")}>
              <Search className="size-3.5" /><span className="hidden sm:inline">Find an app...</span><kbd className="ml-1 hidden rounded border border-white/10 px-1.5 py-0.5 text-[10px] text-zinc-500 sm:inline-flex"><Command className="mr-0.5 size-2.5" />K</kbd>
            </Button>
            <Button variant="outline" className={cn("h-9 gap-2 px-3", assistantOpen && "border-emerald-400/30 bg-emerald-400/[0.06]")} aria-pressed={assistantOpen} onClick={() => setAssistantOpen((open) => !open)}>
              <Sparkles className="size-3.5 text-emerald-400" /><span className="hidden sm:inline">Ask Assistant</span><kbd className="ml-1 hidden rounded border border-white/10 px-1.5 py-0.5 text-[10px] text-zinc-500 md:inline-flex"><Command className="mr-0.5 size-2.5" />I</kbd>
            </Button>
            <div className="relative hidden sm:block" ref={themeMenuRef}>
              <Button variant="ghost" size="icon" aria-label="Choose theme" aria-haspopup="menu" aria-expanded={themeMenuOpen} title="Choose theme" onClick={() => setThemeMenuOpen((open) => !open)}>
                {resolvedTheme === "dark" ? <Monitor className="size-4" /> : <Sun className="size-4" />}
              </Button>
              {themeMenuOpen && (
                <div role="menu" aria-label="Theme" className="app-theme-menu absolute right-0 top-11 z-50 w-40 rounded-xl border border-white/10 bg-[#111412] p-1.5 shadow-xl">
                  {(["system", "light", "dark"] as const).map((mode) => (
                    <button key={mode} type="button" role="menuitemradio" aria-checked={themeMode === mode} onClick={() => chooseTheme(mode)} className={cn("flex h-9 w-full items-center gap-2 rounded-lg px-2.5 text-left text-xs capitalize transition hover:bg-white/[0.06]", themeMode === mode ? "text-emerald-300" : "text-zinc-300")}>
                      {mode === "system" ? <Monitor className="size-3.5" /> : mode === "light" ? <Sun className="size-3.5" /> : <Moon className="size-3.5" />}
                      {mode}
                      {themeMode === mode && <span className="ml-auto size-1.5 rounded-full bg-emerald-400" />}
                    </button>
                  ))}
                </div>
              )}
            </div>
          </header>

          <main className="app-main relative flex min-h-0 flex-1 flex-col overflow-hidden">
            <div className={cn("min-h-0 flex-1 overflow-y-auto", activeGuide && !assistantOpen && "pb-32")} aria-label={activeGuide ? `${activeGuide.appName} OAuth setup guide` : "OAuth app guide directory"}>
              {activeGuide ? <GuideDocument guide={activeGuide} /> : (
                <div className="mx-auto w-full max-w-[1050px] px-5 py-12 sm:px-9 sm:py-16">
                  <div className="max-w-[760px]">
                    <p className="text-xs font-medium text-emerald-400">OAuth setup, without the guesswork</p>
                    <h1 className="mt-3 text-3xl font-semibold tracking-tight text-zinc-100 sm:text-5xl">Get your OAuth app ready to launch.</h1>
                    <p className="mt-4 max-w-2xl text-sm leading-6 text-zinc-400 sm:text-base">Find the setup path, approval requirements, and next action for an integration. Start with a guide or research an app that is not in the library.</p>
                    <form onSubmit={(event) => { event.preventDefault(); openGuideSearch(searchQuery); }} className="mt-8 flex flex-col gap-2 rounded-2xl border border-white/[0.1] bg-white/[0.025] p-2 sm:flex-row sm:items-center">
                      <Search className="ml-2 hidden size-4 text-zinc-500 sm:block" />
                      <Input value={searchQuery} onChange={(event) => setSearchQuery(event.target.value)} placeholder="Search an app or paste its website" aria-label="Search an app or enter a website" className="border-0 bg-transparent focus-visible:ring-0" />
                      <Button type="submit" className="h-10 shrink-0 px-4">Find a guide <ChevronRight className="size-4" /></Button>
                    </form>
                    <div className="mt-3 flex flex-wrap gap-x-4 gap-y-1 text-[11px] text-zinc-600"><span>Try GitHub</span><span>Slack</span><span>Google Drive</span><span>or enter any app</span></div>
                  </div>

                  <section className="mt-14">
                    <div className="flex flex-wrap items-end justify-between gap-3"><div><h2 className="text-lg font-semibold text-zinc-100">Featured OAuth guides</h2><p className="mt-1 text-xs text-zinc-500">Three different setup and approval paths, checked against provider docs.</p></div><span className="text-[11px] text-zinc-600">3 of 100 planned apps</span></div>
                    <div className="mt-4 grid gap-3 md:grid-cols-2 xl:grid-cols-3">
                      {featuredGuides.map((guide) => <Link key={guide.slug} href={`/guides/${guide.slug}`} className="group rounded-2xl border border-white/[0.08] bg-white/[0.02] p-5 transition hover:border-emerald-400/25 hover:bg-emerald-400/[0.025]">
                        <div className="flex items-center justify-between"><span className="text-xs font-medium text-emerald-300">{guide.appDomain}</span><ChevronRight className="size-4 text-zinc-600 transition group-hover:translate-x-0.5 group-hover:text-emerald-300" /></div>
                        <h3 className="mt-3 text-base font-semibold text-zinc-100">{guide.appName}</h3>
                        <p className="mt-2 min-h-12 text-xs leading-5 text-zinc-400">{guide.summary}</p>
                        <div className="mt-4 flex flex-wrap gap-2"><span className="rounded-full bg-white/[0.05] px-2.5 py-1 text-[10px] capitalize text-zinc-400">{guide.difficulty} setup</span><span className="rounded-full bg-white/[0.05] px-2.5 py-1 text-[10px] text-zinc-400">{guide.approval.requirement === "optional" ? "Optional review path" : guide.approval.requirement === "conditional" ? "Scope or policy dependent" : "Approval varies"}</span></div>
                      </Link>)}
                    </div>
                  </section>
               </div>
              )}
            </div>
            {!assistantOpen && activeGuide && (
              <div className="app-composer-dock pointer-events-none absolute inset-x-0 bottom-0 z-10 px-4 pb-5 pt-4 sm:px-8 sm:pb-7">
                <div className="mx-auto w-full max-w-[760px]">
                  <div className="pointer-events-auto">
                    {composer("bottom")}
                  </div>
                  <p className="mt-2.5 text-center text-[11px] text-zinc-600">Ask about {activeGuide.appName} setup, approval, or a blocker.</p>
                </div>
              </div>
            )}
          </main>
        </section>

        {assistantOpen && (
          <aside className="app-panel fixed inset-0 z-30 flex h-dvh min-h-0 flex-col border-l border-white/[0.08] bg-[#0a0d0b] lg:static lg:z-auto lg:h-full lg:w-[400px] lg:shrink-0 xl:w-[430px]">
            <div className="flex h-[68px] shrink-0 items-center gap-3 border-b border-white/[0.07] px-4 sm:px-5">
              <Sparkles className="size-[17px] text-emerald-400" />
              <h2 className="flex-1 text-sm font-medium text-zinc-100">Assistant</h2>
              <Button variant="ghost" size="icon" className="size-8" aria-label="Clear chat" title="Clear chat" onClick={clearConversation}><Trash2 className="size-4" /></Button>
              <Button variant="ghost" size="icon" className="size-8 lg:hidden" aria-label="Close assistant" onClick={() => setAssistantOpen(false)}><X className="size-4" /></Button>
              <Button variant="ghost" size="icon" className="hidden size-8 lg:inline-flex" aria-label="Close assistant" onClick={() => setAssistantOpen(false)}><X className="size-4" /></Button>
            </div>

            <div className="min-h-0 flex-1 space-y-5 overflow-y-auto px-4 py-5 sm:px-5">
              {messages.length === 0 ? (
                <div className="mx-auto mt-14 max-w-[280px] text-center">
                  <div className="mx-auto mb-4 flex size-11 items-center justify-center rounded-2xl border border-emerald-400/20 bg-emerald-400/[0.08]"><Sparkles className="size-5 text-emerald-300" /></div>
                  <p className="text-sm font-medium text-zinc-200">{activeGuide ? `Ask about ${activeGuide.appName}` : "Ask an OAuth question"}</p>
                  <p className="mt-2 text-xs leading-5 text-zinc-500">{activeGuide ? `Get help with the ${activeGuide.appName} setup steps, approval requirements, and sources in this guide.` : "Ask about OAuth app setup, scopes, approvals, or troubleshooting."}</p>
                </div>
              ) : messages.map((message) => {
                const isUser = message.role === "user";
                const text = messageText(message);
                const structuredAnswer = isUser ? null : parseAssistantAnswer(text);
                const partialAnswer = !isUser && !structuredAnswer && text.trimStart().startsWith("{");
                const copyText = isUser ? text : structuredAnswer ? answerCopyText(structuredAnswer, activeGuide) : partialAnswer ? "" : text;
                return (
                  <div key={message.id} className={cn("group flex flex-col", isUser ? "items-end" : "items-start")}>
                    <div className={cn("max-w-[90%] whitespace-pre-wrap text-[13px] leading-6", isUser ? "user-message rounded-2xl rounded-br-md bg-white/[0.07] px-4 py-2.5 text-zinc-100" : "w-full text-zinc-300")}>
                      {!isUser && <div className="mb-2 flex items-center gap-2 text-[11px] font-medium text-zinc-500"><Sparkles className="size-3 text-emerald-400" />Assistant</div>}
                      {isUser ? text : structuredAnswer ? <AssistantAnswerView answer={structuredAnswer} guide={activeGuide} /> : partialAnswer ? busy ? <AssistantThinking /> : <span className="text-xs text-zinc-500">This answer could not be formatted. Please ask again.</span> : text || (busy && message === messages[messages.length - 1] ? <AssistantThinking /> : null)}
                    </div>
                    {copyText && (
                      <div className="pointer-events-none mt-1 flex items-center gap-0.5 opacity-0 transition-opacity group-hover:pointer-events-auto group-hover:opacity-100 group-focus-within:pointer-events-auto group-focus-within:opacity-100">
                        {!isUser && (
                          <>
                            <Button type="button" variant="ghost" size="icon" className={cn("size-7", reactions[message.id] === "like" && "text-emerald-300")} aria-label="Like answer" aria-pressed={reactions[message.id] === "like"} title="Like" onClick={() => setReaction(message.id, "like")}><ThumbsUp className="size-3.5" /></Button>
                            <Button type="button" variant="ghost" size="icon" className={cn("size-7", reactions[message.id] === "dislike" && "text-rose-300")} aria-label="Dislike answer" aria-pressed={reactions[message.id] === "dislike"} title="Dislike" onClick={() => setReaction(message.id, "dislike")}><ThumbsDown className="size-3.5" /></Button>
                          </>
                        )}
                        <Button type="button" variant="ghost" size="icon" className="size-7" aria-label={copiedMessageId === message.id ? "Copied message" : "Copy message"} title={copiedMessageId === message.id ? "Copied" : "Copy"} onClick={() => void copyMessage(message.id, copyText)}>
                          {copiedMessageId === message.id ? <Check className="size-3.5 text-emerald-300" /> : <Copy className="size-3.5" />}
                        </Button>
                      </div>
                    )}
                  </div>
                );
              })}
              {busy && messages[messages.length - 1]?.role === "user" && <AssistantThinking />}
              {error && <div role="alert" className="rounded-lg border border-red-400/20 bg-red-400/[0.06] px-3 py-2.5 text-xs leading-5 text-red-200">{error.message || "The assistant could not respond. Check your API key and try again."}</div>}
              <div ref={messagesEndRef} />
            </div>

            <div className="shrink-0 px-4 pb-5 pt-2 sm:px-5 sm:pb-6">
              {composer("panel")}
              <p className="mt-2 text-center text-[10px] text-zinc-600">Enter to send · Shift + Enter for a new line</p>
            </div>
          </aside>
        )}
      </div>

      <Dialog open={searchOpen} onOpenChange={setSearchOpen}>
        <DialogContent>
          <DialogTitle className="mb-1 flex items-center gap-2"><Search className="size-4 text-zinc-500" />Find an OAuth guide</DialogTitle>
          <DialogDescription>Search the library or research a new app by name or website.</DialogDescription>
          <Input autoFocus value={searchQuery} onChange={(event) => { setSearchQuery(event.target.value); setGuideError(null); }} onKeyDown={(event) => { if (event.key === "Enter" && !event.nativeEvent.isComposing) { event.preventDefault(); submitGuideSearch(); } }} placeholder="Try GitHub, Slack, or an app website" className="mt-4" />
          {searchResults.length > 0 && <div className="mt-3 max-h-56 space-y-1 overflow-y-auto">{searchResults.map((guide) => <button key={guide.slug} type="button" onClick={() => { setSearchOpen(false); router.push(`/guides/${guide.slug}`); }} className="w-full rounded-lg px-3 py-2.5 text-left transition hover:bg-white/[0.05]"><span className="flex items-center justify-between text-sm font-medium text-zinc-200">{guide.appName}<ChevronRight className="size-3.5 text-zinc-600" /></span><span className="mt-1 block text-[11px] text-zinc-500">{guide.appDomain} · {guide.origin === "curated" ? "researched guide" : "generated guide"}</span></button>)}</div>}
          {guideError && <p role="alert" className="mt-3 rounded-lg border border-red-400/20 bg-red-400/[0.06] px-3 py-2 text-xs text-red-200">{guideError}</p>}
          <div className="mt-4 flex flex-col gap-3 border-t border-white/[0.08] pt-4">
            <p className="text-xs text-zinc-500">{searchQuery.trim().length >= 2 ? "Don’t see the right app? Research it and create a shareable guide." : "Enter an app name or website to search or generate a guide."}</p>
            <Button type="button" onClick={submitGuideSearch} disabled={generatingGuide || searchQuery.trim().length < 2}>
              {generatingGuide ? <><span className="size-3 animate-spin rounded-full border-2 border-zinc-950/30 border-t-zinc-950" />Researching provider docs…</> : searchResults.some((guide) => guide.appName.toLowerCase() === searchQuery.trim().toLowerCase() || guide.appDomain.toLowerCase().replace(/^www\./, "") === searchQuery.trim().toLowerCase().replace(/^www\./, "")) ? <><Search className="size-3.5" />Open matching guide</> : <><Sparkles className="size-3.5" />Generate a guide</>}
            </Button>
            <p className="text-center text-[10px] text-zinc-600">Generated guides include web sources; estimates and approval paths are conditional.</p>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
