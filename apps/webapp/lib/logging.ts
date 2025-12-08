import { createSupabaseAdminClient } from "@midwestea/utils";
import { createSupabaseClient } from "@midwestea/utils";

export interface LogEntry {
  admin_user_id?: string | null;
  reference_id: string;
  reference_type: "program" | "course" | "class" | "student";
  action_type: "detail_updated" | "class_created" | "class_deleted" | "student_added" | "student_removed" | "student_registered" | "payment_success";
  field_name?: string | null;
  old_value?: string | null;
  new_value?: string | null;
  batch_id?: string | null;
  student_id?: string | null;
  class_id?: string | null;
  amount?: number | null;
}

/**
 * Get current admin user from session
 * Queries admins table using auth.users.id from session
 * Can work with either a user ID (for server-side) or by getting session (for client-side)
 */
export async function getCurrentAdmin(userId?: string): Promise<{ admin: { id: string; display_name: string } | null; error: string | null }> {
  try {
    let authUserId: string | undefined = userId;

    // If no userId provided, try to get from session
    if (!authUserId) {
      const supabase = await createSupabaseClient();
      const { data: { session }, error: sessionError } = await supabase.auth.getSession();

      if (sessionError || !session?.user) {
        return { admin: null, error: "Not authenticated" };
      }

      authUserId = session.user.id;
    }

    if (!authUserId) {
      return { admin: null, error: "No user ID available" };
    }

    // Use admin client for querying admins table
    const supabase = createSupabaseAdminClient();
    const { data: admin, error: adminError } = await supabase
      .from("admins")
      .select("id, display_name")
      .eq("id", authUserId)
      .is("deleted_at", null)
      .single();

    if (adminError) {
      // Admin might not exist in admins table yet
      return { admin: null, error: adminError.message };
    }

    return { admin: admin || null, error: null };
  } catch (err: any) {
    return { admin: null, error: err.message || "Failed to get current admin" };
  }
}

/**
 * Insert a log entry into the logs table
 * Uses admin client for server-side operations
 */
export async function insertLog(entry: LogEntry): Promise<{ success: boolean; error: string | null }> {
  try {
    const supabase = createSupabaseAdminClient();

    const { error } = await supabase
      .from("logs")
      .insert({
        admin_user_id: entry.admin_user_id || null,
        reference_id: entry.reference_id,
        reference_type: entry.reference_type,
        action_type: entry.action_type,
        field_name: entry.field_name || null,
        old_value: entry.old_value || null,
        new_value: entry.new_value || null,
        batch_id: entry.batch_id || null,
        student_id: entry.student_id || null,
        class_id: entry.class_id || null,
        amount: entry.amount || null,
        timestamp: new Date().toISOString(),
      });

    if (error) {
      return { success: false, error: error.message };
    }

    return { success: true, error: null };
  } catch (err: any) {
    return { success: false, error: err.message || "Failed to insert log" };
  }
}

/**
 * Format timestamp into human-readable relative time
 * 0-5 sec → "just now"
 * < 60 sec → "X seconds ago"
 * < 60 min → "X minutes ago"
 * < 24 hours → "X hours ago"
 * < 7 days → "X days ago"
 * ≥ 7 days → "MMM DD, YYYY"
 */
export function formatTimestamp(timestamp: string | Date): string {
  const now = new Date();
  const time = typeof timestamp === "string" ? new Date(timestamp) : timestamp;
  const diffMs = now.getTime() - time.getTime();
  const diffSec = Math.floor(diffMs / 1000);
  const diffMin = Math.floor(diffSec / 60);
  const diffHour = Math.floor(diffMin / 60);
  const diffDay = Math.floor(diffHour / 24);

  if (diffSec < 5) {
    return "just now";
  } else if (diffSec < 60) {
    return `${diffSec} seconds ago`;
  } else if (diffMin < 60) {
    return `${diffMin} ${diffMin === 1 ? "minute" : "minutes"} ago`;
  } else if (diffHour < 24) {
    return `${diffHour} ${diffHour === 1 ? "hour" : "hours"} ago`;
  } else if (diffDay < 7) {
    return `${diffDay} ${diffDay === 1 ? "day" : "days"} ago`;
  } else {
    // Format as "MMM DD, YYYY"
    const months = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
    const month = months[time.getMonth()];
    const day = time.getDate();
    const year = time.getFullYear();
    return `${month} ${day}, ${year}`;
  }
}

