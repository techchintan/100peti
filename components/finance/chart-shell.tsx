import {Card, CardContent, CardDescription, CardHeader, CardTitle} from "@/components/ui/card";
import {cn} from "@/lib/utils";

export function EmptyChart({message}: {message: string}) {
  return <p className="text-muted-foreground py-12 text-center text-sm">{message}</p>;
}

export function ChartCard({
  title,
  description,
  children,
  className,
}: {
  title: string;
  description: string;
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <Card className={cn("overflow-hidden rounded-2xl border shadow-sm", className)}>
      <CardHeader className="border-b px-6 py-5">
        <CardTitle className="font-serif text-xl">{title}</CardTitle>
        <CardDescription>{description}</CardDescription>
      </CardHeader>
      <CardContent className="px-2 py-6 sm:px-6">{children}</CardContent>
    </Card>
  );
}

export function PeriodToggle<T extends string>({
  value,
  onChange,
  options,
}: {
  value: T;
  onChange: (value: T) => void;
  options: {value: T; label: string}[];
}) {
  return (
    <div className="bg-muted inline-flex rounded-lg p-1">
      {options.map(({value: optionValue, label}) => (
        <button
          key={optionValue}
          type="button"
          onClick={() => onChange(optionValue)}
          className={cn(
            "rounded-md px-3 py-1.5 text-sm font-medium transition-colors",
            value === optionValue
              ? "bg-background text-foreground shadow-sm"
              : "text-muted-foreground hover:text-foreground",
          )}
        >
          {label}
        </button>
      ))}
    </div>
  );
}
