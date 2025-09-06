"use client";

import Link from "next/link";
import React, {useState} from "react";
import {merge} from "@/utils";
import {usePathname} from "next/navigation";
import {Settings as SettingsType} from "@/sanity.types";
import {Button} from "@/components/ui/button";
import {useRouter} from "next/navigation";

export default function Header(props: SettingsType) {
  const {brand, header} = props;
  const router = useRouter();
  const pathname = usePathname();
  const [activeSubmenu, setActiveSubmenu] = useState<string | null>(null);

  return (
    <header className="mb-11 flex flex-col items-center justify-between gap-y-5 md:flex-row lg:mb-20 lg:gap-y-0">
      <h1 className="font-serif text-4xl font-semibold text-black">{brand?.name}</h1>
      <nav className="flex items-center gap-4 font-sans lg:gap-8">
        {(header?.headerLinks || []).map((item) => (
          <div
            key={item._key}
            className="group relative"
            onMouseEnter={() => setActiveSubmenu(item._key)}
            onMouseLeave={() => setActiveSubmenu(null)}
          >
            <Link
              className={merge(
                "text-primary text-xl font-normal hover:text-black lg:text-2xl",
                item.link === pathname && "text-black",
              )}
              href={item.link || "#"}
              target={item.link?.includes("http") ? "_blank" : undefined}
            >
              {item.label}
            </Link>
            {item.submenu && item.submenu.length > 0 && (
              <div
                className={merge(
                  "absolute top-full left-0 z-50 mt-2 w-48 rounded-md bg-white py-2 shadow-lg transition-all duration-200",
                  activeSubmenu === item._key
                    ? "translate-y-0 opacity-100"
                    : "pointer-events-none -translate-y-2 opacity-0",
                )}
              >
                {item.submenu.map((subItem) => (
                  <Link
                    key={subItem._key}
                    className="block px-4 py-2 text-xl text-gray-700 hover:bg-gray-100"
                    href={subItem.link || "#"}
                    target={subItem.link?.includes("http") ? "_blank" : undefined}
                  >
                    {subItem.label}
                  </Link>
                ))}
              </div>
            )}
          </div>
        ))}
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
