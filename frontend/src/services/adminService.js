import apiService from './api';

class AdminService {
  async getAllUsers(page = 0, size = 10, sortBy = 'id', sortDir = 'asc') {
    try {
      const response = await apiService.get('/auth/api/v1/admin/users', {
        params: { page, size, sortBy, sortDir }
      });

      if (response.data && response.data.data) {
        return response.data.data;
      } else if (response.data && response.data.content) {
        return response.data;
      } else {
        return { content: [], totalElements: 0, totalPage: 0 };
      }
    } catch (error) {
      console.error('Failed to get all users:', error);
      throw new Error(error.response?.data?.message || 'Failed to get users');
    }
  }

  async getUserById(userId) {
    try {
      const response = await apiService.get(`/auth/api/v1/admin/users/${userId}`);
      return response.data.data;
    } catch (error) {
      console.error('Failed to get user by id:', error);
      throw new Error(error.response?.data?.message || 'Failed to get user');
    }
  }

  async updateUser(userId, userData) {
    try {
      const response = await apiService.put(`/auth/api/v1/admin/users/${userId}`, userData);
      return response.data.data;
    } catch (error) {
      console.error('Failed to update user:', error);
      throw new Error(error.response?.data?.message || 'Failed to update user');
    }
  }

  async deleteUser(userId) {
    try {
      await apiService.delete(`/auth/api/v1/admin/users/${userId}`);
      return true;
    } catch (error) {
      console.error('Failed to delete user:', error);
      throw new Error(error.response?.data?.message || 'Failed to delete user');
    }
  }

  getHardcodedProducts() {
    return [
      {
        id: 1,
        name: '참이슬 후레쉬',
        currentPrice: 1890,
        originalPrice: 2100,
        lowestPrice: 1790,
        category: '소주',
        image: 'https://images.unsplash.com/photo-1551538827-9c037cb4f32a?ixlib=rb-4.0.3&auto=format&fit=crop&w=500&q=80',
        isActive: true,
        createdAt: '2024-01-15'
      },
      {
        id: 2,
        name: '하이트 제로',
        currentPrice: 2680,
        originalPrice: 2800,
        lowestPrice: 2450,
        category: '맥주',
        image: 'https://images.unsplash.com/photo-1608270586620-248524c67de9?ixlib=rb-4.0.3&auto=format&fit=crop&w=500&q=80',
        isActive: true,
        createdAt: '2024-01-20'
      },
      {
        id: 3,
        name: '처음처럼',
        currentPrice: 1790,
        originalPrice: 1950,
        lowestPrice: 1650,
        category: '소주',
        image: 'https://images.unsplash.com/photo-1569529465841-dfecdab7503b?ixlib=rb-4.0.3&auto=format&fit=crop&w=500&q=80',
        isActive: true,
        createdAt: '2024-02-01'
      },
      {
        id: 4,
        name: '카스 맥주',
        currentPrice: 2450,
        originalPrice: 2600,
        lowestPrice: 2200,
        category: '맥주',
        image: 'https://images.unsplash.com/photo-1608270586620-248524c67de9?ixlib=rb-4.0.3&auto=format&fit=crop&w=500&q=80',
        isActive: false,
        createdAt: '2024-02-10'
      },
      {
        id: 5,
        name: '칠레 산타리타 와인',
        currentPrice: 8900,
        originalPrice: 9500,
        lowestPrice: 8500,
        category: '와인',
        image: 'https://images.unsplash.com/photo-1506377247377-2a5b3b417ebb?ixlib=rb-4.0.3&auto=format&fit=crop&w=500&q=80',
        isActive: true,
        createdAt: '2024-02-15'
      }
    ];
  }

  async updateProduct(productId, productData) {
    return new Promise((resolve) => {
      setTimeout(() => {
        console.log('Product updated:', productId, productData);
        resolve({ ...productData, id: productId });
      }, 500);
    });
  }

  async deleteProduct(productId) {
    return new Promise((resolve) => {
      setTimeout(() => {
        console.log('Product deleted:', productId);
        resolve(true);
      }, 500);
    });
  }

  async addProduct(productData) {
    return new Promise((resolve) => {
      setTimeout(() => {
        const newProduct = {
          ...productData,
          id: Date.now(),
          createdAt: new Date().toISOString().split('T')[0]
        };
        console.log('Product added:', newProduct);
        resolve(newProduct);
      }, 500);
    });
  }
}

export default new AdminService();