'use client';

import { useState, useEffect, useCallback, useRef } from 'react';
import { Portfolio, Stock } from '@/types/portfolio';
import { portfolioService } from '@/services/portfolioService';

interface UsePortfolioReturn {
  portfolio: Portfolio | null;
  loading: boolean;
  error: string | null;
  errors: string[];
  isRefreshing: boolean;
  addStock: (stockData: Omit<Stock, 'id' | 'investment' | 'portfolioPercentage' | 'cmp' | 'presentValue' | 'gainLoss' | 'peRatio' | 'latestEarnings'>) => Promise<void>;
  removeStock: (stockId: string) => void;
  updateStock: (stockId: string, updates: Partial<Omit<Stock, 'id' | 'cmp' | 'presentValue' | 'gainLoss' | 'peRatio' | 'latestEarnings'>>) => void;
  refreshPortfolio: () => Promise<void>;
  clearPortfolio: () => void;
  dismissError: () => void;
  dismissErrors: () => void;
}

export function usePortfolio(): UsePortfolioReturn {
  const [portfolio, setPortfolio] = useState<Portfolio | null>(null);
  const [loading, setLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [errors, setErrors] = useState<string[]>([]);
  const intervalRef = useRef<NodeJS.Timeout | null>(null);

  const fetchPortfolio = useCallback(async (showLoading = true) => {
    try {
      if (showLoading) {
        setError(null);
        setErrors([]);
      }
      
      const portfolioData = await portfolioService.fetchPortfolio();
      setPortfolio(portfolioData);
      
      if (portfolioData.errors.length > 0) {
        setErrors(portfolioData.errors);
      }
      
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to fetch portfolio data';
      setError(errorMessage);
      console.error('Portfolio fetch error:', err);
    } finally {
      if (showLoading) {
        setLoading(false);
      }
    }
  }, []);

  const refreshLiveData = useCallback(async () => {
    if (!portfolio || loading) return;

    setIsRefreshing(true);
    try {
      const { stocks: updatedStocks, errors: refreshErrors } = await portfolioService.refreshLiveData(portfolio.stocks);
      
      const totalInvestment = updatedStocks.reduce((sum, stock) => sum + stock.investment, 0);
      const totalPresentValue = updatedStocks.reduce((sum, stock) => sum + stock.presentValue, 0);
      const totalGainLoss = totalPresentValue - totalInvestment;

      const stocksWithPercentages = updatedStocks.map(stock => ({
        ...stock,
        portfolioPercentage: totalInvestment > 0 ? (stock.investment / totalInvestment) * 100 : 0,
      }));

      const sectors = stocksWithPercentages.reduce((acc, stock) => {
        const existingSector = acc.find(s => s.sector === stock.sector);
        if (existingSector) {
          existingSector.stocks.push(stock);
          existingSector.totalInvestment += stock.investment;
          existingSector.totalPresentValue += stock.presentValue;
          existingSector.totalGainLoss += stock.gainLoss;
        } else {
          acc.push({
            sector: stock.sector,
            stocks: [stock],
            totalInvestment: stock.investment,
            totalPresentValue: stock.presentValue,
            totalGainLoss: stock.gainLoss,
          });
        }
        return acc;
      }, [] as Portfolio['sectors']);

      setPortfolio({
        stocks: stocksWithPercentages,
        sectors,
        totalInvestment,
        totalPresentValue,
        totalGainLoss,
        lastUpdated: new Date(),
      });

      if (refreshErrors.length > 0) {
        setErrors(refreshErrors);
      } else {
        setErrors([]); 
      }
      
    } catch (err) {
      console.error('Live data refresh error:', err);
      const errorMessage = err instanceof Error ? err.message : 'Failed to refresh live data';
      setErrors(prev => [...prev, `Refresh failed: ${errorMessage}`]);
    } finally {
      setIsRefreshing(false);
    }
  }, [portfolio, loading]);

  const startAutoRefresh = useCallback(() => {
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
    }
    
    intervalRef.current = setInterval(() => {
      refreshLiveData();
    }, 15000);
  }, [refreshLiveData]);

  const stopAutoRefresh = useCallback(() => {
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    }
  }, []);

  const addStock = useCallback(async (stockData: Omit<Stock, 'id' | 'investment' | 'portfolioPercentage' | 'cmp' | 'presentValue' | 'gainLoss' | 'peRatio' | 'latestEarnings'>) => {
    try {
      setLoading(true);
      setError(null);
      setErrors([]);
      
      portfolioService.addStock(stockData);
      await fetchPortfolio(false); 
      
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to add stock';
      setError(errorMessage);
      throw err; 
    } finally {
      setLoading(false);
    }
  }, [fetchPortfolio]);

  const removeStock = useCallback((stockId: string) => {
    try {
      setError(null);
      setErrors([]);
      
      portfolioService.removeStock(stockId);
      
      if (portfolio) {
        const updatedStocks = portfolio.stocks.filter(s => s.id !== stockId);
        
        if (updatedStocks.length === 0) {
          setPortfolio(null);
          return;
        }
        
        const totalInvestment = updatedStocks.reduce((sum, stock) => sum + stock.investment, 0);
        const totalPresentValue = updatedStocks.reduce((sum, stock) => sum + stock.presentValue, 0);
        const totalGainLoss = totalPresentValue - totalInvestment;

        const stocksWithPercentages = updatedStocks.map(stock => ({
          ...stock,
          portfolioPercentage: totalInvestment > 0 ? (stock.investment / totalInvestment) * 100 : 0,
        }));

        const sectors = stocksWithPercentages.reduce((acc, stock) => {
          const existingSector = acc.find(s => s.sector === stock.sector);
          if (existingSector) {
            existingSector.stocks.push(stock);
            existingSector.totalInvestment += stock.investment;
            existingSector.totalPresentValue += stock.presentValue;
            existingSector.totalGainLoss += stock.gainLoss;
          } else {
            acc.push({
              sector: stock.sector,
              stocks: [stock],
              totalInvestment: stock.investment,
              totalPresentValue: stock.presentValue,
              totalGainLoss: stock.gainLoss,
            });
          }
          return acc;
        }, [] as Portfolio['sectors']);

        setPortfolio({
          stocks: stocksWithPercentages,
          sectors,
          totalInvestment,
          totalPresentValue,
          totalGainLoss,
          lastUpdated: new Date(),
        });
      }
      
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to remove stock';
      setError(errorMessage);
    }
  }, [portfolio]);

  const updateStock = useCallback((stockId: string, updates: Partial<Omit<Stock, 'id' | 'cmp' | 'presentValue' | 'gainLoss' | 'peRatio' | 'latestEarnings'>>) => {
    try {
      setError(null);
      setErrors([]);
      
      portfolioService.updateStock(stockId, updates);
      fetchPortfolio(false); 
      
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to update stock';
      setError(errorMessage);
    }
  }, [fetchPortfolio]);

  const refreshPortfolio = useCallback(async () => {
    setLoading(true);
    await fetchPortfolio();
  }, [fetchPortfolio]);

  const clearPortfolio = useCallback(() => {
    try {
      setError(null);
      setErrors([]);
      
      portfolioService.clearPortfolio();
      setPortfolio(null);
      stopAutoRefresh();
      
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to clear portfolio';
      setError(errorMessage);
    }
  }, [stopAutoRefresh]);

  const dismissError = useCallback(() => {
    setError(null);
  }, []);

  const dismissErrors = useCallback(() => {
    setErrors([]);
  }, []);

  useEffect(() => {
    fetchPortfolio();
  }, [fetchPortfolio]);

  useEffect(() => {
    if (portfolio && !loading) {
      startAutoRefresh();
    }
    
    return () => {
      stopAutoRefresh();
    };
  }, [portfolio, loading, startAutoRefresh, stopAutoRefresh]);

  useEffect(() => {
    return () => {
      stopAutoRefresh();
    };
  }, [stopAutoRefresh]);

  return {
    portfolio,
    loading,
    error,
    errors,
    isRefreshing,
    addStock,
    removeStock,
    updateStock,
    refreshPortfolio,
    clearPortfolio,
    dismissError,
    dismissErrors,
  };
}