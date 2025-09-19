import { useState, useEffect } from 'react';
import adminNotificationService from '../services/adminNotificationService';

const AdminNotifications = () => {
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [page, setPage] = useState(0);
  const [totalPages, setTotalPages] = useState(0);
  const [unreadCount, setUnreadCount] = useState(0);

  useEffect(() => {
    fetchNotifications();
    fetchUnreadCount();
  }, [page]);

  const fetchNotifications = async () => {
    try {
      setLoading(true);
      const data = await adminNotificationService.getNotifications(page, 10);

      if (data && data.content) {
        setNotifications(data.content);
        setTotalPages(data.totalPage || 0);
      }
    } catch (err) {
      setError('알림을 불러오는데 실패했습니다.');
    } finally {
      setLoading(false);
    }
  };

  const fetchUnreadCount = async () => {
    try {
      const count = await adminNotificationService.getUnreadCount();
      setUnreadCount(count);
    } catch (err) {
      console.error('Failed to fetch unread count:', err);
    }
  };

  const handleMarkAsRead = async (id) => {
    try {
      await adminNotificationService.markAsRead(id);
      fetchNotifications();
      fetchUnreadCount();
    } catch (err) {
      setError('알림을 읽음 처리하는데 실패했습니다.');
    }
  };

  const handleMarkAllAsRead = async () => {
    try {
      await adminNotificationService.markAllAsRead();
      fetchNotifications();
      fetchUnreadCount();
    } catch (err) {
      setError('모든 알림을 읽음 처리하는데 실패했습니다.');
    }
  };

  const handleDelete = async (id) => {
    try {
      await adminNotificationService.deleteNotification(id);
      fetchNotifications();
      fetchUnreadCount();
    } catch (err) {
      setError('알림을 삭제하는데 실패했습니다.');
    }
  };

  const getNotificationTypeColor = (type) => {
    switch (type) {
      case 'USER_REGISTRATION':
        return 'bg-green-100 text-green-800';
      case 'USER_INQUIRY':
        return 'bg-yellow-100 text-yellow-800';
      case 'SYSTEM_ERROR':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-blue-100 text-blue-800';
    }
  };

  const getNotificationTypeText = (type) => {
    switch (type) {
      case 'USER_REGISTRATION':
        return '회원가입';
      case 'USER_INQUIRY':
        return '문의';
      case 'SYSTEM_ERROR':
        return '시스템 오류';
      default:
        return '기타';
    }
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleString('ko-KR');
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <i className="fas fa-spinner fa-spin text-4xl text-primary mb-4"></i>
          <p className="text-gray-600">알림을 불러오는 중...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="bg-white rounded-lg shadow-sm p-6">
          {/* 헤더 */}
          <div className="flex justify-between items-center mb-6">
            <div className="flex items-center gap-3">
              <i className="fas fa-bell text-3xl text-primary"></i>
              <h1 className="text-3xl font-bold text-gray-900">관리자 알림</h1>
              {unreadCount > 0 && (
                <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-red-100 text-red-800">
                  읽지 않음: {unreadCount}
                </span>
              )}
            </div>

            <button
              onClick={handleMarkAllAsRead}
              disabled={unreadCount === 0}
              className={`px-4 py-2 rounded-lg text-sm font-medium ${
                unreadCount === 0
                  ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                  : 'bg-primary text-white hover:bg-blue-700'
              }`}
            >
              <i className="fas fa-check-circle mr-2"></i>
              모두 읽음 처리
            </button>
          </div>

          {/* 에러 메시지 */}
          {error && (
            <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg">
              <div className="flex">
                <i className="fas fa-exclamation-circle text-red-400 mr-3 mt-0.5"></i>
                <p className="text-red-700">{error}</p>
              </div>
            </div>
          )}

          {/* 알림 목록 */}
          {notifications.length === 0 ? (
            <div className="text-center py-12">
              <i className="fas fa-bell-slash text-6xl text-gray-300 mb-4"></i>
              <h3 className="text-lg font-medium text-gray-900 mb-2">알림이 없습니다</h3>
              <p className="text-gray-500">새로운 알림이 도착하면 여기에 표시됩니다.</p>
            </div>
          ) : (
            <>
              <div className="space-y-4">
                {notifications.map((notification) => (
                  <div
                    key={notification.id}
                    className={`bg-white border rounded-lg p-6 ${
                      notification.isRead ? 'border-gray-200' : 'border-blue-200 bg-blue-50'
                    } ${notification.isImportant ? 'border-l-4 border-l-red-500' : ''}`}
                  >
                    <div className="flex justify-between items-start">
                      <div className="flex-1">
                        {/* 태그들 */}
                        <div className="flex items-center gap-2 mb-3">
                          <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${getNotificationTypeColor(notification.type)}`}>
                            {getNotificationTypeText(notification.type)}
                          </span>
                          {notification.isImportant && (
                            <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-red-100 text-red-800">
                              중요
                            </span>
                          )}
                          {!notification.isRead && (
                            <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                              읽지 않음
                            </span>
                          )}
                        </div>

                        {/* 제목 */}
                        <h3 className="text-lg font-semibold text-gray-900 mb-2">
                          {notification.title}
                        </h3>

                        {/* 메시지 */}
                        <p className="text-gray-700 mb-3">
                          {notification.message}
                        </p>

                        {/* 시간 */}
                        <p className="text-sm text-gray-500">
                          {formatDate(notification.createdAt)}
                        </p>
                      </div>

                      {/* 액션 버튼들 */}
                      <div className="flex items-center gap-2 ml-4">
                        {!notification.isRead && (
                          <button
                            onClick={() => handleMarkAsRead(notification.id)}
                            className="px-3 py-1 text-sm font-medium text-blue-600 border border-blue-300 rounded-md hover:bg-blue-50"
                          >
                            읽음
                          </button>
                        )}
                        <button
                          onClick={() => handleDelete(notification.id)}
                          className="p-2 text-red-600 hover:bg-red-50 rounded-md"
                          title="삭제"
                        >
                          <i className="fas fa-trash text-sm"></i>
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              {/* 페이지네이션 */}
              {totalPages > 1 && (
                <div className="flex justify-center mt-8">
                  <nav className="flex items-center space-x-2">
                    <button
                      onClick={() => setPage(Math.max(0, page - 1))}
                      disabled={page === 0}
                      className={`px-3 py-2 rounded-md text-sm font-medium ${
                        page === 0
                          ? 'text-gray-400 cursor-not-allowed'
                          : 'text-gray-700 hover:bg-gray-100'
                      }`}
                    >
                      이전
                    </button>

                    {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                      const pageNum = i + Math.max(0, page - 2);
                      if (pageNum >= totalPages) return null;

                      return (
                        <button
                          key={pageNum}
                          onClick={() => setPage(pageNum)}
                          className={`px-3 py-2 rounded-md text-sm font-medium ${
                            page === pageNum
                              ? 'bg-primary text-white'
                              : 'text-gray-700 hover:bg-gray-100'
                          }`}
                        >
                          {pageNum + 1}
                        </button>
                      );
                    })}

                    <button
                      onClick={() => setPage(Math.min(totalPages - 1, page + 1))}
                      disabled={page >= totalPages - 1}
                      className={`px-3 py-2 rounded-md text-sm font-medium ${
                        page >= totalPages - 1
                          ? 'text-gray-400 cursor-not-allowed'
                          : 'text-gray-700 hover:bg-gray-100'
                      }`}
                    >
                      다음
                    </button>
                  </nav>
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default AdminNotifications;