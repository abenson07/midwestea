import { CommitteeMeetingDemo } from "@/components/patterns/client-templates-migrate/committees";

export default async function CommitteeMeetingPage({
  params,
}: {
  params: Promise<{ committeeId: string; meetingId: string }>;
}) {
  const { committeeId, meetingId } = await params;
  return <CommitteeMeetingDemo committeeId={committeeId} meetingId={meetingId} />;
}
