import { formatTimestamp } from "./logging";

export interface LogRecord {
  id: string;
  admin_user_id: string | null;
  reference_id: string;
  reference_type: "program" | "course" | "class" | "student";
  action_type: "detail_updated" | "class_created" | "class_deleted" | "student_added" | "student_removed" | "student_registered" | "payment_success";
  field_name: string | null;
  old_value: string | null;
  new_value: string | null;
  batch_id: string | null;
  student_id: string | null;
  class_id: string | null;
  amount: number | null;
  timestamp: string;
  admins?: {
    display_name: string;
  } | null;
  students?: {
    first_name: string | null;
    last_name: string | null;
    email: string | null;
  } | null;
  classes?: {
    class_id: string | null;
  } | null;
}

/**
 * Field labels for natural language formatting
 * Short-form labels that vary based on reference_type
 */
export const FIELD_LABELS: Record<string, Record<string, string>> = {
  program: {
    name: "Program Name",
    price: "Price",
    registration_fee: "Registration Fee",
  },
  course: {
    name: "Course Name",
    price: "Price",
    registration_fee: "Registration Fee",
  },
  class: {
    name: "Class Name",
    start_date: "Start Date",
    end_date: "End Date",
    location: "Location",
    enrollment_start: "Enrollment Start",
    enrollment_close: "Enrollment Close",
    is_online: "Online Class",
    length_of_class: "Length of Class",
    certification_length: "Cert. Length",
    graduation_rate: "Graduation Rate",
    registration_limit: "Registration Limit",
    price: "Price",
    registration_fee: "Registration Fee",
  },
  student: {
    first_name: "First Name",
    last_name: "Last Name",
    email: "Email",
    phone: "Phone Number",
    t_shirt_size: "T-Shirt Size",
    emergency_contact_name: "Emergency Contact Name",
    emergency_contact_phone: "Emergency Contact Phone",
    has_required_info: "Has Required Info",
  },
};

/**
 * Format a log entry into natural language
 * Uses admin display_name from admins table join
 */
export function formatLogMessage(log: LogRecord): string {
  const adminName = log.admins?.display_name || "Unknown Admin";
  const timestamp = formatTimestamp(log.timestamp);

  switch (log.action_type) {
    case "detail_updated":
      return formatDetailUpdate(log, adminName, timestamp);

    case "class_created":
      // On course/program detail pages, show class_id; on class detail page, show "this class"
      if ((log.reference_type === "course" || log.reference_type === "program") && log.classes?.class_id) {
        return `${adminName} created Class ID ${log.classes.class_id} – ${timestamp}`;
      }
      return `${adminName} created this class – ${timestamp}`;

    case "class_deleted":
      return `${adminName} deleted this class – ${timestamp}`;

    case "student_added": {
      const studentName = formatStudentName(log.students);
      const studentEmail = log.students?.email || "";
      const emailPart = studentEmail ? ` (${studentEmail})` : "";
      return `${adminName} added ${studentName}${emailPart} to this class – ${timestamp}`;
    }

    case "student_removed": {
      const studentName = formatStudentName(log.students);
      const studentEmail = log.students?.email || "";
      const emailPart = studentEmail ? ` (${studentEmail})` : "";
      return `${adminName} removed ${studentName}${emailPart} from this class – ${timestamp}`;
    }

    case "student_registered": {
      const studentName = formatStudentName(log.students);
      const studentEmail = log.students?.email || "";
      const emailPart = studentEmail ? ` (${studentEmail})` : "";
      return `${studentName}${emailPart} registered for this class – ${timestamp}`;
    }

    case "payment_success": {
      const studentName = formatStudentName(log.students);
      const studentEmail = log.students?.email || "";
      const emailPart = studentEmail ? ` (${studentEmail})` : "";
      const amount = log.amount ? formatCurrency(log.amount) : "$0.00";
      return `${studentName}${emailPart} paid ${amount} – ${timestamp}`;
    }

    default:
      return `Action performed – ${timestamp}`;
  }
}

/**
 * Format detail update log message
 * Handles three cases:
 * - old_value is NULL → "[Admin] added [Field Label]: "[new_value]" – [timestamp]"
 * - new_value is NULL → "[Admin] removed [Field Label] – [timestamp]"
 * - Otherwise → "[Admin] updated the [Field Label] from "[old_value]" to "[new_value]" – [timestamp]"
 */
function formatDetailUpdate(log: LogRecord, adminName: string, timestamp: string): string {
  if (!log.field_name) {
    return `${adminName} updated this ${log.reference_type} – ${timestamp}`;
  }

  const fieldLabel = getFieldLabel(log.reference_type, log.field_name);
  
  if (log.old_value === null || log.old_value === undefined || log.old_value === "") {
    // Added field
    return `${adminName} added ${fieldLabel}: "${log.new_value || ""}" – ${timestamp}`;
  } else if (log.new_value === null || log.new_value === undefined || log.new_value === "") {
    // Removed field
    return `${adminName} removed ${fieldLabel} – ${timestamp}`;
  } else {
    // Updated field
    return `${adminName} updated the ${fieldLabel} from "${log.old_value}" to "${log.new_value}" – ${timestamp}`;
  }
}

/**
 * Get field label for a given reference type and field name
 */
function getFieldLabel(referenceType: string, fieldName: string): string {
  const labels = FIELD_LABELS[referenceType];
  if (labels && labels[fieldName]) {
    return labels[fieldName];
  }
  // Fallback: capitalize and replace underscores
  return fieldName
    .split("_")
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(" ");
}

/**
 * Format student name from student record
 */
function formatStudentName(student: LogRecord["students"]): string {
  if (!student) {
    return "Unknown Student";
  }
  const firstName = student.first_name || "";
  const lastName = student.last_name || "";
  const name = `${firstName} ${lastName}`.trim();
  return name || "Unknown Student";
}

/**
 * Format currency amount (stored in cents)
 */
function formatCurrency(cents: number): string {
  const dollars = cents / 100;
  return `$${dollars.toFixed(2)}`;
}

