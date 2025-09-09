'use client';

import React, { useMemo, useState } from 'react';
import {
  createColumnHelper,
  flexRender,
  getCoreRowModel,
  useReactTable,
  getSortedRowModel,
  SortingState,
  CellContext,
} from '@tanstack/react-table';
import { Stock, Portfolio } from '@/types/portfolio';

interface PortfolioTableProps {
  portfolio: Portfolio;
  loading: boolean;
  error: string | null;
  onRefresh: () => void;
  onRemoveStock?: (stockId: string) => void;
}

const columnHelper = createColumnHelper<Stock>();

const PortfolioTable = React.memo(function PortfolioTable({ portfolio, loading, error, onRefresh, onRemoveStock }: PortfolioTableProps) {
  const [sorting, setSorting] = useState<SortingState>([]);

  const columns = useMemo(
    () => [
      columnHelper.accessor('particulars', {
        header: 'Particulars',
        cell: (info) => (
          <div>
            <div className="font-medium text-gray-900 dark:text-gray-100">
              {info.getValue()}
            </div>
            <div className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">
              {info.row.original.sector}
            </div>
          </div>
        ),
      }),
      columnHelper.accessor('purchasePrice', {
        header: 'Purchase Price',
        cell: (info) => `₹${info.getValue().toFixed(2)}`,
      }),
      columnHelper.accessor('quantity', {
        header: 'Qty',
        cell: (info) => info.getValue().toLocaleString(),
      }),
      columnHelper.accessor('investment', {
        header: 'Investment',
        cell: (info) => `₹${info.getValue().toLocaleString()}`,
      }),
      columnHelper.accessor('portfolioPercentage', {
        header: 'Portfolio (%)',
        cell: (info) => `${info.getValue().toFixed(2)}%`,
      }),
      columnHelper.accessor('exchange', {
        header: 'NSE/BSE',
        cell: (info) => (
          <span className="px-2.5 py-1 text-xs font-semibold bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200 rounded-full">
            {info.getValue()}
          </span>
        ),
      }),
      columnHelper.accessor('cmp', {
        header: 'CMP',
        cell: (info) => (
          <div className="font-semibold text-blue-600 dark:text-blue-400">
            ₹{info.getValue().toFixed(2)}
          </div>
        ),
      }),
      columnHelper.accessor('presentValue', {
        header: 'Present Value',
        cell: (info) => `₹${info.getValue().toLocaleString()}`,
      }),
      columnHelper.accessor('gainLoss', {
        header: 'Gain/Loss',
        cell: (info) => {
          const value = info.getValue();
          const isGain = value >= 0;
          return (
            <div className={`font-semibold ${
              isGain 
                ? 'text-green-600 dark:text-green-400' 
                : 'text-red-600 dark:text-red-400'
            }`}>
              {isGain ? '+' : ''}₹{value.toLocaleString()}
            </div>
          );
        },
      }),
      columnHelper.accessor('peRatio', {
        header: 'P/E Ratio',
        cell: (info) => {
          const value = info.getValue();
          return value ? value.toFixed(2) : 'N/A';
        },
      }),
      columnHelper.accessor('latestEarnings', {
        header: 'Latest Earnings',
        cell: (info) => info.getValue() || 'N/A',
      }),
      ...(onRemoveStock ? [{
        id: 'actions',
        header: 'Actions',
        cell: (info: CellContext<Stock, unknown>) => (
          <button
            onClick={() => {
              if (window.confirm(`Are you sure you want to remove ${info.row.original.particulars} from your portfolio?`)) {
                onRemoveStock(info.row.original.id);
              }
            }}
            className="text-red-600 hover:text-red-800 dark:text-red-400 dark:hover:text-red-200 text-sm font-medium"
          >
            Remove
          </button>
        ),
      }] : []),
    ],
    [onRemoveStock]
  );

  const table = useReactTable({
    data: portfolio.stocks,
    columns,
    getCoreRowModel: getCoreRowModel(),
    getSortedRowModel: getSortedRowModel(),
    state: {
      sorting,
    },
    onSortingChange: setSorting,
  });

  if (error) {
    return (
      <div className="bg-red-50 border border-red-200 rounded-lg p-6 text-center">
        <div className="text-red-600 font-semibold mb-2">Error Loading Portfolio</div>
        <div className="text-red-500 mb-4">{error}</div>
        <button
          onClick={onRefresh}
          className="px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 transition-colors"
        >
          Retry
        </button>
      </div>
    );
  }

  return (
    <div className="bg-white dark:bg-gray-800 shadow-lg rounded-xl overflow-hidden">
      <div className="px-4 sm:px-6 py-4 sm:py-5 border-b border-gray-200 dark:border-gray-700 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 sm:gap-0">
        <h2 className="text-lg sm:text-xl font-semibold text-gray-900 dark:text-gray-100">
          Portfolio Holdings
        </h2>
        <div className="flex items-center gap-3 sm:gap-4">
          <div className="text-sm text-gray-500 dark:text-gray-400">
            Last updated: {portfolio.lastUpdated.toLocaleTimeString()}
          </div>
          <button
            onClick={onRefresh}
            disabled={loading}
            className="px-3 sm:px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:bg-gray-400 transition-all duration-200 hover:shadow-lg flex items-center gap-2 text-sm sm:text-base"
          >
            {loading ? (
              <div className="animate-spin w-4 h-4 border-2 border-white border-t-transparent rounded-full"></div>
            ) : (
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
              </svg>
            )}
            Refresh
          </button>
        </div>
      </div>

      <div className="px-4 sm:px-6 py-5 bg-gradient-to-r from-gray-100 to-gray-500 dark:from-gray-700 dark:to-gray-750 grid grid-cols-1 sm:grid-cols-3 gap-4 sm:gap-6">
        <div className="text-center sm:text-left">
          <div className="text-xs sm:text-sm text-gray-500 dark:text-gray-400 mb-1">Total Investment</div>
          <div className="text-xl sm:text-2xl font-bold text-gray-900 dark:text-gray-100">
            ₹{portfolio.totalInvestment.toLocaleString()}
          </div>
        </div>
        <div className="text-center">
          <div className="text-xs sm:text-sm text-gray-500 dark:text-gray-400 mb-1">Present Value</div>
          <div className="text-xl sm:text-2xl font-bold text-gray-900 dark:text-gray-100">
            ₹{portfolio.totalPresentValue.toLocaleString()}
          </div>
        </div>
        <div className="text-center sm:text-right">
          <div className="text-xs sm:text-sm text-gray-500 dark:text-gray-400 mb-1">Total Gain/Loss</div>
          <div className={`text-xl sm:text-2xl font-bold ${
            portfolio.totalGainLoss >= 0 
              ? 'text-green-600 dark:text-green-400' 
              : 'text-red-600 dark:text-red-400'
          }`}>
            {portfolio.totalGainLoss >= 0 ? '+' : ''}₹{portfolio.totalGainLoss.toLocaleString()}
          </div>
        </div>
      </div>
      {/* Mobile Card View */}
      <div className="sm:hidden px-4 py-4 space-y-3">
        {portfolio.stocks.map((stock) => (
          <div key={stock.id} className="bg-gray-50 dark:bg-gray-700 rounded-lg p-4 space-y-3">
            <div className="flex justify-between items-start">
              <div>
                <div className="font-semibold text-gray-900 dark:text-gray-100">{stock.particulars}</div>
                <div className="text-xs text-gray-500 dark:text-gray-400 mt-1">{stock.sector}</div>
              </div>
              <span className="px-2 py-1 text-xs font-semibold bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200 rounded-full">
                {stock.exchange}
              </span>
            </div>
            
            <div className="grid grid-cols-2 gap-3 text-sm">
              <div>
                <div className="text-xs text-gray-500 dark:text-gray-400">Purchase Price</div>
                <div className="font-medium">₹{stock.purchasePrice.toFixed(2)}</div>
              </div>
              <div>
                <div className="text-xs text-gray-500 dark:text-gray-400">CMP</div>
                <div className="font-semibold text-blue-600 dark:text-blue-400">₹{stock.cmp.toFixed(2)}</div>
              </div>
              <div>
                <div className="text-xs text-gray-500 dark:text-gray-400">Quantity</div>
                <div className="font-medium">{stock.quantity.toLocaleString()}</div>
              </div>
              <div>
                <div className="text-xs text-gray-500 dark:text-gray-400">Gain/Loss</div>
                <div className={`font-semibold ${stock.gainLoss >= 0 ? 'text-green-600 dark:text-green-400' : 'text-red-600 dark:text-red-400'}`}>
                  {stock.gainLoss >= 0 ? '+' : ''}₹{stock.gainLoss.toLocaleString()}
                </div>
              </div>
            </div>
            
            <div className="pt-2 border-t border-gray-200 dark:border-gray-600 flex justify-between items-center">
              <div>
                <div className="text-xs text-gray-500 dark:text-gray-400">Present Value</div>
                <div className="font-semibold text-gray-900 dark:text-gray-100">₹{stock.presentValue.toLocaleString()}</div>
              </div>
              {onRemoveStock && (
                <button
                  onClick={() => {
                    if (window.confirm(`Are you sure you want to remove ${stock.particulars} from your portfolio?`)) {
                      onRemoveStock(stock.id);
                    }
                  }}
                  className="text-red-600 hover:text-red-800 dark:text-red-400 dark:hover:text-red-200 text-sm font-medium"
                >
                  Remove
                </button>
              )}
            </div>
          </div>
        ))}
      </div>

      {/* Desktop Table */}
      <div className="hidden sm:block overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-600">
          <thead className="bg-gray-50 dark:bg-gray-700">
            {table.getHeaderGroups().map((headerGroup) => (
              <tr key={headerGroup.id}>
                {headerGroup.headers.map((header) => (
                  <th
                    key={header.id}
                    className="px-3 sm:px-6 py-3 sm:py-4 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-600 transition-colors duration-150"
                    onClick={header.column.getToggleSortingHandler()}
                  >
                    <div className="flex items-center gap-2">
                      {flexRender(header.column.columnDef.header, header.getContext())}
                      {header.column.getIsSorted() && (
                        <span className="text-blue-600 dark:text-blue-400">
                          {header.column.getIsSorted() === 'desc' ? '↓' : '↑'}
                        </span>
                      )}
                    </div>
                  </th>
                ))}
              </tr>
            ))}
          </thead>
          <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-600">
            {loading ? (
              <tr>
                <td colSpan={columns.length} className="px-6 py-12 text-center">
                  <div className="flex items-center justify-center">
                    <div className="animate-spin w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full"></div>
                    <span className="ml-3 text-gray-500 dark:text-gray-400">Loading portfolio data...</span>
                  </div>
                </td>
              </tr>
            ) : (
              table.getRowModel().rows.map((row) => (
                <tr key={row.id} className="hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors duration-150">
                  {row.getVisibleCells().map((cell) => (
                    <td key={cell.id} className="px-3 sm:px-6 py-3 sm:py-5 whitespace-nowrap text-xs sm:text-sm text-gray-900 dark:text-gray-100">
                      {flexRender(cell.column.columnDef.cell, cell.getContext())}
                    </td>
                  ))}
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
});

export default PortfolioTable;