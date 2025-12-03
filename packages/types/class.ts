// Class type definitions

export type Class = {
  id: string; // UUID
  course_uuid: string; // UUID
  class_name: string | null;
  course_code: string | null;
  class_id: string | null; // text field used for lookup
  date_created: string | null; // timestamp with time zone
  enrollment_start: string | null; // date
  enrollment_close: string | null; // date
  class_start_date: string | null; // date
  class_close_date: string | null; // date
  location: string | null;
  is_online: boolean | null; // default: false
  created_at: string | null; // timestamp with time zone
  updated_at: string | null; // timestamp with time zone
  product_id: string | null;
  length_of_class: string | null;
  certification_length: number | null;
  graduation_rate: number | null;
  registration_limit: number | null;
  stripe_product_id: string | null;
  price: number | null;
  registration_fee: number | null;
};



