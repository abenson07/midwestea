export type ActionItemAssignee = {
  type: "committee" | "person";
  name: string;
};

export type ActionItem = {
  id: string;
  title: string;
  description: string;
  dueDate: string;
  assignee: ActionItemAssignee;
  linkedMeeting: string;
  status?: "open" | "done" | "canceled";
};
