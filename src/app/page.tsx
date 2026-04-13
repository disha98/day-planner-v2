import { auth } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";
import Link from "next/link";
import {
  CalendarDays,
  CheckSquare,
  StickyNote,
  CloudSun,
  Sparkles,
  ArrowRight,
} from "lucide-react";

export default async function LandingPage() {
  const { userId } = await auth();
  if (userId) redirect("/planner");

  return (
    <div className="min-h-screen bg-stone-50 flex flex-col">
      {/* Nav */}
      <header className="w-full flex items-center justify-between px-8 py-5">
        <div className="flex items-center gap-2">
          <CalendarDays size={22} className="text-blue-500" />
          <span className="font-semibold text-stone-800 text-lg">Day Planner</span>
        </div>
        <div className="flex items-center gap-3">
          <Link
            href="/sign-in"
            className="text-sm font-medium text-stone-600 hover:text-stone-800 transition-colors px-4 py-2"
          >
            Sign In
          </Link>
          <Link
            href="/sign-up"
            className="text-sm font-medium text-white bg-stone-800 hover:bg-stone-700 transition-colors px-4 py-2 rounded-lg"
          >
            Get Started
          </Link>
        </div>
      </header>

      {/* Hero */}
      <main className="flex-1 flex flex-col items-center justify-center px-6 -mt-16">
        <div className="max-w-2xl text-center">
          <div className="inline-flex items-center gap-1.5 bg-blue-50 text-blue-600 text-xs font-medium px-3 py-1.5 rounded-full mb-6">
            <Sparkles size={13} />
            Weather &amp; holidays built in
          </div>

          <h1 className="text-5xl font-bold text-stone-900 tracking-tight leading-tight">
            Plan your days with
            <span className="text-blue-500"> clarity</span>
          </h1>

          <p className="mt-4 text-lg text-stone-500 leading-relaxed max-w-lg mx-auto">
            A clean, focused day planner with time blocks, tasks, notes,
            live weather forecasts, and public holiday awareness.
          </p>

          <div className="mt-8 flex items-center gap-4 justify-center">
            <Link
              href="/sign-up"
              className="inline-flex items-center gap-2 bg-blue-500 hover:bg-blue-600 text-white font-medium px-6 py-3 rounded-xl transition-colors text-sm"
            >
              Start Planning
              <ArrowRight size={16} />
            </Link>
            <Link
              href="/sign-in"
              className="inline-flex items-center gap-2 text-stone-600 hover:text-stone-800 font-medium px-6 py-3 rounded-xl transition-colors text-sm border border-stone-200 hover:border-stone-300"
            >
              Sign In
            </Link>
          </div>
        </div>

        {/* Feature grid */}
        <div className="mt-20 grid grid-cols-2 md:grid-cols-4 gap-6 max-w-3xl w-full">
          {[
            {
              icon: CalendarDays,
              title: "Time Blocks",
              desc: "Drag-and-drop weekly schedule",
              color: "text-blue-500",
              bg: "bg-blue-50",
            },
            {
              icon: CheckSquare,
              title: "Tasks",
              desc: "Prioritized to-do lists",
              color: "text-emerald-500",
              bg: "bg-emerald-50",
            },
            {
              icon: StickyNote,
              title: "Notes",
              desc: "Organized sections & pages",
              color: "text-amber-500",
              bg: "bg-amber-50",
            },
            {
              icon: CloudSun,
              title: "Weather",
              desc: "Live forecasts on your calendar",
              color: "text-violet-500",
              bg: "bg-violet-50",
            },
          ].map((f) => (
            <div
              key={f.title}
              className="flex flex-col items-center text-center p-5 rounded-2xl bg-white border border-stone-100 shadow-sm"
            >
              <div className={`${f.bg} p-2.5 rounded-xl mb-3`}>
                <f.icon size={20} className={f.color} />
              </div>
              <h3 className="text-sm font-semibold text-stone-800">{f.title}</h3>
              <p className="text-xs text-stone-400 mt-1">{f.desc}</p>
            </div>
          ))}
        </div>
      </main>

      {/* Footer */}
      <footer className="py-6 text-center text-xs text-stone-400">
        Built with Next.js, Supabase &amp; Clerk
      </footer>
    </div>
  );
}
