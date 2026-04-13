"use client";

import Link from "next/link";
import { usePathname, useSearchParams } from "next/navigation";
import { UserButton } from "@clerk/nextjs";
import { CalendarDays, List, Sun, StickyNote, CheckSquare, Cog, Upload } from "lucide-react";

interface NavItem {
  icon: typeof CalendarDays;
  href: string;
  label: string;
}

const navItems: NavItem[] = [
  { icon: List, href: "/planner?view=list", label: "List" },
  { icon: Sun, href: "/planner?view=day", label: "Day" },
  { icon: CalendarDays, href: "/planner?view=calendar", label: "Week" },
  { icon: StickyNote, href: "/notes", label: "Notes" },
  { icon: CheckSquare, href: "/todos", label: "To-Do" },
];

const bottomItems: NavItem[] = [
  { icon: Upload, href: "/import", label: "Import" },
  { icon: Cog, href: "/settings", label: "Settings" },
];

function NavButton({ item, isActive }: { item: NavItem; isActive: boolean }) {
  const Icon = item.icon;
  return (
    <Link
      href={item.href}
      className={`flex flex-col items-center gap-0.5 py-2 px-1 rounded-lg w-12 transition-all duration-200 ${
        isActive
          ? "text-stone-800 bg-stone-100"
          : "text-stone-400 hover:text-stone-600 hover:bg-stone-50"
      }`}
    >
      <Icon size={19} strokeWidth={isActive ? 2.2 : 1.8} />
      <span className={`text-[10px] ${isActive ? "font-semibold" : "font-medium"}`}>{item.label}</span>
    </Link>
  );
}

export function LeftNav() {
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const view = searchParams.get("view");

  function isActive(item: NavItem) {
    const [itemPath, itemQuery] = item.href.split("?");
    if (pathname !== itemPath && !pathname.startsWith(itemPath + "/")) {
      return false;
    }
    // For planner sub-views, match on query param
    if (itemQuery) {
      const itemView = new URLSearchParams(itemQuery).get("view");
      if (itemPath === "/planner") {
        // "list" is active when on /planner with no view param or view=list
        if (itemView === "list") return !view || view === "list";
        return view === itemView;
      }
    }
    return true;
  }

  return (
    <nav className="w-16 h-full bg-white border-r border-stone-200/80 flex flex-col items-center pt-5 gap-0.5 relative z-50">
      {navItems.map((item) => (
        <NavButton key={item.href} item={item} isActive={isActive(item)} />
      ))}

      <div className="mt-auto mb-4 flex flex-col items-center gap-0.5">
        <div className="w-8 h-px bg-stone-100 mx-auto mb-1" />
        {bottomItems.map((item) => (
          <NavButton key={item.href} item={item} isActive={isActive(item)} />
        ))}
        <div className="mt-2">
          <UserButton
            appearance={{
              elements: { avatarBox: "w-8 h-8" },
            }}
          />
        </div>
      </div>
    </nav>
  );
}
