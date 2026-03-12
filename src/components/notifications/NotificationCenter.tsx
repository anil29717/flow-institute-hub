import { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { api } from '@/api/client';
import { 
  Bell, CheckCircle2, AlertCircle, Info, XCircle, 
  Trash2, Check, ExternalLink, Loader2, Sparkles 
} from 'lucide-react';
import { toast } from 'sonner';

export default function NotificationCenter() {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const qc = useQueryClient();

  // Close when clicking outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Fetch notifications
  const { data: notifications = [], isLoading } = useQuery({
    queryKey: ['notifications'],
    queryFn: () => api.get('/notifications'),
    enabled: true,
    refetchInterval: 30000, // Refetch every 30s
  });

  // Fetch unread count
  const { data: unreadData } = useQuery({
    queryKey: ['notifications', 'unread-count'],
    queryFn: () => api.get('/notifications/unread-count'),
    refetchInterval: 30000,
  });

  const unreadCount = unreadData?.count ?? 0;

  // Mark as read mutation
  const markRead = useMutation({
    mutationFn: (id: string) => api.patch(`/notifications/${id}/read`, {}),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['notifications'] });
    }
  });

  // Mark all as read mutation
  const markAllRead = useMutation({
    mutationFn: () => api.patch('/notifications/read-all', {}),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['notifications'] });
      toast.success('All marked as read');
    }
  });

  // Delete mutation
  const deleteNotif = useMutation({
    mutationFn: (id: string) => api.delete(`/notifications/${id}`),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['notifications'] });
    }
  });

  const getIcon = (type: string) => {
    switch (type) {
      case 'success': return <CheckCircle2 className="w-4 h-4 text-green-500" />;
      case 'warning': return <AlertCircle className="w-4 h-4 text-amber-500" />;
      case 'error': return <XCircle className="w-4 h-4 text-destructive" />;
      default: return <Info className="w-4 h-4 text-blue-500" />;
    }
  };

  return (
    <div className="relative" ref={dropdownRef}>
      <motion.button
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
        onClick={() => setIsOpen(!isOpen)}
        className={`relative p-2 rounded-xl transition-all duration-200 ${
          isOpen ? 'bg-primary/10 text-primary' : 'text-muted-foreground hover:bg-muted hover:text-foreground'
        }`}
      >
        <Bell className="w-5 h-5" />
        {unreadCount > 0 && (
          <motion.span
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            className="absolute top-1.5 right-1.5 w-4 h-4 bg-destructive text-[10px] font-bold text-white rounded-full flex items-center justify-center ring-2 ring-background"
          >
            {unreadCount > 9 ? '9+' : unreadCount}
          </motion.span>
        )}
      </motion.button>

      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: 10, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 10, scale: 0.95 }}
            className="absolute right-0 mt-2 w-80 sm:w-96 bg-card/90 backdrop-blur-xl rounded-2xl border border-border shadow-2xl z-50 overflow-hidden"
          >
            {/* Header */}
            <div className="p-4 border-b border-border flex items-center justify-between bg-muted/30">
              <div className="flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-primary" />
                <h3 className="font-display font-bold text-sm">Notifications</h3>
              </div>
              {unreadCount > 0 && (
                <button 
                  onClick={() => markAllRead.mutate()}
                  className="text-[11px] font-medium text-primary hover:underline flex items-center gap-1"
                >
                  <Check className="w-3 h-3" /> Mark all read
                </button>
              )}
            </div>

            {/* List */}
            <div className="max-h-[400px] overflow-y-auto scrollbar-thin">
              {isLoading ? (
                <div className="p-12 flex flex-col items-center justify-center gap-3">
                  <Loader2 className="w-6 h-6 animate-spin text-primary/40" />
                  <p className="text-xs text-muted-foreground">Fetching updates...</p>
                </div>
              ) : notifications.length === 0 ? (
                <div className="p-12 text-center flex flex-col items-center gap-3">
                  <div className="w-12 h-12 rounded-full bg-muted flex items-center justify-center">
                    <Bell className="w-6 h-6 text-muted-foreground/40" />
                  </div>
                  <div>
                    <p className="text-sm font-medium text-foreground">All caught up!</p>
                    <p className="text-xs text-muted-foreground mt-1">Check back later for new updates.</p>
                  </div>
                </div>
              ) : (
                <div className="divide-y divide-border/50">
                  {notifications.map((notif: any) => (
                    <div 
                      key={notif._id}
                      className={`p-4 transition-colors relative group ${
                        !notif.isRead ? 'bg-primary/5 hover:bg-primary/10' : 'hover:bg-muted/50'
                      }`}
                    >
                      <div className="flex gap-3">
                        <div className={`mt-1 flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center ${
                          notif.type === 'success' ? 'bg-green-500/10' : 
                          notif.type === 'warning' ? 'bg-amber-500/10' : 
                          notif.type === 'error' ? 'bg-destructive/10' : 'bg-blue-500/10'
                        }`}>
                          {getIcon(notif.type)}
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-start justify-between gap-2">
                            <p className={`text-sm font-semibold truncate ${!notif.isRead ? 'text-foreground' : 'text-muted-foreground'}`}>
                              {notif.title}
                            </p>
                            <span className="text-[10px] text-muted-foreground whitespace-nowrap mt-0.5">
                              {new Date(notif.createdAt).toLocaleDateString([], { hour: '2-digit', minute: '2-digit' })}
                            </span>
                          </div>
                          <p className="text-xs text-muted-foreground line-clamp-2 mt-0.5 leading-relaxed">
                            {notif.message}
                          </p>
                          
                          <div className="mt-2 flex items-center justify-between">
                            <div className="flex items-center gap-2">
                              {!notif.isRead && (
                                <button 
                                  onClick={() => markRead.mutate(notif._id)}
                                  className="text-[10px] font-medium text-primary hover:text-primary/80"
                                >
                                  Read
                                </button>
                              )}
                              {notif.link && (
                                <button className="text-[10px] font-medium text-muted-foreground hover:text-foreground flex items-center gap-1">
                                  View <ExternalLink className="w-2.5 h-2.5" />
                                </button>
                              )}
                            </div>
                            <button 
                              onClick={() => deleteNotif.mutate(notif._id)}
                              className="text-muted-foreground/0 group-hover:text-muted-foreground/60 hover:!text-destructive transition-all duration-200"
                            >
                              <Trash2 className="w-3 h-3" />
                            </button>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Footer */}
            <div className="p-3 border-t border-border flex justify-center bg-muted/10">
              <p className="text-[10px] text-muted-foreground uppercase tracking-widest font-bold opacity-50">
                InstiFlow Alerts
              </p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
