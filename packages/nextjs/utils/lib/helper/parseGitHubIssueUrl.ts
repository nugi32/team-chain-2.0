export interface GitHubIssueInfo {
  owner: string;
  repo: string;
  issueNumber: number;
}

/**
 * Validasi format URL GitHub Issue
 */
export function parseGitHubIssueUrl(url: string): GitHubIssueInfo | null {
  try {
    const parsed = new URL(url);

    if (parsed.hostname !== "github.com") {
      return null;
    }

    const match = parsed.pathname.match(/^\/([^/]+)\/([^/]+)\/issues\/(\d+)\/?$/);

    if (!match) {
      return null;
    }

    return {
      owner: match[1],
      repo: match[2],
      issueNumber: Number(match[3]),
    };
  } catch {
    return null;
  }
}
