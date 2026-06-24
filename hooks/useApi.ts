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

  const getCompareStocks = async (tickers: string[]) => {
    const { data } = await apiClient.get(`/compare?tickers=${tickers.join(',')}`);
    return data;
  };

  const sendChatMessage = async (ticker: string, message: string) => {
    const { data } = await apiClient.post(`/chat`, { ticker, message });
    return data;
  };

  return {
    apiClient,
    getWatchlist,
    getStockData,
    getResearchProgress,
    getMarketMood,
    getCompareStocks,
    sendChatMessage,
  };
}
