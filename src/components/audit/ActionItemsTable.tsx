import { useMemo } from 'react';
import { Table, Badge, Select } from '../ui';
import type { Column } from '../ui/Table';
import type { ActionItem } from '../../types/audit';
import { useUpdateActionItem } from '../../hooks/api/useActionItemsManagement';

interface ActionItemsTableProps {
  actionItems: ActionItem[];
  loading?: boolean;
  onItemClick: (item: ActionItem) => void;
  onQuickStatusUpdate?: (itemId: string, status: string) => void;
  sortBy?: string;
  sortDirection?: 'asc' | 'desc';
  onSort: (key: string) => void;
}

const statusOptions = [
  { value: 'open', label: 'Open' },
  { value: 'in_progress', label: 'In Progress' },
  { value: 'resolved', label: 'Resolved' },
  { value: 'dismissed', label: 'Dismissed' },
];

export function ActionItemsTable({
  actionItems,
  loading = false,
  onItemClick,
  onQuickStatusUpdate,
  sortBy,
  sortDirection,
  onSort
}: ActionItemsTableProps) {
  const updateActionItem = useUpdateActionItem();

  const handleQuickStatusChange = async (itemId: string, newStatus: string) => {
    try {
      await updateActionItem.mutateAsync({
        itemId,
        status: newStatus,
      });

      onQuickStatusUpdate?.(itemId, newStatus);
    } catch (error) {
      console.error('Failed to update action item status:', error);
    }
  };

  const columns: Column<ActionItem>[] = useMemo(() => [
    {
      key: 'severity',
      header: 'Priority',
      width: '100px',
      sortable: true,
      render: (value) => (
        <Badge variant="severity" severity={value} size="sm">
          {value}
        </Badge>
      ),
    },
    {
      key: 'title',
      header: 'Action Required',
      sortable: true,
      render: (value, item) => (
        <div className="max-w-xs">
          <p className="text-sm font-medium text-gray-900">
            {value || 'No action specified'}
          </p>
          <div className="flex items-center space-x-2 mt-1">
            <Badge variant="audit-type" auditType={item.audit_type} size="sm">
              {item.audit_type.replace('-', ' ')}
            </Badge>
            {item.auto_resolved && (
              <Badge variant="success" size="sm">
                Auto-resolved
              </Badge>
            )}
          </div>
        </div>
      ),
    },
    {
      key: 'facility_name',
      header: 'Facility',
      sortable: true,
      render: (value) => (
        <span className="text-sm text-gray-900">{value}</span>
      ),
    },
    {
      key: 'mrn',
      header: 'MRN',
      sortable: true,
      render: (value) => (
        <span className="font-mono text-sm text-gray-700">
          {value || 'N/A'}
        </span>
      ),
    },
    {
      key: 'status',
      header: 'Status',
      sortable: true,
      width: '140px',
      render: (value, item) => (
        <Select
          options={statusOptions}
          value={value}
          onChange={(newStatus) => handleQuickStatusChange(item.id, newStatus)}
          size="sm"
          className="min-w-0"
        />
      ),
    },
  ], [onItemClick]);

  return (
    <Table
      data={actionItems}
      columns={columns}
      sortBy={sortBy}
      sortDirection={sortDirection}
      onSort={onSort}
      onRowClick={onItemClick}
      loading={loading}
      emptyMessage="No action items found. Run an audit to generate action items."
      striped
      hoverable
    />
  );
}
