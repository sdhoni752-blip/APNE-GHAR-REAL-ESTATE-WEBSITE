import React, { useState } from 'react';
import { Property } from '../../types';
import { useRealEstate } from '../../context/RealEstateContext';
import { formatINR } from '../../utils/format';
import { X, FileText, CheckCircle2 } from 'lucide-react';

interface RentalApplicationModalProps {
  property: Property;
  onClose: () => void;
  onSuccess: () => void;
}

export const RentalApplicationModal: React.FC<RentalApplicationModalProps> = ({
  property,
  onClose,
  onSuccess
}) => {
  const { currentUser, submitApplication } = useRealEstate();

  const [applicantName, setApplicantName] = useState(currentUser.name);
  const [applicantEmail, setApplicantEmail] = useState(currentUser.email);
  const [applicantPhone, setApplicantPhone] = useState(currentUser.phone);
  const [employer, setEmployer] = useState('Infosys Technologies Ltd');
  const [occupation, setOccupation] = useState('Principal Software Architect');
  const [monthlyIncome, setMonthlyIncome] = useState('280000');
  const [creditScore, setCreditScore] = useState('785');
  const [moveInDate, setMoveInDate] = useState('2026-11-01');
  const [occupantsCount, setOccupantsCount] = useState('2');
  const [pets, setPets] = useState('None');
  const [notes, setNotes] = useState('Aadhaar and PAN KYC available. Verified rental history with prompt digital payments.');
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    submitApplication({
      propertyId: property.id,
      propertyTitle: property.title,
      propertyAddress: `${property.address}, ${property.city}, ${property.state}`,
      propertyImage: property.image,
      monthlyRent: property.price,
      applicantId: currentUser.id,
      applicantName,
      applicantEmail,
      applicantPhone,
      employer,
      occupation,
      monthlyIncome: Number(monthlyIncome),
      creditScore: Number(creditScore),
      moveInDate,
      occupantsCount: Number(occupantsCount),
      pets,
      notes,
      managerId: property.managerId,
    });

    setSubmitted(true);
    setTimeout(() => {
      onSuccess();
    }, 1500);
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto">
      <div
        className="bg-white rounded-2xl max-w-2xl w-full max-h-[92vh] overflow-y-auto shadow-2xl border border-slate-200 relative my-6"
        onClick={e => e.stopPropagation()}
      >
        <div className="p-6 border-b border-slate-200 flex items-center justify-between sticky top-0 bg-white z-10">
          <div>
            <h2 className="text-lg font-bold text-slate-900">
              Submit Rental Application
            </h2>
            <p className="text-xs text-slate-500 mt-0.5">
              Applying for {property.title} (₹{formatINR(property.price)}/mo)
            </p>
          </div>
          <button
            onClick={onClose}
            className="p-2 text-slate-400 hover:text-slate-600 rounded-lg hover:bg-slate-100 transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {submitted ? (
          <div className="p-12 text-center space-y-4">
            <div className="w-16 h-16 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center mx-auto">
              <CheckCircle2 className="w-8 h-8" />
            </div>
            <h3 className="text-xl font-bold text-slate-900">Application Submitted!</h3>
            <p className="text-sm text-slate-600 max-w-md mx-auto">
              Your rental application has been sent directly to <strong>{property.managerName}</strong>. You can track status in your Tenant Portal.
            </p>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="p-6 space-y-6">
            {/* Property Summary Preview */}
            <div className="flex items-center gap-4 p-3 rounded-xl bg-slate-50 border border-slate-200">
              <img
                src={property.image}
                alt={property.title}
                referrerPolicy="no-referrer"
                className="w-16 h-16 rounded-lg object-cover shrink-0"
              />
              <div className="text-xs">
                <div className="font-semibold text-slate-900 text-sm">{property.title}</div>
                <div className="text-slate-500 mt-0.5">{property.address}, {property.city}</div>
                <div className="text-slate-700 font-mono tabular-nums font-medium mt-1">
                  ₹{formatINR(property.price)}/month · Security Deposit: ₹{formatINR(property.securityDeposit)}
                </div>
              </div>
            </div>

            {/* Applicant Personal Information */}
            <div className="space-y-4">
              <h3 className="text-xs font-semibold uppercase tracking-wider text-slate-400">Applicant Details</h3>
              
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-medium text-slate-700 mb-1">Full Name</label>
                  <input
                    type="text"
                    required
                    value={applicantName}
                    onChange={e => setApplicantName(e.target.value)}
                    className="w-full px-3 py-2 text-sm border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-slate-700 mb-1">Email Address</label>
                  <input
                    type="email"
                    required
                    value={applicantEmail}
                    onChange={e => setApplicantEmail(e.target.value)}
                    className="w-full px-3 py-2 text-sm border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-700 mb-1">Primary Phone</label>
                <input
                  type="tel"
                  required
                  value={applicantPhone}
                  onChange={e => setApplicantPhone(e.target.value)}
                  className="w-full px-3 py-2 text-sm border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
                />
              </div>
            </div>

            {/* Financial & Background */}
            <div className="space-y-4 pt-4 border-t border-slate-200">
              <h3 className="text-xs font-semibold uppercase tracking-wider text-slate-400">Employment & Financials</h3>
              
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-medium text-slate-700 mb-1">Current Employer</label>
                  <input
                    type="text"
                    required
                    value={employer}
                    onChange={e => setEmployer(e.target.value)}
                    className="w-full px-3 py-2 text-sm border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-slate-700 mb-1">Job Title / Occupation</label>
                  <input
                    type="text"
                    required
                    value={occupation}
                    onChange={e => setOccupation(e.target.value)}
                    className="w-full px-3 py-2 text-sm border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                <div>
                  <label className="block text-xs font-medium text-slate-700 mb-1">Monthly Gross (₹)</label>
                  <input
                    type="number"
                    required
                    min="1"
                    value={monthlyIncome}
                    onChange={e => setMonthlyIncome(e.target.value)}
                    className="w-full px-3 py-2 text-sm font-mono tabular-nums border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-medium text-slate-700 mb-1">CIBIL / Credit Score</label>
                  <input
                    type="number"
                    required
                    min="300"
                    max="900"
                    value={creditScore}
                    onChange={e => setCreditScore(e.target.value)}
                    className="w-full px-3 py-2 text-sm font-mono tabular-nums border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-medium text-slate-700 mb-1">Move-In Date</label>
                  <input
                    type="date"
                    required
                    value={moveInDate}
                    onChange={e => setMoveInDate(e.target.value)}
                    className="w-full px-3 py-2 text-sm border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-medium text-slate-700 mb-1">Occupants Count</label>
                  <input
                    type="number"
                    required
                    min="1"
                    value={occupantsCount}
                    onChange={e => setOccupantsCount(e.target.value)}
                    className="w-full px-3 py-2 text-sm font-mono tabular-nums border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-700 mb-1">Pets (Breed & Age, or 'None')</label>
                <input
                  type="text"
                  value={pets}
                  onChange={e => setPets(e.target.value)}
                  className="w-full px-3 py-2 text-sm border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-700 mb-1">Additional Notes & References</label>
                <textarea
                  rows={2}
                  value={notes}
                  onChange={e => setNotes(e.target.value)}
                  className="w-full px-3 py-2 text-sm border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
                />
              </div>
            </div>

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
                className="px-5 py-2 text-xs font-semibold text-white bg-indigo-600 hover:bg-indigo-700 rounded-lg transition-colors shadow-xs cursor-pointer flex items-center gap-1.5"
              >
                <FileText className="w-4 h-4" />
                <span>Submit Rental Application</span>
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
};
