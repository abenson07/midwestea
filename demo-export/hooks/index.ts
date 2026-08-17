/**
 * Hooks Index
 * Exports all custom hooks for easy importing
 */

export { usePeople, type PersonWithMembership } from "./usePeople";
export { useMemberships } from "./useMemberships";
export { useBusinesses, type BusinessWithDetails } from "./useBusinesses";
export { useRoutes, type RouteWithDeliverer } from "./useRoutes";
export {
  useVolunteerAsks,
  VOLUNTEER_ASKS_QUERY_KEY,
  type VolunteerAskWithSignups,
  type VolunteerSignup,
} from "./useVolunteerAsks";
export { useEvents, EVENTS_QUERY_KEY, useEvent, type CreateEventPayload } from "./useEvents";
export { useEventTemplates, EVENT_TEMPLATES_QUERY_KEY } from "./useEventTemplates";
export { useEventSponsorships } from "./useEventSponsorships";
export {
  useSponsorshipItemOfferings,
  type OfferingLevel,
  type OfferingsParent,
} from "./useSponsorshipItemOfferings";
export {
  useAllSponsorships,
  ALL_SPONSORSHIPS_QUERY_KEY,
  type SponsorshipWithParent,
  type SponsorshipParentType,
} from "./useAllSponsorships";
export { useStripeInvoices, STRIPE_INVOICES_QUERY_KEY } from "./useStripeInvoices";
export { useEventVolunteerAsks, eventVolunteerAsksQueryKey } from "./useEventVolunteerAsks";
export {
  useCommitteeInterests,
  COMMITTEE_INTERESTS_QUERY_KEY,
  committeeInterestsQueryKey,
} from "./useCommitteeInterests";
export {
  useCommitteeVolunteerAsks,
  committeeVolunteerAsksQueryKey,
} from "./useCommitteeVolunteerAsks";
export { useQrCodes, QR_CODES_QUERY_KEY } from "./useQrCodes";
export { useEventQrCodes, type EventQrCodeRow } from "./useEventQrCodes";
export { useDashboard } from "./useDashboard";
export { useWebflowEvents, WEBFLOW_EVENTS_QUERY_KEY } from "./useWebflowEvents";
export { useBanners, BANNERS_QUERY_KEY } from "./useBanners";
export { useLeaflets, LEAFLETS_QUERY_KEY } from "./useLeaflets";
export { useDeliveries, type DeliveryWithRelations } from "./useDeliveries";
export { useTasks, taskDueDate } from "./useTasks";
export { useCommSettings } from "./useCommSettings";
export { useLeafletSponsorships } from "./useLeafletSponsorships";
export { useLeafletHistory } from "./useLeafletHistory";
export { useCloseOutEligible } from "./useCloseOutEligible";
export { useLeafletQr } from "./useLeafletQr";
export {
  useCommitteeMeeting,
  createCommitteeMeetingApi,
  COMMITTEE_MEETING_QUERY_KEY,
  type CommitteeMeetingWithRelations,
  type CreateCommitteeMeetingPayload,
} from "./useCommitteeMeeting";
export {
  useCommitteeMeetingsList,
  useCommitteeMeetingById,
  useOutstandingActionItems,
  textToAgendaJson,
  textToStructuredMinutes,
  structuredMinutesToText,
  COMMITTEE_MEETINGS_LIST_KEY,
  COMMITTEE_MEETING_BY_ID_KEY,
  OUTSTANDING_ACTION_ITEMS_KEY,
  type CommitteeMeetingListRow,
  type CommitteeMeetingDetail,
  type MeetingActionItem,
} from "./useCommitteeMeetings";
export {
  useMyActionItems,
  useActionItemsForMeeting,
  MY_ACTION_ITEMS_QUERY_KEY,
  ALL_ACTION_ITEMS_QUERY_KEY,
  type MyActionItem,
} from "./useActionItems";
export { useAllActionItems } from "./useAllActionItems";
export {
  useCommitteeDefaultAttendees,
  committeeDefaultAttendeesKey,
  type CommitteeDefaultAttendee,
} from "./useCommitteeDefaultAttendees";
export { useFavorites, FAVORITES_QUERY_KEY } from "./useFavorites";
export { useFaqs, type FaqWithPages } from "./useFaqs";
export { useStories } from "./useStories";
export {
  useFundraiserStripeTotals,
  FUNDRAISER_STRIPE_TOTALS_QUERY_KEY,
} from "./useFundraiserStripeTotals";
export type {
  WebflowEventsPayload,
  WebflowCollectionFieldDTO,
  WebflowEventItemDTO,
  WebflowOptionChoice,
} from "./useWebflowEvents";
export { useDemoGuard } from "./useDemoGuard";
export {
  useCommitteeInitiatives,
  useCommitteeInitiative,
  COMMITTEE_INITIATIVES_KEY,
} from "./useCommitteeInitiatives";
export {
  useCommitteeProfile,
  useCommitteeMembers,
  mapProfileToDetail,
  COMMITTEE_PROFILE_KEY,
  COMMITTEE_MEMBERS_KEY,
} from "./useCommitteeSettings";
export { useCurrentPerson, type CurrentPerson } from "./useCurrentPerson";
export {
  useMyCommitteeMemberships,
  type MyCommitteeMembership,
} from "./useMyCommitteeMemberships";
