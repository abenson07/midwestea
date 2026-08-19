export type PaletteResultKind = "action" | "page" | "class" | "student" | "transaction";

/** Resolved to an actual icon only in the results-list UI component, so the
 * scoring/matching modules stay plain data with no JSX. */
export type PaletteIconKey =
  | "overview"
  | "classes"
  | "courses"
  | "programs"
  | "students"
  | "transactions"
  | "locations"
  | "prerequisites"
  | "settings"
  | "new-class"
  | "new-transaction"
  | "add-location"
  | "add-student"
  | "class"
  | "student"
  | "transaction"
  | "recent";

export type PaletteResult = {
  id: string;
  kind: PaletteResultKind;
  title: string;
  subtitle?: string;
  icon: PaletteIconKey;
  score: number;
  onSelect: () => void;
  /** Persisted so a Recent row can navigate without rebuilding the original result. */
  href?: string;
  /** Persisted so a Recent row can re-fire a create action. */
  actionId?: string;
};

export type PaletteSection = {
  heading: string;
  results: PaletteResult[];
};
