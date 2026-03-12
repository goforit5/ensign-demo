import React, { useState } from 'react';
import { format } from 'date-fns';
import { Modal, Badge, Button, Select } from '../ui';
import { useUpdateActionItem } from '../../hooks/api/useActionItemsManagement';
import type { ActionItem } from '../../types/audit';
import {
  ClockIcon,
  UserIcon,
  DocumentTextIcon,
  ExclamationTriangleIcon,
  CheckCircleIcon,
  InformationCircleIcon,
  ClipboardDocumentIcon,
  CheckIcon
} from '@heroicons/react/24/outline';

interface ActionItemDetailModalProps {
  isOpen: boolean;
  onClose: () => void;
  actionItem: ActionItem | null;
  onUpdate?: (updatedItem: ActionItem) => void;
}

const statusOptions = [
  { value: 'open', label: 'Open' },
  { value: 'in_progress', label: 'In Progress' },
  { value: 'resolved', label: 'Resolved' },
  { value: 'dismissed', label: 'Dismissed' },
];

const assigneeOptions = [
  { value: '', label: 'Unassigned' },
  { value: 'medical_records', label: 'Medical Records' },
  { value: 'nursing_supervisor', label: 'Nursing Supervisor' },
  { value: 'pharmacy', label: 'Pharmacy' },
  { value: 'quality_assurance', label: 'Quality Assurance' },
  { value: 'administrator', label: 'Administrator' },
];

