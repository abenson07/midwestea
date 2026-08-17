export type MembershipType = "household" | "individual" | "senior" | "student" | "no-tier";

export type MemberRow = {
  id: string;
  name: string;
  email: string;
  membershipType: MembershipType;
  memberSince: string;
};

export type NeighborRow = {
  id: string;
  name: string;
  email: string;
  address: string;
  joinedDate: string;
};

export type VolunteerRow = {
  id: string;
  name: string;
  email: string;
  hasVolunteeredBefore: boolean;
  interestArea: string;
};
