import React, { useState } from 'react';
import { MaintenanceRequest, MaintenancePriority, MaintenanceStatus } from '../../types';
import { useRealEstate } from '../../context/RealEstateContext';
import { X, Wrench, CheckCircle2, AlertTriangle, Clock } from 'lucide-react';

interface MaintenanceModalProps {
  requestToEdit?: MaintenanceRequest | null;
  onClose: () => void;
}

export const MaintenanceModal: React.FC<MaintenanceModalProps> = ({
  requestToEdit,
  onClose
}) => {
  const { currentUser, properties, submitMaintenanceRequest, updateMaintenanceStatus, leases } = useRealEstate();

  // If new request, default to tenant's leased property or first available
  const userLease = leases.find(l => l.tenantId === currentUser.id && l.status === 'active');
  const defaultProperty = properties.find(p => p.id === userLease?.propertyId) || properties[0];

  const [propertyId, setPropertyId] = useState(requestToEdit?.propertyId || defaultProperty?.id || '');
  const [title, setTitle] = useState(requestToEdit?.title || '');
  const [category, setCategory] = useState<MaintenanceRequest['category']>(requestToEdit?.category || 'Plumbing');
  const [priority, setPriority] = useState<MaintenancePriority>(requestToEdit?.priority || 'medium');
  const [description, setDescription] = useState(requestToEdit?.description || '');

  // Manager update fields
  const [status, setStatus] = useState<MaintenanceStatus>(requestToEdit?.status || 'submitted');
  const [assignedContractor, setAssignedContractor] = useState(requestToEdit?.assignedContractor || '');
  const [scheduledDate, setScheduledDate] = useState(requestToEdit?.scheduledDate || '');
  const [resolutionNotes, setResolutionNotes] = useState(requestToEdit?.resolutionNotes || '');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (requestToEdit) {
      updateMaintenanceStatus(
        requestToEdit.id,
        status,
        assignedContractor,
        scheduledDate,
        resolutionNotes
      );
    } else {
      const selectedProp = properties.find(p => p.id === propertyId) || properties[0];
      submitMaintenanceRequest({
        propertyId: selectedProp.id,
        propertyTitle: selectedProp.title,
        propertyAddress: selectedProp.address,
        tenantId: currentUser.id,
        tenantName: currentUser.name,
        managerId: selectedProp.managerId,
        title,
        category,
        priority,
        description,
      });
    }

    onClose();
  };

  const isManagerOrAdmin = currentUser.role === 'manager' || currentUser.role === 'admin';

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto">
      <div
        className="bg-white rounded-2xl max-w-xl w-full max-h-[92vh] overflow-y-auto shadow-2xl border border-slate-200 relative my-6 text-slate-800"
        onClick={e => e.stopPropagation()}
      >
        <div className="p-6 border-b border-slate-200 flex items-center justify-between sticky top-0 bg-white z-10">
          <div className="flex items-center gap-2">
            <Wrench className="w-5 h-5 text-indigo-600" />
            <h2 className="text-base font-bold text-slate-900">
              {requestToEdit ? `Manage Work Order #${requestToEdit.id}` : 'Submit Maintenance Request'}
            </h2>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-slate-600 rounded-lg hover:bg-slate-100 transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-5">
          {!requestToEdit && (
            <>
              <div>
                <label className="block text-xs font-medium text-slate-700 mb-1">Target Property / Unit</label>
                <select
                  value={propertyId}
                  onChange={e => setPropertyId(e.target.value)}
                  className="w-full px-3 py-2 text-sm border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 bg-white"
                >
                  {properties.map(p => (
                    <option key={p.id} value={p.id}>
                      {p.title} ({p.address})
                    </option>
                  ))}
                </select>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-medium text-slate-700 mb-1">Category</label>
                  <select
                    value={category}
                    onChange={e => setCategory(e.target.value as MaintenanceRequest['category'])}
                    className="w-full px-3 py-2 text-sm border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 bg-white"
                  >
                    <option value="Plumbing">Plumbing</option>
                    <option value="Electrical">Electrical</option>
                    <option value="HVAC">Heating / HVAC</option>
                    <option value="Appliance">Appliances</option>
                    <option value="Structural">Structural / Door / Window</option>
                    <option value="Other">Other Repairs</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-medium text-slate-700 mb-1">Urgency Priority</label>
                  <select
                    value={priority}
                    onChange={e => setPriority(e.target.value as MaintenancePriority)}
                    className="w-full px-3 py-2 text-sm border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 bg-white"
                  >
                    <option value="low">Low (Standard routine)</option>
                    <option value="medium">Medium (Requires attention this week)</option>
                    <option value="high">High (Impacting daily living)</option>
                    <option value="urgent">Urgent (Water leak / heating failure)</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-700 mb-1">Subject / Summary</label>
                <input
                  type="text"
                  required
                  value={title}
                  onChange={e => setTitle(e.target.value)}
                  placeholder="e.g. Master bathroom sink drain backing up"
                  className="w-full px-3 py-2 text-sm border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-700 mb-1">Detailed Description</label>
                <textarea
                  rows={3}
                  required
                  value={description}
                  onChange={e => setDescription(e.target.value)}
                  placeholder="Describe when the issue began, exact location in property, and any troubleshooting steps..."
                  className="w-full px-3 py-2 text-sm border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
                />
              </div>
            </>
          )}

          {requestToEdit && (
            <div className="space-y-4">
              <div className="p-3 rounded-lg bg-slate-50 border border-slate-200 text-xs space-y-1">
                <div className="font-semibold text-slate-900">{requestToEdit.title}</div>
                <div className="text-slate-600">{requestToEdit.description}</div>
                <div className="text-slate-500 pt-1">
                  Requested by <strong className="text-slate-800">{requestToEdit.tenantName}</strong> on {requestToEdit.createdAt}
                </div>
              </div>

              {isManagerOrAdmin && (
                <>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-medium text-slate-700 mb-1">Work Order Status</label>
                      <select
                        value={status}
                        onChange={e => setStatus(e.target.value as MaintenanceStatus)}
                        className="w-full px-3 py-2 text-sm border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 bg-white"
                      >
                        <option value="submitted">Submitted</option>
                        <option value="scheduled">Scheduled</option>
                        <option value="in_progress">In Progress</option>
                        <option value="resolved">Resolved</option>
                      </select>
                    </div>

                    <div>
                      <label className="block text-xs font-medium text-slate-700 mb-1">Assigned Vendor / Tech</label>
                      <input
                        type="text"
                        value={assignedContractor}
                        onChange={e => setAssignedContractor(e.target.value)}
                        placeholder="e.g. Cascade Climate Controls"
                        className="w-full px-3 py-2 text-sm border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-medium text-slate-700 mb-1">Scheduled Window</label>
                    <input
                      type="text"
                      value={scheduledDate}
                      onChange={e => setScheduledDate(e.target.value)}
                      placeholder="e.g. 2026-10-18 between 1:00 PM - 3:00 PM"
                      className="w-full px-3 py-2 text-sm border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-medium text-slate-700 mb-1">Technician / Resolution Notes</label>
                    <textarea
                      rows={2}
                      value={resolutionNotes}
                      onChange={e => setResolutionNotes(e.target.value)}
                      placeholder="Notes on replacement parts, inspection results..."
                      className="w-full px-3 py-2 text-sm border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
                    />
                  </div>
                </>
              )}
            </div>
          )}

          <div className="pt-4 border-t border-slate-200 flex items-center justify-end gap-3">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-xs font-medium text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-lg transition-colors cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-5 py-2 text-xs font-semibold text-white bg-indigo-600 hover:bg-indigo-700 rounded-lg transition-colors shadow-xs cursor-pointer"
            >
              {requestToEdit ? 'Update Work Order' : 'Submit Request'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
