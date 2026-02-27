import type { SupabaseClient } from "../client";

export async function getWorkspacesForUser(client: SupabaseClient) {
  const { data, error } = await client
    .from("workspace_members")
    .select(
      `
      workspace_id,
      role,
      workspaces:workspace_id (
        id,
        name,
        slug,
        type,
        settings
      )
    `
    )
    .order("role", { ascending: true });

  if (error) throw error;
  return data;
}

export async function getWorkspaceBySlug(client: SupabaseClient, slug: string) {
  const { data, error } = await client
    .from("workspaces")
    .select("*")
    .eq("slug", slug)
    .single();

  if (error) throw error;
  return data;
}
