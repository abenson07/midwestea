import { createStagingAdminClient } from "./adminClient";

export type StagingLocation = {
  id: string;
  name: string;
  street: string | null;
  city: string | null;
  state: string | null;
  zip: string | null;
  mapsUrl: string | null;
};

export async function listLocations(): Promise<StagingLocation[]> {
  const supabase = createStagingAdminClient();
  const { data, error } = await supabase
    .from("locations")
    .select("id, location_name, street, city, state, zip, google_maps_url")
    .order("location_name");

  if (error) {
    throw new Error(error.message);
  }

  return (data ?? []).map((row) => ({
    id: row.id as string,
    name: (row.location_name as string | null) || "Untitled location",
    street: (row.street as string | null) ?? null,
    city: (row.city as string | null) ?? null,
    state: (row.state as string | null) ?? null,
    zip: (row.zip as string | null) ?? null,
    mapsUrl: (row.google_maps_url as string | null) ?? null,
  }));
}
