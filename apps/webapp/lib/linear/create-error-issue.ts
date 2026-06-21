import { LinearClient } from "@linear/sdk";
import type { ScrubbedErrorReport } from "@/lib/error-reporting/types";
import type { LinearErrorReportingConfig } from "@/lib/error-reporting/config";

const UUID_PATTERN =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

function buildIssueTitle(report: ScrubbedErrorReport): string {
  if (report.kind === "http") {
    const method = report.method ?? "GET";
    const path = report.requestUrl
      ? new URL(report.requestUrl, "http://localhost").pathname
      : "unknown";
    return `[ERR][client][http] ${method} ${path} — ${report.statusCode ?? "?"}`;
  }

  const shortMessage =
    report.message.length > 80
      ? `${report.message.slice(0, 77)}…`
      : report.message;
  return `[ERR][client][${report.kind}] ${shortMessage}`;
}

function buildIssueDescription(report: ScrubbedErrorReport): string {
  const meta = {
    fingerprint: report.fingerprint,
    kind: report.kind,
    pageUrl: report.pageUrl,
    requestUrl: report.requestUrl,
    statusCode: report.statusCode,
    timestamp: report.timestamp,
    environment: report.environment,
  };

  const lines = [
    "## Summary",
    `- **Page:** ${report.pageUrl}`,
    `- **Kind:** ${report.kind}`,
    `- **Environment:** ${report.environment}`,
    `- **Message:** ${report.message}`,
  ];

  if (report.statusCode !== undefined) {
    lines.push(`- **Status:** ${report.statusCode}`);
  }

  if (report.requestUrl) {
    lines.push("", "## Request");
    lines.push(`- **URL:** ${report.requestUrl}`);
    if (report.method) {
      lines.push(`- **Method:** ${report.method}`);
    }
  }

  if (report.responseBody) {
    lines.push("", "## Response body", "```", report.responseBody, "```");
  }

  if (report.stack) {
    lines.push("", "## Stack", "```", report.stack, "```");
  }

  lines.push(
    "",
    `<!-- error-meta:${JSON.stringify(meta)} -->`
  );

  return lines.join("\n");
}

function mapPriority(report: ScrubbedErrorReport): number {
  if (report.kind === "http") {
    return report.statusCode !== undefined && report.statusCode >= 500 ? 2 : 3;
  }

  return 2;
}

async function resolveTeamId(
  client: LinearClient,
  teamIdOrKey: string
): Promise<string> {
  if (UUID_PATTERN.test(teamIdOrKey)) {
    return teamIdOrKey;
  }

  const teams = await client.teams({
    filter: {
      key: { eq: teamIdOrKey },
    },
  });

  const team = teams.nodes[0];
  if (!team) {
    throw new Error(`Linear team not found for key: ${teamIdOrKey}`);
  }

  return team.id;
}

async function resolveProjectId(
  client: LinearClient,
  projectIdOrSlug: string
): Promise<string> {
  if (UUID_PATTERN.test(projectIdOrSlug)) {
    return projectIdOrSlug;
  }

  const projects = await client.projects({
    filter: {
      slugId: { eq: projectIdOrSlug },
    },
  });

  const project = projects.nodes[0];
  if (!project) {
    throw new Error(`Linear project not found for slug: ${projectIdOrSlug}`);
  }

  return project.id;
}

async function resolveLabelIds(
  client: LinearClient,
  teamId: string,
  labelNames: string[]
): Promise<string[]> {
  const labels = await client.issueLabels({
    filter: {
      team: { id: { eq: teamId } },
    },
  });

  const labelIds: string[] = [];
  for (const name of labelNames) {
    const match = labels.nodes.find(
      (label) => label.name.toLowerCase() === name.toLowerCase()
    );
    if (match) {
      labelIds.push(match.id);
    }
  }

  return labelIds;
}

export async function createLinearErrorIssue(
  config: LinearErrorReportingConfig,
  report: ScrubbedErrorReport
): Promise<{ issueId: string; issueIdentifier: string }> {
  const client = new LinearClient({ apiKey: config.apiKey });
  const teamId = await resolveTeamId(client, config.teamId);
  const projectId = await resolveProjectId(client, config.projectId);
  const labelIds = await resolveLabelIds(client, teamId, [
    ...config.labels,
    report.environment,
  ]);

  const issuePayload = await client.createIssue({
    teamId,
    projectId,
    title: buildIssueTitle(report),
    description: buildIssueDescription(report),
    priority: mapPriority(report),
    labelIds: labelIds.length > 0 ? labelIds : undefined,
  });

  const issue = await issuePayload.issue;
  if (!issue) {
    throw new Error("Linear issue creation returned no issue");
  }

  return {
    issueId: issue.id,
    issueIdentifier: issue.identifier,
  };
}
