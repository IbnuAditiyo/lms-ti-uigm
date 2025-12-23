import React from 'react';
import { useQuery, useMutation, useQueryClient } from 'react-query';
import { format } from 'date-fns';
import { id as idLocale } from 'date-fns/locale';
import { 
  CheckCircleIcon, 
  TrashIcon, 
  EnvelopeOpenIcon, 
  EnvelopeIcon 
} from '@heroicons/react/24/outline';
import { notificationService } from '../../services/notificationService';
import { LoadingSpinner } from '../../components/ui/LoadingSpinner';
import { ErrorMessage } from '../../components/ui/ErrorMessage';
import { toast } from 'react-hot-toast';

const NotificationsPage: React.FC = () => {
  const queryClient = useQueryClient();

  // Fetch notifikasi
  const { data, isLoading, error } = useQuery(
    ['notifications-page'],
    () => notificationService.getMyNotifications({ limit: 50 }), // Ambil 50 terakhir
    { keepPreviousData: true }
  );

  // Mark as read mutation
  const markReadMutation = useMutation(
    (id: string) => notificationService.markAsRead(id),
    {
      onSuccess: () => {
        queryClient.invalidateQueries('notifications-page');
        queryClient.invalidateQueries('unreadNotifications'); // Update badge di header
      },
    }
  );

  // Mark ALL read mutation
  const markAllReadMutation = useMutation(
    () => notificationService.markAllAsRead(),
    {
      onSuccess: () => {
        toast.success('Semua notifikasi ditandai sudah dibaca');
        queryClient.invalidateQueries('notifications-page');
        queryClient.invalidateQueries('unreadNotifications');
      },
    }
  );

  // Delete mutation
  const deleteMutation = useMutation(
    (id: string) => notificationService.deleteNotification(id),
    {
      onSuccess: () => {
        toast.success('Notifikasi dihapus');
        queryClient.invalidateQueries('notifications-page');
      },
    }
  );

  if (isLoading) {
    return (
      <div className="flex justify-center py-12">
        <LoadingSpinner />
      </div>
    );
  }

  if (error) {
    return <ErrorMessage message="Gagal memuat notifikasi." />;
  }

  const notifications = data?.data || [];

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Notifikasi</h1>
          <p className="text-gray-500 mt-1">Update terbaru aktivitas pembelajaran Anda</p>
        </div>
        {notifications.some(n => !n.isRead) && (
          <button
            onClick={() => markAllReadMutation.mutate()}
            disabled={markAllReadMutation.isLoading}
            className="flex items-center px-4 py-2 bg-white border border-gray-300 rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-50 shadow-sm transition-colors"
          >
            <CheckCircleIcon className="h-5 w-5 mr-2 text-green-600" />
            Tandai Semua Dibaca
          </button>
        )}
      </div>

      <div className="bg-white shadow-sm rounded-xl border border-gray-200 overflow-hidden">
        {notifications.length === 0 ? (
          <div className="text-center py-16 px-4">
            <div className="mx-auto h-16 w-16 bg-gray-100 rounded-full flex items-center justify-center mb-4">
              <EnvelopeIcon className="h-8 w-8 text-gray-400" />
            </div>
            <h3 className="text-lg font-medium text-gray-900">Belum ada notifikasi</h3>
            <p className="mt-1 text-gray-500">Anda akan melihat update tugas dan pengumuman di sini.</p>
          </div>
        ) : (
          <div className="divide-y divide-gray-100">
            {notifications.map((notification) => (
              <div 
                key={notification.id} 
                className={`p-6 hover:bg-gray-50 transition-colors duration-200 ${
                  !notification.isRead ? 'bg-blue-50/40' : ''
                }`}
              >
                <div className="flex items-start gap-4">
                  <div className={`mt-1 flex-shrink-0 w-10 h-10 rounded-full flex items-center justify-center ${
                    !notification.isRead ? 'bg-blue-100 text-blue-600' : 'bg-gray-100 text-gray-500'
                  }`}>
                    {notification.isRead ? (
                      <EnvelopeOpenIcon className="h-6 w-6" />
                    ) : (
                      <EnvelopeIcon className="h-6 w-6" />
                    )}
                  </div>
                  
                  <div className="flex-1 min-w-0">
                    <div className="flex justify-between items-start">
                      <p className={`text-base ${!notification.isRead ? 'font-semibold text-gray-900' : 'font-medium text-gray-700'}`}>
                        {notification.title}
                      </p>
                      <span className="text-xs text-gray-500 whitespace-nowrap ml-4">
                        {format(new Date(notification.createdAt), 'dd MMM yyyy HH:mm', { locale: idLocale })}
                      </span>
                    </div>
                    <p className="mt-1 text-sm text-gray-600 leading-relaxed">
                      {notification.message}
                    </p>
                  </div>

                  <div className="flex flex-col gap-2 ml-4">
                    {!notification.isRead && (
                      <button
                        onClick={() => markReadMutation.mutate(notification.id)}
                        className="p-2 text-blue-600 hover:bg-blue-100 rounded-full transition-colors"
                        title="Tandai dibaca"
                      >
                        <CheckCircleIcon className="h-5 w-5" />
                      </button>
                    )}
                    <button
                      onClick={() => {
                        if (window.confirm('Hapus notifikasi ini?')) {
                          deleteMutation.mutate(notification.id);
                        }
                      }}
                      className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-full transition-colors"
                      title="Hapus"
                    >
                      <TrashIcon className="h-5 w-5" />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default NotificationsPage;