export function ActionItemDetailModal({
  isOpen,
  onClose,
  actionItem,
  onUpdate
}: ActionItemDetailModalProps) {
  const [isEditing, setIsEditing] = useState(false);
  const [editStatus, setEditStatus] = useState('');
  const [editAssignee, setEditAssignee] = useState('');
  const [editNotes, setEditNotes] = useState('');
  const [isCopied, setIsCopied] = useState(false);

  const updateActionItem = useUpdateActionItem();

  React.useEffect(() => {
    if (actionItem) {
      setEditStatus(actionItem.status);
      setEditAssignee(actionItem.assigned_to || '');
      setEditNotes('');
      setIsCopied(false);
    }
  }, [actionItem]);

  if (!actionItem) return null;

  const handleCopyFindingCode = async () => {
    try {
      await navigator.clipboard.writeText(actionItem.finding_code);
      setIsCopied(true);
      setTimeout(() => setIsCopied(false), 2000);
    } catch (error) {
      console.error('Failed to copy finding code:', error);
    }
  };

  const handleSaveChanges = async () => {
    try {
      await updateActionItem.mutateAsync({
        itemId: actionItem.id,
        status: editStatus,
        assignedTo: editAssignee || undefined,
        notes: editNotes || undefined,
      });
      
      // Update the local item if callback provided
      if (onUpdate) {
        onUpdate({
          ...actionItem,
          status: editStatus as any,
          assigned_to: editAssignee || undefined,
          updated_at: new Date().toISOString(),
        });
      }
      
      setIsEditing(false);
      onClose();
    } catch (error) {
      console.error('Failed to update action item:', error);
    }
  };

  const handleCancelEdit = () => {
    setEditStatus(actionItem.status);
    setEditAssignee(actionItem.assigned_to || '');
    setEditNotes('');
    setIsEditing(false);
  };

  const getSeverityIcon = () => {
    switch (actionItem.severity) {
      case 'critical':
        return <ExclamationTriangleIcon className="w-5 h-5 text-red-500" />;
      case 'high':
        return <ExclamationTriangleIcon className="w-5 h-5 text-orange-500" />;
      case 'medium':
        return <ClockIcon className="w-5 h-5 text-yellow-500" />;
      case 'low':
        return <CheckCircleIcon className="w-5 h-5 text-green-500" />;
      default:
        return <InformationCircleIcon className="w-5 h-5 text-gray-500" />;
    }
  };

  const footer = (
    <div className="flex items-center justify-between">
      <div className="text-sm text-gray-500">
        Last updated: {format(new Date(actionItem.updated_at), 'MMM dd, yyyy HH:mm')}
      </div>
      <div className="flex space-x-3">
        {isEditing ? (
          <>
            <Button
              variant="outline"
              onClick={handleCancelEdit}
              disabled={updateActionItem.isPending}
            >
              Cancel
            </Button>
            <Button
              variant="primary"
              onClick={handleSaveChanges}
              disabled={updateActionItem.isPending}
            >
              {updateActionItem.isPending ? 'Saving...' : 'Save Changes'}
            </Button>
          </>
        ) : (
          <Button
            variant="primary"
            onClick={() => setIsEditing(true)}
          >
            Edit Action Item
          </Button>
        )}
      </div>
    </div>
  );

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Action Item Details"
      size="lg"
      footer={footer}
    >
      <div className="space-y-6">
        {/* Header Info */}
        <div className="flex items-start space-x-4">
          <div className="flex-shrink-0">
            {getSeverityIcon()}
          </div>
          <div className="flex-1">
            <div className="flex items-center space-x-3 mb-2">
              <Badge variant="audit-type" auditType={actionItem.audit_type}>
                {actionItem.audit_type.replace('-', ' ')}
              </Badge>
              <Badge variant="severity" severity={actionItem.severity}>
                {actionItem.severity}
              </Badge>
              {actionItem.auto_resolved && (
                <Badge variant="success">
                  Auto-resolved
                </Badge>
              )}
            </div>
            <h3 className="text-lg font-medium text-gray-900 mb-1">
              {actionItem.title}
            </h3>

            {/* Finding Code with Copy Button */}
            <div className="flex items-center space-x-2 mt-2">
              <span className="text-sm text-gray-600">Finding Code:</span>
              <span className="font-mono font-medium text-sm text-gray-900">
                {actionItem.finding_code}
              </span>
              <Button
                variant="ghost"
                size="sm"
                onClick={handleCopyFindingCode}
                className="p-1"
              >
                {isCopied ? (
                  <CheckIcon className="w-4 h-4 text-green-600" />
                ) : (
                  <ClipboardDocumentIcon className="w-4 h-4 text-gray-500" />
                )}
              </Button>
            </div>
          </div>
        </div>

        {/* Details Grid */}
        <div className="grid grid-cols-2 gap-6">
          <div>
            <h4 className="text-sm font-medium text-gray-900 mb-3">Facility Information</h4>
            <div className="space-y-2">
              <div className="flex items-center space-x-2">
                <InformationCircleIcon className="w-4 h-4 text-gray-400" />
                <span className="text-sm text-gray-700">{actionItem.facility_name}</span>
              </div>
              {actionItem.mrn && (
                <div className="flex items-center space-x-2">
                  <DocumentTextIcon className="w-4 h-4 text-gray-400" />
                  <span className="text-sm text-gray-700">MRN: {actionItem.mrn}</span>
                </div>
              )}
            </div>
          </div>

          <div>
            <h4 className="text-sm font-medium text-gray-900 mb-3">Timing</h4>
            <div className="space-y-2">
              <div className="flex items-center space-x-2">
                <ClockIcon className="w-4 h-4 text-gray-400" />
                <span className="text-sm text-gray-700">
                  Created: {format(new Date(actionItem.created_at), 'MMM dd, yyyy HH:mm')}
                </span>
              </div>
              {actionItem.due_date && (
                <div className="flex items-center space-x-2">
                  <ClockIcon className="w-4 h-4 text-orange-400" />
                  <span className="text-sm text-gray-700">
                    Due: {format(new Date(actionItem.due_date), 'MMM dd, yyyy')}
                  </span>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Description */}
        <div>
          <h4 className="text-sm font-medium text-gray-900 mb-2">Description</h4>
          <div className="bg-gray-50 rounded-apple p-4">
            <p className="text-sm text-gray-700 whitespace-pre-wrap">
              {actionItem.description}
            </p>
          </div>
        </div>

        {/* Status and Assignment */}
        <div className="grid grid-cols-2 gap-6">
          <div>
            <h4 className="text-sm font-medium text-gray-900 mb-3">Status</h4>
            {isEditing ? (
              <Select
                options={statusOptions}
                value={editStatus}
                onChange={setEditStatus}
              />
            ) : (
              <Badge variant="status" status={actionItem.status}>
                {actionItem.status.replace('_', ' ')}
              </Badge>
            )}
          </div>

          <div>
            <h4 className="text-sm font-medium text-gray-900 mb-3">Assignment</h4>
            {isEditing ? (
              <Select
                options={assigneeOptions}
                value={editAssignee}
                onChange={setEditAssignee}
                placeholder="Select assignee"
              />
            ) : (
              <div className="flex items-center space-x-2">
                <UserIcon className="w-4 h-4 text-gray-400" />
                <span className="text-sm text-gray-700">
                  {actionItem.assigned_to ? (
                    assigneeOptions.find(opt => opt.value === actionItem.assigned_to)?.label || actionItem.assigned_to
                  ) : (
                    'Unassigned'
                  )}
                </span>
              </div>
            )}
          </div>
        </div>

        {/* Notes/Resolution (Edit Mode) */}
        {isEditing && (
          <div>
            <label className="block text-sm font-medium text-gray-900 mb-2">
              Notes / Resolution Details
            </label>
            <textarea
              value={editNotes}
              onChange={(e) => setEditNotes(e.target.value)}
              rows={3}
              className="block w-full border border-gray-300 rounded-apple px-3 py-2 text-sm placeholder-gray-500 focus:outline-none focus:ring-1 focus:ring-primary-500 focus:border-primary-500"
              placeholder="Add notes about resolution, next steps, or any relevant information..."
            />
          </div>
        )}

        {/* Auto-Resolution Notice */}
        {actionItem.auto_resolved && (
          <div className="bg-green-50 border border-green-200 rounded-apple p-4">
            <div className="flex items-start space-x-3">
              <CheckCircleIcon className="w-5 h-5 text-green-500 flex-shrink-0 mt-0.5" />
              <div>
                <h4 className="text-sm font-medium text-green-900">
                  Automatically Resolved
                </h4>
                <p className="text-sm text-green-700 mt-1">
                  This action item was automatically resolved during a subsequent audit, 
                  indicating that the compliance issue has been addressed.
                </p>
              </div>
            </div>
          </div>
        )}

        {/* System Information */}
        <div className="border-t border-gray-200 pt-4">
          <h4 className="text-sm font-medium text-gray-900 mb-2">System Information</h4>
          <div className="grid grid-cols-2 gap-4 text-sm text-gray-600">
            <div>
              <span className="font-medium">Action Item ID:</span> {actionItem.id}
            </div>
            <div>
              <span className="font-medium">Audit Run ID:</span> {actionItem.audit_run_id}
            </div>
            {actionItem.finding_id && (
              <div>
                <span className="font-medium">Finding ID:</span> {actionItem.finding_id}
              </div>
            )}
          </div>
        </div>
      </div>
    </Modal>
  );
}