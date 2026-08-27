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
      id="main-content"
      tabIndex={-1}
      className={cn("app-shell-main", className)}
    >
      <div className="app-container">{children}</div>
    </main>
  );
}
