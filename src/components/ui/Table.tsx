import React from 'react';
import { clsx } from 'clsx';
import { ChevronUpIcon, ChevronDownIcon } from '@heroicons/react/24/outline';

export interface Column<T> {
  key: keyof T | string;
  header: string;
  sortable?: boolean;
  width?: string;
  render?: (value: any, row: T) => React.ReactNode;
  className?: string;
}

export interface TableProps<T> {
  data: T[];
  columns: Column<T>[];
  sortBy?: string;
  sortDirection?: 'asc' | 'desc';
  onSort?: (key: string) => void;
  onRowClick?: (row: T) => void;
  loading?: boolean;
  emptyMessage?: string;
  className?: string;
  striped?: boolean;
  hoverable?: boolean;
}

function getValue<T>(obj: T, key: keyof T | string): any {
  if (typeof key === 'string' && key.includes('.')) {
    return key.split('.').reduce((value, k) => value?.[k], obj as any);
  }
  return obj[key as keyof T];
}

export function Table<T>({
  data,
  columns,
  sortBy,
  sortDirection,
  onSort,
  onRowClick,
  loading = false,
  emptyMessage = 'No data available',
  className,
  striped = false,
  hoverable = true
}: TableProps<T>) {
  const handleSort = (column: Column<T>) => {
    if (column.sortable && onSort) {
      onSort(column.key as string);
    }
  };

  const renderSortIcon = (column: Column<T>) => {
    if (!column.sortable) return null;
    
    const isActive = sortBy === column.key;
    
    return (
      <span className="ml-1 inline-flex flex-col">
        <ChevronUpIcon 
          className={clsx(
            'w-3 h-3 -mb-0.5',
            isActive && sortDirection === 'asc' 
              ? 'text-gray-900' 
              : 'text-gray-400'
          )} 
        />
        <ChevronDownIcon 
          className={clsx(
            'w-3 h-3',
            isActive && sortDirection === 'desc' 
              ? 'text-gray-900' 
              : 'text-gray-400'
          )} 
        />
      </span>
    );
  };

  if (loading) {
    return (
      <div className="overflow-hidden shadow ring-1 ring-black ring-opacity-5 rounded-apple">
        <div className="bg-white">
          <div className="animate-pulse">
            <div className="bg-gray-50 px-6 py-3 border-b border-gray-200">
              <div className="h-4 bg-gray-200 rounded w-1/4"></div>
            </div>
            {[1, 2, 3].map(i => (
              <div key={i} className="px-6 py-4 border-b border-gray-200">
                <div className="space-y-2">
                  <div className="h-4 bg-gray-200 rounded w-3/4"></div>
                  <div className="h-4 bg-gray-200 rounded w-1/2"></div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className={clsx('overflow-hidden shadow ring-1 ring-black ring-opacity-5 rounded-apple', className)}>
      <table className="min-w-full divide-y divide-gray-200">
        <thead className="bg-gray-50">
          <tr>
            {columns.map((column, index) => (
              <th
                key={index}
                scope="col"
                className={clsx(
                  'px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider',
                  column.sortable && 'cursor-pointer hover:bg-gray-100 transition-colors',
                  column.className
                )}
                style={{ width: column.width }}
                onClick={() => handleSort(column)}
              >
                <div className="flex items-center">
                  {column.header}
                  {renderSortIcon(column)}
                </div>
              </th>
            ))}
          </tr>
        </thead>
        <tbody className={clsx('bg-white divide-y divide-gray-200', striped && 'divide-gray-200')}>
          {data.length === 0 ? (
            <tr>
              <td 
                colSpan={columns.length} 
                className="px-6 py-12 text-center text-sm text-gray-500"
              >
                {emptyMessage}
              </td>
            </tr>
          ) : (
            data.map((row, rowIndex) => (
              <tr
                key={rowIndex}
                className={clsx(
                  striped && rowIndex % 2 === 1 && 'bg-gray-50',
                  hoverable && onRowClick && 'hover:bg-gray-50 cursor-pointer',
                  'transition-colors'
                )}
                onClick={() => onRowClick?.(row)}
              >
                {columns.map((column, colIndex) => (
                  <td
                    key={colIndex}
                    className="px-6 py-4 whitespace-nowrap text-sm text-gray-900"
                  >
                    {column.render 
                      ? column.render(getValue(row, column.key), row)
                      : getValue(row, column.key)
                    }
                  </td>
                ))}
              </tr>
            ))
          )}
        </tbody>
      </table>
    </div>
  );
}