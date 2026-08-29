import { cn } from "@/lib/utils";

export function PageShell({
  children,
  className,
  wide = false,
}: {
  children: React.ReactNode;
  className?: string;
  wide?: boolean;
}) {
  return (
    <main id="main-content" tabIndex={-1} className="app-shell-main flex-1">
      <div
        className={cn(
          "mx-auto w-full px-4 md:px-6 lg:px-10",
          wide ? "max-w-[1600px]" : "max-w-6xl",
          className
        )}
      >
        {children}
      </div>
    </main>
  );
}
