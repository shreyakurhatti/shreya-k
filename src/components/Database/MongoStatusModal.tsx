import React, { useState, useEffect } from 'react';
import {
  Database,
  CheckCircle2,
  AlertTriangle,
  RefreshCw,
  ExternalLink,
  X,
  Server,
  Layers,
  Copy,
  Check,
  ShieldAlert,
  ArrowRight,
  Send,
  Sliders,
} from 'lucide-react';

interface MongoStatusData {
  connected: boolean;
  state: 'connected' | 'connecting' | 'error' | 'disconnected';
  database: string;
  cluster: string;
  uriMasked?: string;
  collections: { name: string; count: number }[];
  lastError: string | null;
  clientIp?: string;
  requiresNetworkAccess?: boolean;
}

interface MongoStatusModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const MongoStatusModal: React.FC<MongoStatusModalProps> = ({ isOpen, onClose }) => {
  const [data, setData] = useState<MongoStatusData | null>(null);
  const [loading, setLoading] = useState(false);
  const [copiedIp, setCopiedIp] = useState(false);
  const [copiedAnywhere, setCopiedAnywhere] = useState(false);
  const [syncing, setSyncing] = useState(false);
  const [syncMsg, setSyncMsg] = useState<string | null>(null);
  const [showConfig, setShowConfig] = useState(false);
  const [customUri, setCustomUri] = useState('');
  const [savingUri, setSavingUri] = useState(false);

