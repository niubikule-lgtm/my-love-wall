import { Link, useLocation } from "wouter";
import { Heart, Flame, PenLine } from "lucide-react";

export function Layout({ children }: { children: React.ReactNode }) {
  const [location] = useLocation();

  return (
    <div className="min-h-screen flex flex-col">
      <header className="sticky top-0 z-50 w-full border-b border-primary/10 bg-background/80 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="container mx-auto flex h-16 max-w-2xl items-center justify-between px-4">
          <Link href="/" className="flex items-center gap-2 text-primary hover:opacity-80 transition-opacity">
            <Heart className="h-6 w-6 fill-current" />
            <span className="font-serif text-xl font-bold">校园表白墙</span>
          </Link>
          <nav className="flex items-center gap-6 text-sm font-medium">
            <Link 
              href="/" 
              className={`transition-colors hover:text-primary ${location === "/" ? "text-primary" : "text-muted-foreground"}`}
            >
              <div className="flex items-center gap-1.5">
                <PenLine className="h-4 w-4" />
                最新
              </div>
            </Link>
            <Link 
              href="/trending" 
              className={`transition-colors hover:text-primary ${location === "/trending" ? "text-primary" : "text-muted-foreground"}`}
            >
              <div className="flex items-center gap-1.5">
                <Flame className="h-4 w-4" />
                热门
              </div>
            </Link>
          </nav>
        </div>
      </header>
      <main className="flex-1 container mx-auto max-w-2xl px-4 py-8">
        {children}
      </main>
    </div>
  );
}
