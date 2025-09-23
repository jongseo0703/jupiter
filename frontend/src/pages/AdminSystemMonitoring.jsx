import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import authService from '../services/authService';
import adminService from '../services/adminService';

const AdminSystemMonitoring = () => {
    const navigate = useNavigate();
    const [systemStatus, setSystemStatus] = useState(null);
    const [detailedMetrics, setDetailedMetrics] = useState(null);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState('');
    const [lastUpdated, setLastUpdated] = useState(new Date());
    const [autoRefresh, setAutoRefresh] = useState(true);

    useEffect(() => {
        checkAdminAccess();
        loadSystemData();
    }, []);

    useEffect(() => {
        let interval;
        if (autoRefresh) {
            interval = setInterval(() => {
                loadSystemData();
            }, 30000); // 30초마다 자동 갱신
        }
        return () => clearInterval(interval);
    }, [autoRefresh]);

    const checkAdminAccess = async () => {
        try {
            if (!authService.isLoggedIn()) {
                navigate('/login');
                return;
            }

            const user = await authService.getCurrentUser();
            if (user.role !== 'ADMIN') {
                navigate('/');
                return;
            }
        } catch (error) {
            console.error('Admin access check failed:', error);
            navigate('/login');
        }
    };

    const loadSystemData = async () => {
        try {
            setError('');
            const [statusData, metricsData] = await Promise.all([
                adminService.getSystemStatus(),
                adminService.getDetailedMetrics()
            ]);

            setSystemStatus(statusData);
            setDetailedMetrics(metricsData);
            setLastUpdated(new Date());
        } catch (error) {
            console.error('Failed to load system data:', error);
            setError(error.message || '시스템 데이터 로드에 실패했습니다.');
        } finally {
            setIsLoading(false);
        }
    };

    const formatBytes = (bytes) => {
        if (bytes === 0) return '0 Bytes';
        const k = 1024;
        const sizes = ['Bytes', 'KB', 'MB', 'GB'];
        const i = Math.floor(Math.log(bytes) / Math.log(k));
        return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
    };

    const getStatusColor = (status) => {
        switch (status) {
            case 'UP': return 'text-green-600 bg-green-100';
            case 'DOWN': return 'text-red-600 bg-red-100';
            default: return 'text-yellow-600 bg-yellow-100';
        }
    };

    if (isLoading) {
        return (
            <div className="min-h-screen bg-gray-50 flex items-center justify-center">
                <div className="text-center">
                    <i className="fas fa-spinner fa-spin text-4xl text-primary mb-4"></i>
                    <p className="text-gray-600">시스템 데이터를 로드하는 중...</p>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gray-50 py-6">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                {/* 헤더 */}
                <div className="mb-8">
                    <div className="flex justify-between items-center mb-4">
                        <h1 className="text-3xl font-bold text-gray-900">
                            <i className="fas fa-chart-line mr-3 text-primary"></i>
                            시스템 모니터링
                        </h1>
                        <div className="flex items-center space-x-4">
                            <div className="flex items-center">
                                <input
                                    type="checkbox"
                                    id="autoRefresh"
                                    checked={autoRefresh}
                                    onChange={(e) => setAutoRefresh(e.target.checked)}
                                    className="mr-2"
                                />
                                <label htmlFor="autoRefresh" className="text-sm text-gray-600">
                                    자동 갱신 (30초)
                                </label>
                            </div>
                            <button
                                onClick={loadSystemData}
                                className="px-4 py-2 bg-primary text-white rounded-lg hover:bg-blue-800 transition-colors"
                            >
                                <i className="fas fa-sync-alt mr-2"></i>
                                새로고침
                            </button>
                        </div>
                    </div>
                    <p className="text-gray-600">
                        마지막 업데이트: {lastUpdated.toLocaleString('ko-KR')}
                    </p>
                </div>

                {/* 에러 메시지 */}
                {error && (
                    <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg">
                        <div className="flex items-center">
                            <i className="fas fa-exclamation-triangle text-red-600 mr-2"></i>
                            <p className="text-red-700">{error}</p>
                        </div>
                    </div>
                )}

                {/* 시스템 상태 카드들 */}
                {systemStatus && (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
                        {/* 전체 상태 */}
                        <div className="bg-white rounded-lg shadow-sm p-6">
                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="text-sm font-medium text-gray-600">시스템 상태</p>
                                    <div className={`inline-flex px-3 py-1 rounded-full text-sm font-medium ${getStatusColor(systemStatus.status)}`}>
                                        {systemStatus.status === 'UP' ? '정상' : '오류'}
                                    </div>
                                </div>
                                <i className={`fas fa-server text-2xl ${systemStatus.status === 'UP' ? 'text-green-500' : 'text-red-500'}`}></i>
                            </div>
                        </div>

                        {/* 메모리 사용률 */}
                        <div className="bg-white rounded-lg shadow-sm p-6">
                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="text-sm font-medium text-gray-600">메모리 사용률</p>
                                    <p className="text-2xl font-bold text-gray-900">
                                        {systemStatus.metrics?.memory?.usagePercentage?.toFixed(1)}%
                                    </p>
                                    <p className="text-sm text-gray-500">
                                        {formatBytes(systemStatus.metrics?.memory?.usedMemory)} / {formatBytes(systemStatus.metrics?.memory?.totalMemory)}
                                    </p>
                                </div>
                                <i className="fas fa-memory text-2xl text-blue-500"></i>
                            </div>
                        </div>

                        {/* CPU 사용률 */}
                        <div className="bg-white rounded-lg shadow-sm p-6">
                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="text-sm font-medium text-gray-600">CPU 사용률</p>
                                    <p className="text-2xl font-bold text-gray-900">
                                        {systemStatus.metrics?.cpuUsage?.toFixed(1)}%
                                    </p>
                                </div>
                                <i className="fas fa-microchip text-2xl text-orange-500"></i>
                            </div>
                        </div>

                        {/* 업타임 */}
                        <div className="bg-white rounded-lg shadow-sm p-6">
                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="text-sm font-medium text-gray-600">업타임</p>
                                    <p className="text-lg font-bold text-gray-900">
                                        {systemStatus.metrics?.uptime}
                                    </p>
                                </div>
                                <i className="fas fa-clock text-2xl text-purple-500"></i>
                            </div>
                        </div>
                    </div>
                )}

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                    {/* 시스템 메트릭스 */}
                    {systemStatus && (
                        <div className="bg-white rounded-lg shadow-sm">
                            <div className="p-6 border-b border-gray-200">
                                <h2 className="text-xl font-semibold text-gray-900">시스템 메트릭스</h2>
                            </div>
                            <div className="p-6 space-y-4">
                                <div className="flex justify-between">
                                    <span className="text-gray-600">활성 연결</span>
                                    <span className="font-medium">{systemStatus.metrics?.activeConnections || 0}</span>
                                </div>
                                <div className="flex justify-between">
                                    <span className="text-gray-600">스레드 수</span>
                                    <span className="font-medium">{systemStatus.metrics?.threadCount || 0}</span>
                                </div>
                                <div className="flex justify-between">
                                    <span className="text-gray-600">여유 메모리</span>
                                    <span className="font-medium">{formatBytes(systemStatus.metrics?.memory?.freeMemory || 0)}</span>
                                </div>
                            </div>
                        </div>
                    )}

                    {/* 상세 메트릭스 */}
                    {detailedMetrics && (
                        <div className="bg-white rounded-lg shadow-sm">
                            <div className="p-6 border-b border-gray-200">
                                <h2 className="text-xl font-semibold text-gray-900">상세 정보</h2>
                            </div>
                            <div className="p-6 space-y-4">
                                <div className="flex justify-between">
                                    <span className="text-gray-600">가용 프로세서</span>
                                    <span className="font-medium">{detailedMetrics.available_processors || 'N/A'}</span>
                                </div>
                                <div className="flex justify-between">
                                    <span className="text-gray-600">시스템 로드</span>
                                    <span className="font-medium">
                                        {detailedMetrics.system_load_average !== undefined
                                            ? detailedMetrics.system_load_average.toFixed(2)
                                            : 'N/A'}
                                    </span>
                                </div>
                                <div className="flex justify-between">
                                    <span className="text-gray-600">피크 스레드</span>
                                    <span className="font-medium">{detailedMetrics.peak_thread_count || 'N/A'}</span>
                                </div>
                                <div className="flex justify-between">
                                    <span className="text-gray-600">데몬 스레드</span>
                                    <span className="font-medium">{detailedMetrics.daemon_thread_count || 'N/A'}</span>
                                </div>
                            </div>
                        </div>
                    )}
                </div>

                {/* 헬스 상세 정보 */}
                {systemStatus?.healthDetails && (
                    <div className="mt-8 bg-white rounded-lg shadow-sm">
                        <div className="p-6 border-b border-gray-200">
                            <h2 className="text-xl font-semibold text-gray-900">헬스체크 상세</h2>
                        </div>
                        <div className="p-6">
                            <pre className="bg-gray-50 p-4 rounded-lg text-sm overflow-auto">
                                {JSON.stringify(systemStatus.healthDetails, null, 2)}
                            </pre>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};

export default AdminSystemMonitoring;