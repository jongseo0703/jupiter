import api from './api';

class AdminNotificationService {
  async getNotifications(page = 0, size = 10) {
    try {
      const response = await api.get('/auth/api/v1/admin/notifications', {
        params: { page, size }
      });

      if (response.data && response.data.data) {
        return response.data.data;
      } else if (response.data && response.data.content) {
        return response.data;
      }

      return response.data;
    } catch (error) {
      console.error('Failed to fetch notifications:', error);
      throw error;
    }
  }

  async getUnreadCount() {
    try {
      const response = await api.get('/auth/api/v1/admin/notifications/unread-count');

      // API가 직접 숫자를 반환하는 경우
      if (typeof response.data === 'number') {
        return response.data;
      }

      // ApiResponse 형태로 반환하는 경우
      return response.data.data;
    } catch (error) {
      console.error('Failed to fetch unread count:', error);
      throw error;
    }
  }

  async markAsRead(id) {
    try {
      const response = await api.put(`/auth/api/v1/admin/notifications/${id}/read`);
      return response.data.data;
    } catch (error) {
      console.error('Failed to mark notification as read:', error);
      throw error;
    }
  }

  async markAllAsRead() {
    try {
      await api.put('/auth/api/v1/admin/notifications/read-all');
    } catch (error) {
      console.error('Failed to mark all notifications as read:', error);
      throw error;
    }
  }

  async deleteNotification(id) {
    try {
      await api.delete(`/auth/api/v1/admin/notifications/${id}`);
    } catch (error) {
      console.error('Failed to delete notification:', error);
      throw error;
    }
  }
}

export default new AdminNotificationService();