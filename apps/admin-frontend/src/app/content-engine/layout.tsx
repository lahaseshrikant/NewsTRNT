/**
 * Content Engine Layout
 *
 * All content-engine pages use a dark-themed UI (dark cards, white text).
 * This layout wraps them in a dark background so the text stays visible
 * regardless of the admin panel's light/dark theme setting.
 */
export default function ContentEngineLayout({
 children,
}: {
 children: React.ReactNode;
}) {
 return (
 <div className="min-h-screen bg-[#0f0f1a] text-white">
 {children}
 </div>
 );
}
