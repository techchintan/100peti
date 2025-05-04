"use client";

import Link from "next/link";
import React from "react";
import {merge} from "@/utils";
import {usePathname} from "next/navigation";
import {Settings as SettingsType} from "@/sanity.types";

export default function Header(props: SettingsType) {
  const {brand, header} = props;
  const pathname = usePathname();

  return (
    <header className="mb-11 flex flex-col items-center justify-between gap-y-5 md:flex-row lg:mb-20 lg:gap-y-0">
      <h1 className="font-serif text-4xl font-semibold text-black">{brand?.name}</h1>
      <nav className="flex items-center gap-4 font-sans lg:gap-8">
        {(header?.headerLinks || []).map((item) => (
          <Link
            key={item._key}
            className={merge(
              "text-primary text-xl font-normal hover:text-black lg:text-2xl",
              item.link === pathname && "text-black",
            )}
            href={item.link || "#"}
            target={item.link?.includes("http") ? "_blank" : undefined}
          >
            {item.label}
          </Link>
        ))}
      </nav>
    </header>
  );
}
