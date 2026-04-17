import { NextResponse } from 'next/server';

export const revalidate = 3600; // cache for 1 hour

const GITHUB_USER = 'amankeshri7542';

const ALLOWED_TYPES = new Set([
  'PushEvent',
  'CreateEvent',
  'PullRequestEvent',
  'WatchEvent',
  'ForkEvent',
  'IssuesEvent',
]);

function summarise(event: {
  type: string;
  repo: { name: string };
  payload: Record<string, unknown>;
  created_at: string;
}) {
  const repo = event.repo.name.replace(`${GITHUB_USER}/`, '');
  const p = event.payload as Record<string, unknown>;

  switch (event.type) {
    case 'PushEvent': {
      const commits = (p.commits as { message: string }[] | undefined) ?? [];
      const msg = commits[0]?.message?.split('\n')[0] ?? 'pushed code';
      const branch = ((p.ref as string | undefined) ?? '').replace('refs/heads/', '') || 'main';
      return { label: `pushed to ${repo}`, detail: msg, branch, icon: 'commit' };
    }
    case 'CreateEvent':
      return { label: `created ${p.ref_type ?? 'repo'} in ${repo}`, detail: (p.ref as string) ?? '', branch: null, icon: 'branch' };
    case 'PullRequestEvent': {
      const pr = p.pull_request as { title?: string } | undefined;
      return { label: `${p.action} PR in ${repo}`, detail: pr?.title ?? '', branch: null, icon: 'pr' };
    }
    case 'WatchEvent':
      return { label: `starred ${repo}`, detail: '', branch: null, icon: 'star' };
    case 'ForkEvent':
      return { label: `forked ${repo}`, detail: '', branch: null, icon: 'fork' };
    case 'IssuesEvent':
      return { label: `${p.action} issue in ${repo}`, detail: (p.issue as { title?: string } | undefined)?.title ?? '', branch: null, icon: 'issue' };
    default:
      return { label: `activity in ${repo}`, detail: '', branch: null, icon: 'commit' };
  }
}

export async function GET() {
  try {
    const headers: Record<string, string> = {
      Accept: 'application/vnd.github+json',
      'X-GitHub-Api-Version': '2022-11-28',
    };
    if (process.env.GITHUB_TOKEN) {
      headers['Authorization'] = `Bearer ${process.env.GITHUB_TOKEN}`;
    }

    const res = await fetch(
      `https://api.github.com/users/${GITHUB_USER}/events/public?per_page=20`,
      { headers, next: { revalidate: 3600 } }
    );

    if (!res.ok) {
      return NextResponse.json({ events: [], error: 'GitHub API error' });
    }

    const data = await res.json() as {
      type: string;
      id: string;
      repo: { name: string };
      payload: Record<string, unknown>;
      created_at: string;
    }[];

    const events = data
      .filter((e) => ALLOWED_TYPES.has(e.type))
      .slice(0, 10)
      .map((e) => ({
        id: e.id,
        type: e.type,
        created_at: e.created_at,
        ...summarise(e),
      }));

    return NextResponse.json({ events });
  } catch {
    return NextResponse.json({ events: [], error: 'Failed to fetch' });
  }
}
