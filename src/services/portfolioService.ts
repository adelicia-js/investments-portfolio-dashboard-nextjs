import { Stock, Portfolio, SectorSummary, YahooFinanceResponse, GoogleFinanceResponse } from '@/types/portfolio';
import axios from 'axios';

// Default sample portfolio 
const DEFAULT_PORTFOLIO: Omit<Stock, 'cmp' | 'presentValue' | 'gainLoss' | 'peRatio' | 'latestEarnings'>[] = [
  {
    id: '1',
    particulars: 'Tata Consultancy Services',
    sector: 'Technology',
    purchasePrice: 3200,
    quantity: 10,
    exchange: 'NSE',
    symbol: 'TCS',
    investment: 32000,
    portfolioPercentage: 0,
  },
  {
    id: '2',
    particulars: 'Infosys Limited',
    sector: 'Technology',
    purchasePrice: 1400,
    quantity: 15,
    exchange: 'NSE',
    symbol: 'INFY',
    investment: 21000,
    portfolioPercentage: 0,
  },
  {
    id: '3',
    particulars: 'HDFC Bank Limited',
    sector: 'Financials',
    purchasePrice: 1600,
    quantity: 12,
    exchange: 'NSE',
    symbol: 'HDFCBANK',
    investment: 19200,
    portfolioPercentage: 0,
  },
];

export class PortfolioService {
  private cache = new Map<string, { data: unknown; timestamp: number }>();
  private readonly CACHE_DURATION = 10000; // 10 seconds cache
  private readonly STORAGE_KEY = 'portfolio_stocks';

  private getCachedData<T>(key: string): T | null {
    const cached = this.cache.get(key);
    if (cached && Date.now() - cached.timestamp < this.CACHE_DURATION) {
      return cached.data as T;
    }
    return null;
  }

  private setCachedData<T>(key: string, data: T): void {
    this.cache.set(key, { data, timestamp: Date.now() });
  }

  private getUserStocks(): Omit<Stock, 'cmp' | 'presentValue' | 'gainLoss' | 'peRatio' | 'latestEarnings'>[] {
    if (typeof window === 'undefined') return DEFAULT_PORTFOLIO;
    
    try {
      const stored = localStorage.getItem(this.STORAGE_KEY);
      if (stored) {
        const parsed = JSON.parse(stored);
        return Array.isArray(parsed) && parsed.length > 0 ? parsed : DEFAULT_PORTFOLIO;
      }
    } catch (error) {
      console.error('Error loading user stocks from localStorage:', error);
    }
    
    return DEFAULT_PORTFOLIO;
  }

  private saveUserStocks(stocks: Omit<Stock, 'cmp' | 'presentValue' | 'gainLoss' | 'peRatio' | 'latestEarnings'>[]): void {
    if (typeof window === 'undefined') return;
    
    try {
      localStorage.setItem(this.STORAGE_KEY, JSON.stringify(stocks));
    } catch (error) {
      console.error('Error saving user stocks to localStorage:', error);
    }
  }

  addStock(stockData: Omit<Stock, 'id' | 'investment' | 'portfolioPercentage' | 'cmp' | 'presentValue' | 'gainLoss' | 'peRatio' | 'latestEarnings'>): void {
    const currentStocks = this.getUserStocks();
    
    const existingStock = currentStocks.find(s => s.symbol === stockData.symbol && s.exchange === stockData.exchange);
    if (existingStock) {
      throw new Error(`${stockData.symbol} is already in your portfolio on ${stockData.exchange}`);
    }
    
    const newStock = {
      ...stockData,
      id: Date.now().toString(),
      investment: stockData.purchasePrice * stockData.quantity,
      portfolioPercentage: 0,
    };
    
    const updatedStocks = [...currentStocks, newStock];
    this.saveUserStocks(updatedStocks);
    
    this.cache.clear();
  }

  removeStock(stockId: string): void {
    const currentStocks = this.getUserStocks();
    const updatedStocks = currentStocks.filter(s => s.id !== stockId);
    this.saveUserStocks(updatedStocks);
    
    this.cache.clear();
  }

