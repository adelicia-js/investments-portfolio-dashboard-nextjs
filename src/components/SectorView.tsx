'use client';

import React, { useState } from 'react';
import { SectorSummary } from '@/types/portfolio';

interface SectorViewProps {
  sectors: SectorSummary[];
}

interface SectorCardProps {
  sector: SectorSummary;
  isExpanded: boolean;
  onToggle: () => void;
}

const SectorCard = React.memo(function SectorCard({ sector, isExpanded, onToggle }: SectorCardProps) {
  const gainLossPercentage = ((sector.totalGainLoss / sector.totalInvestment) * 100);
  const isGain = sector.totalGainLoss >= 0;

  return (
    <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-600 rounded-lg shadow-sm">
      <button
        onClick={onToggle}
        className="w-full px-6 py-4 text-left hover:bg-gray-50 dark:hover:bg-gray-700 focus:outline-none focus:bg-gray-50 dark:focus:bg-gray-700 transition-colors"
      >
        <div className="flex justify-between items-center">
          <div className="flex items-center gap-3">
            <div className={`w-3 h-3 rounded-full ${
              sector.sector === 'Technology' ? 'bg-blue-500' :
              sector.sector === 'Financials' ? 'bg-green-500' :
              sector.sector === 'Energy' ? 'bg-orange-500' :
              'bg-purple-500'
            }`}></div>
            <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100">
              {sector.sector}
            </h3>
            <span className="text-sm text-gray-500 dark:text-gray-400">
              ({sector.stocks.length} stocks)
            </span>
          </div>
          <div className="flex items-center gap-4">
            <div className="text-right">
              <div className={`text-lg font-semibold ${
                isGain 
                  ? 'text-green-600 dark:text-green-400' 
                  : 'text-red-600 dark:text-red-400'
              }`}>
                {isGain ? '+' : ''}₹{sector.totalGainLoss.toLocaleString()}
              </div>
              <div className={`text-sm ${
                isGain 
                  ? 'text-green-600 dark:text-green-400' 
                  : 'text-red-600 dark:text-red-400'
              }`}>
                ({isGain ? '+' : ''}{gainLossPercentage.toFixed(2)}%)
              </div>
            </div>
            <svg
              className={`w-5 h-5 text-gray-400 transition-transform ${
                isExpanded ? 'rotate-180' : ''
              }`}
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
            </svg>
          </div>
        </div>
      </button>

      <div className="px-6 pb-4 grid grid-cols-3 gap-4">
        <div className="text-center">
          <div className="text-sm text-gray-500 dark:text-gray-400">Investment</div>
          <div className="text-base font-medium text-gray-900 dark:text-gray-100">
            ₹{sector.totalInvestment.toLocaleString()}
          </div>
        </div>
        <div className="text-center">
          <div className="text-sm text-gray-500 dark:text-gray-400">Present Value</div>
          <div className="text-base font-medium text-gray-900 dark:text-gray-100">
            ₹{sector.totalPresentValue.toLocaleString()}
          </div>
        </div>
        <div className="text-center">
          <div className="text-sm text-gray-500 dark:text-gray-400">Return</div>
          <div className={`text-base font-medium ${
            isGain 
              ? 'text-green-600 dark:text-green-400' 
              : 'text-red-600 dark:text-red-400'
          }`}>
            {gainLossPercentage.toFixed(2)}%
          </div>
        </div>
      </div>

      {isExpanded && (
        <div className="border-t border-gray-200 dark:border-gray-600">
          <div className="overflow-x-auto">
            <table className="min-w-full">
              <thead className="bg-gray-50 dark:bg-gray-700">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                    Stock
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                    Qty
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                    CMP
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                    Investment
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                    Present Value
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                    Gain/Loss
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-600">
                {sector.stocks.map((stock) => (
                  <tr key={stock.id} className="hover:bg-gray-50 dark:hover:bg-gray-700">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="font-medium text-gray-900 dark:text-gray-100">
                        {stock.particulars}
                      </div>
                      <div className="text-sm text-gray-500 dark:text-gray-400">
                        {stock.symbol} • {stock.exchange}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-gray-100">
                      {stock.quantity.toLocaleString()}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-medium text-blue-600 dark:text-blue-400">
                        ₹{stock.cmp.toFixed(2)}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-gray-100">
                      ₹{stock.investment.toLocaleString()}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-gray-100">
                      ₹{stock.presentValue.toLocaleString()}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className={`text-sm font-medium ${
                        stock.gainLoss >= 0 
                          ? 'text-green-600 dark:text-green-400' 
                          : 'text-red-600 dark:text-red-400'
                      }`}>
                        {stock.gainLoss >= 0 ? '+' : ''}₹{stock.gainLoss.toLocaleString()}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
});

const SectorView = React.memo(function SectorView({ sectors }: SectorViewProps) {
  const [expandedSectors, setExpandedSectors] = useState<Set<string>>(new Set());

  const toggleSector = (sectorName: string) => {
    const newExpanded = new Set(expandedSectors);
    if (newExpanded.has(sectorName)) {
      newExpanded.delete(sectorName);
    } else {
      newExpanded.add(sectorName);
    }
    setExpandedSectors(newExpanded);
  };

  const sortedSectors = [...sectors].sort((a, b) => b.totalPresentValue - a.totalPresentValue);

  return (
    <div className="space-y-4">
      <h2 className="text-2xl font-bold text-gray-900 dark:text-gray-100 mb-6">
        Sector Breakdown
      </h2>
      
      {sortedSectors.map((sector) => (
        <SectorCard
          key={sector.sector}
          sector={sector}
          isExpanded={expandedSectors.has(sector.sector)}
          onToggle={() => toggleSector(sector.sector)}
        />
      ))}
    </div>
  );
});

export default SectorView;