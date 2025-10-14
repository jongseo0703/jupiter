class FavoriteService {
  constructor() {
    this.listeners = [];
  }

  // 이벤트 리스너 추가
  addListener(callback) {
    this.listeners.push(callback);
  }

  // 이벤트 리스너 제거
  removeListener(callback) {
    this.listeners = this.listeners.filter(listener => listener !== callback);
  }

  // 즐겨찾기 변경 알림
  notifyChange() {
    this.listeners.forEach(callback => callback());
  }
}

export default new FavoriteService();
