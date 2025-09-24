import React from 'react';
import ReactDOM from 'react-dom/client';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import './index.css';
import App from './App';

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 0, // 즉시 stale 상태로 변경
      refetchOnWindowFocus: true, // 윈도우 포커스 시 자동 refetch
      refetchOnMount: true, // 컴포넌트 마운트 시 자동 refetch
      retry: 1, // 실패 시 재시도 횟수
    },
  },
});

const root = ReactDOM.createRoot(
  document.getElementById('root')
);
root.render(
  <React.StrictMode>
    <QueryClientProvider client={queryClient}>
      <App />
    </QueryClientProvider>
  </React.StrictMode>
);
