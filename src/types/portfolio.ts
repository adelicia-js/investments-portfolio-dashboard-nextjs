export interface Stock {
  id: string;
  particulars: string; 
  sector: string;
  purchasePrice: number;
  quantity: number;
  exchange: 'NSE' | 'BSE';
  symbol: string; 
  
  investment: number;
  portfolioPercentage: number;
  
  cmp: number;
  presentValue: number; 
  gainLoss: number; 
  peRatio: number | null; 
  latestEarnings: string | null; 
}

export interface SectorSummary {
  sector: string;
  totalInvestment: number;
  totalPresentValue: number;
  totalGainLoss: number;
  stocks: Stock[];
}

export interface Portfolio {
  stocks: Stock[];
  sectors: SectorSummary[];
  totalInvestment: number;
  totalPresentValue: number;
  totalGainLoss: number;
  lastUpdated: Date;
}

export interface YahooFinanceResponse {
  symbol: string;
  price: number;
  change: number;
  changePercent: number;
  timestamp: number;
  isMockData?: boolean;
  error?: string;
}

export interface GoogleFinanceResponse {
  symbol: string;
  peRatio: number | null;
  earnings: string | null;
  timestamp: number;
  isMockData?: boolean;
  error?: string;
}

export interface PortfolioTableProps {
  portfolio: Portfolio;
  loading: boolean;
  error: string | null;
  onRefresh: () => void;
}

export interface SectorGroupProps {
  sector: SectorSummary;
  expanded: boolean;
  onToggle: () => void;
}

export interface APIError {
  message: string;
  code: string;
  timestamp: Date;
}