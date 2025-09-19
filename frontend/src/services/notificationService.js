import apiService from './api';

class NotificationService {
  // 알림 설정 조회
  async getSettings() {
    try {
      const response = await apiService.get('/auth/api/notification-settings');
      return response;
    } catch (error) {
      console.error('Failed to get notification settings:', error);
      throw error;
    }
  }

  // 알림 설정 생성
  async createSettings(settings) {
    try {
      const response = await apiService.post('/auth/api/notification-settings', settings);
      return response;
    } catch (error) {
      console.error('Failed to create notification settings:', error);
      throw error;
    }
  }

  // 알림 설정 수정
  async updateSettings(settings) {
    try {
      const response = await apiService.put('/auth/api/notification-settings', settings);
      return response;
    } catch (error) {
      console.error('Failed to update notification settings:', error);
      throw error;
    }
  }

  // 알림 설정 삭제
  async deleteSettings() {
    try {
      await apiService.delete('/auth/api/notification-settings');
    } catch (error) {
      console.error('Failed to delete notification settings:', error);
      throw error;
    }
  }
}

const notificationService = new NotificationService();
export default notificationService;