  updateStock(stockId: string, updates: Partial<Omit<Stock, 'id' | 'cmp' | 'presentValue' | 'gainLoss' | 'peRatio' | 'latestEarnings'>>): void {
    const currentStocks = this.getUserStocks();
    const stockIndex = currentStocks.findIndex(s => s.id === stockId);
    
    if (stockIndex === -1) {
      throw new Error('Stock not found in portfolio');
    }
    
    const updatedStock = {
      ...currentStocks[stockIndex],
      ...updates,
      investment: (updates.purchasePrice || currentStocks[stockIndex].purchasePrice) * 
                 (updates.quantity || currentStocks[stockIndex].quantity),
    };
    
    const updatedStocks = [...currentStocks];
    updatedStocks[stockIndex] = updatedStock;
    
    this.saveUserStocks(updatedStocks);
    
    this.cache.clear();
  }

  async fetchYahooFinanceData(symbol: string, exchange: 'NSE' | 'BSE' = 'NSE'): Promise<YahooFinanceResponse & { error?: string }> {
    const cacheKey = `yahoo_${symbol}_${exchange}`;
    const cached = this.getCachedData<YahooFinanceResponse>(cacheKey);
    
    if (cached) {
      return cached;
    }

    try {
      const exchangeCode = exchange === 'NSE' ? 'NS' : 'BO';
      const response = await axios.get(`/api/yahoo-finance?symbol=${symbol}&exchange=${exchangeCode}`, {
        timeout: 15000,
      });
      
      const data: YahooFinanceResponse = response.data;
      
      if (data.isMockData) {
        data.error = 'Using simulated data - real market data unavailable';
      }
      
      this.setCachedData(cacheKey, data);
      return data;
    } catch (error) {
      console.error(`Failed to fetch Yahoo Finance data for ${symbol}:`, error);
      
      const errorMessage = axios.isAxiosError(error) 
        ? `Network error: ${error.message}`
        : 'Unknown error occurred';
        
      return {
        symbol,
        price: 0,
        change: 0,
        changePercent: 0,
        timestamp: Date.now(),
        error: errorMessage,
      };
    }
  }

  async fetchGoogleFinanceData(symbol: string): Promise<GoogleFinanceResponse & { error?: string }> {
    const cacheKey = `google_${symbol}`;
    const cached = this.getCachedData<GoogleFinanceResponse>(cacheKey);
    
    if (cached) {
      return cached;
    }

    try {
      const response = await axios.get(`/api/google-finance?symbol=${symbol}`, {
        timeout: 20000,
      });
      
      const data: GoogleFinanceResponse = response.data;
      
      if (data.isMockData) {
        data.error = 'Using simulated data - real P/E and earnings unavailable';
      }
      
      this.setCachedData(cacheKey, data);
      return data;
    } catch (error) {
      console.error(`Failed to fetch Google Finance data for ${symbol}:`, error);
      
      const errorMessage = axios.isAxiosError(error) 
        ? `Scraping failed: ${error.message}`
        : 'Unable to fetch P/E ratio and earnings data';
        
      return {
        symbol,
        peRatio: null,
        earnings: null,
        timestamp: Date.now(),
        error: errorMessage,
      };
    }
  }

  private calculatePortfolioPercentages(stocks: Stock[]): Stock[] {
    const totalInvestment = stocks.reduce((sum, stock) => sum + stock.investment, 0);
    
    if (totalInvestment === 0) return stocks;
    
    return stocks.map(stock => ({
      ...stock,
      portfolioPercentage: (stock.investment / totalInvestment) * 100,
    }));
  }

  private groupBySector(stocks: Stock[]): SectorSummary[] {
    const sectors = new Map<string, Stock[]>();
    
    stocks.forEach(stock => {
      const sectorStocks = sectors.get(stock.sector) || [];
      sectorStocks.push(stock);
      sectors.set(stock.sector, sectorStocks);
    });

    return Array.from(sectors.entries()).map(([sector, sectorStocks]) => ({
      sector,
      stocks: sectorStocks,
      totalInvestment: sectorStocks.reduce((sum, stock) => sum + stock.investment, 0),
      totalPresentValue: sectorStocks.reduce((sum, stock) => sum + stock.presentValue, 0),
      totalGainLoss: sectorStocks.reduce((sum, stock) => sum + stock.gainLoss, 0),
    }));
  }

