"use client";

import { useState } from "react";
import { cn } from "@/lib/utils";
import { Building2, User, ChevronDown } from "lucide-react";

interface Workspace {
  id: string;
  name: string;
  slug: string;
  type: "organization" | "personal";
}

// Placeholder until we wire up real data from Supabase
const PLACEHOLDER_WORKSPACES: Workspace[] = [
  { id: "1", name: "Elward Systems", slug: "elward", type: "organization" },
  { id: "2", name: "Personal", slug: "personal", type: "personal" },
];

export function WorkspaceSwitcher() {
  const [open, setOpen] = useState(false);
  const [active, setActive] = useState<Workspace>(PLACEHOLDER_WORKSPACES[0]);

  return (
    <div className="relative">
      <button
        onClick={() => setOpen(!open)}
        className="flex w-full items-center gap-2 rounded-md border border-border bg-muted px-3 py-2 text-sm text-foreground hover:bg-accent"
      >
        {active.type === "organization" ? (
          <Building2 className="h-4 w-4 shrink-0 text-primary" />
        ) : (
          <User className="h-4 w-4 shrink-0 text-primary" />
        )}
        <span className="flex-1 truncate text-left">{active.name}</span>
        <ChevronDown className="h-3 w-3 shrink-0 text-muted-foreground" />
      </button>

      {open && (
        <>
          <div className="fixed inset-0 z-40" onClick={() => setOpen(false)} />
          <div className="absolute left-0 top-full z-50 mt-1 w-full rounded-md border border-border bg-popover py-1 shadow-lg">
            {PLACEHOLDER_WORKSPACES.map((ws) => (
              <button
                key={ws.id}
                onClick={() => {
                  setActive(ws);
                  setOpen(false);
                }}
                className={cn(
                  "flex w-full items-center gap-2 px-3 py-2 text-sm hover:bg-accent",
                  active.id === ws.id && "text-primary"
                )}
              >
                {ws.type === "organization" ? (
                  <Building2 className="h-4 w-4 shrink-0" />
                ) : (
                  <User className="h-4 w-4 shrink-0" />
                )}
                <span className="truncate">{ws.name}</span>
              </button>
            ))}
          </div>
        </>
      )}
    </div>
  );
}
