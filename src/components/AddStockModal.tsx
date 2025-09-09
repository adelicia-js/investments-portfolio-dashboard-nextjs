'use client';

import React, { useState } from 'react';
import { Stock } from '@/types/portfolio';

interface AddStockModalProps {
  isOpen: boolean;
  onClose: () => void;
  onAddStock: (stockData: Omit<Stock, 'id' | 'investment' | 'portfolioPercentage' | 'cmp' | 'presentValue' | 'gainLoss' | 'peRatio' | 'latestEarnings'>) => void;
}

const POPULAR_INDIAN_STOCKS = [
  { symbol: 'TCS', name: 'Tata Consultancy Services', sector: 'Technology' },
  { symbol: 'INFY', name: 'Infosys Limited', sector: 'Technology' },
  { symbol: 'HDFCBANK', name: 'HDFC Bank Limited', sector: 'Financials' },
  { symbol: 'ICICIBANK', name: 'ICICI Bank Limited', sector: 'Financials' },
  { symbol: 'RELIANCE', name: 'Reliance Industries', sector: 'Energy' },
  { symbol: 'WIPRO', name: 'Wipro Limited', sector: 'Technology' },
  { symbol: 'SBIN', name: 'State Bank of India', sector: 'Financials' },
  { symbol: 'BHARTIARTL', name: 'Bharti Airtel Limited', sector: 'Telecom' },
  { symbol: 'KOTAKBANK', name: 'Kotak Mahindra Bank', sector: 'Financials' },
  { symbol: 'LT', name: 'Larsen & Toubro', sector: 'Infrastructure' },
  { symbol: 'ADANIGREEN', name: 'Adani Green Energy', sector: 'Energy' },
  { symbol: 'TITAN', name: 'Titan Company Limited', sector: 'Consumer Goods' },
];

