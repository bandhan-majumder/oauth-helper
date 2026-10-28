"use client";

import { useChat } from "@ai-sdk/react";
import { DefaultChatTransport, type UIMessage } from "ai";
import {
  BookOpen,
  Check,
  ChevronDown,
  ChevronRight,
  Command,
  Copy,
  FileText,
  ThumbsDown,
  ThumbsUp,
  Sun,
  Moon,
  Menu,
  MessageCircle,
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
import { cn } from "@/lib/utils";

const storageKey = "docs-assistant-chat:v1";
const themeStorageKey = "docs-theme:v1";
type ThemeMode = "system" | "light" | "dark";

const navigation = [
  {
    title: "Get started",
    items: ["Introduction", "Quickstart", "AI overview"],
  },
  {
    title: "Build",
    items: ["Guides", "Components", "API reference"],
  },
];

function BrandMark() {
  return (
    <div className="flex size-7 items-center justify-center rounded-lg bg-emerald-400/15 text-emerald-400">
      <BookOpen className="size-4" strokeWidth={2.2} />
    </div>
  );
}

function SidebarContent({ onNavigate }: { onNavigate?: () => void }) {
  return (
    <div className="flex h-full flex-col">
      <a href="#" className="flex h-[68px] items-center gap-2.5 border-b border-white/[0.07] px-6">
        <BrandMark />
        <span className="text-[15px] font-semibold tracking-tight text-zinc-100">docs<span className="text-emerald-400">.space</span></span>
      </a>
      <nav aria-label="Documentation" className="flex-1 overflow-y-auto px-3 py-6">
        {navigation.map((group) => (
          <div className="mb-8" key={group.title}>
            <p className="mb-2 px-3 text-[11px] font-semibold uppercase tracking-[0.13em] text-zinc-500">{group.title}</p>
            <ul className="space-y-1">
              {group.items.map((item, index) => {
                const active = group.title === "Get started" && item === "Quickstart";
                return (
                  <li key={item}>
                    <button
                      onClick={onNavigate}
                      className={cn(
                        "flex h-9 w-full items-center justify-between rounded-md px-3 text-left text-[13px] transition-colors",
                        active ? "bg-emerald-400/[0.09] font-medium text-emerald-300" : "text-zinc-400 hover:bg-white/[0.04] hover:text-zinc-100",
                      )}
                    >
                      <span>{item}</span>
                      {(index === 2 || (group.title === "Build" && index !== 2)) && <ChevronRight className="size-3.5 text-zinc-600" />}
                    </button>
                  </li>
                );
              })}
            </ul>
          </div>
        ))}
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

function AssistantThinking() {
  return (
    <span className="flex items-center gap-1" aria-hidden="true">
      <i className="size-1 animate-bounce rounded-full bg-emerald-300 [animation-delay:0ms]" />
      <i className="size-1 animate-bounce rounded-full bg-emerald-300 [animation-delay:120ms]" />
      <i className="size-1 animate-bounce rounded-full bg-emerald-300 [animation-delay:240ms]" />
    </span>
  );
}

export default function DocsWorkspace() {
  const [assistantOpen, setAssistantOpen] = useState(false);
  const [mobileNavOpen, setMobileNavOpen] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const [question, setQuestion] = useState("");
  const [historyLoaded, setHistoryLoaded] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [themeMode, setThemeMode] = useState<ThemeMode>("system");
  const [systemIsDark, setSystemIsDark] = useState(true);
  const [themeMenuOpen, setThemeMenuOpen] = useState(false);
  const [copiedMessageId, setCopiedMessageId] = useState<string | null>(null);
  const [reactions, setReactions] = useState<Record<string, "like" | "dislike">>({});
  const panelInputRef = useRef<HTMLTextAreaElement>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const themeMenuRef = useRef<HTMLDivElement>(null);
  const resolvedTheme = themeMode === "system" ? (systemIsDark ? "dark" : "light") : themeMode;
  const { messages, sendMessage, setMessages, status, error, clearError } = useChat({
    transport: new DefaultChatTransport({ api: "/api/chat" }),
    onError: () => undefined,
  });
  const busy = status === "submitted" || status === "streaming";

  useEffect(() => {
    try {
      const saved = window.localStorage.getItem(storageKey);
      if (saved) {
        const parsed: unknown = JSON.parse(saved);
        if (Array.isArray(parsed)) setMessages(parsed as UIMessage[]);
      }
    } catch {
      window.localStorage.removeItem(storageKey);
    } finally {
      setHistoryLoaded(true);
    }
  }, [setMessages]);

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
      window.localStorage.setItem(storageKey, JSON.stringify(messages));
    } catch {
      // Chat remains available for this page view if browser storage is unavailable.
    }
  }, [historyLoaded, messages]);

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
    window.localStorage.removeItem(storageKey);
  }

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
          placeholder="Ask a question..."
          aria-label="Ask a question"
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
        <SidebarContent />
      </aside>

      {mobileNavOpen && (
        <div className="fixed inset-0 z-40 lg:hidden">
          <button className="absolute inset-0 bg-black/65" aria-label="Close navigation" onClick={() => setMobileNavOpen(false)} />
          <aside className="app-sidebar relative h-full w-[min(84vw,300px)] border-r border-white/10 bg-[#0a0c0b] shadow-2xl">
            <button onClick={() => setMobileNavOpen(false)} aria-label="Close navigation" className="absolute right-3 top-4 z-10 rounded p-2 text-zinc-500 hover:text-zinc-100"><X className="size-4" /></button>
            <SidebarContent onNavigate={() => setMobileNavOpen(false)} />
          </aside>
        </div>
      )}

      <div className="flex h-full min-h-0 min-w-0 flex-1">
        <section className="flex h-full min-h-0 min-w-0 flex-1 flex-col">
          <header className="app-header flex h-[68px] shrink-0 items-center gap-3 border-b border-white/[0.07] px-4 sm:px-6">
            <Button variant="ghost" size="icon" className="lg:hidden" aria-label="Open navigation" onClick={() => setMobileNavOpen(true)}><Menu className="size-4" /></Button>
            <div className="hidden items-center gap-2 text-xs text-zinc-500 sm:flex">
              <span>Documentation</span><ChevronRight className="size-3" /><span className="text-zinc-300">Quickstart</span>
            </div>
            <div className="flex-1" />
            <Button variant="outline" className="h-9 gap-2 px-3 text-zinc-400" onClick={() => setSearchOpen(true)}>
              <Search className="size-3.5" /><span className="hidden sm:inline">Search...</span><kbd className="ml-1 hidden rounded border border-white/10 px-1.5 py-0.5 text-[10px] text-zinc-500 sm:inline-flex"><Command className="mr-0.5 size-2.5" />K</kbd>
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
            <div className="min-h-0 flex-1 overflow-y-auto" aria-label="Documentation content" />
            {!assistantOpen && (
              <div className="mx-auto w-full max-w-[760px] shrink-0 px-4 pb-7 pt-4 sm:px-8 sm:pb-9">
                {composer("bottom")}
                <p className="mt-2.5 text-center text-[11px] text-zinc-600">AI can make mistakes. Check important information.</p>
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
                  <p className="text-sm font-medium text-zinc-200">Ask anything</p>
                  <p className="mt-2 text-xs leading-5 text-zinc-500">Start a conversation with the documentation assistant.</p>
                </div>
              ) : messages.map((message) => {
                const isUser = message.role === "user";
                const text = messageText(message);
                return (
                  <div key={message.id} className={cn("group flex flex-col", isUser ? "items-end" : "items-start")}>
                    <div className={cn("max-w-[90%] whitespace-pre-wrap text-[13px] leading-6", isUser ? "user-message rounded-2xl rounded-br-md bg-white/[0.07] px-4 py-2.5 text-zinc-100" : "w-full text-zinc-300")}>
                      {!isUser && <div className="mb-2 flex items-center gap-2 text-[11px] font-medium text-zinc-500"><Sparkles className="size-3 text-emerald-400" />Assistant</div>}
                      {text || (busy && !isUser && message === messages[messages.length - 1] ? <span className="inline-flex gap-1 py-2" role="status" aria-label="Assistant is responding"><i className="size-1.5 animate-pulse rounded-full bg-emerald-400" /><i className="size-1.5 animate-pulse rounded-full bg-emerald-400 [animation-delay:150ms]" /><i className="size-1.5 animate-pulse rounded-full bg-emerald-400 [animation-delay:300ms]" /></span> : null)}
                    </div>
                    {text && (
                      <div className="pointer-events-none mt-1 flex items-center gap-0.5 opacity-0 transition-opacity group-hover:pointer-events-auto group-hover:opacity-100 group-focus-within:pointer-events-auto group-focus-within:opacity-100">
                        {!isUser && (
                          <>
                            <Button type="button" variant="ghost" size="icon" className={cn("size-7", reactions[message.id] === "like" && "text-emerald-300")} aria-label="Like answer" aria-pressed={reactions[message.id] === "like"} title="Like" onClick={() => setReaction(message.id, "like")}><ThumbsUp className="size-3.5" /></Button>
                            <Button type="button" variant="ghost" size="icon" className={cn("size-7", reactions[message.id] === "dislike" && "text-rose-300")} aria-label="Dislike answer" aria-pressed={reactions[message.id] === "dislike"} title="Dislike" onClick={() => setReaction(message.id, "dislike")}><ThumbsDown className="size-3.5" /></Button>
                          </>
                        )}
                        <Button type="button" variant="ghost" size="icon" className="size-7" aria-label={copiedMessageId === message.id ? "Copied message" : "Copy message"} title={copiedMessageId === message.id ? "Copied" : "Copy"} onClick={() => void copyMessage(message.id, text)}>
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
          <DialogTitle className="mb-4 flex items-center gap-2"><Search className="size-4 text-zinc-500" />Search documentation</DialogTitle>
          <DialogDescription className="sr-only">Search the documentation</DialogDescription>
          <Input autoFocus value={searchQuery} onChange={(event) => setSearchQuery(event.target.value)} placeholder="Search the docs..." />
          <div className="mt-4 rounded-lg border border-dashed border-white/10 px-4 py-7 text-center">
            {searchQuery ? <><FileText className="mx-auto mb-2 size-4 text-zinc-600" /><p className="text-xs text-zinc-500">No indexed pages yet</p></> : <><MessageCircle className="mx-auto mb-2 size-4 text-zinc-600" /><p className="text-xs text-zinc-500">Type to search documentation</p></>}
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
