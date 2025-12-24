import { Shell } from "@/components/Shell";


export default function Page() {
  return (
    <Shell>
      <div className="space-y-4">
        <div className="pp-card p-6">
          <div className="flex items-start justify-between gap-4 flex-wrap">
            <div>
              <h1 className="text-2xl font-semibold">Dashboard</h1>
              <p className="pp-muted mt-1">Your hub for deals, tools, and progress.</p>
            </div>
            <div className="flex items-center gap-2">
              <span className="pp-badge">Beta</span>
              <span className="pp-badge">No APIs wired</span>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          <div className="pp-card p-6">
            <h2 className="text-lg font-semibold">Quick Actions</h2>
            <p className="pp-muted mt-1">These buttons are UI-only for now.</p>
            <div className="mt-4 flex flex-wrap gap-2">
              <button className="pp-btn-primary">Primary</button>
              <button className="pp-btn-secondary">Secondary</button>
              <button className="pp-btn-ghost">Ghost</button>
            </div>
          </div>

          <div className="pp-card p-6">
            <h2 className="text-lg font-semibold">Notes</h2>
            <ul className="mt-2 text-sm text-zinc-300 list-disc pl-5 space-y-1">
              <li>Dark glass look + purple/cyan glow to match the vibe.</li>
              <li>If colors still feel off, we tweak <span className="pp-kbd">app/globals.css</span>.</li>
              <li>We can later theme-match 1:1 once you confirm screenshots of the exact sections you want.</li>
            </ul>
          </div>
        </div>
      </div>
    </Shell>
  );
}
