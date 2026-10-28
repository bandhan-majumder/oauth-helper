import * as React from "react";
import { cn } from "@/lib/utils";

export function Input({ className, ...props }: React.ComponentProps<"input">) {
  return (
    <input
      className={cn(
        "h-10 w-full rounded-lg border border-white/10 bg-white/[0.03] px-3 text-sm text-zinc-100 outline-none placeholder:text-zinc-500 focus-visible:border-emerald-400/60 focus-visible:ring-2 focus-visible:ring-emerald-400/20 disabled:cursor-not-allowed disabled:opacity-50",
        className,
      )}
      {...props}
    />
  );
}
