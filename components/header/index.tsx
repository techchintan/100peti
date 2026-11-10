"use client";

import Link from "next/link";
import {usePathname, useRouter} from "next/navigation";
import {ChevronDown, LogOut} from "lucide-react";

import {cn} from "@/lib/utils";
import {Settings as SettingsType} from "@/sanity.types";
import {Button} from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

type HeaderLinkItem = NonNullable<NonNullable<SettingsType["header"]>["headerLinks"]>[number];

export default function Header(props: SettingsType) {
  const {brand, header} = props;
  const router = useRouter();
  const pathname = usePathname();

  const hasSubmenu = (item: HeaderLinkItem) => Boolean(item.submenu && item.submenu.length > 0);

  const isActive = (item: HeaderLinkItem) => {
    if (item.link === pathname) return true;
    return item.submenu?.some((s) => s.link === pathname) ?? false;
  };

  const linkClass = (active: boolean) =>
    cn(
      "rounded-lg px-3 py-2 text-sm font-medium transition-colors",
      active ? "bg-zinc-900 text-white" : "text-zinc-600 hover:bg-zinc-100 hover:text-zinc-900",
    );

  return (
    <header className="sticky top-0 z-40 -mx-6 mb-10 border-b border-zinc-200/80 bg-white/90 px-6 py-4 backdrop-blur-md lg:-mx-12 lg:mb-12 lg:px-12">
      <div className="flex flex-col items-start justify-between gap-5 lg:flex-row lg:items-center">
        <Link href="/" className="group">
          <p className="text-muted-foreground text-xs font-semibold tracking-[0.18em] uppercase">
            Private Finance
          </p>
          <h1 className="font-serif text-2xl font-semibold tracking-tight text-zinc-900 lg:text-3xl">
            {brand?.name || "Sudani Family"}
          </h1>
        </Link>

        <nav className="flex w-full flex-wrap items-center gap-2 lg:w-auto lg:justify-end">
          {(header?.headerLinks || []).map((item) =>
            hasSubmenu(item) ? (
              <DropdownMenu key={item._key}>
                <DropdownMenuTrigger asChild>
                  <Button
                    variant="ghost"
                    className={cn(linkClass(isActive(item)), "h-auto gap-1 font-medium")}
                  >
                    {item.label}
                    <ChevronDown className="size-4 opacity-70" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="min-w-48">
                  {item.link ? (
                    <DropdownMenuItem asChild>
                      <Link href={item.link}>{item.label}</Link>
                    </DropdownMenuItem>
                  ) : null}
                  {item.link && (item.submenu?.length ?? 0) > 0 ? <DropdownMenuSeparator /> : null}
                  {item.submenu?.map((subItem) => (
                    <DropdownMenuItem key={subItem._key} asChild>
                      <Link href={subItem.link || "#"}>{subItem.label}</Link>
                    </DropdownMenuItem>
                  ))}
                </DropdownMenuContent>
              </DropdownMenu>
            ) : (
              <Link
                key={item._key}
                className={linkClass(item.link === pathname)}
                href={item.link || "#"}
              >
                {item.label}
              </Link>
            ),
          )}
          <Button
            variant="outline"
            size="sm"
            className="ml-auto gap-2 lg:ml-2"
            onClick={async () => {
              await fetch("/api/logout", {method: "POST"});
              router.push("/login");
            }}
          >
            <LogOut className="size-4" />
            Logout
          </Button>
        </nav>
      </div>
    </header>
  );
}
