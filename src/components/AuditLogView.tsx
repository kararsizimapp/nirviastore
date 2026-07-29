import React from 'react';
import { AuditLog } from '../types';
import { formatDate } from '../lib/api';
import { FileText, Clock, User, ShieldCheck } from 'lucide-react';

interface AuditLogViewProps {
  logs: AuditLog[];
}

export const AuditLogView: React.FC<AuditLogViewProps> = ({ logs }) => {
  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-xl font-bold text-slate-900 tracking-tight">Sistem İşlem Logları (Audit Trail)</h2>
        <p className="text-xs text-slate-500 mt-0.5">
          Sistem üzerinde gerçekleştirilen tüm ürün, bayi, ödeme ve fatura işlemlerinin geçmiş kayıtları.
        </p>
      </div>

      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="bg-slate-50 border-b border-slate-200 font-bold text-slate-500 uppercase">
                <th className="p-3">Tarih / Saat</th>
                <th className="p-3">Kullanıcı</th>
                <th className="p-3">Eylem</th>
                <th className="p-3">Detaylar</th>
                <th className="p-3 text-center">Modül</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 font-medium text-slate-700">
              {logs.length === 0 ? (
                <tr>
                  <td colSpan={5} className="p-8 text-center text-slate-400">
                    Henüz işlem kaydı bulunmamaktadır.
                  </td>
                </tr>
              ) : (
                logs.map(log => (
                  <tr key={log.id} className="hover:bg-slate-50/80">
                    <td className="p-3 font-mono text-slate-500 whitespace-nowrap">{formatDate(log.timestamp)}</td>
                    <td className="p-3 font-bold text-slate-800">{log.user}</td>
                    <td className="p-3 font-semibold text-blue-700">{log.action}</td>
                    <td className="p-3 text-slate-600">{log.details}</td>
                    <td className="p-3 text-center">
                      <span className="px-2 py-0.5 bg-slate-100 text-slate-600 rounded text-[10px] font-bold uppercase">
                        {log.entityType}
                      </span>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
