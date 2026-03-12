import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { apiClient } from '../../services/api';

export interface ActionItemFilters {
  facility_id?: number;
  audit_type?: string;
  status?: string;
  severity?: string;
  search?: string;
  skip?: number;
  limit?: number;
}

export function useAllActionItems(filters?: ActionItemFilters) {
  return useQuery({
    queryKey: ['actionItems', 'all', filters],
    queryFn: () => apiClient.getAllActionItems(filters),
    staleTime: 15000,
    refetchOnWindowFocus: false,
  });
}

export function useUpdateActionItem() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      itemId,
      status,
      notes,
      assignedTo,
    }: {
      itemId: string;
      status: string;
      notes?: string;
      assignedTo?: string;
    }) => apiClient.updateActionItemStatus(itemId, status, notes, assignedTo),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['actionItems'] });
      queryClient.invalidateQueries({ queryKey: ['dashboard'] });
    },
  });
}

export function useExportActionItems() {
  return useMutation({
    mutationFn: (filters?: {
      facility_id?: number;
      audit_type?: string;
      status?: string;
      include_resolved?: boolean;
    }) => apiClient.exportActionItems(filters),
  });
}

export function useActionItemsWithPagination(
  filters: ActionItemFilters & { search?: string },
  page: number = 1,
  pageSize: number = 20
) {
  return useQuery({
    queryKey: ['actionItems', 'paginated', { ...filters, page, pageSize }],
    queryFn: async () => {
      const allItems = await apiClient.getAllActionItems({
        ...filters,
        limit: 9999,
      });

      const itemsWithSearchText = allItems.map((item) => ({
        ...item,
        _searchText: [
          item.title,
          item.description,
          item.finding_code,
          item.facility_name,
          item.status,
          item.mrn || '',
        ]
          .join(' ')
          .toLowerCase(),
      }));

      let filteredItems = itemsWithSearchText;
      if (filters.search) {
        const searchTerms = filters.search.toLowerCase().trim().split(/\s+/);
        filteredItems = itemsWithSearchText.filter((item) =>
          searchTerms.every((term) => item._searchText.includes(term))
        );
      }

      const startIndex = (page - 1) * pageSize;
      const endIndex = startIndex + pageSize;
      const paginatedItems = filteredItems.slice(startIndex, endIndex);

      return {
        items: paginatedItems,
        total: filteredItems.length,
        hasMore: endIndex < filteredItems.length,
        page,
        pageSize,
      };
    },
    staleTime: 20000,
    refetchOnWindowFocus: false,
  });
}
