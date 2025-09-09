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
          <div className="font-medium text-gray-900 dark:text-gray-100">
            {info.getValue()}
            <div className="text-sm text-gray-500 dark:text-gray-400">
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
          <span className="px-2 py-1 text-xs font-semibold bg-blue-100 text-blue-800 rounded-full">
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
    <div className="bg-white dark:bg-gray-800 shadow-lg rounded-lg overflow-hidden">
      <div className="px-6 py-4 border-b border-gray-200 dark:border-gray-700 flex justify-between items-center">
        <h2 className="text-xl font-semibold text-gray-900 dark:text-gray-100">
          Portfolio Dashboard
        </h2>
        <div className="flex items-center gap-4">
          <div className="text-sm text-gray-500 dark:text-gray-400">
            Last updated: {portfolio.lastUpdated.toLocaleTimeString()}
          </div>
          <button
            onClick={onRefresh}
            disabled={loading}
            className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:bg-gray-400 transition-colors flex items-center gap-2"
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

      <div className="px-6 py-4 bg-gray-50 dark:bg-gray-700 grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="text-center">
          <div className="text-sm text-gray-500 dark:text-gray-400">Total Investment</div>
          <div className="text-lg font-semibold text-gray-900 dark:text-gray-100">
            ₹{portfolio.totalInvestment.toLocaleString()}
          </div>
        </div>
        <div className="text-center">
          <div className="text-sm text-gray-500 dark:text-gray-400">Present Value</div>
          <div className="text-lg font-semibold text-gray-900 dark:text-gray-100">
            ₹{portfolio.totalPresentValue.toLocaleString()}
          </div>
        </div>
        <div className="text-center">
          <div className="text-sm text-gray-500 dark:text-gray-400">Total Gain/Loss</div>
          <div className={`text-lg font-semibold ${
            portfolio.totalGainLoss >= 0 
              ? 'text-green-600 dark:text-green-400' 
              : 'text-red-600 dark:text-red-400'
          }`}>
            {portfolio.totalGainLoss >= 0 ? '+' : ''}₹{portfolio.totalGainLoss.toLocaleString()}
          </div>
        </div>
      </div>
      {/* Table */}
      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-600">
          <thead className="bg-gray-50 dark:bg-gray-700">
            {table.getHeaderGroups().map((headerGroup) => (
              <tr key={headerGroup.id}>
                {headerGroup.headers.map((header) => (
                  <th
                    key={header.id}
                    className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-600"
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
                <tr key={row.id} className="hover:bg-gray-50 dark:hover:bg-gray-700">
                  {row.getVisibleCells().map((cell) => (
                    <td key={cell.id} className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-gray-100">
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