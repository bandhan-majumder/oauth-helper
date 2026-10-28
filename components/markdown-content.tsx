import ReactMarkdown, { type Components } from "react-markdown";
import remarkGfm from "remark-gfm";

const components: Components = {
  a: ({ children, href }) => (
    <a className="text-emerald-300 underline decoration-emerald-300/40 underline-offset-2 hover:text-emerald-200" href={href} target="_blank" rel="noreferrer">
      {children}
    </a>
  ),
  blockquote: ({ children }) => <blockquote className="border-l-2 border-emerald-400/40 pl-3 text-zinc-400">{children}</blockquote>,
  code: ({ children, className }) => (
    <code className={`${className ?? ""} rounded bg-black/20 px-1 py-0.5 font-mono text-[0.9em] text-emerald-200`}>
      {children}
    </code>
  ),
  h1: ({ children }) => <h3 className="text-base font-semibold text-zinc-100">{children}</h3>,
  h2: ({ children }) => <h4 className="text-sm font-semibold text-zinc-100">{children}</h4>,
  h3: ({ children }) => <h5 className="text-[13px] font-semibold text-zinc-100">{children}</h5>,
  li: ({ children }) => <li className="pl-0.5">{children}</li>,
  ol: ({ children }) => <ol className="list-decimal space-y-1 pl-5">{children}</ol>,
  p: ({ children }) => <p>{children}</p>,
  pre: ({ children }) => <pre className="overflow-x-auto rounded-lg border border-white/[0.08] bg-black/25 p-3 font-mono text-[11px] leading-5 text-zinc-200">{children}</pre>,
  strong: ({ children }) => <strong className="font-semibold text-zinc-100">{children}</strong>,
  table: ({ children }) => <table className="block max-w-full overflow-x-auto border-collapse text-left text-xs">{children}</table>,
  td: ({ children }) => <td className="border border-white/[0.1] px-2 py-1.5">{children}</td>,
  th: ({ children }) => <th className="border border-white/[0.1] px-2 py-1.5 font-semibold text-zinc-100">{children}</th>,
  ul: ({ children }) => <ul className="list-disc space-y-1 pl-5">{children}</ul>,
};

export default function MarkdownContent({ children }: { children: string }) {
  return (
    <div className="min-w-0 space-y-2 break-words [&_em]:italic [&_hr]:border-white/10 [&_s]:text-zinc-400">
      <ReactMarkdown remarkPlugins={[remarkGfm]} components={components} skipHtml>
        {children}
      </ReactMarkdown>
    </div>
  );
}
