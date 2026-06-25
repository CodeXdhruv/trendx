import { useAuth } from '@clerk/nextjs';
import axios from 'axios';
import { useMemo } from 'react';

const BACKEND_URL = process.env.NEXT_PUBLIC_BACKEND_URL || 'http://localhost:3001/api/v1';

export function useApi() {
  const { getToken } = useAuth();

  const apiClient = useMemo(() => {
    const client = axios.create({
      baseURL: BACKEND_URL,
      headers: {
        'Content-Type': 'application/json',
      },
    });

    client.interceptors.request.use(async (config) => {
      try {
        const token = await getToken();
        if (token) {
          config.headers.Authorization = `Bearer ${token}`;
        }
      } catch (error) {
        console.error("Error fetching Clerk auth token", error);
      }
      return config;
    });

    return client;
  }, [getToken]);

  const getWatchlist = async () => {
    const { data } = await apiClient.get('/watchlist');
    return data;
  };

  const getStockData = async (ticker: string) => {
    const { data } = await apiClient.get(`/company/${ticker}`);
    return data;
  };

  const getResearchProgress = async (ticker: string) => {
    const { data } = await apiClient.get(`/research/${ticker}/progress`);
    return data;
  };

  const getMarketMood = async () => {
    const { data } = await apiClient.get('/market/mood');
    return data;
  };

  const getTrendingStocks = async () => {
    const { data } = await apiClient.get('/market/trending');
    return data;
  };

  const getCompareStocks = async (tickers: string[]) => {
    const { data } = await apiClient.get(`/compare?tickers=${tickers.join(',')}`);
    return data;
  };

  const sendChatMessage = async (ticker: string, message: string) => {
    const { data } = await apiClient.post(`/chat`, { ticker, message });
    return data;
  };

  const startResearch = async (ticker: string, onProgress?: (data: any) => void) => {
    const token = await getToken();
    const res = await fetch(`${BACKEND_URL}/research/start/stream`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        ...(token ? { 'Authorization': `Bearer ${token}` } : {})
      },
      body: JSON.stringify({ ticker })
    });
    
    if (!res.body) throw new Error("No readable stream");
    
    const reader = res.body.getReader();
    const decoder = new TextDecoder();
    let finalData = null;
    let buffer = '';

    while (true) {
      const { done, value } = await reader.read();
      if (done) break;
      
      buffer += decoder.decode(value, { stream: true });
      const lines = buffer.split('\n');
      buffer = lines.pop() || '';
      
      for (const line of lines) {
        if (line.startsWith('data: ')) {
          try {
            const parsed = JSON.parse(line.slice(6));
            if (parsed.type === 'final') {
              finalData = parsed.output;
            }
            if (onProgress) {
              onProgress(parsed);
            }
          } catch (e) {
            console.error("Error parsing SSE line", e);
          }
        }
      }
    }
    
    return { data: finalData };
  };

  return {
    apiClient,
    getWatchlist,
    getStockData,
    getResearchProgress,
    getMarketMood,
    getTrendingStocks,
    getCompareStocks,
    sendChatMessage,
    startResearch,
  };
}
