// Class type definitions

export type Class = {
  id: string;
  course_uuid: string;
  class_name: string;
  course_code: string;
  class_id: string;
  enrollment_start: string | null;
  enrollment_close: string | null;
  class_start_date: string | null;
  class_close_date: string | null;
  is_online: boolean;
  length_of_class: string | null;
  certification_length: number | null;
  graduation_rate: number | null;
  registration_limit: number | null;
  price: number | null;
  registration_fee: number | null;
  product_id: string | null;
};



