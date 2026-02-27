/**
 * Generate a fractional position between two values for ordering.
 * Used for drag-and-drop reordering without rewriting all positions.
 */
export function midpoint(a: number, b: number): number {
  return (a + b) / 2;
}

/**
 * Generate a position after the last item in a list.
 */
export function positionAfter(lastPosition: number | undefined): number {
  return (lastPosition ?? 0) + 1;
}

/**
 * Format a date string for display.
 */
export function formatDate(dateStr: string): string {
  return new Date(dateStr).toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
}

/**
 * Get initials from a name.
 */
export function getInitials(name: string): string {
  return name
    .split(" ")
    .map((n) => n[0])
    .join("")
    .toUpperCase()
    .slice(0, 2);
}
