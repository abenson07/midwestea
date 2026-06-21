export interface LinearErrorReportingConfig {
  apiKey: string;
  teamId: string;
  projectId: string;
  labels: string[];
}

export function getDeploymentEnvironment(): string {
  if (process.env.VERCEL_ENV) return process.env.VERCEL_ENV;
  if (process.env.NODE_ENV === "production") return "production";
  return "development";
}

export function getLinearErrorReportingConfig():
  | LinearErrorReportingConfig
  | null {
  const apiKey = process.env.LINEAR_API_KEY?.trim();
  const teamId = process.env.LINEAR_TEAM_ID?.trim();
  const projectId = process.env.LINEAR_ERROR_PROJECT_ID?.trim();

  if (!apiKey || !teamId || !projectId) {
    return null;
  }

  const labels =
    process.env.LINEAR_ERROR_LABELS?.split(",")
      .map((label) => label.trim())
      .filter(Boolean) ?? ["auto-error", "client-error"];

  return {
    apiKey,
    teamId,
    projectId,
    labels,
  };
}
