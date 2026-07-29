export type DraftIssueCard = {
  id: string;
  title: string;
  age: string;
  parentLabel: string;
};

export const sampleDraftIssues: DraftIssueCard[] = [
  {
    id: "draft-issue-1",
    title: "Hook up the Support page to the /membership page",
    age: "6w",
    parentLabel: "Navigation",
  },
];

export type DraftUpdateCard = {
  id: string;
  projectName: string;
  projectColor: string;
  age: string;
  body: string;
};

export const sampleDraftUpdates: DraftUpdateCard[] = [
  {
    id: "draft-update-1",
    projectName: "MLCC",
    projectColor: "#27a644",
    age: "25d",
    body: "I kicked off work on Leaflet's top-level items—navigation migration and the linear canvas approach—along with Favorites and the L2 styling. Those are now in progress and running, and I'll check back in shortly.",
  },
];

export type DraftCommentCard = {
  id: string;
  issueTitle: string;
  age: string;
  body: string;
};

export const sampleDraftComments: DraftCommentCard[] = [
  {
    id: "draft-comment-1",
    issueTitle: "Browse Benson Projects and open a project workspace",
    age: "5d",
    body: "Confirm the selected project's name remains shown on the trigger button while switching between Task, Browser, and Code.",
  },
  {
    id: "draft-comment-2",
    issueTitle: "Standardize admin button and confirmation modal patterns",
    age: "5d",
    body: "The Skip route input field needs to have a border.",
  },
  {
    id: "draft-comment-3",
    issueTitle: "Skip a route when a deliverer is unavailable",
    age: "3w",
    body: "On /routes when i do skip, It moves in the list, and since the sort for the routes table should just be by route name, that shouldn't be affecting this.",
  },
  {
    id: "draft-comment-4",
    issueTitle: "Empty state in the side widget for open routes to add deliverers",
    age: "22d",
    body: "ensure the confirmation provides an undo.",
  },
];
