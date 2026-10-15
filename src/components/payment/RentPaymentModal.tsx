import React, { useState } from 'react';
import { LeaseAgreement } from '../../types';
import { useRealEstate } from '../../context/RealEstateContext';
import { formatINR } from '../../utils/format';
import {
  X,
  CreditCard,
  Building,
  CheckCircle2,
  Lock,
  ArrowRight,
  Printer,
  ShieldCheck,
  Smartphone,
  QrCode
} from 'lucide-react';

interface RentPaymentModalProps {
  lease: LeaseAgreement;
  onClose: () => void;
  onSuccess: () => void;
}

type IndianPaymentMethod =
  | 'UPI (GPay / PhonePe / Paytm)'
  | 'Net Banking (IMPS / NEFT)'
  | 'Debit / Credit Card (RuPay/Visa)'
  | 'Direct RTGS Wire';

export const RentPaymentModal: React.FC<RentPaymentModalProps> = ({
  lease,
  onClose,
  onSuccess
}) => {
  const { processRentPayment } = useRealEstate();

  const [method, setMethod] = useState<IndianPaymentMethod>('UPI (GPay / PhonePe / Paytm)');
  const [upiId, setUpiId] = useState('aarav.patel@okhdfcbank');
  const [selectedBank, setSelectedBank] = useState('HDFC Bank');
  const [isProcessing, setIsProcessing] = useState(false);
  const [receipt, setReceipt] = useState<{ receiptNumber: string; date: string } | null>(null);

  const handlePay = (e: React.FormEvent) => {
    e.preventDefault();
    setIsProcessing(true);

    setTimeout(() => {
      processRentPayment(lease.id, lease.monthlyRent, method);
      setIsProcessing(false);
      setReceipt({
        receiptNumber: `REC-MH-${new Date().getFullYear()}-${Math.floor(1000 + Math.random() * 9000)}`,
        date: new Date().toISOString().split('T')[0],
      });
    }, 1200);
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto">
      <div
        className="bg-white rounded-2xl max-w-lg w-full max-h-[92vh] overflow-y-auto shadow-2xl border border-slate-200 relative my-6 text-slate-800"
        onClick={e => e.stopPropagation()}
      >
        <div className="p-6 border-b border-slate-200 flex items-center justify-between sticky top-0 bg-white z-10">
          <div>
            <h2 className="text-base font-bold text-slate-900">
              {receipt ? 'Tax Invoice & Rent Receipt' : 'Pay Monthly Rent'}
            </h2>
            <p className="text-xs text-slate-500 mt-0.5">
              {lease.propertyTitle} · Mumbai, India
            </p>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-slate-600 rounded-lg hover:bg-slate-100 transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {receipt ? (
          <div className="p-6 sm:p-8 space-y-6">
            <div className="text-center space-y-2">
              <div className="w-14 h-14 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center mx-auto">
                <CheckCircle2 className="w-8 h-8" />
              </div>
              <h3 className="text-lg font-bold text-slate-900">Payment Successful</h3>
              <p className="text-xs text-slate-500">
                Your rent payment has been received and logged under RERA & Model Tenancy registry.
              </p>
            </div>

            {/* Official Indian Receipt Sheet */}
            <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 space-y-3 text-xs">
              <div className="flex items-center justify-between pb-2 border-b border-slate-200">
                <span className="text-slate-500">Official Receipt #</span>
                <span className="font-mono tabular-nums font-semibold text-slate-900">{receipt.receiptNumber}</span>
              </div>
              <div className="flex items-center justify-between pb-2 border-b border-slate-200">
                <span className="text-slate-500">Payment Date</span>
                <span className="font-mono tabular-nums text-slate-800">{receipt.date}</span>
              </div>
              <div className="flex items-center justify-between pb-2 border-b border-slate-200">
                <span className="text-slate-500">Payment Mode</span>
                <span className="text-slate-800 font-medium">{method}</span>
              </div>
              <div className="flex items-center justify-between pb-2 border-b border-slate-200">
                <span className="text-slate-500">Premises</span>
                <span className="text-slate-800 truncate max-w-[200px]">{lease.propertyTitle}</span>
              </div>
              <div className="flex items-center justify-between pt-1 text-sm font-bold text-slate-900">
                <span>Total Amount Paid</span>
                <span className="font-mono tabular-nums text-emerald-700">₹{formatINR(lease.monthlyRent)} INR</span>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <button
                onClick={() => window.print()}
                className="flex-1 py-2 text-xs font-medium text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-lg transition-colors flex items-center justify-center gap-1.5 cursor-pointer"
              >
                <Printer className="w-3.5 h-3.5" />
                <span>Print Official Receipt</span>
              </button>
              <button
                onClick={() => {
                  onSuccess();
                  onClose();
                }}
                className="flex-1 py-2 text-xs font-semibold text-white bg-orange-600 hover:bg-orange-700 rounded-lg transition-colors cursor-pointer"
              >
                Done
              </button>
            </div>
          </div>
        ) : (
          <form onSubmit={handlePay} className="p-6 space-y-6">
            {/* Amount Banner in Rupees */}
            <div className="p-4 rounded-xl bg-slate-900 text-white flex items-center justify-between">
              <div>
                <div className="text-xs text-slate-400 font-medium">Monthly Rent Due</div>
                <div className="text-2xl font-bold font-mono tabular-nums text-white mt-0.5">
                  ₹{formatINR(lease.monthlyRent)}
                </div>
              </div>
              <div className="text-right text-xs">
                <div className="text-slate-400">Due By</div>
                <div className="font-semibold text-white mt-0.5 font-mono tabular-nums">{lease.nextRentDue}</div>
              </div>
            </div>

            {/* Indian Payment Method Selector */}
            <div className="space-y-3">
              <label className="block text-xs font-semibold uppercase tracking-wider text-slate-500">
                Select Indian Payment Gateway
              </label>

              <div className="space-y-2">
                {/* UPI Option */}
                <label
                  onClick={() => setMethod('UPI (GPay / PhonePe / Paytm)')}
                  className={`flex flex-col p-3 rounded-xl border text-xs cursor-pointer transition-colors ${
                    method === 'UPI (GPay / PhonePe / Paytm)'
                      ? 'bg-orange-50/60 border-orange-500'
                      : 'bg-white border-slate-200 hover:bg-slate-50'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2.5">
                      <Smartphone className="w-4 h-4 text-orange-600" />
                      <span className="font-semibold text-slate-900">Instant UPI Payment</span>
                    </div>
                    <span className="text-[11px] font-medium text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded">
                      Zero Surcharge (0%)
                    </span>
                  </div>
                  {method === 'UPI (GPay / PhonePe / Paytm)' && (
                    <div className="mt-2.5 pt-2 border-t border-orange-200/60 flex items-center gap-2">
                      <input
                        type="text"
                        value={upiId}
                        onChange={e => setUpiId(e.target.value)}
                        placeholder="username@okhdfcbank"
                        className="flex-1 px-2.5 py-1.5 text-xs border border-slate-300 rounded-md bg-white focus:outline-none focus:ring-1 focus:ring-orange-500"
                      />
                      <span className="text-[11px] text-slate-500 shrink-0">GPay / PhonePe / Paytm</span>
                    </div>
                  )}
                </label>

                {/* Net Banking */}
                <label
                  onClick={() => setMethod('Net Banking (IMPS / NEFT)')}
                  className={`flex flex-col p-3 rounded-xl border text-xs cursor-pointer transition-colors ${
                    method === 'Net Banking (IMPS / NEFT)'
                      ? 'bg-orange-50/60 border-orange-500'
                      : 'bg-white border-slate-200 hover:bg-slate-50'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2.5">
                      <Building className="w-4 h-4 text-orange-600" />
                      <span className="font-semibold text-slate-900">Net Banking (IMPS / NEFT)</span>
                    </div>
                    <span className="text-[11px] text-slate-500">Direct Bank Debit</span>
                  </div>
                  {method === 'Net Banking (IMPS / NEFT)' && (
                    <div className="mt-2.5 pt-2 border-t border-orange-200/60">
                      <select
                        value={selectedBank}
                        onChange={e => setSelectedBank(e.target.value)}
                        className="w-full px-2.5 py-1.5 text-xs border border-slate-300 rounded-md bg-white"
                      >
                        <option value="HDFC Bank">HDFC Bank</option>
                        <option value="State Bank of India">State Bank of India (SBI)</option>
                        <option value="ICICI Bank">ICICI Bank</option>
                        <option value="Axis Bank">Axis Bank</option>
                        <option value="Kotak Mahindra Bank">Kotak Mahindra Bank</option>
                      </select>
                    </div>
                  )}
                </label>

                {/* RuPay / Cards */}
                <label
                  onClick={() => setMethod('Debit / Credit Card (RuPay/Visa)')}
                  className={`flex items-center justify-between p-3 rounded-xl border text-xs cursor-pointer transition-colors ${
                    method === 'Debit / Credit Card (RuPay/Visa)'
                      ? 'bg-orange-50/60 border-orange-500'
                      : 'bg-white border-slate-200 hover:bg-slate-50'
                  }`}
                >
                  <div className="flex items-center gap-2.5">
                    <CreditCard className="w-4 h-4 text-orange-600" />
                    <div>
                      <div className="font-semibold text-slate-900">RuPay, Visa, Mastercard</div>
                      <div className="text-slate-500 text-[11px]">All Indian debit and credit cards</div>
                    </div>
                  </div>
                  <span className="text-[11px] text-slate-500">Standard</span>
                </label>
              </div>
            </div>

            {/* RBI / NPCI Security note */}
            <div className="flex items-center gap-2 text-xs text-slate-500 bg-slate-50 p-3 rounded-lg border border-slate-200">
              <ShieldCheck className="w-4 h-4 text-emerald-600 shrink-0" />
              <span>Payments routed via RBI-authorized NPCI / Bharat BillPay switch with automated HRA receipt issuance.</span>
            </div>

            {/* Action buttons */}
            <div className="pt-2 flex items-center justify-end gap-3">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 text-xs font-medium text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-lg transition-colors cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={isProcessing}
                className="px-5 py-2.5 text-xs font-semibold text-white bg-orange-600 hover:bg-orange-700 disabled:bg-orange-400 rounded-lg transition-colors shadow-xs flex items-center gap-2 cursor-pointer"
              >
                {isProcessing ? (
                  <span>Processing Payment via NPCI...</span>
                ) : (
                  <>
                    <Lock className="w-3.5 h-3.5" />
                    <span>Pay ₹{formatINR(lease.monthlyRent)} via {method.split(' ')[0]}</span>
                  </>
                )}
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
};
