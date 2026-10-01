// Student type definitions

export type Student = {
  id: string; // UUID, matches auth.users.id
  first_name: string | null;
  last_name: string | null;
  full_name: string | null;
  phone: string | null;
  stripe_customer_id: string | null;
  has_required_info: boolean | null;
  t_shirt_size: string | null;
  vaccination_card_url: string | null;
  emergency_contact_name: string | null;
  emergency_contact_phone: string | null;
  date_of_birth: string | null; // YYYY-MM-DD
  address_line_1: string | null;
  address_line_2: string | null;
  city: string | null;
  state: string | null;
  postal_code: string | null;
  created_at: string | null;
  updated_at: string | null;
};





