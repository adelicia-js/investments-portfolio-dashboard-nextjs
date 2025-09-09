import { NextRequest, NextResponse } from 'next/server';
import yahooFinance from 'yahoo-finance2';

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const symbol = searchParams.get('symbol');
  const exchange = searchParams.get('exchange') || 'NS'; 

  if (!symbol) {
    return NextResponse.json(
      { error: 'Symbol parameter is required' },
      { status: 400 }
    );
  }

  try {
    const ticker = `${symbol}.${exchange}`;
    
    const quote = await yahooFinance.quote(ticker);
    
    if (!quote) {
      throw new Error(`No data found for symbol: ${ticker}`);
    }

    const currentPrice = quote.regularMarketPrice || 0;
    const previousClose = quote.regularMarketPreviousClose || currentPrice;
    const change = quote.regularMarketChange || 0;
    const changePercent = quote.regularMarketChangePercent || 0;
    
    const peRatio = quote.trailingPE || quote.forwardPE || null;
    const marketCap = quote.marketCap || null;
    const dayRange = quote.regularMarketDayRange || null;
    
    return NextResponse.json({
      symbol: symbol,
      ticker: ticker,
      price: currentPrice,
      previousClose: previousClose,
      change: change,
      changePercent: changePercent,
      peRatio: peRatio,
      marketCap: marketCap,
      dayRange: dayRange,
      volume: quote.regularMarketVolume || 0,
      timestamp: Date.now(),
      isMockData: false, // Real data
      source: 'Yahoo Finance'
    });

  } catch (error) {
    console.error('Yahoo Finance API error:', error);
    
    const mockPrice = Math.random() * 1000 + 100;
    return NextResponse.json({
      symbol: symbol,
      price: mockPrice,
      change: (Math.random() - 0.5) * 20,
      changePercent: (Math.random() - 0.5) * 5,
      peRatio: Math.random() * 30 + 10,
      timestamp: Date.now(),
      isMockData: true, // Mock data
      error: 'Failed to fetch real data, using mock data',
      errorDetails: error instanceof Error ? error.message : 'Unknown error'
    });
  }
}