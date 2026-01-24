"use client";

import Link from "next/link";
import {usePathname, useRouter} from "next/navigation";
import {ChevronDown} from "lucide-react";

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
    cn("text-primary text-xl font-normal hover:text-black lg:text-2xl", active && "text-black");

  return (
    <header className="mb-11 flex flex-col items-center justify-between gap-y-5 md:flex-row lg:mb-20 lg:gap-y-0">
      <h1 className="font-serif text-4xl font-semibold text-black">{brand?.name}</h1>
      <nav className="flex items-center gap-4 font-sans lg:gap-8">
        {(header?.headerLinks || []).map((item) =>
          hasSubmenu(item) ? (
            <DropdownMenu key={item._key}>
              <DropdownMenuTrigger asChild>
                <Button
                  variant="ghost"
                  className={cn(linkClass(isActive(item)), "h-auto px-0 font-normal")}
                >
                  {item.label}
                  <ChevronDown className="ml-1 size-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="start" className="min-w-48">
                {item.link && (
                  <DropdownMenuItem asChild>
                    <Link
                      href={item.link}
                      target={item.link.includes("http") ? "_blank" : undefined}
                      className="text-base"
                    >
                      {item.label}
                    </Link>
                  </DropdownMenuItem>
                )}
                {item.link && (item.submenu?.length ?? 0) > 0 && <DropdownMenuSeparator />}
                {item.submenu?.map((subItem) => (
                  <DropdownMenuItem key={subItem._key} asChild>
                    <Link
                      href={subItem.link || "#"}
                      target={subItem.link?.includes("http") ? "_blank" : undefined}
                      className="text-base"
                    >
                      {subItem.label}
                    </Link>
                  </DropdownMenuItem>
                ))}
              </DropdownMenuContent>
            </DropdownMenu>
          ) : (
            <Link
              key={item._key}
              className={linkClass(item.link === pathname)}
              href={item.link || "#"}
              target={item.link?.includes("http") ? "_blank" : undefined}
            >
              {item.label}
            </Link>
          ),
        )}
        <Button
          onClick={async () => {
            await fetch("/api/logout", {method: "POST"});
            router.push("/login");
          }}
        >
          Logout
        </Button>
      </nav>
    </header>
  );
}
