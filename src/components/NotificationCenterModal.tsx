import React, { useState } from 'react';
import { Bell, Check, ExternalLink, Calendar, Info, ShieldCheck, X } from 'lucide-react';
import { Link } from 'react-router-dom';
import { useApp } from '../context/AppContext';

export const NotificationCenterModal: React.FC<{ isOpen: boolean; onClose: () => void }> = ({ isOpen, onClose }) => {
  const { notifications, markNotificationAsRead, markAllNotificationsAsRead, currentUser } = useApp();
  const [filter, setFilter] = useState<'all' | 'unread'>('all');

  if (!isOpen) return null;

  const userNotifs = notifications.filter(n => n.user_id === currentUser?.id);
  const unreadCount = userNotifs.filter(n => !n.is_read).length;
  const filtered = filter === 'unread' ? userNotifs.filter(n => !n.is_read) : userNotifs;

  return (
    <div 
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-sm animate-fade-in"
      role="dialog"
      aria-modal="true"
      aria-labelledby="notif-modal-title"
    >
      <div className="bg-white border border-[#E7E9F0] rounded-3xl max-w-lg w-full p-6 shadow-2xl relative space-y-4 animate-page-enter">
        <div className="flex items-center justify-between border-b border-[#E7E9F0] pb-3">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-xl bg-[#F0EDFF] flex items-center justify-center text-[#5145E5]">
              <Bell className="w-4 h-4" />
            </div>
            <div>
              <h2 id="notif-modal-title" className="text-base font-bold text-[#11152B]">
                Campus Notifications
              </h2>
              <span className="text-[11px] text-[#687087]">
                {unreadCount} unread update{unreadCount === 1 ? '' : 's'}
              </span>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {unreadCount > 0 && (
              <button
                onClick={markAllNotificationsAsRead}
                className="text-[11px] text-[#5145E5] font-bold hover:underline cursor-pointer"
              >
                Mark all read
              </button>
            )}
            <button
              onClick={onClose}
              className="p-1 rounded-xl text-[#9299AA] hover:text-[#11152B] hover:bg-slate-100 transition cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Filter Pills */}
        <div className="flex gap-2 text-xs font-semibold">
          <button
            onClick={() => setFilter('all')}
            className={`px-3 py-1.5 rounded-xl transition ${
              filter === 'all'
                ? 'bg-[#5145E5] text-white shadow-xs font-bold'
                : 'bg-[#F7F8FC] text-[#687087] hover:bg-slate-100'
            }`}
          >
            All Updates ({userNotifs.length})
          </button>
          <button
            onClick={() => setFilter('unread')}
            className={`px-3 py-1.5 rounded-xl transition ${
              filter === 'unread'
                ? 'bg-[#5145E5] text-white shadow-xs font-bold'
                : 'bg-[#F7F8FC] text-[#687087] hover:bg-slate-100'
            }`}
          >
            Unread ({unreadCount})
          </button>
        </div>

        {/* Notification Stream */}
        <div className="max-h-[360px] overflow-y-auto space-y-2.5 pr-1">
          {filtered.length > 0 ? (
            filtered.map((n) => {
              const timeFormatted = new Date(n.created_at).toLocaleDateString('en-IN', {
                month: 'short',
                day: 'numeric',
                hour: '2-digit',
                minute: '2-digit'
              });

              return (
                <div
                  key={n.id}
                  onClick={() => markNotificationAsRead(n.id)}
                  className={`p-3.5 rounded-2xl border transition flex items-start gap-3 cursor-pointer ${
                    n.is_read
                      ? 'bg-white border-[#E7E9F0] text-[#687087]'
                      : 'bg-[#F0EDFF]/50 border-[#5145E5]/30 text-[#11152B] font-medium'
                  }`}
                >
                  <div className="mt-0.5">
                    {n.type === 'event_reminder' && <Calendar className="w-4 h-4 text-[#5145E5]" />}
                    {n.type === 'approval' && <ShieldCheck className="w-4 h-4 text-[#16A36A]" />}
                    {n.type === 'announcement' && <Info className="w-4 h-4 text-amber-500" />}
                  </div>

                  <div className="flex-1 space-y-1">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-bold text-[#11152B]">{n.title}</span>
                      <span className="text-[10px] font-mono text-[#9299AA]">{timeFormatted}</span>
                    </div>
                    <p className="text-xs text-[#687087] leading-relaxed">{n.message}</p>
                    {n.link && (
                      <Link
                        to={n.link}
                        onClick={onClose}
                        className="inline-flex items-center gap-1 text-[11px] font-bold text-[#5145E5] hover:underline pt-1"
                      >
                        <span>View Details</span>
                        <ExternalLink className="w-3 h-3" />
                      </Link>
                    )}
                  </div>

                  {!n.is_read && (
                    <span className="w-2 h-2 rounded-full bg-[#5145E5] shrink-0 mt-1" />
                  )}
                </div>
              );
            })
          ) : (
            <div className="text-center py-10 text-xs text-[#9299AA]">
              No {filter === 'unread' ? 'unread' : ''} notifications at this time.
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
