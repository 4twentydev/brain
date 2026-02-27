export default function DashboardPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Dashboard</h1>
        <p className="text-sm text-muted-foreground">
          Overview of your tasks, projects, and operations.
        </p>
      </div>

      <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-4">
        {[
          { label: "Open Tasks", value: "—" },
          { label: "Active Projects", value: "—" },
          { label: "Work Orders", value: "—" },
          { label: "Machines Online", value: "—" },
        ].map((stat) => (
          <div
            key={stat.label}
            className="rounded-lg border border-border bg-card p-5"
          >
            <p className="text-sm text-muted-foreground">{stat.label}</p>
            <p className="mt-1 text-2xl font-semibold">{stat.value}</p>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
        <div className="rounded-lg border border-border bg-card p-5">
          <h2 className="text-sm font-medium text-muted-foreground">
            Recent Activity
          </h2>
          <p className="mt-8 text-center text-sm text-muted-foreground">
            No activity yet
          </p>
        </div>
        <div className="rounded-lg border border-border bg-card p-5">
          <h2 className="text-sm font-medium text-muted-foreground">
            Upcoming Due
          </h2>
          <p className="mt-8 text-center text-sm text-muted-foreground">
            Nothing due
          </p>
        </div>
      </div>
    </div>
  );
}
