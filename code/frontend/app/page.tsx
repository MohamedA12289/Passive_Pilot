/**
 * Frontend 4: Marketing Pages Pack (old Pilot style-inspired)
 * Drop these into your Next.js app router project under /app.
 * Uses existing <Navigation /> and <Footer /> from Frontend 2/3.
 */
import Navigation from "@/components/navigation";
import Footer from "@/components/footer";

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section className="mx-auto max-w-6xl px-4 py-10">
      <div className="rounded-2xl border border-zinc-800 bg-zinc-950/40 p-6 shadow-sm">
        <h1 className="text-3xl md:text-4xl font-semibold tracking-tight text-white">{title}</h1>
        <div className="mt-4 text-zinc-300 leading-relaxed space-y-4">
          {children}
        </div>
      </div>
    </section>
  );
}

export default function Page() {{
  return (
    <div className="min-h-screen bg-zinc-950 text-white">
      <Navigation />
      <main>
        <Section title="Passive Pilot">
          <p>Passive Pilot helps you run a tighter campaign workflow end-to-end — target area → filters → lead pull → review → export.</p>
          <p>This site is the public home for the product. Use the Dashboard to run campaigns step-by-step.</p>
        </Section>
      </main>
      <Footer />
    </div>
  );
}}
