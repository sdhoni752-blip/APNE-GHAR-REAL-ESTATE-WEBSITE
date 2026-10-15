import React, { useState } from 'react';
import { Property, PropertyType } from '../../types';
import { useRealEstate } from '../../context/RealEstateContext';
import { X, Building2, Image as ImageIcon, Plus, Check } from 'lucide-react';

interface PropertyListingFormModalProps {
  propertyToEdit?: Property | null;
  onClose: () => void;
}

const PRESET_IMAGES = [
  { label: 'Mumbai Sea View Penthouse', url: '/src/assets/images/indian_highrise_mumbai_1792050460172.jpg' },
  { label: 'Bengaluru Garden Villa', url: '/src/assets/images/indian_villa_bengaluru_1792050460174.jpg' },
  { label: 'Gurgaon Sky Penthouse', url: '/src/assets/images/indian_penthouse_delhi_1792050461076.jpg' },
  { label: 'Pune Heritage Bungalow', url: '/src/assets/images/indian_bungalow_pune_1792050460839.jpg' },
];

const COMMON_AMENITIES = [
  '100% DG Power Backup',
  'Piped PNG Gas Connection',
  '24x7 Multi-Tier Security & CCTV',
  'Covered Podium Car Parking',
  'Private Garden / Balcony',
  'Club House & Swimming Pool',
  'Rooftop Solar Water Heating',
  'Italian Botticino Marble Flooring',
  'Modular Kitchen with Chimney',
  'Dedicated Servant Quarters',
  'Pet Friendly Society',
  'High-Speed OTIS Elevators'
];

