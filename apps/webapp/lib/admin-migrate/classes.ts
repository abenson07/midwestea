import { createStagingAdminClient } from "./adminClient";
import { isUuid } from "./ids";

const CLASS_SELECT =
  "id, class_id, class_name, course_code, course_uuid, enrollment_start, enrollment_close, class_start_date, class_close_date, location, programming_offering, length_of_class, certification_length, registration_limit, price, registration_fee, jb_learning_label, jb_learning_url, platinum_ed_label, platinum_ed_url";

type ClassRow = {
  id: string;
  class_id: string | null;
  class_name: string | null;
  course_code: string | null;
  course_uuid: string | null;
  enrollment_start: string | null;
  enrollment_close: string | null;
  class_start_date: string | null;
  class_close_date: string | null;
  location: string | null;
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

export type StagingClass = {
  id: string;
  classCode: string | null;
  name: string | null;
  courseCode: string | null;
  courseUuid: string | null;
  enrollmentStart: string | null;
  enrollmentClose: string | null;
  classStart: string | null;
  classEnd: string | null;
  location: string | null;
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

function toStagingClass(row: ClassRow): StagingClass {
  return {
    id: row.id,
    classCode: row.class_id,
    name: row.class_name,
    courseCode: row.course_code,
    courseUuid: row.course_uuid,
    enrollmentStart: row.enrollment_start,
    enrollmentClose: row.enrollment_close,
    classStart: row.class_start_date,
    classEnd: row.class_close_date,
    location: row.location,
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

export async function listClasses(): Promise<StagingClass[]> {
  const supabase = createStagingAdminClient();
  const { data, error } = await supabase.from("classes").select(CLASS_SELECT).order("class_id");

  if (error) {
    throw new Error(error.message);
  }

  return ((data ?? []) as ClassRow[]).map(toStagingClass);
}

export async function getClassById(id: string): Promise<StagingClass | null> {
  const supabase = createStagingAdminClient();
  const query = supabase.from("classes").select(CLASS_SELECT);

  const { data, error } = isUuid(id)
    ? await query.eq("id", id).maybeSingle()
    : await query.ilike("class_id", id).maybeSingle();

  if (error) {
    throw new Error(error.message);
  }
  if (!data) return null;

  return toStagingClass(data as ClassRow);
}
