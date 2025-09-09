import { NextRequest, NextResponse } from 'next/server';
import * as cheerio from 'cheerio';

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const symbol = searchParams.get('symbol');

  if (!symbol) {
    return NextResponse.json(
      { error: 'Symbol parameter is required' },
      { status: 400 }
    );
  }

  try {
    const googleUrl = `https://www.google.com/finance/quote/${symbol}:NSE`;
    
    const response = await fetch(googleUrl, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
        'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8',
        'Accept-Language': 'en-US,en;q=0.5',
        'Accept-Encoding': 'gzip, deflate, br',
        'DNT': '1',
        'Connection': 'keep-alive',
        'Upgrade-Insecure-Requests': '1',
      },
      redirect: 'follow',
    });

    if (!response.ok) {
      throw new Error(`Google Finance HTTP ${response.status}: ${response.statusText}`);
    }

    const html = await response.text();
    const $ = cheerio.load(html);

    let peRatio: number | null = null;
    
    const peSelectors = [
      '[data-test-id="PE ratio"]',
      '[aria-label*="PE ratio"]',
      'div:contains("PE ratio") + div',
      'div:contains("P/E ratio") + div',
      '.gyFHrc:contains("PE ratio") ~ .P6K39c',
      '.gyFHrc:contains("P/E ratio") ~ .P6K39c'
    ];

    for (const selector of peSelectors) {
      const peText = $(selector).first().text().trim();
      if (peText && peText !== '-' && peText !== 'N/A') {
        const peValue = parseFloat(peText.replace(/[^0-9.-]/g, ''));
        if (!isNaN(peValue) && peValue > 0) {
          peRatio = peValue;
          break;
        }
      }
    }

    let earnings: string | null = null;
    
    const earningsSelectors = [
      '[data-test-id="EPS (TTM)"]',
      '[aria-label*="EPS"]',
      'div:contains("EPS") + div',
      'div:contains("Earnings per share") + div',
      '.gyFHrc:contains("EPS") ~ .P6K39c'
    ];

    for (const selector of earningsSelectors) {
      const epsText = $(selector).first().text().trim();
      if (epsText && epsText !== '-' && epsText !== 'N/A') {
        const epsValue = parseFloat(epsText.replace(/[^0-9.-]/g, ''));
        if (!isNaN(epsValue)) {
          earnings = `₹${epsValue.toFixed(2)} (TTM)`;
          break;
        }
      }
    }

    if (!peRatio || !earnings) {
      $('div').each((_, element) => {
        const text = $(element).text().trim();
        
        // Look for P/E ratio patterns
        if (!peRatio && /P\/E|PE.*ratio/i.test(text)) {
          const match = text.match(/(\d+\.?\d*)/);
          if (match) {
            const value = parseFloat(match[1]);
            if (!isNaN(value) && value > 0 && value < 100) { // Reasonable P/E range
              peRatio = value;
            }
          }
        }
        
        if (!earnings && /EPS|earnings.*share/i.test(text)) {
          const match = text.match(/(\d+\.?\d*)/);
          if (match) {
            const value = parseFloat(match[1]);
            if (!isNaN(value)) {
              earnings = `₹${value.toFixed(2)} (TTM)`;
            }
          }
        }
      });
    }

    console.log(`Google Finance scraping for ${symbol}:`, {
      peRatio,
      earnings,
      hasData: !!peRatio || !!earnings
    });

    return NextResponse.json({
      symbol: symbol,
      peRatio: peRatio,
      earnings: earnings || 'N/A',
      timestamp: Date.now(),
      isMockData: false, // Real scraped data
      source: 'Google Finance (Scraped)',
      scrapingStatus: 'success'
    });

  } catch (error) {
    console.error('Google Finance scraping error:', error);
    
    const mockPERatio = Math.random() * 30 + 10;
    const mockEarnings = `₹${(Math.random() * 100 + 10).toFixed(2)} (TTM)`;
    
    return NextResponse.json({
      symbol: symbol,
      peRatio: parseFloat(mockPERatio.toFixed(2)),
      earnings: mockEarnings,
      timestamp: Date.now(),
      isMockData: true, // Mock data
      source: 'Mock Data (Scraping Failed)',
      error: 'Google Finance scraping failed',
      errorDetails: error instanceof Error ? error.message : 'Unknown error'
    });
  }
}