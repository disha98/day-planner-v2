import { NextRequest, NextResponse } from "next/server";
import { supabase } from "@/lib/supabase";
import { startOfWeek, addDays, format } from "date-fns";

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ token: string }> }
) {
  const { token } = await params;

  // Validate token
  const { data: share } = await supabase
    .from("calendar_shares")
    .select("user_id, is_active")
    .eq("token", token)
    .single();

  if (!share || !share.is_active) {
    return NextResponse.json({ error: "Share not found" }, { status: 404 });
  }

  // Parse date range
  const searchParams = request.nextUrl.searchParams;
  const weekStartParam = searchParams.get("weekStart");
  const weekStart = weekStartParam
    ? weekStartParam
    : format(startOfWeek(new Date(), { weekStartsOn: 1 }), "yyyy-MM-dd");
  const weekEnd = format(addDays(new Date(weekStart), 6), "yyyy-MM-dd");

  const userId = share.user_id;

  // Fetch time blocks, tasks, and categories in parallel
  const [blocksResult, tasksResult, categoriesResult] = await Promise.all([
    supabase
      .from("time_blocks")
      .select("*, categories(name, color)")
      .eq("user_id", userId)
      .gte("date", weekStart)
      .lte("date", weekEnd)
      .order("start_hour"),
    supabase
      .from("tasks")
      .select("*, categories(name, color)")
      .eq("user_id", userId)
      .gte("date", weekStart)
      .lte("date", weekEnd)
      .order("sort_order"),
    supabase
      .from("categories")
      .select("id, name, color, created_at")
      .eq("user_id", userId)
      .order("name"),
  ]);

  // Enrich with category info (same pattern as use-time-blocks)
  const blocks = (blocksResult.data ?? []).map(
    (r: Record<string, unknown>) => {
      const cat = r.categories as { name: string; color: string } | null;
      return {
        id: r.id,
        title: r.title,
        description: r.description,
        meeting_url: r.meeting_url,
        date: r.date,
        start_hour: r.start_hour,
        end_hour: r.end_hour,
        category_id: r.category_id,
        category_name: cat?.name ?? null,
        category_color: cat?.color ?? null,
        created_at: r.created_at,
        updated_at: r.updated_at,
      };
    }
  );

  const tasks = (tasksResult.data ?? []).map(
    (r: Record<string, unknown>) => {
      const cat = r.categories as { name: string; color: string } | null;
      return {
        id: r.id,
        title: r.title,
        completed: r.completed,
        priority: r.priority,
        date: r.date,
        sort_order: r.sort_order,
        category_id: r.category_id,
        category_name: cat?.name ?? null,
        category_color: cat?.color ?? null,
        created_at: r.created_at,
        updated_at: r.updated_at,
      };
    }
  );

  return NextResponse.json({
    blocks,
    tasks,
    categories: categoriesResult.data ?? [],
    ownerId: userId,
  });
}
