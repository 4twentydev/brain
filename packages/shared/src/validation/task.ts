import { z } from "zod";

export const createTaskSchema = z.object({
  title: z.string().min(1, "Title is required").max(500),
  description: z.string().nullable().optional(),
  status: z.enum(["backlog", "todo", "in_progress", "done", "cancelled"]).default("todo"),
  priority: z.enum(["urgent", "high", "medium", "low", "none"]).default("none"),
  type: z
    .enum(["task", "bug", "feature", "shopping_item", "maintenance", "reminder"])
    .default("task"),
  project_id: z.string().uuid().nullable().optional(),
  parent_id: z.string().uuid().nullable().optional(),
  assignee_id: z.string().uuid().nullable().optional(),
  due_date: z.string().nullable().optional(),
});

export const updateTaskSchema = createTaskSchema.partial();

export type CreateTaskInput = z.infer<typeof createTaskSchema>;
export type UpdateTaskInput = z.infer<typeof updateTaskSchema>;
