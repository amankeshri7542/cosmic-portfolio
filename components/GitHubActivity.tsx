'use client';

import { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  GitCommit,
  GitBranch,
  GitPullRequest,
  Star,
  GitFork,
  CircleDot,
  Terminal,
  RefreshCw,
  ExternalLink,
} from 'lucide-react';

type GitEvent = {
  id: string;
  type: string;
  created_at: string;
  label: string;
  detail: string;
  branch: string | null;
  icon: 'commit' | 'branch' | 'pr' | 'star' | 'fork' | 'issue';
};

const iconMap = {
  commit:  { Icon: GitCommit,      color: 'text-cyan-400' },
  branch:  { Icon: GitBranch,      color: 'text-purple-400' },
  pr:      { Icon: GitPullRequest, color: 'text-green-400' },
  star:    { Icon: Star,           color: 'text-yellow-400' },
  fork:    { Icon: GitFork,        color: 'text-blue-400' },
  issue:   { Icon: CircleDot,      color: 'text-orange-400' },
};

function timeAgo(iso: string) {
  const diff = Date.now() - new Date(iso).getTime();
  const mins  = Math.floor(diff / 60000);
  const hours = Math.floor(diff / 3600000);
  const days  = Math.floor(diff / 86400000);
  if (mins < 60)  return `${mins}m ago`;
  if (hours < 24) return `${hours}h ago`;
  return `${days}d ago`;
}

export default function GitHubActivity() {
  const [events, setEvents]     = useState<GitEvent[]>([]);
  const [loading, setLoading]   = useState(true);
  const [error, setError]       = useState(false);
  const [refreshed, setRefreshed] = useState(false);

  const load = async (bust = false) => {
    setLoading(true);
    setError(false);
    try {
      const url = bust ? `/api/github-activity?t=${Date.now()}` : '/api/github-activity';
      const res = await fetch(url);
      const data = await res.json();
      setEvents(data.events ?? []);
    } catch {
      setError(true);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { load(); }, []);

  const handleRefresh = async () => {
    await load(true);
    setRefreshed(true);
    setTimeout(() => setRefreshed(false), 2000);
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 24 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ delay: 0.2 }}
      className="glass-cosmic rounded-xl overflow-hidden"
    >
      {/* Terminal header bar */}
      <div className="flex items-center justify-between px-5 py-3 border-b border-purple-500/20 bg-black/30">
        <div className="flex items-center gap-3">
          <div className="flex gap-1.5">
            <span className="w-3 h-3 rounded-full bg-red-500/80" />
            <span className="w-3 h-3 rounded-full bg-yellow-500/80" />
            <span className="w-3 h-3 rounded-full bg-green-500/80" />
          </div>
          <div className="flex items-center gap-2 text-white/60 text-xs font-mono">
            <Terminal size={12} />
            <span>amankeshri7542 ~ github activity</span>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <a
            href="https://github.com/amankeshri7542"
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-1 text-white/40 hover:text-cyan-300 transition-colors text-xs"
          >
            <ExternalLink size={11} />
            <span className="hidden sm:inline">GitHub</span>
          </a>
          <button
            onClick={handleRefresh}
            disabled={loading}
            title="Refresh activity"
            className="text-white/40 hover:text-purple-300 transition-colors disabled:opacity-30"
          >
            <RefreshCw
              size={13}
              className={loading ? 'animate-spin' : refreshed ? 'text-green-400' : ''}
            />
          </button>
        </div>
      </div>

      {/* Terminal body */}
      <div className="px-5 py-4 font-mono text-xs min-h-[200px]">
        {/* Prompt line */}
        <div className="flex items-center gap-2 mb-4 text-white/40">
          <span className="text-green-400">❯</span>
          <span>git log --oneline --all --author=amankeshri7542</span>
        </div>

        {loading && (
          <div className="space-y-2">
            {[...Array(6)].map((_, i) => (
              <div key={i} className="flex items-center gap-3 animate-pulse">
                <div className="w-3 h-3 rounded-full bg-white/10" />
                <div className="h-3 bg-white/10 rounded flex-1" style={{ width: `${55 + i * 5}%` }} />
              </div>
            ))}
          </div>
        )}

        {error && (
          <p className="text-red-400/70 text-xs">
            <span className="text-red-400">✗</span> Could not reach GitHub API. Try refreshing.
          </p>
        )}

        {!loading && !error && events.length === 0 && (
          <p className="text-white/40 text-xs">No public activity found.</p>
        )}

        <AnimatePresence>
          {!loading && events.map((ev, i) => {
            const { Icon, color } = iconMap[ev.icon] ?? iconMap.commit;
            return (
              <motion.div
                key={ev.id}
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: i * 0.05 }}
                className="flex items-start gap-3 py-1.5 group hover:bg-white/3 rounded px-1 -mx-1 transition-colors"
              >
                {/* Icon */}
                <Icon size={12} className={`${color} mt-0.5 flex-shrink-0`} />

                {/* Main text */}
                <div className="flex-1 min-w-0">
                  <span className="text-white/75">{ev.label}</span>
                  {ev.branch && (
                    <span className="text-purple-400/70 ml-1">
                      [{ev.branch}]
                    </span>
                  )}
                  {ev.detail && (
                    <div className="text-white/40 mt-0.5 truncate">
                      {ev.detail}
                    </div>
                  )}
                </div>

                {/* Timestamp */}
                <span className="text-white/30 flex-shrink-0 group-hover:text-white/50 transition-colors">
                  {timeAgo(ev.created_at)}
                </span>
              </motion.div>
            );
          })}
        </AnimatePresence>

        {/* Blinking cursor */}
        {!loading && (
          <div className="flex items-center gap-2 mt-3 text-white/40">
            <span className="text-green-400">❯</span>
            <span className="w-2 h-3.5 bg-saffron/60 animate-pulse inline-block" />
          </div>
        )}
      </div>
    </motion.div>
  );
}
