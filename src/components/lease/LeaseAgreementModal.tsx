import React, { useState } from 'react';
import { LeaseAgreement } from '../../types';
import { useRealEstate } from '../../context/RealEstateContext';
import { formatINR } from '../../utils/format';
import {
  X,
  FileText,
  CheckCircle2,
  Printer,
  Calendar,
  Building,
  PenTool,
  Clock
} from 'lucide-react';

interface LeaseAgreementModalProps {
  lease: LeaseAgreement;
  onClose: () => void;
}

export const LeaseAgreementModal: React.FC<LeaseAgreementModalProps> = ({
  lease,
  onClose
}) => {
  const { currentUser, signLease } = useRealEstate();
  const [signatureName, setSignatureName] = useState(currentUser.name);
  const [signedSuccess, setSignedSuccess] = useState(false);

  const canManagerSign =
    (currentUser.role === 'manager' || currentUser.role === 'admin') && !lease.signedByManager;
  const canTenantSign =
    (currentUser.role === 'tenant' || currentUser.role === 'admin') && !lease.signedByTenant;

  const handleSign = (role: 'manager' | 'tenant') => {
    signLease(lease.id, role);
    setSignedSuccess(true);
    setTimeout(() => setSignedSuccess(false), 3000);
  };

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto">
      <div
        className="bg-white rounded-2xl max-w-3xl w-full max-h-[92vh] overflow-y-auto shadow-2xl border border-slate-200 relative my-6 text-slate-800"
        onClick={e => e.stopPropagation()}
      >
        {/* Top Control Bar */}
        <div className="p-4 sm:p-6 border-b border-slate-200 flex items-center justify-between sticky top-0 bg-white z-10 print:hidden">
          <div className="flex items-center gap-2">
            <FileText className="w-5 h-5 text-indigo-600" />
            <h2 className="text-base font-bold text-slate-900">
              Residential Lease Agreement #{lease.id}
            </h2>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={handlePrint}
              className="px-3 py-1.5 text-xs font-medium text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-lg transition-colors flex items-center gap-1.5 cursor-pointer"
            >
              <Printer className="w-3.5 h-3.5" />
              <span>Print / Export</span>
            </button>
            <button
              onClick={onClose}
              className="p-1.5 text-slate-400 hover:text-slate-600 rounded-lg hover:bg-slate-100 transition-colors cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Legal Document Sheet */}
        <div className="p-8 sm:p-12 space-y-8 bg-white font-sans text-xs leading-relaxed print:p-0">
          {/* Header Seal */}
          <div className="text-center border-b border-slate-200 pb-6 space-y-1">
            <div className="text-xs uppercase tracking-widest text-slate-500 font-semibold">Official Legal Instrument</div>
            <h1 className="text-xl sm:text-2xl font-bold text-slate-900">RESIDENTIAL TENANCY AGREEMENT</h1>
            <p className="text-slate-500 text-xs">
              Conforming to Model Tenancy Act (MTA) & State Rent Authority Norms · Reg ID: {lease.id}
            </p>
          </div>

          {/* Parties Section */}
          <div className="space-y-3">
            <h3 className="font-bold text-slate-900 uppercase tracking-wide border-b border-slate-100 pb-1">
              1. PARTIES & PREMISES
            </h3>
            <p>
              This Residential Tenancy Agreement (&quot;Agreement&quot;) is executed and registered as of the commencement date indicated below by and between:
            </p>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 p-4 rounded-lg bg-slate-50 border border-slate-200">
              <div>
                <span className="font-semibold text-slate-900 block">LESSOR / PROPERTY MANAGER:</span>
                <span className="text-slate-700 block mt-0.5">{lease.managerName}</span>
                <span className="text-slate-500 block">Authorized Representative for Property Owner</span>
              </div>
              <div>
                <span className="font-semibold text-slate-900 block">LESSEE / PRIMARY TENANT:</span>
                <span className="text-slate-700 block mt-0.5">{lease.tenantName}</span>
                <span className="text-slate-500 block">{lease.tenantEmail}</span>
              </div>
            </div>
            <p>
              Lessor leases to Lessee and Lessee leases from Lessor the real property located at:
              <br />
              <strong className="text-slate-900">{lease.propertyTitle}</strong>, situated at <strong className="text-slate-900">{lease.propertyAddress}</strong> (&quot;Premises&quot;).
            </p>
          </div>

          {/* Lease Term */}
          <div className="space-y-3">
            <h3 className="font-bold text-slate-900 uppercase tracking-wide border-b border-slate-100 pb-1">
              2. TERM & TENANCY DURATION
            </h3>
            <div className="grid grid-cols-2 gap-4 p-3 bg-slate-50 rounded-lg border border-slate-200">
              <div>
                <span className="text-slate-500 block">Lease Commencement Date:</span>
                <strong className="text-slate-900 font-mono tabular-nums text-sm">{lease.startDate}</strong>
              </div>
              <div>
                <span className="text-slate-500 block">Lease Expiration Date:</span>
                <strong className="text-slate-900 font-mono tabular-nums text-sm">{lease.endDate}</strong>
              </div>
            </div>
            <p>
              Upon expiration of the initial term, this Agreement shall convert to a month-to-month tenancy unless either party provides at least thirty (30) days prior written notice of termination.
            </p>
          </div>

          {/* Rent & Deposit */}
          <div className="space-y-3">
            <h3 className="font-bold text-slate-900 uppercase tracking-wide border-b border-slate-100 pb-1">
              3. RENT, DUE DATES & SECURITY DEPOSIT
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 p-3 bg-slate-50 rounded-lg border border-slate-200">
              <div>
                <span className="text-slate-500 block">Monthly Base Rent:</span>
                <span className="text-lg font-bold text-slate-900 font-mono tabular-nums">
                  ₹{formatINR(lease.monthlyRent)} INR
                </span>
                <span className="text-slate-500 block mt-0.5">Payable on or before the 5th day of each calendar month</span>
              </div>
              <div>
                <span className="text-slate-500 block">Refundable Security Deposit:</span>
                <span className="text-lg font-bold text-slate-900 font-mono tabular-nums">
                  ₹{formatINR(lease.securityDeposit)} INR
                </span>
                <span className="text-slate-500 block mt-0.5">Held in designated tenant escrow account</span>
              </div>
            </div>
          </div>

          {/* Specific Terms & Clauses */}
          <div className="space-y-3">
            <h3 className="font-bold text-slate-900 uppercase tracking-wide border-b border-slate-100 pb-1">
              4. STANDARD COVENANTS & PROVISIONS
            </h3>
            <ol className="list-decimal list-inside space-y-2 text-slate-700 pl-1">
              {lease.clauses.map((clause, idx) => (
                <li key={idx} className="pl-1">
                  <span className="text-slate-800">{clause}</span>
                </li>
              ))}
            </ol>
          </div>

          {/* Digital Signatures Execution Block */}
          <div className="space-y-4 pt-6 border-t-2 border-slate-300">
            <h3 className="font-bold text-slate-900 uppercase tracking-wide">
              5. EXECUTION & DIGITAL SIGNATURES
            </h3>
            <p className="text-slate-500 text-[11px]">
              By digital signature below, both parties confirm having read, understood, and agreed to all provisions and terms within this residential lease contract.
            </p>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 pt-2">
              {/* Manager Signature Box */}
              <div className="p-4 rounded-xl border border-slate-200 bg-slate-50 space-y-3">
                <div className="text-xs font-semibold text-slate-900">LESSOR / MANAGER SIGNATURE</div>
                {lease.signedByManager ? (
                  <div className="space-y-1">
                    <div className="font-serif italic text-lg text-indigo-900 border-b border-indigo-200 pb-1">
                      {lease.managerName}
                    </div>
                    <div className="flex items-center gap-1.5 text-[11px] text-emerald-700 font-medium pt-1">
                      <CheckCircle2 className="w-3.5 h-3.5" />
                      <span>Digitally Verified & Signed · {lease.signedByManagerAt}</span>
                    </div>
                  </div>
                ) : (
                  <div className="space-y-2">
                    <div className="text-slate-400 italic py-2 border-b border-dashed border-slate-300">
                      Pending signature from {lease.managerName}
                    </div>
                    {canManagerSign && (
                      <button
                        onClick={() => handleSign('manager')}
                        className="w-full py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg text-xs font-semibold transition-colors flex items-center justify-center gap-1.5 cursor-pointer"
                      >
                        <PenTool className="w-3.5 h-3.5" />
                        <span>Sign as Property Manager</span>
                      </button>
                    )}
                  </div>
                )}
              </div>

              {/* Tenant Signature Box */}
              <div className="p-4 rounded-xl border border-slate-200 bg-slate-50 space-y-3">
                <div className="text-xs font-semibold text-slate-900">LESSEE / TENANT SIGNATURE</div>
                {lease.signedByTenant ? (
                  <div className="space-y-1">
                    <div className="font-serif italic text-lg text-indigo-900 border-b border-indigo-200 pb-1">
                      {lease.tenantName}
                    </div>
                    <div className="flex items-center gap-1.5 text-[11px] text-emerald-700 font-medium pt-1">
                      <CheckCircle2 className="w-3.5 h-3.5" />
                      <span>Digitally Verified & Signed · {lease.signedByTenantAt}</span>
                    </div>
                  </div>
                ) : (
                  <div className="space-y-2">
                    <div className="text-slate-400 italic py-2 border-b border-dashed border-slate-300">
                      Pending signature from {lease.tenantName}
                    </div>
                    {canTenantSign && (
                      <button
                        onClick={() => handleSign('tenant')}
                        className="w-full py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg text-xs font-semibold transition-colors flex items-center justify-center gap-1.5 cursor-pointer"
                      >
                        <PenTool className="w-3.5 h-3.5" />
                        <span>Sign as Tenant</span>
                      </button>
                    )}
                  </div>
                )}
              </div>
            </div>

            {signedSuccess && (
              <div className="p-3 bg-emerald-50 text-emerald-800 rounded-lg text-xs font-medium flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                <span>Agreement successfully signed and verified in the central ledger!</span>
              </div>
            )}
          </div>
        </div>

        {/* Footer info */}
        <div className="p-4 sm:p-6 border-t border-slate-200 bg-slate-50 flex items-center justify-between text-xs text-slate-500 rounded-b-2xl print:hidden">
          <div>
            Status: <strong className="capitalize text-slate-800">{lease.status}</strong> · Next Rent Due:{' '}
            <span className="font-mono tabular-nums">{lease.nextRentDue}</span>
          </div>
          <button
            onClick={onClose}
            className="px-4 py-2 text-xs font-medium text-slate-700 bg-white border border-slate-300 hover:bg-slate-100 rounded-lg transition-colors cursor-pointer"
          >
            Close Agreement
          </button>
        </div>
      </div>
    </div>
  );
};
