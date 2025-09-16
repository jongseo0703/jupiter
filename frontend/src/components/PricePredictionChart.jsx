// TODO: 에러 처리 및 사용자 경험 개선 필요
// TODO: 로딩 상태 및 재시도 로직 고도화 필요
// TODO: 차트 스타일 및 반응형 디자인 최적화 필요
import { useState, useEffect } from 'react';
import { Line } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
} from 'chart.js';

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend
);

function PricePredictionChart({ product }) {
  const [prediction, setPrediction] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const fetchPrediction = async () => {
    setLoading(true);
    setError(null);

    try {
      // 시계열 가격 히스토리에서 가격을 추출하여 trendData 생성 (시간순 정렬)
      const historicalPrices = product.priceHistory
        .sort((a, b) => b.weeksAgo - a.weeksAgo) // 3주전 → 2주전 → 1주전 순서로 정렬
        .map(p => p.price);
      const trendData = historicalPrices.join(',');

      const requestData = {
        productName: product.name,
        currentPrice: product.lowestPrice,
        trendData: trendData
      };

      // TODO: 하드코딩된 localhost URL을 환경변수 또는 설정파일로 관리하도록 수정
      const response = await fetch('http://localhost:7777/api/predictions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(requestData)
      });

      if (response.ok) {
        const data = await response.json();
        setPrediction(data);
      } else {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
    } catch (error) {
      console.error('예측 요청 실패:', error);
      setError('가격 예측을 불러올 수 없습니다. OpenAI API 서버가 실행 중인지 확인해주세요.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPrediction();
  }, [product]);

  if (loading) {
    return (
      <div className="bg-white rounded-lg shadow-sm p-6 mt-8">
        <h3 className="text-xl font-bold mb-4">📈 AI 가격 예측</h3>
        <div className="text-center py-8">
          <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
          <p className="mt-2 text-gray-600">예측 데이터 로딩 중...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-white rounded-lg shadow-sm p-6 mt-8">
        <h3 className="text-xl font-bold mb-4">📈 AI 가격 예측</h3>
        <div className="text-center py-8">
          <div className="text-red-500 mb-4">
            <i className="fas fa-exclamation-triangle text-2xl"></i>
          </div>
          <p className="text-red-600">{error}</p>
          <button
            onClick={fetchPrediction}
            className="mt-4 bg-primary text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors"
          >
            다시 시도
          </button>
        </div>
      </div>
    );
  }

  if (!prediction) return null;

  // 차트 데이터 구성 - 시계열 가격 히스토리 사용
  const historicalPrices = product.priceHistory
    .sort((a, b) => b.weeksAgo - a.weeksAgo) // 3주전 → 2주전 → 1주전 순서로 정렬
    .map(p => p.price);
  const predictionValues = [
    prediction.week1,
    prediction.week2,
    prediction.week3,
    prediction.week4
  ];

  const chartData = {
    labels: ['3주전', '2주전', '1주전', '현재', '1주후', '2주후', '3주후', '4주후'],
    datasets: [
      {
        label: '실제 가격 추이',
        data: [
          ...historicalPrices,
          product.lowestPrice,
          null, null, null, null
        ],
        fill: false,
        borderColor: 'rgb(54, 162, 235)',
        backgroundColor: 'rgb(54, 162, 235)',
        tension: 0.1,
        borderWidth: 2
      },
      {
        label: 'AI 예측 가격',
        data: [
          null, null, null,
          product.lowestPrice,
          ...predictionValues
        ],
        fill: false,
        borderColor: 'rgb(255, 99, 132)',
        backgroundColor: 'rgb(255, 99, 132)',
        borderDash: [5, 5],
        tension: 0.1,
        borderWidth: 2
      }
    ]
  };

  const options = {
    responsive: true,
    maintainAspectRatio: false,
    interaction: {
      intersect: false
    },
    plugins: {
      legend: {
        display: true,
        position: 'top'
      },
      title: {
        display: false
      },
      tooltip: {
        callbacks: {
          label: function(context) {
            return `${context.dataset.label}: ₩${context.parsed.y?.toLocaleString()}`;
          }
        }
      }
    },
    scales: {
      y: {
        beginAtZero: false,
        title: {
          display: true,
          text: '가격 (원)'
        },
        ticks: {
          callback: function(value) {
            return '₩' + value.toLocaleString();
          }
        }
      },
      x: {
        title: {
          display: true,
          text: '기간'
        }
      }
    }
  };

  return (
    <div className="bg-white rounded-lg shadow-sm p-6 mt-8">
      <h3 className="text-xl font-bold mb-4">📈 AI 가격 예측</h3>

      {/* 차트 영역 */}
      <div style={{ width: '100%', height: '400px' }}>
        <Line data={chartData} options={options} />
      </div>

      {/* 주의사항 */}
      <div className="mt-6 p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
        <p className="text-sm text-yellow-800">
          <strong>⚠️ 주의사항:</strong> 이 가격 예측은 AI에 의한 추정치로 실제 가격과 다를 수 있습니다.
          구매 결정 시 참고용으로만 활용해 주시기 바랍니다.
        </p>
      </div>

      {/* AI 분석 결과 */}
      {prediction.explanation && (
        <div className="mt-4 p-4 bg-gray-50 border border-gray-200 rounded-lg">
          <p className="text-sm font-semibold text-gray-700 mb-2">🤖 AI 예측 분석</p>
          <p className="text-sm text-gray-600 leading-relaxed">{prediction.explanation}</p>
        </div>
      )}

      {/* 예측 수치 요약 */}
      <div className="mt-4 grid grid-cols-2 md:grid-cols-4 gap-4">
        {[
          { label: '1주 후', value: prediction.week1 },
          { label: '2주 후', value: prediction.week2 },
          { label: '3주 후', value: prediction.week3 },
          { label: '4주 후', value: prediction.week4 }
        ].map((item, index) => (
          <div key={index} className="text-center p-3 bg-gray-50 rounded-lg">
            <div className="text-sm text-gray-600 mb-1">{item.label}</div>
            <div className="text-lg font-semibold text-gray-800">
              ₩{item.value?.toLocaleString()}
            </div>
            <div className={`text-xs mt-1 ${
              item.value > product.lowestPrice ? 'text-red-600' : 'text-green-600'
            }`}>
              {item.value > product.lowestPrice ? '↗' : '↘'}
              {Math.abs(((item.value - product.lowestPrice) / product.lowestPrice * 100)).toFixed(1)}%
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

export default PricePredictionChart;