export const PropertyListingFormModal: React.FC<PropertyListingFormModalProps> = ({
  propertyToEdit,
  onClose
}) => {
  const { currentUser, addProperty, updateProperty } = useRealEstate();

  const [title, setTitle] = useState(propertyToEdit?.title || '');
  const [address, setAddress] = useState(propertyToEdit?.address || '');
  const [city, setCity] = useState(propertyToEdit?.city || 'Mumbai');
  const [state, setState] = useState(propertyToEdit?.state || 'Maharashtra');
  const [zip, setZip] = useState(propertyToEdit?.zip || '400001');
  const [type, setType] = useState<PropertyType>(propertyToEdit?.type || 'Apartment');
  const [price, setPrice] = useState(propertyToEdit?.price?.toString() || '75000');
  const [securityDeposit, setSecurityDeposit] = useState(propertyToEdit?.securityDeposit?.toString() || '200000');
  const [bedrooms, setBedrooms] = useState(propertyToEdit?.bedrooms?.toString() || '3');
  const [bathrooms, setBathrooms] = useState(propertyToEdit?.bathrooms?.toString() || '3');
  const [sqft, setSqft] = useState(propertyToEdit?.sqft?.toString() || '1650');
  const [yearBuilt, setYearBuilt] = useState(propertyToEdit?.yearBuilt?.toString() || '2023');
  const [selectedImage, setSelectedImage] = useState(propertyToEdit?.image || PRESET_IMAGES[0].url);
  const [description, setDescription] = useState(
    propertyToEdit?.description ||
      'Impeccably appointed residential space featuring spacious Vastu-compliant layout, Italian marble flooring, modern modular kitchen with chimney, private viewing balcony, and premium amenities.'
  );
  const [amenities, setAmenities] = useState<string[]>(
    propertyToEdit?.amenities || [
      '100% DG Power Backup',
      'Piped PNG Gas Connection',
      'Covered Podium Car Parking'
    ]
  );
  const [parking, setParking] = useState(propertyToEdit?.parking || '1 Reserved Covered Stilt / Podium Parking');
  const [petPolicy, setPetPolicy] = useState(propertyToEdit?.petPolicy || 'Permitted with Society NOC registration');
  const [availableFrom, setAvailableFrom] = useState(propertyToEdit?.availableFrom || 'Immediate Move-In');

  const toggleAmenity = (item: string) => {
    if (amenities.includes(item)) {
      setAmenities(amenities.filter(a => a !== item));
    } else {
      setAmenities([...amenities, item]);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (propertyToEdit) {
      updateProperty(propertyToEdit.id, {
        title,
        address,
        city,
        state,
        zip,
        type,
        price: Number(price),
        securityDeposit: Number(securityDeposit),
        bedrooms: Number(bedrooms),
        bathrooms: Number(bathrooms),
        sqft: Number(sqft),
        yearBuilt: Number(yearBuilt),
        image: selectedImage,
        description,
        amenities,
        parking,
        petPolicy,
        availableFrom,
      });
    } else {
      addProperty({
        title,
        address,
        city,
        state,
        zip,
        type,
        price: Number(price),
        securityDeposit: Number(securityDeposit),
        bedrooms: Number(bedrooms),
        bathrooms: Number(bathrooms),
        sqft: Number(sqft),
        yearBuilt: Number(yearBuilt),
        image: selectedImage,
        description,
        amenities,
        parking,
        petPolicy,
        availableFrom,
        status: 'available',
        featured: false,
        managerId: currentUser.id,
        managerName: currentUser.name,
        managerEmail: currentUser.email,
        managerPhone: currentUser.phone,
      });
    }

    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto">
      <div
        className="bg-white rounded-2xl max-w-3xl w-full max-h-[92vh] overflow-y-auto shadow-2xl border border-slate-200 relative my-6"
        onClick={e => e.stopPropagation()}
      >
        <div className="p-6 border-b border-slate-200 flex items-center justify-between sticky top-0 bg-white z-10">
          <div>
            <h2 className="text-lg font-bold text-slate-900">
              {propertyToEdit ? 'Edit Property Listing' : 'Create New Property Listing'}
            </h2>
            <p className="text-xs text-slate-500 mt-0.5">
              Add property specifications, pricing, amenities, and photographic showcase.
            </p>
          </div>
          <button
            onClick={onClose}
            className="p-2 text-slate-400 hover:text-slate-600 rounded-lg hover:bg-slate-100 transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          {/* Basic Info */}
          <div className="space-y-4">
            <h3 className="text-xs font-semibold uppercase tracking-wider text-slate-400">Basic Information</h3>
            
            <div>
              <label className="block text-xs font-medium text-slate-700 mb-1">Listing Title</label>
              <input
                type="text"
                required
                value={title}
                onChange={e => setTitle(e.target.value)}
                placeholder="e.g. Modern Sunset Park Luxury Condo"
                className="w-full px-3 py-2 text-sm border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-medium text-slate-700 mb-1">Property Type</label>
                <select
                  value={type}
                  onChange={e => setType(e.target.value as PropertyType)}
                  className="w-full px-3 py-2 text-sm border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 bg-white"
                >
                  <option value="Apartment">Apartment</option>
                  <option value="House">Single Family House</option>
                  <option value="Condo">Condominium</option>
                  <option value="Townhome">Townhome</option>
                  <option value="Studio">Studio</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-700 mb-1">Street Address</label>
                <input
                  type="text"
                  required
                  value={address}
                  onChange={e => setAddress(e.target.value)}
                  placeholder="e.g. 520 Bell Street, Suite 4A"
                  className="w-full px-3 py-2 text-sm border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
                />
              </div>
            </div>

            <div className="grid grid-cols-3 gap-3">
              <div>
                <label className="block text-xs font-medium text-slate-700 mb-1">City</label>
                <input
                  type="text"
                  required
                  value={city}
                  onChange={e => setCity(e.target.value)}
                  className="w-full px-3 py-2 text-sm border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-slate-700 mb-1">State</label>
                <input
                  type="text"
                  required
                  value={state}
                  onChange={e => setState(e.target.value)}
                  className="w-full px-3 py-2 text-sm border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-slate-700 mb-1">Zip Code</label>
                <input
                  type="text"
                  required
                  value={zip}
                  onChange={e => setZip(e.target.value)}
                  className="w-full px-3 py-2 text-sm border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
                />
              </div>
            </div>
          </div>

          {/* Pricing & Dimensions */}
          <div className="space-y-4 pt-4 border-t border-slate-200">
            <h3 className="text-xs font-semibold uppercase tracking-wider text-slate-400">Pricing & Floor Specs</h3>
            
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
              <div>
                <label className="block text-xs font-medium text-slate-700 mb-1">Monthly Rent (₹)</label>
                <input
                  type="number"
                  required
                  min="1"
                  value={price}
                  onChange={e => setPrice(e.target.value)}
                  className="w-full px-3 py-2 text-sm font-mono tabular-nums border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-700 mb-1">Security Deposit (₹)</label>
                <input
                  type="number"
                  required
                  min="0"
                  value={securityDeposit}
                  onChange={e => setSecurityDeposit(e.target.value)}
                  className="w-full px-3 py-2 text-sm font-mono tabular-nums border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-700 mb-1">Bedrooms</label>
                <input
                  type="number"
                  required
                  min="0"
                  step="1"
                  value={bedrooms}
                  onChange={e => setBedrooms(e.target.value)}
                  className="w-full px-3 py-2 text-sm font-mono tabular-nums border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-700 mb-1">Bathrooms</label>
                <input
                  type="number"
                  required
                  min="1"
                  step="0.5"
                  value={bathrooms}
                  onChange={e => setBathrooms(e.target.value)}
                  className="w-full px-3 py-2 text-sm font-mono tabular-nums border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
                />
              </div>
            </div>

            <div className="grid grid-cols-3 gap-4">
              <div>
                <label className="block text-xs font-medium text-slate-700 mb-1">Square Footage</label>
                <input
                  type="number"
                  required
                  min="100"
                  value={sqft}
                  onChange={e => setSqft(e.target.value)}
                  className="w-full px-3 py-2 text-sm font-mono tabular-nums border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-700 mb-1">Year Built</label>
                <input
                  type="number"
                  required
                  value={yearBuilt}
                  onChange={e => setYearBuilt(e.target.value)}
                  className="w-full px-3 py-2 text-sm font-mono tabular-nums border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-700 mb-1">Available From</label>
                <input
                  type="text"
                  required
                  value={availableFrom}
                  onChange={e => setAvailableFrom(e.target.value)}
                  placeholder="Immediate or Date"
                  className="w-full px-3 py-2 text-sm border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
                />
              </div>
            </div>
          </div>

          {/* Photo Showcase Selector */}
          <div className="space-y-3 pt-4 border-t border-slate-200">
            <h3 className="text-xs font-semibold uppercase tracking-wider text-slate-400">Showcase Photography</h3>
            <p className="text-xs text-slate-500">Select an architectural photo asset for this listing.</p>
            
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              {PRESET_IMAGES.map((img, i) => (
                <div
                  key={i}
                  onClick={() => setSelectedImage(img.url)}
                  className={`group relative aspect-4/3 rounded-lg overflow-hidden border-2 cursor-pointer transition-all ${
                    selectedImage === img.url ? 'border-indigo-600 ring-2 ring-indigo-500/30' : 'border-slate-200 hover:border-slate-400'
                  }`}
                >
                  <img src={img.url} alt={img.label} className="w-full h-full object-cover" />
                  <div className="absolute inset-0 bg-black/40 flex items-end p-2">
                    <span className="text-[11px] font-medium text-white truncate">{img.label}</span>
                  </div>
                  {selectedImage === img.url && (
                    <div className="absolute top-1.5 right-1.5 w-5 h-5 rounded-full bg-indigo-600 text-white flex items-center justify-center">
                      <Check className="w-3.5 h-3.5" />
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>

          {/* Description */}
          <div className="space-y-2 pt-4 border-t border-slate-200">
            <label className="block text-xs font-medium text-slate-700">Detailed Description</label>
            <textarea
              rows={3}
              required
              value={description}
              onChange={e => setDescription(e.target.value)}
              className="w-full px-3 py-2 text-sm border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
            />
          </div>

          {/* Amenities checklist */}
          <div className="space-y-3 pt-4 border-t border-slate-200">
            <h3 className="text-xs font-semibold uppercase tracking-wider text-slate-400">Included Amenities</h3>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
              {COMMON_AMENITIES.map(amenity => {
                const checked = amenities.includes(amenity);
                return (
                  <button
                    key={amenity}
                    type="button"
                    onClick={() => toggleAmenity(amenity)}
                    className={`text-left p-2 rounded-lg text-xs flex items-center gap-2 border transition-colors cursor-pointer ${
                      checked
                        ? 'bg-indigo-50 border-indigo-200 text-indigo-900 font-medium'
                        : 'bg-white border-slate-200 text-slate-600 hover:bg-slate-50'
                    }`}
                  >
                    <div className={`w-4 h-4 rounded flex items-center justify-center border ${
                      checked ? 'bg-indigo-600 border-indigo-600 text-white' : 'border-slate-300'
                    }`}>
                      {checked && <Check className="w-3 h-3" />}
                    </div>
                    <span className="truncate">{amenity}</span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Policies */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-4 border-t border-slate-200">
            <div>
              <label className="block text-xs font-medium text-slate-700 mb-1">Parking Terms</label>
              <input
                type="text"
                value={parking}
                onChange={e => setParking(e.target.value)}
                className="w-full px-3 py-2 text-sm border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-slate-700 mb-1">Pet Policy</label>
              <input
                type="text"
                value={petPolicy}
                onChange={e => setPetPolicy(e.target.value)}
                className="w-full px-3 py-2 text-sm border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
              />
            </div>
          </div>

          {/* Action buttons */}
          <div className="pt-6 border-t border-slate-200 flex items-center justify-end gap-3 sticky bottom-0 bg-white">
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
              {propertyToEdit ? 'Save Changes' : 'Publish Listing'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