  const fetchStatus = async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/db-status');
      const json = await res.json();
      setData(json);
    } catch {
      // ignore
    } finally {
      setLoading(false);
    }
  };

  const handleRetry = async () => {
    setLoading(true);
    setSyncMsg(null);
    try {
      const res = await fetch('/api/db-retry', { method: 'POST' });
      const json = await res.json();
      setData(json);
    } catch {
      // ignore
    } finally {
      setLoading(false);
    }
  };

  const handleSyncData = async () => {
    setSyncing(true);
    setSyncMsg(null);
    try {
      const res = await fetch('/api/db/sync', { method: 'POST' });
      const json = await res.json();
      if (json.success) {
        setSyncMsg('✅ Synced local entities to MongoDB Atlas!');
        if (json.stats) setData(json.stats);
      } else {
        setSyncMsg(`⚠️ ${json.error || 'Sync deferred'}`);
      }
    } catch (e: any) {
      setSyncMsg(`⚠️ ${e.message || 'Sync failed'}`);
    } finally {
      setSyncing(false);
    }
  };

  const handleSaveUri = async () => {
    if (!customUri.trim()) return;
    setSavingUri(true);
    setSyncMsg(null);
    try {
      const res = await fetch('/api/db/config', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ uri: customUri.trim() }),
      });
      const json = await res.json();
      setData(json);
      setCustomUri('');
      setShowConfig(false);
    } catch (e: any) {
      setSyncMsg(`Error updating URI: ${e.message}`);
    } finally {
      setSavingUri(false);
    }
  };

  useEffect(() => {
    if (isOpen) {
      fetchStatus();
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const isTlsOrIpError =
    data?.requiresNetworkAccess ||
    (data?.lastError &&
      (data.lastError.includes('SSL') ||
        data.lastError.includes('tlsv1 alert') ||
        data.lastError.includes('Network Access') ||
        data.lastError.includes('timed out') ||
        data.lastError.includes('MongoServerSelectionError')));

  return (
    <div className="fixed inset-0 z-50 bg-slate-950/85 backdrop-blur-md flex items-center justify-center p-4">
      <div className="w-full max-w-xl bg-slate-900 border border-emerald-500/40 rounded-3xl shadow-2xl overflow-hidden flex flex-col max-h-[92vh]">
        {/* Header */}
        <div className="p-4 bg-slate-950 border-b border-slate-800 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-emerald-600 via-teal-500 to-lime-400 p-[1.5px] flex items-center justify-center">
              <div className="w-full h-full bg-slate-950 rounded-[10px] flex items-center justify-center">
                <Database className="w-4 h-4 text-emerald-400" />
              </div>
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="font-bold text-white text-sm">MongoDB Atlas Connection</h3>
                <span
                  className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                    data?.connected
                      ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30'
                      : 'bg-amber-500/20 text-amber-300 border border-amber-500/30'
                  }`}
                >
                  {data?.connected ? 'Connected' : 'Network Whitelist Required'}
                </span>
              </div>
              <p className="text-[11px] text-slate-400 font-mono">Cluster0 • plastisense Database</p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-5 overflow-y-auto space-y-4 text-xs">
          {/* Status Banner */}
          <div
            className={`p-4 rounded-2xl border flex items-start gap-3 ${
              data?.connected
                ? 'bg-emerald-950/60 border-emerald-500/40 text-emerald-300'
                : 'bg-amber-950/50 border-amber-500/40 text-amber-200'
            }`}
          >
            {data?.connected ? (
              <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0 mt-0.5" />
            ) : (
              <AlertTriangle className="w-5 h-5 text-amber-400 shrink-0 mt-0.5" />
            )}
            <div className="flex-1">
              <div className="font-bold text-sm text-white">
                {data?.connected ? 'Connected to MongoDB Atlas' : 'Credentials Saved & Ready to Connect'}
              </div>
              <p className="text-[11px] text-slate-300 mt-0.5 leading-relaxed">
                {data?.connected
                  ? 'Real-time database active. Scans, drop-off receipts, and collection stations are persistently stored in your MongoDB Atlas cluster.'
                  : 'Your database credentials (shreyakurhatti_db_user) are configured. To allow cloud connection, add 0.0.0.0/0 in MongoDB Atlas Network Access.'}
              </p>
            </div>
          </div>

          {/* Database Details Card */}
          <div className="p-4 rounded-2xl bg-slate-950 border border-slate-800 space-y-2.5 font-mono">
            <div className="flex items-center justify-between text-slate-400 pb-2 border-b border-slate-800/80">
              <span>Cluster Endpoint:</span>
              <span className="text-white font-semibold">cluster0.qjfl17z.mongodb.net</span>
            </div>
            <div className="flex items-center justify-between text-slate-400 pb-2 border-b border-slate-800/80">
              <span>Database Name:</span>
              <span className="text-emerald-400 font-bold">plastisense</span>
            </div>
            <div className="flex items-center justify-between text-slate-400 pb-2 border-b border-slate-800/80">
              <span>DB User:</span>
              <span className="text-white">shreyakurhatti_db_user</span>
            </div>
            <div className="flex items-center justify-between text-slate-400">
              <span>Collections Ready:</span>
              <span className="text-slate-200">
                {data?.collections && data.collections.length > 0
                  ? data.collections.map((c) => `${c.name} (${c.count})`).join(', ')
                  : 'collectionPoints (5), recyclingActivities (1), scans (3)'}
              </span>
            </div>
          </div>

          {/* MongoDB Atlas Network Access Guide (SSL alert 80 fix) */}
          {isTlsOrIpError && !data?.connected && (
            <div className="p-4 rounded-2xl bg-slate-950 border border-amber-500/40 space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2 text-amber-300 font-bold">
                  <ShieldAlert className="w-4 h-4 text-amber-400" />
                  <span>How to connect in 1 minute (Atlas Network Access)</span>
                </div>
                <a
                  href="https://cloud.mongodb.com"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-[11px] text-emerald-400 hover:text-emerald-300 flex items-center gap-1"
                >
                  <span>Open Atlas</span>
                  <ExternalLink className="w-3 h-3" />
                </a>
              </div>

              <p className="text-[11px] text-slate-300 leading-relaxed">
                MongoDB Atlas blocks incoming cloud connections by default until you add an IP rule. Follow these 4 quick steps:
              </p>

              <div className="space-y-2 bg-slate-900/80 p-3.5 rounded-xl border border-slate-800 text-[11px]">
                <div className="flex items-start gap-2">
                  <span className="w-4 h-4 rounded-full bg-emerald-500/20 text-emerald-400 font-bold flex items-center justify-center shrink-0 text-[10px]">
                    1
                  </span>
                  <span>In MongoDB Atlas, click <strong className="text-emerald-300">Network Access</strong> in the left sidebar.</span>
                </div>
                <div className="flex items-start gap-2">
                  <span className="w-4 h-4 rounded-full bg-emerald-500/20 text-emerald-400 font-bold flex items-center justify-center shrink-0 text-[10px]">
                    2
                  </span>
                  <span>Click the green <strong className="text-white">+ Add IP Address</strong> button.</span>
                </div>
                <div className="flex items-start gap-2">
                  <span className="w-4 h-4 rounded-full bg-emerald-500/20 text-emerald-400 font-bold flex items-center justify-center shrink-0 text-[10px]">
                    3
                  </span>
                  <div className="flex-1">
                    <span>Click <strong className="text-white">Allow Access from Anywhere</strong> (or enter <code className="text-emerald-300">0.0.0.0/0</code>):</span>
                    <div className="mt-1.5 flex items-center gap-2">
                      <code className="px-2 py-1 rounded bg-slate-950 text-emerald-300 font-mono text-[11px] border border-slate-800">
                        0.0.0.0/0
                      </code>
                      <button
                        onClick={() => {
                          navigator.clipboard.writeText('0.0.0.0/0');
                          setCopiedAnywhere(true);
                          setTimeout(() => setCopiedAnywhere(false), 2000);
                        }}
                        className="px-2.5 py-1 rounded-lg bg-emerald-500/20 hover:bg-emerald-500/30 text-emerald-300 text-[10px] font-semibold flex items-center gap-1 transition border border-emerald-500/30"
                      >
                        {copiedAnywhere ? <Check className="w-3 h-3 text-emerald-400" /> : <Copy className="w-3 h-3" />}
                        <span>{copiedAnywhere ? 'Copied 0.0.0.0/0' : 'Copy 0.0.0.0/0'}</span>
                      </button>
                    </div>
                  </div>
                </div>
                <div className="flex items-start gap-2">
                  <span className="w-4 h-4 rounded-full bg-emerald-500/20 text-emerald-400 font-bold flex items-center justify-center shrink-0 text-[10px]">
                    4
                  </span>
                  <span>Click <strong className="text-white">Confirm</strong>, then click <strong className="text-emerald-400">Test Connection</strong> below!</span>
                </div>
              </div>

              {data?.clientIp && (
                <div className="flex items-center justify-between p-2.5 rounded-xl bg-slate-900 border border-slate-800 text-[11px]">
                  <span className="text-slate-400 font-mono">Current Outbound Server IP: {data.clientIp}</span>
                  <button
                    onClick={() => {
                      navigator.clipboard.writeText(data.clientIp || '');
                      setCopiedIp(true);
                      setTimeout(() => setCopiedIp(false), 2000);
                    }}
                    className="px-2 py-1 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 text-[10px] flex items-center gap-1 transition"
                  >
                    {copiedIp ? <Check className="w-3 h-3 text-emerald-400" /> : <Copy className="w-3 h-3" />}
                    <span>{copiedIp ? 'Copied' : 'Copy Outbound IP'}</span>
                  </button>
                </div>
              )}
            </div>
          )}

          {/* Sync notification message */}
          {syncMsg && (
            <div className="p-3 rounded-xl bg-slate-950 border border-slate-800 text-[11px] text-slate-200">
              {syncMsg}
            </div>
          )}

          {/* Advanced URI Editor Toggle */}
          <div className="border-t border-slate-800/80 pt-3">
            <button
              onClick={() => setShowConfig(!showConfig)}
              className="text-slate-400 hover:text-slate-200 text-[11px] flex items-center gap-1.5 transition"
            >
              <Sliders className="w-3.5 h-3.5" />
              <span>{showConfig ? 'Hide Connection URI Config' : 'Update MongoDB URI or Password'}</span>
            </button>

            {showConfig && (
              <div className="mt-2.5 p-3 rounded-xl bg-slate-950 border border-slate-800 space-y-2">
                <label className="text-[11px] text-slate-400 block">
                  MongoDB Connection String:
                </label>
                <div className="flex gap-2">
                  <input
                    type="password"
                    value={customUri}
                    onChange={(e) => setCustomUri(e.target.value)}
                    placeholder="mongodb+srv://<username>:<password>@cluster0.qjfl17z.mongodb.net/plastisense..."
                    className="flex-1 px-3 py-1.5 rounded-lg bg-slate-900 border border-slate-700 text-white font-mono text-[11px] focus:outline-none focus:border-emerald-500"
                  />
                  <button
                    onClick={handleSaveUri}
                    disabled={savingUri || !customUri.trim()}
                    className="px-3 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white font-bold transition disabled:opacity-50 text-[11px] flex items-center gap-1"
                  >
                    {savingUri ? <RefreshCw className="w-3 h-3 animate-spin" /> : <Send className="w-3 h-3" />}
                    <span>Save</span>
                  </button>
                </div>
              </div>
            )}
          </div>

          {/* Action Buttons */}
          <div className="flex items-center justify-between pt-2 border-t border-slate-800">
            <div className="flex items-center gap-2">
              <button
                onClick={handleRetry}
                disabled={loading}
                className="px-4 py-2 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold transition flex items-center gap-2 disabled:opacity-50 text-xs shadow-lg shadow-emerald-500/20"
              >
                <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
                <span>{loading ? 'Testing...' : 'Test Connection'}</span>
              </button>

              <button
                onClick={handleSyncData}
                disabled={syncing}
                className="px-3.5 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 transition flex items-center gap-1.5 text-xs border border-slate-700"
              >
                <Database className={`w-3.5 h-3.5 ${syncing ? 'animate-pulse text-emerald-400' : ''}`} />
                <span>{syncing ? 'Syncing...' : 'Sync Local Data'}</span>
              </button>
            </div>

            <a
              href="https://cloud.mongodb.com"
              target="_blank"
              rel="noopener noreferrer"
              className="px-3.5 py-2 rounded-xl bg-slate-800/80 hover:bg-slate-700 text-slate-300 transition flex items-center gap-1.5 text-xs border border-slate-800"
            >
              <span>Atlas Console</span>
              <ExternalLink className="w-3.5 h-3.5" />
            </a>
          </div>
        </div>
      </div>
    </div>
  );
};

