import React from "react";
import {Settings as SettingsType} from "@/sanity.types";
import Link from "next/link";
import {SanityImage} from "../image";

export default function Footer(props: SettingsType) {
  const {brand, footer} = props;

  return (
    <footer className="mx-auto flex max-w-[82rem] min-w-[20rem] items-center justify-between gap-4 p-4">
      <p className="text-nobel text-center font-sans text-xl font-normal tracking-wide">
        {brand?.name} &copy; 2021 - {new Date().getFullYear()}.
      </p>
      <div className="flex items-center justify-center gap-6">
        {(footer?.socialLinks || []).map((item) => (
          <Link
            key={item._key}
            href={item.link || "#"}
            target="_blank"
            className="flex items-center justify-center opacity-60 hover:opacity-100"
          >
            <SanityImage src={item.icon || ""} alt={item.label || ""} width={24} height={24} />
          </Link>
        ))}
      </div>
    </footer>
  );
}
