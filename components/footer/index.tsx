import {IndianRupee} from "lucide-react";

import {Settings as SettingsType} from "@/sanity.types";

export default function Footer(props: SettingsType) {
  const {brand} = props;

  return (
    <footer className="border-t border-zinc-200 bg-white">
      <div className="mx-auto flex max-w-380 flex-col items-center justify-between gap-3 px-6 py-6 text-center sm:flex-row sm:text-left lg:px-12">
        <div className="flex items-center gap-2 text-zinc-600">
          <IndianRupee className="size-4" />
          <p className="text-sm">
            {brand?.name || "Sudani Family"} · Private wealth dashboard
          </p>
        </div>
        <p className="text-muted-foreground text-xs">
          © {new Date().getFullYear()} · Secured family access only
        </p>
      </div>
    </footer>
  );
}
