"use client";

import { Bell } from "lucide-react";
import { WorkspaceSwitcher } from "./workspace-switcher";

export function Header() {
  return (
    <header className="flex h-14 items-center justify-between border-b border-border px-6">
      <div className="w-56">
        <WorkspaceSwitcher />
      </div>

      <div className="flex items-center gap-3">
        <button className="rounded-md p-2 text-muted-foreground hover:bg-accent hover:text-foreground">
          <Bell className="h-4 w-4" />
        </button>
      </div>
    </header>
  );
}
