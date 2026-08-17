import type { CommitteeSlug } from "schemas/committee_meetings";

export interface CommitteeDefaultAttendees {
  id: string;
  committee_slug: CommitteeSlug;
  person_id: string;
  created_at: string;
}

export interface CommitteeDefaultAttendeesInsert {
  committee_slug: CommitteeSlug;
  person_id: string;
}
