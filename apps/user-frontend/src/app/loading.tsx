/**
 * Root loading state — shown during top-level route transitions.
 * Renders a skeleton with editorial styling.
 */
export default function Loading() {
  return (
    <div className="min-h-[60vh] flex items-center justify-center">
      <div className="flex flex-col items-center gap-4">
        {/* Spinning accent bar */}
        <div className="relative w-10 h-10">
          <div className="absolute inset-0 border-2 border-border rounded-full" />
          <div className="absolute inset-0 border-2 border-transparent border-t-vermillion rounded-full animate-spin" />
        </div>
        <p className="text-overline text-muted-foreground uppercase tracking-widest">
          Loading
        </p>
      </div>
    </div>
  );
}
