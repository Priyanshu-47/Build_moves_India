import { cn } from "@/lib/utils";

export function PageShell({
  children,
  className,
}: {
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <main
      className={cn(
        "mx-auto w-full max-w-lg flex-1 px-4 py-6 sm:max-w-2xl sm:px-6 sm:py-8",
        className
      )}
    >
      {children}
    </main>
  );
}
