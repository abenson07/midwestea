export type InboxMessageCategory =
  | "General"
  | "Volunteer"
  | "Business"
  | "Event"
  | "Complaint"
  | "Question";

export type InboxMessage = {
  id: string;
  fromName: string;
  fromEmail: string;
  subject: string;
  preview: string;
  body: string;
  receivedAt: string;
  status: "unread" | "read";
  category: InboxMessageCategory;
};

/** Simulated inbound Gmail mail — customers, neighbors, and businesses writing in. Demo-only. */
export const sampleInboxMessages: InboxMessage[] = [
  {
    id: "msg-1",
    fromName: "Rebecca Torres",
    fromEmail: "rtorres.mapleleaf@gmail.com",
    subject: "Halloween Parade route question",
    preview: "Hi! Does the parade route pass by 88th and Roosevelt this year, or...",
    body: "Hi!\n\nDoes the parade route pass by 88th and Roosevelt this year, or has it changed from last year? We're trying to figure out the best spot to set up a chair for my daughter, who's 4 and gets tired fast.\n\nThanks so much,\nRebecca",
    receivedAt: "2026-10-20T14:32:00-07:00",
    status: "unread",
    category: "Event",
  },
  {
    id: "msg-2",
    fromName: "Third Place Books",
    fromEmail: "events@thirdplacebooks.com",
    subject: "Re: Sponsorship renewal for next year",
    preview: "Thanks for reaching out — we'd love to renew our Presenting sponsorship...",
    body: "Thanks for reaching out — we'd love to renew our Presenting sponsorship for Movie by the Tower again next summer. Can you send over the invoice whenever it's ready? Also curious if there's a Community-tier option for the Halloween Parade this year.\n\nBest,\nThe Third Place Books events team",
    receivedAt: "2026-10-18T09:05:00-07:00",
    status: "read",
    category: "Business",
  },
  {
    id: "msg-3",
    fromName: "Owen Castillo",
    fromEmail: "owen.castillo@example.com",
    subject: "Interested in helping with the Book Club",
    preview: "Hey, I saw the sign-up sheet at the pub and wanted to see if you still...",
    body: "Hey,\n\nI saw the sign-up sheet at the pub and wanted to see if you still need someone for snacks & setup at the next Book Club meetup. Happy to help out — I'm usually free evenings.\n\nOwen",
    receivedAt: "2026-10-17T19:48:00-07:00",
    status: "read",
    category: "Volunteer",
  },
  {
    id: "msg-4",
    fromName: "Lena Brandt",
    fromEmail: "lena.brandt@example.com",
    subject: "Leaflet never arrived this month",
    preview: "Not a huge deal but wanted to flag it — we didn't get a leaflet on...",
    body: "Not a huge deal but wanted to flag it — we didn't get a leaflet on our block this month (92nd between Roosevelt and 5th). Second time this has happened. Just wanted to let you know in case a route got skipped.\n\nThanks,\nLena",
    receivedAt: "2026-10-16T11:20:00-07:00",
    status: "unread",
    category: "Complaint",
  },
  {
    id: "msg-5",
    fromName: "Priya Anand",
    fromEmail: "priya.anand@example.com",
    subject: "Thank you for a great Summer Social!",
    preview: "Just wanted to say the potluck was such a nice turnout this year...",
    body: "Just wanted to say the potluck was such a nice turnout this year! The band was a great addition. Already looking forward to next summer.\n\n— Priya",
    receivedAt: "2026-08-16T08:12:00-07:00",
    status: "read",
    category: "General",
  },
  {
    id: "msg-6",
    fromName: "Maple Leaf Grocery",
    fromEmail: "community@mapleleafgrocery.com",
    subject: "Question about membership dues for businesses",
    preview: "We're a new business on the block and heard about the community...",
    body: "We're a new business on the block and heard about the community council from a neighbor. Could you send over info on business membership dues and what's included? We'd love to get involved with sponsorships too.\n\nThanks,\nMaple Leaf Grocery",
    receivedAt: "2026-08-10T13:41:00-07:00",
    status: "read",
    category: "Business",
  },
  {
    id: "msg-7",
    fromName: "Sam Okafor",
    fromEmail: "sam.okafor@example.com",
    subject: "Can I bring my dog to the Summer Social?",
    preview: "Quick question before I RSVP — is the Summer Social dog-friendly?...",
    body: "Quick question before I RSVP — is the Summer Social dog-friendly? Mine's pretty chill around crowds but wanted to check first.\n\nThanks!\nSam",
    receivedAt: "2026-08-05T16:03:00-07:00",
    status: "unread",
    category: "Question",
  },
  {
    id: "msg-8",
    fromName: "Dana Whitfield",
    fromEmail: "dana.whitfield@example.com",
    subject: "Broken link on the website",
    preview: "Heads up — the \"volunteer\" link on the homepage 404s. Figured you'd...",
    body: "Heads up — the \"volunteer\" link on the homepage 404s. Figured you'd want to know before more people run into it.\n\nDana",
    receivedAt: "2026-07-29T10:15:00-07:00",
    status: "read",
    category: "Complaint",
  },
  {
    id: "msg-9",
    fromName: "Marcus Ianelli",
    fromEmail: "marcus.ianelli@example.com",
    subject: "New to the neighborhood — how do I get involved?",
    preview: "Hi there, my partner and I just moved to Maple Leaf and heard great...",
    body: "Hi there,\n\nMy partner and I just moved to Maple Leaf and heard great things about the community council. Is there a mailing list we should join, or a good first event to check out?\n\nThanks!\nMarcus",
    receivedAt: "2026-07-22T18:27:00-07:00",
    status: "read",
    category: "General",
  },
  {
    id: "msg-10",
    fromName: "Byrek Bakery",
    fromEmail: "hello@byrekbakery.com",
    subject: "Interested in joining a committee",
    preview: "We loved being a Community sponsor this year and would love to get...",
    body: "We loved being a Community sponsor this year and would love to get more involved — is there a Businesses committee we could join, or someone we should talk to?\n\nThanks,\nByrek Bakery",
    receivedAt: "2026-07-18T12:55:00-07:00",
    status: "unread",
    category: "Business",
  },
];
