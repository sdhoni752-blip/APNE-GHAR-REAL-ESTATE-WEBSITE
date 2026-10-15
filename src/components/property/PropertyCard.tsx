import React, { useState } from 'react';
import { Property } from '../../types';
import { useRealEstate } from '../../context/RealEstateContext';
import { formatINR } from '../../utils/format';
import {
  Bed,
  Bath,
  Maximize2,
  MapPin,
  Building,
  CheckCircle2,
  Clock,
  Wrench,
  AlertCircle
} from 'lucide-react';

interface PropertyCardProps {
  property: Property;
  onSelect: (property: Property) => void;
  onApply?: (property: Property) => void;
  onEdit?: (property: Property) => void;
}

export const PropertyCard: React.FC<PropertyCardProps> = ({
  property,
  onSelect,
  onApply,
  onEdit
}) => {
  const { currentUser } = useRealEstate();
  const [imageFailed, setImageFailed] = useState(false);

  const getStatusText = (status: Property['status']) => {
    switch (status) {
      case 'available':
        return { label: 'Available Now', color: 'text-emerald-700' };
      case 'rented':
        return { label: 'Currently Leased', color: 'text-slate-600' };
      case 'pending_approval':
        return { label: 'Pending Admin Review', color: 'text-amber-700' };
      case 'maintenance':
        return { label: 'Under Maintenance', color: 'text-rose-700' };
    }
  };

  const statusInfo = getStatusText(property.status);

  return (
    <div className="group bg-white border border-slate-200 rounded-xl overflow-hidden shadow-xs hover:shadow-md transition-shadow duration-200 flex flex-col">
      {/* Property Visual Showcase */}
      <div className="relative aspect-4/3 w-full bg-slate-100 overflow-hidden cursor-pointer" onClick={() => onSelect(property)}>
        {!imageFailed && property.image ? (
          <img
            src={property.image}
            alt={property.title}
            referrerPolicy="no-referrer"
            onError={() => setImageFailed(true)}
            className="w-full h-full object-cover group-hover:scale-102 transition-transform duration-300 ease-out"
          />
        ) : (
          <div className="w-full h-full flex flex-col items-center justify-center bg-slate-100 text-slate-400 p-6 text-center">
            <Building className="w-12 h-12 stroke-1 mb-2 text-slate-400" />
            <span className="text-xs font-medium text-slate-500">{property.type}</span>
          </div>
        )}

        {/* Minimal gradient scrim for readability */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-80" />

        {/* Overlay info */}
        <div className="absolute bottom-3 left-3 right-3 flex items-end justify-between text-white">
          <div>
            <div className="text-xl font-bold font-mono tabular-nums leading-none">
              ₹{formatINR(property.price)}
              <span className="text-xs font-normal text-slate-200 ml-1">/ month</span>
            </div>
            <div className="text-xs text-slate-200 mt-1 flex items-center gap-1">
              <MapPin className="w-3.5 h-3.5 text-slate-300 shrink-0" />
              <span className="truncate max-w-[200px]">{property.city}, {property.state}</span>
            </div>
          </div>

          {property.featured && (
            <span className="text-[11px] font-semibold tracking-wide uppercase text-amber-300 drop-shadow-xs">
              Featured
            </span>
          )}
        </div>
      </div>

      {/* Card Content */}
      <div className="p-4 flex-1 flex flex-col justify-between">
        <div>
          {/* Unboxed Metadata Line (anti-slop clean text rule) */}
          <div className="flex items-center gap-2 text-xs text-slate-500 mb-1.5">
            <span>{property.type}</span>
            <span aria-hidden="true">·</span>
            <span className={`font-medium ${statusInfo.color}`}>{statusInfo.label}</span>
            <span aria-hidden="true">·</span>
            <span>Built {property.yearBuilt}</span>
          </div>

          <h3
            onClick={() => onSelect(property)}
            className="text-base font-semibold text-slate-900 group-hover:text-indigo-600 transition-colors line-clamp-1 cursor-pointer"
          >
            {property.title}
          </h3>

          <p className="text-xs text-slate-500 mt-1 line-clamp-1">
            {property.address}
          </p>

          {/* Key Property Specs */}
          <div className="grid grid-cols-3 gap-2 mt-4 py-2 border-y border-slate-100 text-xs text-slate-700">
            <div className="flex items-center gap-1.5">
              <Bed className="w-4 h-4 text-slate-400 shrink-0" />
              <span><strong className="font-mono tabular-nums font-semibold">{property.bedrooms}</strong> beds</span>
            </div>
            <div className="flex items-center gap-1.5">
              <Bath className="w-4 h-4 text-slate-400 shrink-0" />
              <span><strong className="font-mono tabular-nums font-semibold">{property.bathrooms}</strong> baths</span>
            </div>
            <div className="flex items-center gap-1.5">
              <Maximize2 className="w-4 h-4 text-slate-400 shrink-0" />
              <span><strong className="font-mono tabular-nums font-semibold">{property.sqft.toLocaleString()}</strong> sqft</span>
            </div>
          </div>
        </div>

        {/* Card Footer & Action Area */}
        <div className="mt-4 pt-2 flex items-center justify-between text-xs">
          <div className="text-slate-500 truncate max-w-[150px]">
            Managed by <span className="text-slate-700 font-medium">{property.managerName}</span>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => onSelect(property)}
              className="px-3 py-1.5 text-xs font-medium text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-lg transition-colors cursor-pointer"
            >
              Details
            </button>

            {currentUser.role === 'tenant' && property.status === 'available' && onApply && (
              <button
                onClick={() => onApply(property)}
                className="px-3 py-1.5 text-xs font-medium text-white bg-indigo-600 hover:bg-indigo-700 rounded-lg transition-colors cursor-pointer"
              >
                Apply
              </button>
            )}

            {currentUser.role === 'manager' && onEdit && (
              <button
                onClick={() => onEdit(property)}
                className="px-3 py-1.5 text-xs font-medium text-indigo-700 bg-indigo-50 hover:bg-indigo-100 rounded-lg transition-colors cursor-pointer"
              >
                Edit
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
