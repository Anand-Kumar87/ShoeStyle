import { useState, useEffect, useCallback } from 'react';
import Head from 'next/head';
import { GetServerSideProps } from 'next';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import AdminLayout from '@/components/layout/AdminLayout';
import {
  Activity,
  AlertTriangle,
  CheckCircle2,
  Clock,
  Filter,
  RefreshCw,
  Search,
  ShieldAlert,
  Trash2,
  ChevronDown,
  ChevronUp,
  Server,
  Globe,
  Shield,
  Zap,
} from 'lucide-react';
import toast from 'react-hot-toast';

interface TelemetryLog {
  id: string;
  message: string;
  stack?: string | null;
  source: 'client' | 'server' | 'gateway';
  severity: 'fatal' | 'error' | 'warn';
  url?: string | null;
  route?: string | null;
  userId?: string | null;
  userAgent?: string | null;
  metadata?: any;
  resolved: boolean;
  createdAt: string;
  occurrences?: number;
}

interface TelemetryMetrics {
  totalErrors: number;
  unresolvedErrors: number;
  fatalErrors: number;
  clientErrors: number;
  serverErrors: number;
  gatewayBlocked: number;
}

export default function AdminObservabilityPage() {
  const [logs, setLogs] = useState<TelemetryLog[]>([]);
  const [metrics, setMetrics] = useState<TelemetryMetrics>({
    totalErrors: 0,
    unresolvedErrors: 0,
    fatalErrors: 0,
    clientErrors: 0,
    serverErrors: 0,
    gatewayBlocked: 0,
  });

  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [autoRefresh, setAutoRefresh] = useState(true);

  // Filters
  const [sourceFilter, setSourceFilter] = useState('ALL');
  const [severityFilter, setSeverityFilter] = useState('ALL');
  const [searchQuery, setSearchQuery] = useState('');
  const [expandedLogId, setExpandedLogId] = useState<string | null>(null);

  const fetchLogs = useCallback(
    async (isBackground = false) => {
      if (!isBackground) setLoading(true);
      else setRefreshing(true);

      try {
        const query = new URLSearchParams();
        if (sourceFilter !== 'ALL') query.set('source', sourceFilter);
        if (severityFilter !== 'ALL') query.set('severity', severityFilter);
        if (searchQuery) query.set('search', searchQuery);

        const res = await fetch(`/api/telemetry/errors?${query.toString()}`);
        const data = await res.json();

        if (data.success) {
          setLogs(data.logs || []);
          setMetrics(data.metrics || metrics);
        }
      } catch (err) {
        console.error('Failed to fetch observability logs:', err);
      } finally {
        setLoading(false);
        setRefreshing(false);
      }
    },
    [sourceFilter, severityFilter, searchQuery]
  );

  useEffect(() => {
    fetchLogs();
  }, [fetchLogs]);

  // Real-time polling every 6 seconds
  useEffect(() => {
    if (!autoRefresh) return;
    const interval = setInterval(() => {
      fetchLogs(true);
    }, 6000);
    return () => clearInterval(interval);
  }, [autoRefresh, fetchLogs]);

  const handleResolve = async (id: string) => {
    try {
      const res = await fetch('/api/telemetry/errors', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id }),
      });
      const data = await res.json();
      if (data.success) {
        toast.success('Incident marked as resolved');
        setLogs((prev) =>
          prev.map((l) => (l.id === id ? { ...l, resolved: true } : l))
        );
        setMetrics((prev) => ({
          ...prev,
          unresolvedErrors: Math.max(0, prev.unresolvedErrors - 1),
        }));
      }
    } catch {
      toast.error('Failed to resolve error');
    }
  };

  const handleClearAll = async () => {
    if (!confirm('Are you sure you want to clear all telemetry logs?')) return;
    try {
      const res = await fetch('/api/telemetry/errors', { method: 'DELETE' });
      const data = await res.json();
      if (data.success) {
        toast.success('All telemetry logs cleared');
        setLogs([]);
        setMetrics({
          totalErrors: 0,
          unresolvedErrors: 0,
          fatalErrors: 0,
          clientErrors: 0,
          serverErrors: 0,
          gatewayBlocked: 0,
        });
      }
    } catch {
      toast.error('Failed to clear logs');
    }
  };

  const triggerTestError = async () => {
    try {
      toast.loading('Sending test error beacon...', { id: 'test-err' });
      await fetch('/api/telemetry/errors', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          message: 'Simulated Observability Test Error: High-Concurrency Health Check',
          stack: 'Error: Simulated Observability Test Error\n    at triggerTestError (observability.tsx:165)',
          source: 'gateway',
          severity: 'warn',
          route: '/admin/observability',
          metadata: { simulated: true, testedAt: new Date().toISOString() },
        }),
      });
      toast.success('Test error received & logged in real time!', { id: 'test-err' });
      fetchLogs(true);
    } catch {
      toast.error('Failed to send test error', { id: 'test-err' });
    }
  };

  return (
    <AdminLayout>
      <Head>
        <title>Real-Time Observability & Error Telemetry | ShoeStyle Admin</title>
      </Head>

      <div className="p-4 sm:p-8 lg:p-10 max-w-7xl mx-auto space-y-6 sm:space-y-8">
        {/* Header Bar */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-white dark:bg-[#0f172a] p-6 rounded-3xl border border-slate-200/80 dark:border-slate-800 shadow-sm">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="inline-flex items-center gap-1.5 bg-red-50 text-red-700 text-xs font-black uppercase tracking-wider px-3 py-1 rounded-full border border-red-200">
                <span className="w-2 h-2 rounded-full bg-red-600 animate-ping" />
                Live Telemetry
              </span>
              <span className="text-xs text-slate-400 font-bold uppercase tracking-wider">
                System Observability
              </span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-white tracking-tight">
              Error Reporting & Health
            </h1>
            <p className="text-xs sm:text-sm text-slate-500 font-medium mt-1">
              Real-time stack traces, client context, and gateway security monitoring.
            </p>
          </div>

          {/* Quick Action Buttons */}
          <div className="flex flex-wrap items-center gap-2.5">
            <button
              type="button"
              onClick={triggerTestError}
              className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-black uppercase tracking-wider bg-indigo-50 hover:bg-indigo-100 text-indigo-700 transition-colors cursor-pointer active:scale-95"
            >
              <Zap size={14} /> Trigger Test Log
            </button>

            <button
              type="button"
              onClick={() => setAutoRefresh(!autoRefresh)}
              className={`inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-black uppercase tracking-wider transition-colors cursor-pointer active:scale-95 ${
                autoRefresh
                  ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                  : 'bg-slate-100 text-slate-600'
              }`}
            >
              <span className={`w-2 h-2 rounded-full ${autoRefresh ? 'bg-emerald-500' : 'bg-slate-400'}`} />
              {autoRefresh ? 'Auto-Refresh ON' : 'Paused'}
            </button>

            <button
              type="button"
              onClick={() => fetchLogs(true)}
              className="p-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 transition-colors cursor-pointer active:scale-95"
              title="Refresh now"
            >
              <RefreshCw size={16} className={refreshing ? 'animate-spin text-blue-600' : ''} />
            </button>

            {logs.length > 0 && (
              <button
                type="button"
                onClick={handleClearAll}
                className="inline-flex items-center gap-1 px-3 py-2 rounded-xl text-xs font-black uppercase tracking-wider bg-red-50 hover:bg-red-100 text-red-600 transition-colors cursor-pointer active:scale-95"
              >
                <Trash2 size={14} /> Clear All
              </button>
            )}
          </div>
        </div>

        {/* Metrics Overview Grid */}
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3 sm:gap-4">
          <div className="bg-white dark:bg-[#0f172a] p-4 rounded-2xl border border-slate-200/80 dark:border-slate-800 shadow-sm">
            <span className="text-[10px] font-black uppercase tracking-wider text-slate-400">Total Errors</span>
            <p className="text-xl sm:text-2xl font-black text-slate-900 dark:text-white mt-1">
              {metrics.totalErrors}
            </p>
          </div>

          <div className="bg-white dark:bg-[#0f172a] p-4 rounded-2xl border border-amber-200/80 dark:border-amber-900/50 bg-amber-50/20 shadow-sm">
            <span className="text-[10px] font-black uppercase tracking-wider text-amber-600">Unresolved</span>
            <p className="text-xl sm:text-2xl font-black text-amber-700 mt-1">
              {metrics.unresolvedErrors}
            </p>
          </div>

          <div className="bg-white dark:bg-[#0f172a] p-4 rounded-2xl border border-red-200/80 dark:border-red-900/50 bg-red-50/20 shadow-sm">
            <span className="text-[10px] font-black uppercase tracking-wider text-red-600">Fatal Crashes</span>
            <p className="text-xl sm:text-2xl font-black text-red-700 mt-1">
              {metrics.fatalErrors}
            </p>
          </div>

          <div className="bg-white dark:bg-[#0f172a] p-4 rounded-2xl border border-slate-200/80 dark:border-slate-800 shadow-sm">
            <span className="text-[10px] font-black uppercase tracking-wider text-slate-400">Client Crashes</span>
            <p className="text-xl sm:text-2xl font-black text-slate-900 dark:text-white mt-1">
              {metrics.clientErrors}
            </p>
          </div>

          <div className="bg-white dark:bg-[#0f172a] p-4 rounded-2xl border border-slate-200/80 dark:border-slate-800 shadow-sm">
            <span className="text-[10px] font-black uppercase tracking-wider text-slate-400">Server Errors</span>
            <p className="text-xl sm:text-2xl font-black text-slate-900 dark:text-white mt-1">
              {metrics.serverErrors}
            </p>
          </div>

          <div className="bg-white dark:bg-[#0f172a] p-4 rounded-2xl border border-blue-200/80 dark:border-blue-900/50 bg-blue-50/20 shadow-sm">
            <span className="text-[10px] font-black uppercase tracking-wider text-blue-600">Gateway Blocked</span>
            <p className="text-xl sm:text-2xl font-black text-blue-700 mt-1">
              {metrics.gatewayBlocked}
            </p>
          </div>
        </div>

        {/* Filter Controls Bar */}
        <div className="flex flex-col sm:flex-row items-center justify-between gap-3 bg-white dark:bg-[#0f172a] p-4 rounded-2xl border border-slate-200/80 dark:border-slate-800 shadow-sm">
          {/* Search Box */}
          <div className="relative w-full sm:w-80">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" size={15} />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search by error, route, or ID..."
              className="w-full pl-10 pr-4 py-2 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl text-xs font-semibold text-slate-900 dark:text-white outline-none focus:border-slate-900"
            />
          </div>

          {/* Filter Dropdowns */}
          <div className="flex items-center gap-2.5 w-full sm:w-auto">
            <select
              value={sourceFilter}
              onChange={(e) => setSourceFilter(e.target.value)}
              className="px-3 py-2 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl text-xs font-bold text-slate-700 dark:text-slate-300 outline-none cursor-pointer"
            >
              <option value="ALL">All Sources</option>
              <option value="client">Client-Side</option>
              <option value="server">Server-Side</option>
              <option value="gateway">API Gateway</option>
            </select>

            <select
              value={severityFilter}
              onChange={(e) => setSeverityFilter(e.target.value)}
              className="px-3 py-2 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl text-xs font-bold text-slate-700 dark:text-slate-300 outline-none cursor-pointer"
            >
              <option value="ALL">All Severities</option>
              <option value="fatal">Fatal</option>
              <option value="error">Error</option>
              <option value="warn">Warning</option>
            </select>
          </div>
        </div>

        {/* Live Logs Stream */}
        <div className="space-y-3">
          {loading ? (
            <div className="bg-white dark:bg-[#0f172a] rounded-2xl p-12 text-center border border-slate-200 dark:border-slate-800">
              <RefreshCw size={24} className="animate-spin text-blue-600 mx-auto mb-2" />
              <p className="text-xs font-bold text-slate-500 uppercase tracking-wider">Loading live telemetry stream...</p>
            </div>
          ) : logs.length === 0 ? (
            <div className="bg-white dark:bg-[#0f172a] rounded-2xl p-12 text-center border border-slate-200 dark:border-slate-800">
              <div className="w-12 h-12 rounded-full bg-emerald-50 text-emerald-600 flex items-center justify-center mx-auto mb-3">
                <CheckCircle2 size={24} />
              </div>
              <h3 className="text-base font-black text-slate-900 dark:text-white">All Systems Operational</h3>
              <p className="text-xs text-slate-500 font-medium mt-1">
                Zero active runtime exceptions captured in this filter view.
              </p>
            </div>
          ) : (
            logs.map((log) => {
              const isExpanded = expandedLogId === log.id;
              const isFatal = log.severity === 'fatal';
              const isWarn = log.severity === 'warn';

              return (
                <div
                  key={log.id}
                  className={`bg-white dark:bg-[#0f172a] rounded-2xl border transition-all duration-200 shadow-xs overflow-hidden ${
                    log.resolved
                      ? 'opacity-60 border-slate-200 dark:border-slate-800'
                      : isFatal
                      ? 'border-red-200 dark:border-red-900/60'
                      : isWarn
                      ? 'border-amber-200 dark:border-amber-900/60'
                      : 'border-slate-200/90 dark:border-slate-800'
                  }`}
                >
                  <div
                    onClick={() => setExpandedLogId(isExpanded ? null : log.id)}
                    className="p-4 sm:p-5 flex items-start justify-between gap-3 cursor-pointer hover:bg-slate-50/50 dark:hover:bg-slate-900/50"
                  >
                    <div className="flex items-start gap-3 min-w-0 flex-1">
                      {/* Source Badge Icon */}
                      <div
                        className={`w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0 mt-0.5 ${
                          log.source === 'gateway'
                            ? 'bg-blue-50 text-blue-600'
                            : log.source === 'server'
                            ? 'bg-purple-50 text-purple-600'
                            : 'bg-amber-50 text-amber-600'
                        }`}
                      >
                        {log.source === 'gateway' ? (
                          <Shield size={16} />
                        ) : log.source === 'server' ? (
                          <Server size={16} />
                        ) : (
                          <Globe size={16} />
                        )}
                      </div>

                      <div className="min-w-0 flex-1">
                        <div className="flex flex-wrap items-center gap-2 mb-1">
                          <span
                            className={`text-[10px] font-black uppercase px-2 py-0.5 rounded-md tracking-wider ${
                              isFatal
                                ? 'bg-red-100 text-red-800'
                                : isWarn
                                ? 'bg-amber-100 text-amber-800'
                                : 'bg-slate-100 text-slate-800'
                            }`}
                          >
                            {log.severity}
                          </span>

                          <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
                            {log.source}
                          </span>

                          {log.route && (
                            <code className="text-[11px] font-mono font-bold text-blue-600 bg-blue-50/60 px-2 py-0.5 rounded">
                              {log.route}
                            </code>
                          )}

                          {log.occurrences && log.occurrences > 1 && (
                            <span className="text-[10px] font-black bg-rose-50 text-rose-700 px-2 py-0.5 rounded-full border border-rose-200">
                              {log.occurrences}x captured
                            </span>
                          )}

                          {log.resolved && (
                            <span className="text-[10px] font-bold text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-md flex items-center gap-1">
                              <CheckCircle2 size={12} /> Resolved
                            </span>
                          )}
                        </div>

                        <p className="text-xs sm:text-sm font-bold text-slate-900 dark:text-white truncate">
                          {log.message}
                        </p>

                        <p className="text-[11px] text-slate-400 font-medium mt-1 flex items-center gap-2">
                          <Clock size={12} />
                          {new Date(log.createdAt).toLocaleString()} • ID: {log.id}
                        </p>
                      </div>
                    </div>

                    <div className="flex items-center gap-2 flex-shrink-0">
                      {!log.resolved && (
                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            handleResolve(log.id);
                          }}
                          className="px-2.5 py-1.5 rounded-lg text-[11px] font-black uppercase tracking-wider bg-emerald-50 hover:bg-emerald-100 text-emerald-700 transition-colors cursor-pointer"
                        >
                          Resolve
                        </button>
                      )}

                      <div className="text-slate-400">
                        {isExpanded ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
                      </div>
                    </div>
                  </div>

                  {/* Expanded Stack Trace & Metadata */}
                  {isExpanded && (
                    <div className="p-4 sm:p-5 bg-slate-50 dark:bg-slate-950/80 border-t border-slate-100 dark:border-slate-800 space-y-3">
                      {log.stack ? (
                        <div>
                          <p className="text-[10px] font-black uppercase tracking-wider text-slate-400 mb-1">
                            Stack Trace
                          </p>
                          <pre className="p-3 rounded-xl bg-slate-900 text-slate-100 text-[11px] font-mono overflow-x-auto whitespace-pre-wrap leading-relaxed">
                            {log.stack}
                          </pre>
                        </div>
                      ) : (
                        <p className="text-xs text-slate-400 italic">No stack trace available for this event.</p>
                      )}

                      {/* Metadata Grid */}
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-[11px] text-slate-500 pt-2 border-t border-slate-200/60 dark:border-slate-800">
                        {log.url && (
                          <div>
                            <span className="font-bold text-slate-700 dark:text-slate-300">URL:</span> {log.url}
                          </div>
                        )}
                        {log.userId && (
                          <div>
                            <span className="font-bold text-slate-700 dark:text-slate-300">User ID:</span> {log.userId}
                          </div>
                        )}
                        {log.userAgent && (
                          <div className="col-span-full truncate">
                            <span className="font-bold text-slate-700 dark:text-slate-300">User Agent:</span> {log.userAgent}
                          </div>
                        )}
                      </div>
                    </div>
                  )}
                </div>
              );
            })
          )}
        </div>
      </div>
    </AdminLayout>
  );
}

export const getServerSideProps: GetServerSideProps = async (ctx) => {
  const session = await getServerSession(ctx.req, ctx.res, authOptions);
  const isAdmin = session?.user?.role?.toString().toUpperCase() === 'ADMIN';

  if (!session || !isAdmin) {
    return { redirect: { destination: '/auth/signin?error=AccessDenied', permanent: false } };
  }

  return { props: {} };
};
