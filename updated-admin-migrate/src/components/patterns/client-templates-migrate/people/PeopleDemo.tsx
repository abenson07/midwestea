"use client";

import { Suspense, useEffect, useMemo, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Plus } from "lucide-react";
import { toast } from "sonner";
import { usePeople, useMemberships, useDemoGuard, type PersonWithMembership } from "hooks";
import { FoundationLayout } from "@/components/patterns/foundation/FoundationLayout";
import { CanvasHeader } from "@/components/patterns/foundation/CanvasHeader";
import { LinearSidebar } from "@/components/patterns/foundation/LinearSidebar";
import { ViewTab } from "@/components/patterns/foundation/ViewTab";
import { ViewTabs } from "@/components/patterns/foundation/ViewTabs";
import { ListToolbar } from "@/components/patterns/foundation/ListToolbar";
import { Button } from "@/components/patterns/primitives/Button";
import { Text } from "@/components/patterns/primitives/Text";
import { OutlinedPanel } from "@/components/patterns/client-templates/shared";
import { useAdminBasePath } from "@/components/patterns/client-templates/shared/useAdminBasePath";
import { useIsMobileAdmin } from "@/components/patterns/client-templates-migrate/mobile";
import { newDemoId } from "@/lib/demo/demoStore";
import { MembersTable } from "./MembersTable";
import { NeighborsTable } from "./NeighborsTable";
import { VolunteersTable } from "./VolunteersTable";
import { MemberDetailPanel } from "./MemberDetailPanel";
import { NeighborDetailPanel } from "./NeighborDetailPanel";
import { VolunteerDetailPanel } from "./VolunteerDetailPanel";
import { AddPersonModal } from "./AddPersonModal";
import { EditPersonModal } from "./EditPersonModal";
import type { MemberRow, NeighborRow, VolunteerRow } from "./types";
import type { PeopleUpdate, MembershipsUpdate } from "@/types/database";
import { hookFiltersForView, toMemberRow, toNeighborRow, toVolunteerRow, VOLUNTEERED_BEFORE_TAG } from "./adapters";

function matchesPeopleView(person: PersonWithMembership, view: PeopleView): boolean {
  if (view === "members") {
    return Boolean(person.membership_id || person.membership);
  }
  if (view === "volunteers") {
    return (person.roles ?? []).some((role) => role.toLowerCase() === "volunteer");
  }
  return true;
}

type PeopleView = "members" | "neighbors" | "volunteers";

const VIEW_TABS: { key: PeopleView; label: string }[] = [
  { key: "members", label: "Members" },
  { key: "neighbors", label: "Neighbors" },
  { key: "volunteers", label: "Volunteers" },
];

function isPeopleView(value: string | null): value is PeopleView {
  return value === "members" || value === "neighbors" || value === "volunteers";
}

type Selection =
  | { kind: "member"; row: MemberRow }
  | { kind: "neighbor"; row: NeighborRow }
  | { kind: "volunteer"; row: VolunteerRow };

