import { useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button, EmptyState } from '../components/ui';
import { ActionItemCard } from '../components/audit/ActionItemCard';
import { ActionItemsFilters, type ActionItemFilters } from '../components/audit/ActionItemsFilters';
import { ActionItemDetailModal } from '../components/audit/ActionItemDetailModal';
import { useActionItemsWithPagination, useExportActionItems } from '../hooks/api/useActionItemsManagement';
import type { ActionItem } from '../types/audit';
import { DocumentArrowDownIcon, ExclamationTriangleIcon, CheckCircleIcon } from '@heroicons/react/24/outline';

export default function ActionItems() {
  const navigate = useNavigate();
  const [filters, setFilters] = useState<ActionItemFilters>({});
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize] = useState(20);
  const [selectedItem, setSelectedItem] = useState<ActionItem | null>(null);
  const [isDetailModalOpen, setIsDetailModalOpen] = useState(false);

  const { data: paginatedData, isLoading, error, refetch } = useActionItemsWithPagination(
    { ...filters, search: filters.search }, currentPage, pageSize
  );

  const exportItems = useExportActionItems();

  const actionItems = paginatedData?.items || [];
  const totalItems = paginatedData?.total || 0;
  const hasMore = paginatedData?.hasMore || false;

  const activeFilterCount = useMemo(() => {
    return Object.values(filters).filter(value => value !== undefined && value !== '' && value !== 'all').length;
  }, [filters]);

  const handleFiltersChange = (newFilters: ActionItemFilters) => { setFilters(newFilters); setCurrentPage(1); };
  const handleItemClick = (item: ActionItem) => { setSelectedItem(item); setIsDetailModalOpen(true); };
  const handleCloseDetailModal = () => { setIsDetailModalOpen(false); setSelectedItem(null); };
  const handleItemUpdate = () => refetch();

  const handleExportAll = () => {
    exportItems.mutate({
      facility_id: filters.facility_id,
      audit_type: filters.audit_type === 'all' ? undefined : filters.audit_type,
      status: filters.status,
      include_resolved: true,
    });
  };

  const handlePageChange = (page: number) => setCurrentPage(page);

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white shadow-sm border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="py-6">
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-3xl font-bold text-gray-900">Action Items</h1>
                <p className="mt-1 text-sm text-gray-500">Manage compliance action items across all audit types and facilities</p>
              </div>
              <div className="flex space-x-3">
                <Button variant="outline" size="md" onClick={handleExportAll} disabled={exportItems.isPending || totalItems === 0}>
                  <DocumentArrowDownIcon className="w-4 h-4 mr-2" />Export All
                </Button>
              </div>
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {error && (
          <div className="mb-6 bg-red-50 border border-red-200 rounded-apple p-4">
            <div className="flex items-center space-x-2">
              <ExclamationTriangleIcon className="w-5 h-5 text-red-500" />
              <h3 className="text-sm font-medium text-red-800">Unable to load action items</h3>
            </div>
          </div>
        )}

        <div className="mb-8">
          <ActionItemsFilters filters={filters} onFiltersChange={handleFiltersChange} activeFilterCount={activeFilterCount} />
        </div>

        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-xl font-semibold text-gray-900">{isLoading ? 'Loading...' : `${totalItems} ${totalItems === 1 ? 'item' : 'items'}`}</h2>
              {totalItems > 0 && (
                <p className="text-sm text-gray-500 mt-1">Showing {((currentPage - 1) * pageSize) + 1} to {Math.min(currentPage * pageSize, totalItems)} of {totalItems} results</p>
              )}
            </div>
          </div>

          {isLoading ? (
            <div className="grid grid-cols-1 gap-4">{[...Array(3)].map((_, i) => <div key={i} className="h-32 bg-white rounded-apple animate-pulse border border-gray-100" />)}</div>
          ) : actionItems.length === 0 ? (
            <EmptyState icon={<CheckCircleIcon className="w-full h-full" />} emoji="🎉" title="All Clear!" description="No action items need attention right now. Run an audit to generate new action items." actionLabel="Run New Audit" onAction={() => navigate('/run-audits')} />
          ) : (
            <div className="grid grid-cols-1 gap-4">
              {actionItems.map((item) => <ActionItemCard key={item.id} item={item} onClick={handleItemClick} onUpdate={handleItemUpdate} />)}
            </div>
          )}

          {totalItems > pageSize && (
            <div className="flex items-center justify-between pt-6 border-t border-gray-200">
              <div className="text-sm text-gray-600">Showing {((currentPage - 1) * pageSize) + 1} to {Math.min(currentPage * pageSize, totalItems)} of {totalItems}</div>
              <div className="flex space-x-2">
                <Button variant="outline" size="sm" onClick={() => handlePageChange(currentPage - 1)} disabled={currentPage === 1}>Previous</Button>
                <Button variant="outline" size="sm" onClick={() => handlePageChange(currentPage + 1)} disabled={!hasMore}>Next</Button>
              </div>
            </div>
          )}
        </div>
      </main>

      <ActionItemDetailModal isOpen={isDetailModalOpen} onClose={handleCloseDetailModal} actionItem={selectedItem} onUpdate={handleItemUpdate} />
    </div>
  );
}
