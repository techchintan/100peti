"use client";

import {cn} from "@/lib/utils";
import {Button} from "@/components/ui/button";
import {Card, CardContent} from "@/components/ui/card";
import {Input} from "@/components/ui/input";
import {Label} from "@/components/ui/label";
import Image from "next/image";
import {useState} from "react";
import {useRouter} from "next/navigation";

const coolQuotes = [
  {
    quote: `Success is not just about making money. It's about making a difference.`,
    author: "Millionaire Mindset",
  },
  {
    quote: `The only limit to our realization of tomorrow is our doubts of today.`,
    author: "Franklin D. Roosevelt",
  },
  {
    quote: `Dream big and dare to fail.`,
    author: "Norman Vaughan",
  },
  {
    quote: `Opportunities don't happen, you create them.`,
    author: "Chris Grosser",
  },
  {
    quote: `Do something today that your future self will thank you for.`,
    author: "Sean Patrick Flanery",
  },
];

function getRandomQuote() {
  const idx = Math.floor(Math.random() * coolQuotes.length);
  return coolQuotes[idx];
}

export function LoginForm({className, ...props}: React.ComponentProps<"div">) {
  const [quoteObj] = useState(() => getRandomQuote());
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError("");

    try {
      const response = await fetch("/api/login", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({email, password}),
      });

      if (response.ok) {
        router.push("/");
        router.refresh();
      } else {
        setError("Invalid password");
      }
    } catch {
      setError("Login failed. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className={cn("flex flex-col gap-6", className)} {...props}>
      <Card className="overflow-hidden p-0">
        <CardContent className="grid p-0 md:grid-cols-2">
          <form className="p-6 md:p-8" onSubmit={handleSubmit}>
            <div className="flex flex-col gap-6">
              <div className="flex flex-col items-center text-center">
                <h1 className="text-2xl font-bold">Welcome back</h1>
                <p className="text-muted-foreground text-balance">Login to 100 Peti account</p>
                <blockquote className="text-primary mt-4 text-sm italic">
                  &quot;{quoteObj.quote}&quot; <br />
                  <span className="text-muted-foreground text-xs">— {quoteObj.author}</span>
                </blockquote>
              </div>
              {error && (
                <div className="text-destructive text-sm text-center bg-destructive/10 p-3 rounded-md">
                  {error}
                </div>
              )}
              <div className="grid gap-3">
                <Label htmlFor="email">Email</Label>
                <Input 
                  id="email" 
                  type="email" 
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required 
                />
                <Label htmlFor="password">Password</Label>
                <Input 
                  id="password" 
                  type="password" 
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required 
                />
              </div>
              <Button type="submit" className="w-full" disabled={isLoading}>
                {isLoading ? "Logging in..." : "Login"}
              </Button>
            </div>
          </form>
          <div className="bg-muted relative hidden md:block">
            <div className="absolute inset-0">
              <Image
                src="/chintan.webp"
                alt="Profile Picture"
                fill
                sizes="(min-width: 768px) 50vw, 100vw"
                priority
                className="object-cover object-center"
                style={{objectPosition: "center top"}}
              />
              <div className="to-primary/20 pointer-events-none absolute inset-0 animate-pulse bg-gradient-to-br from-transparent via-white/10" />
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
