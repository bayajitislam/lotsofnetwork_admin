"use client";

import React, { useState } from "react";
import { 
  ShieldCheck, 
  Search, 
  Terminal, 
  Clock, 
  UserCheck, 
  Key,
  ShieldAlert,
  Fingerprint
} from "lucide-react";
import { AuditLog } from "@/lib/api";

interface AuditLogsViewProps {
  logs: AuditLog[];
}

export function AuditLogsView({ logs }: AuditLogsViewProps) {
  const [search, setSearch] = useState("");

  const filtered = logs.filter(l => 
    l.action.toLowerCase().includes(search.toLowerCase()) ||
    l.admin_email.toLowerCase().includes(search.toLowerCase()) ||
    (l.details && l.details.toLowerCase().includes(search.toLowerCase()))
  );

  return (
    <div className="space-y-6">
      <div className="p-6 rounded-3xl bg-white dark:bg-[#0b101d] border border-slate-200/80 dark:border-white/5 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h3 className="text-lg font-bold text-slate-900 dark:text-white flex items-center gap-2">
            <ShieldCheck className="w-5 h-5 text-emerald-500" />
            Immutable Administrative Audit Trail
          </h3>
          <p className="text-xs text-slate-500">
            Cryptographic log of user activations, campaign updates, and authentication events
          </p>
        </div>

        <div className="relative w-full sm:w-64">
          <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            placeholder="Search action or email..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-8 pr-3 py-2 rounded-xl text-xs bg-slate-50 dark:bg-white/5 border border-slate-200 dark:border-white/10 text-slate-900 dark:text-white placeholder-slate-400 focus:outline-hidden"
          />
        </div>
      </div>

      <div className="p-6 rounded-3xl bg-white dark:bg-[#0b101d] border border-slate-200/80 dark:border-white/5 shadow-xs">
        {filtered.length === 0 ? (
          <div className="py-12 text-center text-slate-400 text-xs">
            No audit logs recorded yet. Administrative events like user status changes and campaign launches will appear here automatically.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="border-b border-slate-100 dark:border-white/5 text-slate-400 font-semibold uppercase tracking-wider text-[10px]">
                  <th className="pb-3 pl-2">Timestamp</th>
                  <th className="pb-3">Action</th>
                  <th className="pb-3">Admin Identity</th>
                  <th className="pb-3">Resource & Diff Details</th>
                  <th className="pb-3 pr-2 text-right">IP Address</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-white/5">
                {filtered.map((log) => (
                  <tr key={log.id} className="hover:bg-slate-50/50 dark:hover:bg-white/[0.02] transition">
                    <td className="py-4 pl-2 font-mono text-[11px] text-slate-500 whitespace-nowrap">
                      {new Date(log.created_at).toLocaleString(undefined, {
                        month: "short",
                        day: "numeric",
                        hour: "2-digit",
                        minute: "2-digit",
                        second: "2-digit",
                      })}
                    </td>

                    <td className="py-4">
                      <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-md text-[10px] font-mono font-bold bg-blue-500/10 text-blue-600 dark:text-blue-400 border border-blue-500/20">
                        {log.action}
                      </span>
                    </td>

                    <td className="py-4 font-semibold text-slate-800 dark:text-slate-200">
                      {log.admin_email}
                    </td>

                    <td className="py-4 font-mono text-[11px] text-slate-600 dark:text-slate-300 max-w-xs truncate">
                      {log.details || `Type: ${log.resource_type} (ID: ${log.resource_id})`}
                    </td>

                    <td className="py-4 pr-2 text-right font-mono text-[11px] text-slate-400">
                      {log.ip_address || "127.0.0.1"}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