function PeopleDemoInner() {
  const router = useRouter();
  const base = useAdminBasePath();
  const isMobile = useIsMobileAdmin();
  const searchParams = useSearchParams();
  const initial = searchParams.get("view");
  const [view, setView] = useState<PeopleView>(isPeopleView(initial) ? initial : "members");

  useEffect(() => {
    if (!isMobile) return;
    const tab =
      initial === "volunteers" ? "volunteers" : initial === "neighbors" ? "neighbors" : "people";
    router.replace(`${base}/database?tab=${tab}`);
  }, [isMobile, initial, router, base]);

  const [search, setSearch] = useState("");
  const filters = useMemo(
    () => ({ ...hookFiltersForView(view), search: search || undefined }),
    [view, search]
  );
  const { people: peopleRaw, loading, error, create, update, refetch } = usePeople({ filters });
  const { create: createMembership, update: updateMembership } = useMemberships();
  const { enabled: demo, overlay, store } = useDemoGuard();

  const people = useMemo(() => {
    if (!demo) return peopleRaw;
    return store
      .merge<PersonWithMembership>("people", peopleRaw)
      .filter((person) => matchesPeopleView(person, view));
  }, [demo, peopleRaw, store, view, store.version]);

  const members: MemberRow[] = useMemo(
    () => (view === "members" ? people.map(toMemberRow) : []),
    [people, view]
  );
  const neighbors: NeighborRow[] = useMemo(
    () => (view === "neighbors" ? people.map(toNeighborRow) : []),
    [people, view]
  );
  const volunteers: VolunteerRow[] = useMemo(
    () => (view === "volunteers" ? people.map(toVolunteerRow) : []),
    [people, view]
  );

  const [selection, setSelection] = useState<Selection | null>(null);
  const [isAddOpen, setIsAddOpen] = useState(false);
  const [isEditOpen, setIsEditOpen] = useState(false);

  const selectedPerson = selection ? people.find((person) => person.id === selection.row.id) ?? null : null;

  async function handleSaveEdit(
    personId: string,
    personData: PeopleUpdate,
    membershipId: string | null,
    membershipData: MembershipsUpdate
  ) {
    if (demo) {
      overlay.patch("people", personId, { ...personData, ...membershipData });
      toast.success("Person updated — demo mode, saved locally only");
      return;
    }
    await update(personId, personData);
    if (membershipId) {
      await updateMembership(membershipId, membershipData);
    }
    await refetch();
  }

  /** Inline field commit from a Person detail panel — same demo-guard shape as `handleSaveEdit`. */
  async function commitPersonField(personId: string, data: PeopleUpdate) {
    if (demo) {
      overlay.patch("people", personId, data as Record<string, unknown>);
      toast.success("Person updated — demo mode, saved locally only");
      return;
    }
    await update(personId, data);
    await refetch();
  }

  async function commitMembershipField(membershipId: string, personId: string, data: MembershipsUpdate) {
    if (demo) {
      overlay.patch("people", personId, data as Record<string, unknown>);
      toast.success("Person updated — demo mode, saved locally only");
      return;
    }
    await updateMembership(membershipId, data);
    await refetch();
  }

  function selectView(next: PeopleView) {
    setView(next);
    setSelection(null);
  }

  async function handleAddMember(row: Omit<MemberRow, "id">) {
    if (demo) {
      const id = newDemoId("person");
      const membershipId = newDemoId("membership");
      const start = new Date().toISOString().slice(0, 10);
      overlay.upsert("people", {
        id,
        full_name: row.name,
        email: row.email,
        membership_id: membershipId,
        roles: [],
        tags: [],
        created_at: new Date().toISOString(),
        membership: {
          id: membershipId,
          tier: row.membershipType === "no-tier" ? null : row.membershipType,
          status: "active",
          start_date: start,
          last_renewal: start,
        },
      });
      toast.success("Member added — demo mode, saved locally only");
      return;
    }
    const membership = await createMembership({
      tier: row.membershipType,
      status: "active",
      start_date: new Date().toISOString().slice(0, 10),
    });
    await create({
      full_name: row.name,
      email: row.email,
      membership_id: membership?.id ?? null,
    });
    await refetch();
  }

  async function handleAddNeighbor(row: Omit<NeighborRow, "id">) {
    if (demo) {
      overlay.upsert("people", {
        id: newDemoId("person"),
        full_name: row.name,
        email: row.email,
        address: row.address,
        membership_id: null,
        roles: [],
        tags: [],
        created_at: new Date().toISOString(),
        membership: null,
      });
      toast.success("Neighbor added — demo mode, saved locally only");
      return;
    }
    await create({ full_name: row.name, email: row.email, address: row.address });
    await refetch();
  }

  async function handleAddVolunteer(row: Omit<VolunteerRow, "id">) {
    if (demo) {
      const tags = [row.interestArea, row.hasVolunteeredBefore ? VOLUNTEERED_BEFORE_TAG : null].filter(
        (tag): tag is string => Boolean(tag),
      );
      overlay.upsert("people", {
        id: newDemoId("person"),
        full_name: row.name,
        email: row.email,
        membership_id: null,
        roles: ["volunteer"],
        tags,
        created_at: new Date().toISOString(),
        membership: null,
      });
      toast.success("Volunteer added — demo mode, saved locally only");
      return;
    }
    const tags = [row.interestArea, row.hasVolunteeredBefore ? VOLUNTEERED_BEFORE_TAG : null].filter(
      (tag): tag is string => Boolean(tag)
    );
    await create({ full_name: row.name, email: row.email, roles: ["volunteer"], tags });
    await refetch();
  }

  if (isMobile) return null;

  const body =
    view === "neighbors" ? (
      <NeighborsTable data={neighbors} onSelect={(row) => setSelection({ kind: "neighbor", row })} />
    ) : view === "volunteers" ? (
      <VolunteersTable data={volunteers} onSelect={(row) => setSelection({ kind: "volunteer", row })} />
    ) : (
      <MembersTable data={members} onSelect={(row) => setSelection({ kind: "member", row })} />
    );

  return (
    <div style={{ height: "100%" }}>
      <FoundationLayout
        navigation={<LinearSidebar />}
        header={
          <CanvasHeader
            topbar={{
              title: "People",
              endContent: (
                <Button
                  label={view === "members" ? "Add member" : view === "neighbors" ? "Add neighbor" : "Add volunteer"}
                  variant="secondary"
                  icon={<Plus size={14} strokeWidth={1.75} />}
                  onClick={() => setIsAddOpen(true)}
                />
              ),
            }}
            controls={
              <ViewTabs
                aria-label="People views"
                endContent={
                  <ListToolbar
                    searchValue={search}
                    onSearchChange={setSearch}
                    searchPlaceholder="Search people…"
                  />
                }
              >
                {VIEW_TABS.map((tab) => (
                  <ViewTab
                    key={tab.key}
                    label={tab.label}
                    selected={view === tab.key}
                    onClick={() => selectView(tab.key)}
                  />
                ))}
              </ViewTabs>
            }
          />
        }
        sideContent={
          selection && selectedPerson ? (
            <OutlinedPanel
              onClose={() => setSelection(null)}
              onEdit={selection.kind === "member" ? undefined : () => setIsEditOpen(true)}
            >
              {selection.kind === "member" ? (
                <MemberDetailPanel
                  member={selection.row}
                  person={selectedPerson}
                  onUpdatePerson={(data) => commitPersonField(selectedPerson.id, data)}
                  onUpdateMembership={(data) =>
                    selectedPerson.membership
                      ? commitMembershipField(selectedPerson.membership.id, selectedPerson.id, data)
                      : undefined
                  }
                />
              ) : null}
              {selection.kind === "neighbor" ? (
                <NeighborDetailPanel
                  neighbor={selection.row}
                  person={selectedPerson}
                  onUpdatePerson={(data) => commitPersonField(selectedPerson.id, data)}
                  onUpdateMembership={(data) =>
                    selectedPerson.membership
                      ? commitMembershipField(selectedPerson.membership.id, selectedPerson.id, data)
                      : undefined
                  }
                />
              ) : null}
              {selection.kind === "volunteer" ? (
                <VolunteerDetailPanel
                  volunteer={selection.row}
                  person={selectedPerson}
                  onUpdatePerson={(data) => commitPersonField(selectedPerson.id, data)}
                  onUpdateMembership={(data) =>
                    selectedPerson.membership
                      ? commitMembershipField(selectedPerson.membership.id, selectedPerson.id, data)
                      : undefined
                  }
                />
              ) : null}
            </OutlinedPanel>
          ) : null
        }
      >
        {error ? (
          <div style={{ padding: 24 }}>
            <Text color="secondary">Couldn&apos;t load people: {error}</Text>
          </div>
        ) : loading ? (
          <div style={{ padding: 24 }}>
            <Text color="secondary">Loading…</Text>
          </div>
        ) : (
          body
        )}
      </FoundationLayout>

      <AddPersonModal
        isOpen={isAddOpen}
        view={view}
        onClose={() => setIsAddOpen(false)}
        onAddMember={handleAddMember}
        onAddNeighbor={handleAddNeighbor}
        onAddVolunteer={handleAddVolunteer}
      />

      <EditPersonModal
        isOpen={isEditOpen}
        person={selectedPerson}
        onClose={() => setIsEditOpen(false)}
        onSave={handleSaveEdit}
      />
    </div>
  );
}

export function PeopleDemo() {
  return (
    <Suspense fallback={null}>
      <PeopleDemoInner />
    </Suspense>
  );
}