  async fetchPortfolio(): Promise<Portfolio & { errors: string[] }> {
    const userStocks = this.getUserStocks();
    const errors: string[] = [];
    
    if (userStocks.length === 0) {
      throw new Error('No stocks in portfolio. Please add some stocks to get started.');
    }

    try {
      const stockPromises = userStocks.map(async (baseStock) => {
        const [yahooData, googleData] = await Promise.allSettled([
          this.fetchYahooFinanceData(baseStock.symbol, baseStock.exchange),
          this.fetchGoogleFinanceData(baseStock.symbol),
        ]);

        let cmp = baseStock.purchasePrice;
        if (yahooData.status === 'fulfilled') {
          if (yahooData.value.error) {
            errors.push(`${baseStock.symbol}: ${yahooData.value.error}`);
          }
          cmp = yahooData.value.price || baseStock.purchasePrice;
        } else {
          errors.push(`${baseStock.symbol}: Failed to fetch current price`);
        }

        let peRatio: number | null = null;
        let latestEarnings: string | null = null;
        
        if (googleData.status === 'fulfilled') {
          if (googleData.value.error) {
            errors.push(`${baseStock.symbol}: ${googleData.value.error}`);
          }
          peRatio = googleData.value.peRatio;
          latestEarnings = googleData.value.earnings;
        } else {
          errors.push(`${baseStock.symbol}: Failed to fetch P/E ratio and earnings`);
        }

        const presentValue = cmp * baseStock.quantity;
        const gainLoss = presentValue - baseStock.investment;

        return {
          ...baseStock,
          cmp,
          presentValue,
          gainLoss,
          peRatio,
          latestEarnings,
        } as Stock;
      });

      const stocks = await Promise.all(stockPromises);
      const stocksWithPercentages = this.calculatePortfolioPercentages(stocks);
      const sectors = this.groupBySector(stocksWithPercentages);

      const totalInvestment = stocksWithPercentages.reduce((sum, stock) => sum + stock.investment, 0);
      const totalPresentValue = stocksWithPercentages.reduce((sum, stock) => sum + stock.presentValue, 0);
      const totalGainLoss = totalPresentValue - totalInvestment;

      return {
        stocks: stocksWithPercentages,
        sectors,
        totalInvestment,
        totalPresentValue,
        totalGainLoss,
        lastUpdated: new Date(),
        errors: [...new Set(errors)],
      };

    } catch (error) {
      console.error('Error fetching portfolio data:', error);
      throw new Error('Failed to fetch portfolio data. Please check your internet connection and try again.');
    }
  }

  async refreshLiveData(currentStocks: Stock[]): Promise<{ stocks: Stock[]; errors: string[] }> {
    const errors: string[] = [];
    
    const refreshPromises = currentStocks.map(async (stock) => {
      try {
        const yahooData = await this.fetchYahooFinanceData(stock.symbol, stock.exchange);
        
        if (yahooData.error) {
          errors.push(`${stock.symbol}: ${yahooData.error}`);
        }
        
        const cmp = yahooData.price || stock.cmp;
        const presentValue = cmp * stock.quantity;
        const gainLoss = presentValue - stock.investment;

        return {
          ...stock,
          cmp,
          presentValue,
          gainLoss,
        };
      } catch {
        errors.push(`${stock.symbol}: Failed to refresh price data`);
        return stock; 
      }
    });

    const stocks = await Promise.all(refreshPromises);
    
    return {
      stocks,
      errors: [...new Set(errors)],
    };
  }

  clearPortfolio(): void {
    if (typeof window !== 'undefined') {
      localStorage.removeItem(this.STORAGE_KEY);
    }
    this.cache.clear();
  }

  getPortfolioStats(stocks: Stock[]) {
    const totalStocks = stocks.length;
    const totalInvestment = stocks.reduce((sum, stock) => sum + stock.investment, 0);
    const totalPresentValue = stocks.reduce((sum, stock) => sum + stock.presentValue, 0);
    const totalGainLoss = totalPresentValue - totalInvestment;
    const totalReturnPercent = totalInvestment > 0 ? (totalGainLoss / totalInvestment) * 100 : 0;
    
    const gainers = stocks.filter(s => s.gainLoss > 0).length;
    const losers = stocks.filter(s => s.gainLoss < 0).length;
    const unchanged = stocks.filter(s => s.gainLoss === 0).length;
    
    return {
      totalStocks,
      totalInvestment,
      totalPresentValue,
      totalGainLoss,
      totalReturnPercent,
      gainers,
      losers,
      unchanged,
    };
  }
}

export const portfolioService = new PortfolioService();