import React, { useState } from 'react';
import { Property } from '../../types';
import { useRealEstate } from '../../context/RealEstateContext';
import { formatINR } from '../../utils/format';
import {
  X,
  MapPin,
  Bed,
  Bath,
  Maximize2,
  Calendar,
  Shield,
  Car,
  Dog,
  CheckCircle2,
  Mail,
  Phone,
  Building,
  FileText,
  MessageSquare
} from 'lucide-react';

interface PropertyDetailModalProps {
  property: Property;
  onClose: () => void;
  onApply?: (property: Property) => void;
  onOpenMessages?: (managerId: string, propertyTitle: string) => void;
}

export const PropertyDetailModal: React.FC<PropertyDetailModalProps> = ({
  property,
  onClose,
  onApply,
  onOpenMessages
}) => {
  const { currentUser } = useRealEstate();
  const [imageFailed, setImageFailed] = useState(false);
  const [tourBooked, setTourBooked] = useState(false);
  const [tourDate, setTourDate] = useState('2026-10-22');

  const handleBookTour = (e: React.FormEvent) => {
    e.preventDefault();
    setTourBooked(true);
    setTimeout(() => setTourBooked(false), 4000);
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto">
      <div
        className="bg-white rounded-2xl max-w-4xl w-full max-h-[90vh] overflow-y-auto shadow-2xl border border-slate-200 relative my-8"
        onClick={e => e.stopPropagation()}
      >
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 z-10 p-2 rounded-full bg-white/90 hover:bg-white text-slate-700 shadow-md transition-all cursor-pointer"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Hero Photo Section */}
        <div className="relative aspect-16/9 sm:aspect-21/9 w-full bg-slate-900 overflow-hidden">
          {!imageFailed && property.image ? (
            <img
              src={property.image}
              alt={property.title}
              referrerPolicy="no-referrer"
              onError={() => setImageFailed(true)}
              className="w-full h-full object-cover"
            />
          ) : (
            <div className="w-full h-full flex flex-col items-center justify-center text-slate-400">
              <Building className="w-16 h-16 stroke-1 mb-2" />
              <span>{property.type} Architecture</span>
            </div>
          )}
          <div className="absolute inset-0 bg-gradient-to-t from-slate-950/80 via-slate-950/20 to-transparent" />

          {/* Overlaid Hero Title */}
          <div className="absolute bottom-6 left-6 right-6 text-white">
            <div className="flex items-center gap-2 text-xs text-slate-300 mb-1">
              <span>{property.type}</span>
              <span aria-hidden="true">·</span>
              <span>Built {property.yearBuilt}</span>
              <span aria-hidden="true">·</span>
              <span className="capitalize">{property.status.replace('_', ' ')}</span>
            </div>
            <h2 className="text-2xl sm:text-3xl font-bold tracking-tight">{property.title}</h2>
            <div className="flex items-center gap-1.5 text-sm text-slate-200 mt-1">
              <MapPin className="w-4 h-4 shrink-0 text-indigo-400" />
              <span>{property.address}, {property.city}, {property.state} {property.zip}</span>
            </div>
          </div>
        </div>

        {/* Main Content Layout */}
        <div className="p-6 sm:p-8 space-y-8">
          {/* Key Financial & Spec Strip */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 pb-6 border-b border-slate-200">
            <div>
              <div className="text-xs text-slate-500 font-medium">Monthly Rent</div>
              <div className="text-2xl font-bold font-mono tabular-nums text-slate-900 mt-0.5">
                ₹{formatINR(property.price)}
              </div>
              <div className="text-xs text-slate-500">Security Deposit: ₹{formatINR(property.securityDeposit)}</div>
            </div>

            <div>
              <div className="text-xs text-slate-500 font-medium">Configuration</div>
              <div className="text-lg font-semibold text-slate-900 mt-1 flex items-center gap-2">
                <span><strong className="font-mono tabular-nums">{property.bedrooms}</strong> Beds</span>
                <span className="text-slate-300">/</span>
                <span><strong className="font-mono tabular-nums">{property.bathrooms}</strong> Baths</span>
              </div>
              <div className="text-xs text-slate-500 font-mono tabular-nums">{property.sqft.toLocaleString()} sq.ft living area</div>
            </div>

            <div>
              <div className="text-xs text-slate-500 font-medium">Availability</div>
              <div className="text-base font-semibold text-emerald-700 mt-1">
                {property.availableFrom}
              </div>
              <div className="text-xs text-slate-500">Standard 12-Month Lease</div>
            </div>

            <div>
              <div className="text-xs text-slate-500 font-medium">Platform Activity</div>
              <div className="text-base font-semibold text-slate-900 mt-1 font-mono tabular-nums">
                {property.viewsCount} verified views
              </div>
              <div className="text-xs text-slate-500">Listed {property.createdAt}</div>
            </div>
          </div>

          {/* Description & Overview */}
          <div>
            <h3 className="text-base font-semibold text-slate-900 mb-2">Property Description</h3>
            <p className="text-sm text-slate-600 leading-relaxed">
              {property.description}
            </p>
          </div>

          {/* Amenities Grid */}
          <div>
            <h3 className="text-base font-semibold text-slate-900 mb-3">Amenities & Features</h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
              {property.amenities.map((amenity, i) => (
                <div key={i} className="flex items-center gap-2.5 text-xs text-slate-700 p-2.5 rounded-lg bg-slate-50 border border-slate-100">
                  <CheckCircle2 className="w-4 h-4 text-indigo-600 shrink-0" />
                  <span>{amenity}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Rules and Policies */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 p-4 rounded-xl bg-slate-50 border border-slate-200 text-xs">
            <div className="flex items-start gap-3">
              <Car className="w-5 h-5 text-slate-500 shrink-0 mt-0.5" />
              <div>
                <div className="font-semibold text-slate-900">Parking & Storage</div>
                <div className="text-slate-600 mt-0.5">{property.parking}</div>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <Dog className="w-5 h-5 text-slate-500 shrink-0 mt-0.5" />
              <div>
                <div className="font-semibold text-slate-900">Pet Policy</div>
                <div className="text-slate-600 mt-0.5">{property.petPolicy}</div>
              </div>
            </div>
          </div>

          {/* Manager Contact & Direct Tour Schedule */}
          <div className="border-t border-slate-200 pt-6 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-full bg-indigo-100 text-indigo-700 font-bold flex items-center justify-center text-sm">
                {property.managerName.split(' ').map(n => n[0]).join('')}
              </div>
              <div>
                <div className="text-xs text-slate-500">Property Listed By</div>
                <div className="text-sm font-semibold text-slate-900">{property.managerName}</div>
                <div className="flex items-center gap-3 text-xs text-slate-500 mt-0.5">
                  <span className="flex items-center gap-1"><Mail className="w-3.5 h-3.5" /> {property.managerEmail}</span>
                  <span className="flex items-center gap-1"><Phone className="w-3.5 h-3.5" /> {property.managerPhone}</span>
                </div>
              </div>
            </div>

            <div className="flex items-center gap-3 w-full sm:w-auto">
              {onOpenMessages && (
                <button
                  onClick={() => onOpenMessages(property.managerId, property.title)}
                  className="flex-1 sm:flex-none px-4 py-2 text-xs font-medium text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-lg transition-colors flex items-center justify-center gap-2 cursor-pointer"
                >
                  <MessageSquare className="w-4 h-4" />
                  <span>Message Manager</span>
                </button>
              )}

              {currentUser.role === 'tenant' && property.status === 'available' && onApply && (
                <button
                  onClick={() => onApply(property)}
                  className="flex-1 sm:flex-none px-5 py-2 text-xs font-semibold text-white bg-indigo-600 hover:bg-indigo-700 rounded-lg transition-colors flex items-center justify-center gap-2 shadow-xs cursor-pointer"
                >
                  <FileText className="w-4 h-4" />
                  <span>Apply for Rental</span>
                </button>
              )}
            </div>
          </div>

          {/* Quick Schedule Tour Box */}
          <div className="p-4 rounded-xl border border-slate-200 bg-white">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div>
                <h4 className="text-sm font-semibold text-slate-900">Request an On-Site or Virtual Tour</h4>
                <p className="text-xs text-slate-500 mt-0.5">Select a preferred inspection date to schedule with the property manager.</p>
              </div>

              {tourBooked ? (
                <div className="text-xs text-emerald-700 font-medium flex items-center gap-1.5 bg-emerald-50 px-3 py-2 rounded-lg">
                  <CheckCircle2 className="w-4 h-4" />
                  <span>Tour requested for {tourDate}! The manager will confirm via email.</span>
                </div>
              ) : (
                <form onSubmit={handleBookTour} className="flex items-center gap-2">
                  <input
                    type="date"
                    value={tourDate}
                    onChange={e => setTourDate(e.target.value)}
                    className="px-3 py-1.5 text-xs border border-slate-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-indigo-500"
                    required
                  />
                  <button
                    type="submit"
                    className="px-4 py-1.5 text-xs font-medium text-slate-900 bg-slate-100 hover:bg-slate-200 rounded-lg transition-colors cursor-pointer"
                  >
                    Request Tour
                  </button>
                </form>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
