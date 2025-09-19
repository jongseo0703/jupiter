import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import authService from '../services/authService';
import adminService from '../services/adminService';

const AdminUsers = () => {
  const navigate = useNavigate();
  const [users, setUsers] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(0);
  const [totalPages, setTotalPages] = useState(0);
  const [totalElements, setTotalElements] = useState(0);
  const [pageSize] = useState(10);
  const [sortBy, setSortBy] = useState('id');
  const [sortDir, setSortDir] = useState('desc');
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedUser, setSelectedUser] = useState(null);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [editFormData, setEditFormData] = useState({
    username: '',
    email: '',
    phone: ''
  });

  useEffect(() => {
    checkAdminAccess();
    loadUsers();
  }, [currentPage, sortBy, sortDir]);

  const checkAdminAccess = async () => {
    try {
      if (!authService.isLoggedIn()) {
        navigate('/login');
        return;
      }

      const userData = await authService.getCurrentUser();
      if (userData.role !== 'ADMIN') {
        alert('관리자 권한이 필요합니다.');
        navigate('/');
        return;
      }
    } catch (error) {
      console.error('Failed to check admin access:', error);
      navigate('/login');
    }
  };

  const loadUsers = async () => {
    try {
      setIsLoading(true);
      const data = await adminService.getAllUsers(currentPage, pageSize, sortBy, sortDir);
      setUsers(data.content || []);
      setTotalPages(data.totalPage || 0);
      setTotalElements(data.totalElements || 0);
    } catch (error) {
      console.error('Failed to load users:', error);
      alert('사용자 목록을 불러오는데 실패했습니다.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleSort = (field) => {
    if (sortBy === field) {
      setSortDir(sortDir === 'asc' ? 'desc' : 'asc');
    } else {
      setSortBy(field);
      setSortDir('asc');
    }
    setCurrentPage(0);
  };

  const handleEdit = (user) => {
    setSelectedUser(user);
    setEditFormData({
      username: user.username || '',
      email: user.email || '',
      phone: user.phone || ''
    });
    setShowEditModal(true);
  };

  const handleSaveEdit = async () => {
    try {
      await adminService.updateUser(selectedUser.id, editFormData);
      setShowEditModal(false);
      loadUsers();
      alert('사용자 정보가 성공적으로 수정되었습니다.');
    } catch (error) {
      console.error('Failed to update user:', error);
      alert(error.message || '사용자 정보 수정에 실패했습니다.');
    }
  };

  const handleDelete = (user) => {
    setSelectedUser(user);
    setShowDeleteModal(true);
  };

  const confirmDelete = async () => {
    try {
      await adminService.deleteUser(selectedUser.id);
      setShowDeleteModal(false);
      loadUsers();
      alert('사용자가 성공적으로 삭제되었습니다.');
    } catch (error) {
      console.error('Failed to delete user:', error);
      alert(error.message || '사용자 삭제에 실패했습니다.');
    }
  };

  const filteredUsers = users.filter(user =>
    user.username?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    user.email?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const getSortIcon = (field) => {
    if (sortBy !== field) return 'fas fa-sort text-gray-400';
    return sortDir === 'asc' ? 'fas fa-sort-up text-primary' : 'fas fa-sort-down text-primary';
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <i className="fas fa-spinner fa-spin text-4xl text-primary mb-4"></i>
          <p className="text-gray-600">사용자 목록을 불러오는 중...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* 헤더 */}
        <div className="mb-8">
          <div className="flex items-center justify-between">
            <div>
              <button
                onClick={() => navigate('/admin')}
                className="text-primary hover:text-blue-800 mb-4 flex items-center"
              >
                <i className="fas fa-arrow-left mr-2"></i>
                관리자 대시보드로 돌아가기
              </button>
              <h1 className="text-3xl font-bold text-gray-900">
                <i className="fas fa-users mr-3 text-primary"></i>
                사용자 관리
              </h1>
              <p className="text-gray-600 mt-2">
                총 {totalElements}명의 사용자가 등록되어 있습니다.
              </p>
            </div>
          </div>
        </div>

        {/* 검색 및 필터 */}
        <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
          <div className="flex items-center space-x-4">
            <div className="flex-1">
              <div className="relative">
                <i className="fas fa-search absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400"></i>
                <input
                  type="text"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  placeholder="사용자명 또는 이메일로 검색..."
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary"
                />
              </div>
            </div>
            <button
              onClick={loadUsers}
              className="bg-primary text-white px-4 py-2 rounded-lg hover:bg-blue-800 transition-colors flex items-center"
            >
              <i className="fas fa-sync-alt mr-2"></i>
              새로고침
            </button>
          </div>
        </div>

        {/* 사용자 테이블 */}
        <div className="bg-white rounded-lg shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th
                    className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100"
                    onClick={() => handleSort('id')}
                  >
                    <div className="flex items-center space-x-1">
                      <span>ID</span>
                      <i className={getSortIcon('id')}></i>
                    </div>
                  </th>
                  <th
                    className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100"
                    onClick={() => handleSort('username')}
                  >
                    <div className="flex items-center space-x-1">
                      <span>사용자명</span>
                      <i className={getSortIcon('username')}></i>
                    </div>
                  </th>
                  <th
                    className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100"
                    onClick={() => handleSort('email')}
                  >
                    <div className="flex items-center space-x-1">
                      <span>이메일</span>
                      <i className={getSortIcon('email')}></i>
                    </div>
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    휴대폰
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    역할
                  </th>
                  <th
                    className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100"
                    onClick={() => handleSort('createdAt')}
                  >
                    <div className="flex items-center space-x-1">
                      <span>가입일</span>
                      <i className={getSortIcon('createdAt')}></i>
                    </div>
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    액션
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {filteredUsers.map((user) => (
                  <tr key={user.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {user.id}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <div className="w-8 h-8 bg-primary rounded-full flex items-center justify-center mr-3">
                          <i className="fas fa-user text-white text-sm"></i>
                        </div>
                        <div className="text-sm font-medium text-gray-900">
                          {user.username}
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {user.email}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {user.phone || '정보 없음'}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                        user.role === 'ADMIN'
                          ? 'bg-red-100 text-red-800'
                          : 'bg-green-100 text-green-800'
                      }`}>
                        {user.role === 'ADMIN' ? '관리자' : '사용자'}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {new Date(user.createdAt).toLocaleDateString('ko-KR')}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                      <div className="flex space-x-2">
                        <button
                          onClick={() => handleEdit(user)}
                          className="text-blue-600 hover:text-blue-900"
                        >
                          <i className="fas fa-edit"></i>
                        </button>
                        <button
                          onClick={() => handleDelete(user)}
                          className="text-red-600 hover:text-red-900"
                          disabled={user.role === 'ADMIN'}
                        >
                          <i className="fas fa-trash"></i>
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* 페이지네이션 */}
          {totalPages > 1 && (
            <div className="bg-white px-4 py-3 border-t border-gray-200 sm:px-6">
              <div className="flex items-center justify-between">
                <div className="flex-1 flex justify-between sm:hidden">
                  <button
                    onClick={() => setCurrentPage(Math.max(0, currentPage - 1))}
                    disabled={currentPage === 0}
                    className="relative inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50"
                  >
                    이전
                  </button>
                  <button
                    onClick={() => setCurrentPage(Math.min(totalPages - 1, currentPage + 1))}
                    disabled={currentPage === totalPages - 1}
                    className="ml-3 relative inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50"
                  >
                    다음
                  </button>
                </div>
                <div className="hidden sm:flex-1 sm:flex sm:items-center sm:justify-between">
                  <div>
                    <p className="text-sm text-gray-700">
                      총 <span className="font-medium">{totalElements}</span>개 중{' '}
                      <span className="font-medium">{currentPage * pageSize + 1}</span>-
                      <span className="font-medium">
                        {Math.min((currentPage + 1) * pageSize, totalElements)}
                      </span>개 표시
                    </p>
                  </div>
                  <div>
                    <nav className="relative z-0 inline-flex rounded-md shadow-sm -space-x-px">
                      <button
                        onClick={() => setCurrentPage(Math.max(0, currentPage - 1))}
                        disabled={currentPage === 0}
                        className="relative inline-flex items-center px-2 py-2 rounded-l-md border border-gray-300 bg-white text-sm font-medium text-gray-500 hover:bg-gray-50 disabled:opacity-50"
                      >
                        <i className="fas fa-chevron-left"></i>
                      </button>

                      {[...Array(totalPages)].map((_, index) => (
                        <button
                          key={index}
                          onClick={() => setCurrentPage(index)}
                          className={`relative inline-flex items-center px-4 py-2 border text-sm font-medium ${
                            currentPage === index
                              ? 'z-10 bg-primary border-primary text-white'
                              : 'bg-white border-gray-300 text-gray-500 hover:bg-gray-50'
                          }`}
                        >
                          {index + 1}
                        </button>
                      ))}

                      <button
                        onClick={() => setCurrentPage(Math.min(totalPages - 1, currentPage + 1))}
                        disabled={currentPage === totalPages - 1}
                        className="relative inline-flex items-center px-2 py-2 rounded-r-md border border-gray-300 bg-white text-sm font-medium text-gray-500 hover:bg-gray-50 disabled:opacity-50"
                      >
                        <i className="fas fa-chevron-right"></i>
                      </button>
                    </nav>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* 수정 모달 */}
        {showEditModal && (
          <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
            <div className="relative top-20 mx-auto p-5 border w-96 shadow-lg rounded-md bg-white">
              <div className="mt-3">
                <h3 className="text-lg font-medium text-gray-900 mb-4">사용자 정보 수정</h3>
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      사용자명
                    </label>
                    <input
                      type="text"
                      value={editFormData.username}
                      onChange={(e) => setEditFormData({...editFormData, username: e.target.value})}
                      className="w-full p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      이메일
                    </label>
                    <input
                      type="email"
                      value={editFormData.email}
                      onChange={(e) => setEditFormData({...editFormData, email: e.target.value})}
                      className="w-full p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      휴대폰 번호
                    </label>
                    <input
                      type="tel"
                      value={editFormData.phone}
                      onChange={(e) => setEditFormData({...editFormData, phone: e.target.value})}
                      className="w-full p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary"
                    />
                  </div>
                </div>
                <div className="flex items-center justify-end space-x-3 mt-6">
                  <button
                    onClick={() => setShowEditModal(false)}
                    className="px-4 py-2 text-gray-700 bg-gray-200 rounded-md hover:bg-gray-300"
                  >
                    취소
                  </button>
                  <button
                    onClick={handleSaveEdit}
                    className="px-4 py-2 bg-primary text-white rounded-md hover:bg-blue-800"
                  >
                    저장
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* 삭제 확인 모달 */}
        {showDeleteModal && (
          <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
            <div className="relative top-20 mx-auto p-5 border w-96 shadow-lg rounded-md bg-white">
              <div className="mt-3 text-center">
                <i className="fas fa-exclamation-triangle text-red-500 text-4xl mb-4"></i>
                <h3 className="text-lg font-medium text-gray-900 mb-2">사용자 삭제</h3>
                <p className="text-sm text-gray-500 mb-6">
                  정말로 "{selectedUser?.username}" 사용자를 삭제하시겠습니까?<br/>
                  이 작업은 되돌릴 수 없습니다.
                </p>
                <div className="flex items-center justify-center space-x-3">
                  <button
                    onClick={() => setShowDeleteModal(false)}
                    className="px-4 py-2 text-gray-700 bg-gray-200 rounded-md hover:bg-gray-300"
                  >
                    취소
                  </button>
                  <button
                    onClick={confirmDelete}
                    className="px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700"
                  >
                    삭제
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default AdminUsers;