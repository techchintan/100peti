import Link from "next/link";
import type {LucideIcon} from "lucide-react";
import {ArrowUpRight} from "lucide-react";

import {cn} from "@/lib/utils";

type PageHeaderProps = {
  title: string;
  description?: string;
  eyebrow?: string;
  action?: {
    label: string;
    href: string;
  };
  className?: string;
};

export function PageHeader({title, description, eyebrow, action, className}: PageHeaderProps) {
  return (
    <div className={cn("mb-8 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between", className)}>
      <div className="space-y-2">
        {eyebrow ? (
          <p className="text-muted-foreground text-xs font-semibold tracking-[0.18em] uppercase">
            {eyebrow}
          </p>
        ) : null}
        <h1 className="font-serif text-3xl font-semibold tracking-tight text-zinc-900 sm:text-4xl">
          {title}
        </h1>
        {description ? <p className="text-muted-foreground max-w-2xl text-sm sm:text-base">{description}</p> : null}
      </div>
      {action ? (
        <Link
          href={action.href}
          className="text-primary inline-flex items-center gap-1 text-sm font-medium hover:underline"
        >
          {action.label}
          <ArrowUpRight className="size-4" />
        </Link>
      ) : null}
    </div>
  );
}

type StatCardProps = {
  label: string;
  value: string;
  hint?: string;
  icon: LucideIcon;
  tone?: "default" | "income" | "expense" | "gold" | "trading" | "cash";
  href?: string;
};

const toneStyles = {
  default: "bg-zinc-100 text-zinc-700",
  income: "bg-emerald-50 text-emerald-700",
  expense: "bg-rose-50 text-rose-700",
  gold: "bg-amber-50 text-amber-700",
  trading: "bg-sky-50 text-sky-700",
  cash: "bg-violet-50 text-violet-700",
};

export function StatCard({label, value, hint, icon: Icon, tone = "default", href}: StatCardProps) {
  const content = (
    <div className="bg-card group hover:border-primary/20 relative overflow-hidden rounded-2xl border p-5 shadow-sm transition-all hover:shadow-md">
      <div className="flex items-start justify-between gap-4">
        <div className={cn("rounded-xl p-2.5", toneStyles[tone])}>
          <Icon className="size-5" strokeWidth={1.75} />
        </div>
        {href ? <ArrowUpRight className="text-muted-foreground size-4 opacity-0 transition-opacity group-hover:opacity-100" /> : null}
      </div>
      <div className="mt-4 space-y-1">
        <p className="text-muted-foreground text-sm">{label}</p>
        <p className="text-2xl font-semibold tracking-tight text-zinc-900">{value}</p>
        {hint ? <p className="text-muted-foreground text-xs">{hint}</p> : null}
      </div>
    </div>
  );

  if (href) {
    return (
      <Link href={href} className="block">
        {content}
      </Link>
    );
  }

  return content;
}

type SectionNavItem = {
  label: string;
  href: string;
  description?: string;
};

export function SectionNav({items, activeHref}: {items: SectionNavItem[]; activeHref?: string}) {
  return (
    <div className="mb-8 grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
      {items.map((item) => {
        const active = activeHref === item.href;
        return (
          <Link
            key={item.href}
            href={item.href}
            className={cn(
              "rounded-xl border px-4 py-3 transition-colors",
              active
                ? "border-primary bg-primary/5 shadow-sm"
                : "bg-card hover:border-primary/30 hover:bg-zinc-50",
            )}
          >
            <p className={cn("font-medium", active ? "text-primary" : "text-zinc-900")}>{item.label}</p>
            {item.description ? <p className="text-muted-foreground mt-1 text-xs">{item.description}</p> : null}
          </Link>
        );
      })}
    </div>
  );
}

export function EmptyState({
  title,
  description,
  action,
}: {
  title: string;
  description: string;
  action?: {label: string; href: string};
}) {
  return (
    <div className="bg-card flex flex-col items-center justify-center rounded-2xl border border-dashed px-6 py-16 text-center">
      <h3 className="text-lg font-medium text-zinc-900">{title}</h3>
      <p className="text-muted-foreground mt-2 max-w-md text-sm">{description}</p>
      {action ? (
        <Link
          href={action.href}
          className="bg-primary text-primary-foreground mt-6 inline-flex rounded-lg px-4 py-2 text-sm font-medium"
        >
          {action.label}
        </Link>
      ) : null}
    </div>
  );
}
