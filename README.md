# Dynamic Portfolio Dashboard

A real-time portfolio tracking application built with Next.js, TypeScript, and Tailwind CSS that provides live market data updates and comprehensive portfolio analytics.

## 🚀 Features

### Core Functionality
- **Real-time Market Data**: Fetches live CMP (Current Market Price) from Yahoo Finance every 15 seconds
- **Financial Metrics**: P/E ratios and latest earnings data from Google Finance
- **Comprehensive Portfolio View**: Displays 11 key metrics combining data from both sources
- **Automatic Updates**: No page refresh required - data updates seamlessly in the background
- **Visual Indicators**: Green for gains, red for losses across all metrics
- **Sector Analysis**: Groups stocks by sector with aggregated summaries
- **Portfolio Management**: Add/remove stocks dynamically to your portfolio

### User Interface
- **Responsive Design**: Fully optimized for desktop, tablet, and mobile devices
- **Dark Mode Support**: Built-in dark theme for comfortable viewing
- **Multiple Views**: Toggle between detailed table view and sector-grouped view
- **Mobile-First Cards**: Stocks displayed as cards on mobile for better readability
- **Loading States**: Skeleton loaders and spinners for smooth user experience
- **Error Handling**: Graceful error messages with retry options

## 📊 Portfolio Metrics

The dashboard displays the following information for each stock:

1. **Particulars** - Stock name and company details
2. **Purchase Price** - Original buy price
3. **Quantity** - Number of shares owned
4. **Investment** - Total amount invested (Purchase Price × Quantity)
5. **Portfolio %** - Weight of stock in total portfolio
6. **NSE/BSE** - Stock exchange identifier
7. **CMP** - Current Market Price (live from Yahoo Finance)
8. **Present Value** - Current worth (CMP × Quantity)
9. **Gain/Loss** - Profit/Loss amount and percentage
10. **P/E Ratio** - Price-to-Earnings ratio (from Google Finance)
11. **Latest Earnings** - Most recent earnings report date (from Google Finance)

## 🛠️ Technology Stack

- **Frontend Framework**: Next.js 15.0 (App Router)
- **Language**: TypeScript 5
- **Styling**: Tailwind CSS 3.4
- **Data Tables**: TanStack Table v8 (successor to React Table)
- **HTTP Client**: Native Fetch API
- **State Management**: React Hooks
- **Build Tool**: Turbopack
- **Package Manager**: npm

## 📦 Installation

### Prerequisites
- Node.js 18.0 or higher
- npm 9.0 or higher

### Setup Instructions

1. **Clone the repository**
```bash
git clone https://github.com/adelicia-js/investments-portfolio-dashboard-nextjs.git portfolio-dashboard
cd portfolio-dashboard
```

2. **Install dependencies**
```bash
npm install
```

3. **Set up environment variables**
Create a `.env.local` file in the root directory:
```env
# No external API keys required - uses public endpoints
NEXT_PUBLIC_API_URL=http://localhost:3000
```

4. **Run the development server**
```bash
npm run dev
```

5. **Open the application**
Navigate to [http://localhost:3000](http://localhost:3000)

## 🚀 Available Scripts

```bash
# Development
npm run dev          # Start development server with hot reload

# Production
npm run build        # Create optimized production build
npm run start        # Start production server

# Code Quality
npm run lint         # Run ESLint for code quality checks
npm run type-check   # Run TypeScript compiler for type checking
```

## 📱 Usage

### Adding Stocks to Portfolio

1. Click the **"Add Stock"** button in the header
2. Choose from popular Indian stocks or enter custom stock details
3. Enter purchase price and quantity
4. Select the exchange (NSE/BSE)
5. Click "Add Stock" to add to your portfolio

### Viewing Portfolio Data

- **Table View**: Detailed view with all metrics in a sortable table
- **Sector View**: Stocks grouped by sector with expandable details
- **Mobile View**: Swipe-friendly card layout on small screens

### Real-time Updates

- Data automatically refreshes every 15 seconds
- Visual indicator shows when data is updating
- Manual refresh available via the refresh button

## 🏗️ Project Structure

```
portfolio-dashboard/
├── src/
│   ├── app/                 # Next.js app router pages
│   │   ├── api/             # API routes for data fetching
│   │   ├── layout.tsx       # Root layout component
│   │   └── page.tsx         # Main dashboard page
│   ├── components/          # React components
│   │   ├── PortfolioTable.tsx
│   │   ├── SectorView.tsx
│   │   ├── AddStockModal.tsx
│   │   ├── LoadingSpinner.tsx
│   │   └── ErrorAlert.tsx
│   ├── hooks/              # Custom React hooks
│   │   └── usePortfolio.ts
│   ├── services/           # API service layer
│   │   └── stockService.ts
│   └── types/              # TypeScript type definitions
│       └── portfolio.ts
├── public/                 # Static assets
├── .env.local             # Environment variables
├── package.json           # Dependencies and scripts
├── tsconfig.json          # TypeScript configuration
├── tailwind.config.ts     # Tailwind CSS configuration
└── README.md              # This file
```

## 🔧 API Integration

### Data Sources

1. **Yahoo Finance** (via query1.finance.yahoo.com)
   - **Method**: JSON API endpoints for stock quotes
   - **Data Format**: Structured JSON responses
   - Fetches real-time stock prices (CMP)
   - Handles NSE/BSE stock symbols (.NS/.BO suffixes)
   - Implements retry logic for reliability

2. **Google Finance** (via google.com/finance)
   - **Method**: HTML scraping with Cheerio-like parsing
   - **Data Extraction**: CSS selectors for P/E ratios and earnings
   - Retrieves P/E ratios for fundamental analysis
   - Fetches latest earnings report dates
   - Provides financial metrics for stock evaluation
   - Falls back gracefully when data unavailable or structure changes

### Rate Limiting & Caching

- **Client-side caching**: 15-second cache for API responses
- **Request batching**: Groups multiple stock requests
- **Error recovery**: Automatic retry with exponential backoff
- **Fallback data**: Shows last known values during API failures

## 🎨 UI Features

### Responsive Breakpoints
- **Mobile**: < 640px
- **Tablet**: 640px - 1024px
- **Desktop**: > 1024px

### Color Scheme
- **Gains**: Green (#10b981)
- **Losses**: Red (#ef4444)
- **Primary**: Blue (#3b82f6)
- **Background**: Gray scale with dark mode support

## ⚡ Performance Optimizations

- **React.memo**: Prevents unnecessary re-renders
- **Virtual scrolling**: Efficient rendering of large portfolios
- **Code splitting**: Lazy loading of modal components
- **Image optimization**: Next.js Image component for logos
- **Debounced updates**: Prevents excessive API calls

## 🔒 Security Considerations

- No API keys exposed in client-side code
- Input validation on all user entries
- XSS protection through React's default escaping
- CORS headers properly configured
- Rate limiting on API endpoints

## 🧪 Testing

```bash
# Run all tests
npm test

# Run with coverage
npm run test:coverage

# Run in watch mode
npm run test:watch
```

## 🤝 Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

## 📝 License

This project is created as part of a technical assessment for Octa Byte AI Pvt Ltd.

---

**Note**: This application uses unofficial APIs for educational purposes. For production use, consider integrating with official financial data providers.