export default function AddStockModal({ isOpen, onClose, onAddStock }: AddStockModalProps) {
  const [selectedStock, setSelectedStock] = useState('');
  const [customStock, setCustomStock] = useState({ symbol: '', name: '', sector: '' });
  const [purchasePrice, setPurchasePrice] = useState('');
  const [quantity, setQuantity] = useState('');
  const [exchange, setExchange] = useState<'NSE' | 'BSE'>('NSE');
  const [isCustom, setIsCustom] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  const validateForm = () => {
    const newErrors: Record<string, string> = {};

    if (!isCustom && !selectedStock) {
      newErrors.selectedStock = 'Please select a stock';
    }

    if (isCustom) {
      if (!customStock.symbol.trim()) {
        newErrors.customSymbol = 'Stock symbol is required';
      }
      if (!customStock.name.trim()) {
        newErrors.customName = 'Company name is required';
      }
      if (!customStock.sector.trim()) {
        newErrors.customSector = 'Sector is required';
      }
    }

    const price = parseFloat(purchasePrice);
    if (!purchasePrice.trim()) {
      newErrors.purchasePrice = 'Purchase price is required';
    } else if (isNaN(price) || price <= 0) {
      newErrors.purchasePrice = 'Purchase price must be a positive number';
    }

    const qty = parseInt(quantity);
    if (!quantity.trim()) {
      newErrors.quantity = 'Quantity is required';
    } else if (isNaN(qty) || qty <= 0) {
      newErrors.quantity = 'Quantity must be a positive integer';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) return;

    setIsSubmitting(true);

    try {
      let stockInfo;
      
      if (isCustom) {
        stockInfo = {
          symbol: customStock.symbol.toUpperCase().trim(),
          particulars: customStock.name.trim(),
          sector: customStock.sector.trim(),
        };
      } else {
        const selected = POPULAR_INDIAN_STOCKS.find(s => s.symbol === selectedStock);
        stockInfo = {
          symbol: selected!.symbol,
          particulars: selected!.name,
          sector: selected!.sector,
        };
      }

      const newStock = {
        ...stockInfo,
        purchasePrice: parseFloat(purchasePrice),
        quantity: parseInt(quantity),
        exchange,
        investment: parseFloat(purchasePrice) * parseInt(quantity),
      };

      onAddStock(newStock);
      handleClose();
    } catch {
      setErrors({ submit: 'Failed to add stock. Please try again.' });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleClose = () => {
    setSelectedStock('');
    setCustomStock({ symbol: '', name: '', sector: '' });
    setPurchasePrice('');
    setQuantity('');
    setExchange('NSE');
    setIsCustom(false);
    setErrors({});
    setIsSubmitting(false);
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-2xl max-w-md w-full max-h-[90vh] overflow-y-auto">
        <div className="p-4 sm:p-6">
          <div className="flex justify-between items-center mb-4 sm:mb-6">
            <h2 className="text-xl font-semibold text-gray-900 dark:text-gray-100">
              Add Stock to Portfolio
            </h2>
            <button
              onClick={handleClose}
              className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>

          <form onSubmit={handleSubmit} className="space-y-3 sm:space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Stock Selection
              </label>
              <div className="flex gap-4">
                <label className="flex items-center">
                  <input
                    type="radio"
                    checked={!isCustom}
                    onChange={() => setIsCustom(false)}
                    className="mr-2"
                  />
                  Popular Stocks
                </label>
                <label className="flex items-center">
                  <input
                    type="radio"
                    checked={isCustom}
                    onChange={() => setIsCustom(true)}
                    className="mr-2"
                  />
                  Custom Stock
                </label>
              </div>
            </div>

            {!isCustom && (
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Select Stock
                </label>
                <select
                  value={selectedStock}
                  onChange={(e) => setSelectedStock(e.target.value)}
                  className={`w-full px-3 py-2.5 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:text-gray-100 transition-all duration-150 ${
                    errors.selectedStock ? 'border-red-500' : 'border-gray-300'
                  }`}
                >
                  <option value="">Choose a stock...</option>
                  {POPULAR_INDIAN_STOCKS.map((stock) => (
                    <option key={stock.symbol} value={stock.symbol}>
                      {stock.name} ({stock.symbol}) - {stock.sector}
                    </option>
                  ))}
                </select>
                {errors.selectedStock && (
                  <p className="text-red-500 text-sm mt-1">{errors.selectedStock}</p>
                )}
              </div>
            )}

            {isCustom && (
              <>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Stock Symbol
                  </label>
                  <input
                    type="text"
                    value={customStock.symbol}
                    onChange={(e) => setCustomStock({...customStock, symbol: e.target.value})}
                    placeholder="e.g., TATAMOTORS"
                    className={`w-full px-3 py-2.5 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:text-gray-100 transition-all duration-150 ${
                      errors.customSymbol ? 'border-red-500' : 'border-gray-300'
                    }`}
                  />
                  {errors.customSymbol && (
                    <p className="text-red-500 text-sm mt-1">{errors.customSymbol}</p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Company Name
                  </label>
                  <input
                    type="text"
                    value={customStock.name}
                    onChange={(e) => setCustomStock({...customStock, name: e.target.value})}
                    placeholder="e.g., Tata Motors Limited"
                    className={`w-full px-3 py-2.5 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:text-gray-100 transition-all duration-150 ${
                      errors.customName ? 'border-red-500' : 'border-gray-300'
                    }`}
                  />
                  {errors.customName && (
                    <p className="text-red-500 text-sm mt-1">{errors.customName}</p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Sector
                  </label>
                  <input
                    type="text"
                    value={customStock.sector}
                    onChange={(e) => setCustomStock({...customStock, sector: e.target.value})}
                    placeholder="e.g., Automotive"
                    className={`w-full px-3 py-2.5 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:text-gray-100 transition-all duration-150 ${
                      errors.customSector ? 'border-red-500' : 'border-gray-300'
                    }`}
                  />
                  {errors.customSector && (
                    <p className="text-red-500 text-sm mt-1">{errors.customSector}</p>
                  )}
                </div>
              </>
            )}

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Purchase Price (₹)
                </label>
                <input
                  type="number"
                  step="0.01"
                  min="0"
                  value={purchasePrice}
                  onChange={(e) => setPurchasePrice(e.target.value)}
                  placeholder="0.00"
                  className={`w-full px-3 py-2.5 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:text-gray-100 transition-all duration-150 ${
                    errors.purchasePrice ? 'border-red-500' : 'border-gray-300'
                  }`}
                />
                {errors.purchasePrice && (
                  <p className="text-red-500 text-sm mt-1">{errors.purchasePrice}</p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Quantity
                </label>
                <input
                  type="number"
                  min="1"
                  value={quantity}
                  onChange={(e) => setQuantity(e.target.value)}
                  placeholder="0"
                  className={`w-full px-3 py-2.5 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:text-gray-100 transition-all duration-150 ${
                    errors.quantity ? 'border-red-500' : 'border-gray-300'
                  }`}
                />
                {errors.quantity && (
                  <p className="text-red-500 text-sm mt-1">{errors.quantity}</p>
                )}
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Exchange
              </label>
              <select
                value={exchange}
                onChange={(e) => setExchange(e.target.value as 'NSE' | 'BSE')}
                className="w-full px-3 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:text-gray-100 transition-all duration-150"
              >
                <option value="NSE">NSE (National Stock Exchange)</option>
                <option value="BSE">BSE (Bombay Stock Exchange)</option>
              </select>
            </div>

            {purchasePrice && quantity && (
              <div className="bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-gray-700 dark:to-gray-750 p-3 rounded-lg border border-blue-200 dark:border-gray-600">
                <p className="text-sm text-gray-600 dark:text-gray-300">
                  Total Investment: <span className="font-semibold">₹{(parseFloat(purchasePrice || '0') * parseInt(quantity || '0')).toLocaleString()}</span>
                </p>
              </div>
            )}

            {errors.submit && (
              <div className="bg-red-50 border border-red-200 rounded-lg p-3">
                <p className="text-red-600 text-sm">{errors.submit}</p>
              </div>
            )}

            <div className="flex gap-3 pt-4">
              <button
                type="button"
                onClick={handleClose}
                className="flex-1 px-4 py-2.5 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 dark:border-gray-600 dark:text-gray-300 dark:hover:bg-gray-700 transition-all duration-150 hover:shadow-md"
                disabled={isSubmitting}
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={isSubmitting}
                className="flex-1 px-4 py-2.5 bg-gradient-to-r from-blue-600 to-blue-700 text-white rounded-lg hover:from-blue-700 hover:to-blue-800 disabled:from-gray-400 disabled:to-gray-400 flex items-center justify-center transition-all duration-150 hover:shadow-lg"
              >
                {isSubmitting ? (
                  <>
                    <div className="animate-spin w-4 h-4 border-2 border-white border-t-transparent rounded-full mr-2"></div>
                    Adding...
                  </>
                ) : (
                  'Add Stock'
                )}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}