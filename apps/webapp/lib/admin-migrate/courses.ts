import { createStagingAdminClient } from "./adminClient";

const UUID_RE = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

const COURSE_SELECT =
  "id, course_name, course_code, program_type, programming_offering, length_of_class, certification_length, registration_limit, price, registration_fee, jb_learning_label, jb_learning_url, platinum_ed_label, platinum_ed_url";

type CourseRow = {
  id: string;
  course_name: string | null;
  course_code: string | null;
  program_type: string | null;
  programming_offering: string | null;
  length_of_class: string | null;
  certification_length: number | null;
  registration_limit: number | null;
  price: number | null;
  registration_fee: number | null;
  jb_learning_label: string | null;
  jb_learning_url: string | null;
  platinum_ed_label: string | null;
  platinum_ed_url: string | null;
};

export type StagingCourse = {
  id: string;
  name: string;
  code: string | null;
  kind: "Program" | "Course";
  classFormat: string | null;
  classLength: string | null;
  certificationLength: number | null;
  registrationLimit: number | null;
  price: number | null;
  registrationFee: number | null;
  jbLearningLabel: string | null;
  jbLearningUrl: string | null;
  platinumEdLabel: string | null;
  platinumEdUrl: string | null;
};

function toStagingCourse(row: CourseRow): StagingCourse {
  return {
    id: row.id,
    name: row.course_name || row.course_code || "Untitled",
    code: row.course_code,
    kind: row.program_type === "program" ? "Program" : "Course",
    classFormat: row.programming_offering,
    classLength: row.length_of_class,
    certificationLength: row.certification_length,
    registrationLimit: row.registration_limit,
    price: row.price,
    registrationFee: row.registration_fee,
    jbLearningLabel: row.jb_learning_label,
    jbLearningUrl: row.jb_learning_url,
    platinumEdLabel: row.platinum_ed_label,
    platinumEdUrl: row.platinum_ed_url,
  };
}

export async function listCourses(): Promise<StagingCourse[]> {
  const supabase = createStagingAdminClient();
  const { data, error } = await supabase.from("courses").select(COURSE_SELECT).order("course_code");

  if (error) {
    throw new Error(error.message);
  }

  return ((data ?? []) as CourseRow[]).map(toStagingCourse);
}

export async function getCourseById(id: string): Promise<StagingCourse | null> {
  if (!UUID_RE.test(id)) return null;

  const supabase = createStagingAdminClient();
  const { data, error } = await supabase.from("courses").select(COURSE_SELECT).eq("id", id).maybeSingle();

  if (error) {
    throw new Error(error.message);
  }
  if (!data) return null;

  return toStagingCourse(data as CourseRow);
}
