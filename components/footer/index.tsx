import React from "react";
import {Settings as SettingsType} from "@/sanity.types";

export default function Footer(props: SettingsType) {
  const {brand} = props;

  return (
    <footer className="mx-auto flex max-w-328 min-w-[20rem] items-center justify-between gap-4 p-4">
      <p className="text-nobel text-center font-sans text-xl font-normal tracking-wide">
        {brand?.name} &copy; 2020 - {new Date().getFullYear()}.
      </p>
    </footer>
  );
}
