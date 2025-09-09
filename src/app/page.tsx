'use client';

import React, { useState } from 'react';
import PortfolioTable from '@/components/PortfolioTable';
import SectorView from '@/components/SectorView';
import AddStockModal from '@/components/AddStockModal';
import LoadingSpinner, { SectorCardSkeleton } from '@/components/LoadingSpinner';
import ErrorAlert, { ErrorsList, EmptyPortfolio, NetworkError } from '@/components/ErrorAlert';
import { usePortfolio } from '@/hooks/usePortfolio';

export default function Home() {
  const { 
    portfolio, 
    loading, 
    error, 
    errors, 
    isRefreshing,
    addStock, 
    removeStock, 
    refreshPortfolio, 
    dismissError, 
    dismissErrors 
  } = usePortfolio();
  
  const [activeView, setActiveView] = useState<'table' | 'sectors'>('table');
  const [showAddModal, setShowAddModal] = useState(false);

  if (!portfolio && loading) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center">
        <LoadingSpinner size="xl" text="Loading your portfolio..." />
      </div>
    );
  }

  if (error && !portfolio) {
    const isNetworkError = error.includes('internet') || error.includes('connection') || error.includes('network');
    
    if (isNetworkError) {
      return (
        <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center">
          <NetworkError onRetry={refreshPortfolio} />
        </div>
      );
    }

    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center">
        <div className="text-center max-w-md mx-4">
          <ErrorAlert 
            error={error}
            onDismiss={dismissError}
            className="mb-6"
          />
          <button
            onClick={refreshPortfolio}
            disabled={loading}
            className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:bg-gray-400 transition-colors flex items-center justify-center mx-auto"
          >
            {loading ? <LoadingSpinner size="sm" className="mr-2" /> : null}
            Try Again
          </button>
        </div>
      </div>
    );
  }

  if (!loading && (!portfolio || portfolio.stocks.length === 0)) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
        <header className="bg-white dark:bg-gray-800 shadow-sm border-b border-gray-200 dark:border-gray-700">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex justify-between items-center h-16">
              <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100">
                Portfolio Dashboard
              </h1>
              <button
                onClick={() => setShowAddModal(true)}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors flex items-center"
              >
                <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                </svg>
                Add Stock
              </button>
            </div>
          </div>
        </header>

        <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <EmptyPortfolio onAddStock={() => setShowAddModal(true)} />
        </main>

        <AddStockModal
          isOpen={showAddModal}
          onClose={() => setShowAddModal(false)}
          onAddStock={addStock}
        />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <header className="bg-white dark:bg-gray-800 shadow-sm border-b border-gray-200 dark:border-gray-700">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center">
              <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100">
                Portfolio Dashboard
              </h1>
              <div className="flex items-center gap-2 ml-4">
                <div className="px-3 py-1 bg-green-100 text-green-800 text-sm rounded-full flex items-center">
                  {isRefreshing ? (
                    <>
                      <LoadingSpinner size="sm" className="mr-1" />
                      Updating...
                    </>
                  ) : (
                    'Live Data'
                  )}
                </div>
                <div className="px-3 py-1 bg-blue-100 text-blue-800 text-sm rounded-full">
                  Yahoo Finance + Google Finance
                </div>
              </div>
            </div>
            
            <div className="flex items-center gap-4">
              <button
                onClick={() => setShowAddModal(true)}
                className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors flex items-center"
              >
                <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                </svg>
                Add Stock
              </button>

              <div className="flex bg-gray-100 dark:bg-gray-700 rounded-lg p-1">
                <button
                  onClick={() => setActiveView('table')}
                  className={`px-4 py-2 text-sm font-medium rounded-md transition-colors ${
                    activeView === 'table'
                      ? 'bg-white dark:bg-gray-600 text-gray-900 dark:text-gray-100 shadow-sm'
                      : 'text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200'
                  }`}
                >
                  Table View
                </button>
                <button
                  onClick={() => setActiveView('sectors')}
                  className={`px-4 py-2 text-sm font-medium rounded-md transition-colors ${
                    activeView === 'sectors'
                      ? 'bg-white dark:bg-gray-600 text-gray-900 dark:text-gray-100 shadow-sm'
                      : 'text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200'
                  }`}
                >
                  Sectors
                </button>
              </div>
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="space-y-6">
          {error && (
            <ErrorAlert 
              error={error}
              onDismiss={dismissError}
            />
          )}

          {errors.length > 0 && (
            <ErrorsList
              errors={errors}
              onDismiss={dismissErrors}
              title="Data Notices"
              variant="warning"
            />
          )}

          {portfolio && (
            <>
              {activeView === 'table' ? (
                <PortfolioTable
                  portfolio={portfolio}
                  loading={loading}
                  error={null} 
                  onRefresh={refreshPortfolio}
                  onRemoveStock={removeStock}
                />
              ) : (
                <>
                  {loading ? (
                    <div className="space-y-4">
                      {Array.from({ length: 3 }).map((_, index) => (
                        <SectorCardSkeleton key={index} />
                      ))}
                    </div>
                  ) : (
                    <SectorView sectors={portfolio.sectors} />
                  )}
                </>
              )}
            </>
          )}
        </div>
      </main>

      <footer className="bg-white dark:bg-gray-800 border-t border-gray-200 dark:border-gray-700 mt-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex justify-between items-center">
            <div className="text-sm text-gray-500 dark:text-gray-400">
              Auto-refresh every 15 seconds • Built with Next.js & TypeScript
            </div>
          </div>
        </div>
      </footer>

      <AddStockModal
        isOpen={showAddModal}
        onClose={() => setShowAddModal(false)}
        onAddStock={addStock}
      />
    </div>
  );
}
