import React, { useMemo, useRef, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { useBooking } from '../context/BookingContext';
import { format, parseISO } from 'date-fns';
import { formatTime12h } from '../lib/utils';
import { FUTSAL_HIVE_LOGO } from '../lib/constants';
import { Printer, ArrowLeft, Download } from 'lucide-react';
import jsPDF from 'jspdf';
import { domToPng } from 'modern-screenshot';

export default function Invoice() {
  const { id } = useParams<{ id: string }>();
  const { bookings, loading } = useBooking();
  const invoiceRef = useRef<HTMLDivElement>(null);
  const [isDownloading, setIsDownloading] = useState(false);

  const booking = useMemo(() => {
    return bookings.find(b => b.id === id);
  }, [bookings, id]);

  const handleDownloadPDF = async () => {
    if (!invoiceRef.current || !booking) return;
    
    try {
      setIsDownloading(true);
      const dataUrl = await domToPng(invoiceRef.current, {
        scale: 2,
        backgroundColor: '#ffffff',
      });
      
      const pdf = new jsPDF({
        orientation: 'portrait',
        unit: 'mm',
        format: 'a4'
      });
      
      const pdfWidth = pdf.internal.pageSize.getWidth();
      
      // Calculate height based on A4 ratio and image aspect ratio
      const img = new Image();
      img.src = dataUrl;
      
      await new Promise((resolve) => {
        img.onload = resolve;
      });
      
      const pdfHeight = (img.height * pdfWidth) / img.width;
      
      pdf.addImage(dataUrl, 'PNG', 0, 0, pdfWidth, pdfHeight);
      pdf.save(`invoice-${booking.id}.pdf`);
    } catch (error) {
      console.error('Error generating PDF:', error);
      alert('Failed to generate PDF. Please try again.');
    } finally {
      setIsDownloading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <div className="w-12 h-12 border-4 border-hive-yellow border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (!booking) {
    return (
      <div className="min-h-screen bg-white flex flex-col items-center justify-center text-hive-black p-4">
        <h2 className="text-2xl font-black uppercase tracking-widest mb-4">Invoice Not Found</h2>
        <Link to="/" className="text-blue-500 hover:underline flex items-center gap-2">
          <ArrowLeft size={16} /> Return Home
        </Link>
      </div>
    );
  }

  const totalPaid = booking.status === 'paid' ? booking.price : (booking.advanceAmount || 0);
  const dueAmount = booking.price - totalPaid > 0 ? booking.price - totalPaid : 0;

  return (
    <div className="min-h-screen pt-32 pb-20 px-4 flex justify-center print:p-0 print:bg-white">
      <div className="max-w-3xl w-full">
        {/* Actions (Hidden on Print) */}
        <div className="flex flex-col sm:flex-row justify-between items-center gap-4 mb-6 print:hidden">
          <button 
            onClick={() => window.history.back()}
            className="flex items-center gap-2 text-white/50 hover:text-white transition-colors font-bold uppercase text-xs w-full sm:w-auto justify-center bg-white/5 sm:bg-transparent py-4 sm:py-0 rounded-xl"
          >
            <ArrowLeft size={16} /> Back
          </button>
          <div className="flex flex-col sm:flex-row items-center gap-3 w-full sm:w-auto">
            <button 
              onClick={handleDownloadPDF}
              disabled={isDownloading}
              className="flex items-center justify-center gap-2 bg-hive-yellow text-hive-black px-6 py-4 rounded-xl font-black uppercase text-sm hover:bg-yellow-400 hover:scale-105 active:scale-95 transition-all shadow-xl shadow-hive-yellow/20 w-full sm:w-auto disabled:opacity-50 disabled:pointer-events-none"
            >
              {isDownloading ? (
                <div className="w-5 h-5 border-2 border-hive-black border-t-transparent rounded-full animate-spin" />
              ) : (
                <Download size={18} />
              )}
              {isDownloading ? 'Generating...' : 'Download PDF'}
            </button>
            <button 
              onClick={() => window.print()}
              className="flex items-center justify-center gap-2 bg-white/10 text-white px-6 py-4 rounded-xl font-black uppercase text-sm hover:bg-white/20 transition-all w-full sm:w-auto"
            >
              <Printer size={18} /> Print
            </button>
          </div>
        </div>

        {/* Visible Invoice Paper */}
        <div className="bg-white p-6 sm:p-12 shadow-2xl rounded-2xl print:shadow-none print:rounded-none relative overflow-hidden">
          {/* Header */}
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center border-b-2 border-gray-100 pb-8 mb-8 gap-6">
            <div className="flex items-center gap-4">
              <div className="p-1 bg-hive-yellow rounded-xl shadow-md">
                <img src={FUTSAL_HIVE_LOGO} alt="Futsal Hive" className="w-16 h-16 rounded-lg object-cover" />
              </div>
              <div>
                <h1 className="text-3xl sm:text-4xl font-display font-black text-hive-black uppercase tracking-tighter">Futsal Hive</h1>
                <p className="text-gray-500 text-xs font-bold uppercase tracking-widest">Belive in your joy.</p>
              </div>
            </div>
            <div className="text-left sm:text-right w-full sm:w-auto font-mono bg-gray-50 p-4 sm:p-0 sm:bg-transparent rounded-xl">
              <h2 className="text-xl sm:text-2xl font-black text-gray-300 uppercase tracking-widest mb-1 sm:mb-2">Invoice</h2>
              <p className="text-sm font-bold text-gray-800">#{booking.id.slice(-6).toUpperCase()}</p>
              <p className="text-xs text-gray-500 mt-1">Date: {format(new Date(), 'MMM dd, yyyy')}</p>
            </div>
          </div>

          {/* User Info */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 mb-8">
            <div className="bg-gray-50 p-6 rounded-xl border border-gray-100">
              <p className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-2">Billed To:</p>
              <h3 className="text-xl font-black text-hive-black uppercase">{booking.userName}</h3>
              <p className="text-sm text-gray-600 font-medium font-mono mt-1">{booking.userPhone}</p>
            </div>
            <div className="bg-gray-50 p-6 rounded-xl border border-gray-100 text-left sm:text-right flex flex-col justify-center">
              <p className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-2">Payment Details:</p>
              <div className="flex flex-col sm:items-end gap-1">
                <div className="flex items-center justify-start sm:justify-end gap-2">
                  <span className="text-xs text-gray-400 font-bold uppercase">Status:</span>
                  <span className="text-lg font-black uppercase tracking-widest" style={{ color: booking.status === 'paid' ? '#22c55e' : booking.status === 'cancelled' ? '#ef4444' : '#eab308' }}>
                    {booking.status}
                  </span>
                </div>
                {booking.paymentMethod && (
                  <div className="flex items-center justify-start sm:justify-end gap-2 mt-1">
                    <span className="text-[10px] text-gray-400 font-bold uppercase tracking-widest">Method:</span>
                    <span className="text-xs font-black text-gray-700 bg-gray-200 px-2 py-0.5 rounded uppercase tracking-wider">{booking.paymentMethod}</span>
                  </div>
                )}
                {booking.transactionId && (
                  <div className="mt-1">
                    <span className="text-xs text-gray-500 font-mono bg-white px-2 py-1 rounded inline-block border border-gray-200 shadow-sm">
                      TXN: {booking.transactionId}
                    </span>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Booking Details Table */}
          <div className="mb-8">
            <div className="bg-white rounded-xl overflow-x-auto border border-gray-200 shadow-sm">
              <table className="w-full text-left border-collapse min-w-[500px]">
                <thead>
                  <tr className="bg-gray-100 border-b border-gray-200">
                    <th className="py-4 px-6 text-xs font-bold text-gray-500 uppercase tracking-widest">Description</th>
                    <th className="py-4 px-6 text-xs font-bold text-gray-500 uppercase tracking-widest text-right">Amount</th>
                  </tr>
                </thead>
                <tbody className="text-sm font-medium text-gray-800">
                  <tr className="border-b border-gray-100 hover:bg-gray-50 transition-colors">
                    <td className="py-6 px-6">
                      <p className="font-black text-hive-black text-lg mb-1 uppercase tracking-tight">Arena Booking</p>
                      <div className="inline-flex items-center gap-2 px-3 py-1 bg-gray-100 rounded-md text-gray-600 font-bold font-mono text-xs mt-2">
                        <span>{format(parseISO(booking.date), 'MMM dd, yyyy')}</span>
                        <span className="w-1 h-1 bg-gray-300 rounded-full"></span>
                        <span>{formatTime12h(booking.startTime)} - {formatTime12h(booking.endTime)}</span>
                      </div>
                    </td>
                    <td className="py-6 px-6 text-right text-xl font-black text-hive-black">
                      ৳{booking.price + (booking.discountAmount || 0)}
                    </td>
                  </tr>
                  
                  {booking.discountAmount ? (
                    <tr className="border-b border-green-100 bg-green-50/30">
                      <td className="py-4 px-6 text-green-700 flex items-center gap-2 font-bold uppercase text-xs tracking-widest">
                        Discount Applied
                        {booking.couponCode && (
                          <span className="px-2 py-1 bg-green-200/50 text-green-800 rounded font-mono font-black border border-green-200/50">
                            {booking.couponCode}
                          </span>
                        )}
                      </td>
                      <td className="py-4 px-6 text-right text-green-700 font-black text-lg">
                        - ৳{booking.discountAmount}
                      </td>
                    </tr>
                  ) : null}

                  {(booking.advanceAmount || 0) > 0 ? (
                    <tr className="border-b border-blue-100 bg-blue-50/30">
                      <td className="py-4 px-6 text-blue-700 font-bold uppercase text-xs tracking-widest">
                        Advance Payment
                      </td>
                      <td className="py-4 px-6 text-right text-blue-700 font-black text-lg">
                        - ৳{booking.advanceAmount}
                      </td>
                    </tr>
                  ) : null}

                  {booking.status === 'paid' ? (
                    <tr className="border-b border-blue-100 bg-blue-50/30">
                      <td className="py-4 px-6 text-blue-700 font-bold uppercase text-xs tracking-widest">
                        {(booking.advanceAmount || 0) > 0 ? 'Remaining Balance Paid' : 'Amount Paid'}
                      </td>
                      <td className="py-4 px-6 text-right text-blue-700 font-black text-lg">
                        - ৳{booking.price - (booking.advanceAmount || 0)}
                      </td>
                    </tr>
                  ) : null}
                </tbody>
              </table>
            </div>
          </div>

          {/* Totals */}
          <div className="flex flex-col sm:flex-row justify-end items-center sm:items-end border-t-4 border-hive-black pt-6 gap-6">
            <div className="w-full sm:w-80">
              <div className="flex justify-between items-center mb-3 px-4">
                <span className="text-gray-500 font-bold uppercase text-xs tracking-widest">Subtotal:</span>
                <span className="font-bold text-gray-800 font-mono text-lg">৳{booking.price}</span>
              </div>
              {dueAmount > 0 && (
                <div className="flex justify-between items-center bg-hive-black text-white p-4 rounded-xl shadow-lg mt-2">
                  <span className="font-black text-white uppercase tracking-tighter text-lg">Amount Due</span>
                  <span className="font-black text-hive-yellow text-2xl font-mono">৳{dueAmount}</span>
                </div>
              )}
            </div>
          </div>

          {/* Footer Text */}
          <div className="mt-12 text-center border-t border-gray-100 pt-8 relative">
            <div className="absolute top-0 left-1/2 -translate-x-1/2 -translate-y-1/2 bg-white px-4">
              <span className="text-hive-yellow/40">⚽⚽⚽</span>
            </div>
            <p className="text-xs text-gray-800 font-black uppercase tracking-widest">Thank you for playing at Futsal Hive!</p>
            <p className="text-[10px] text-gray-400 mt-2 max-w-md mx-auto font-bold leading-relaxed">
              China Project, Aftabnagar, Dhaka, Bangladesh, 1212 • contact@futsalhive.com • +880 1711-000000<br/>
              Please arrive at least 15 minutes prior to your booking. Terms and conditions apply. 
              For any queries, please communicate with management.
            </p>
          </div>
        </div>

        {/* Hidden Desktop-Sized Invoice specifically for PDF generation */}
        <div className="fixed -left-[9999px] top-0 pointer-events-none" aria-hidden="true">
          <div ref={invoiceRef} className="bg-white p-12 relative overflow-hidden w-[800px] font-sans">
            <div className="flex flex-row justify-between items-center border-b-2 border-gray-100 pb-8 mb-8 gap-6">
              <div className="flex items-center gap-4">
                <div className="p-1 bg-hive-yellow rounded-xl shadow-md">
                  <img src={FUTSAL_HIVE_LOGO} alt="Futsal Hive" className="w-16 h-16 rounded-lg object-cover" />
                </div>
                <div>
                  <h1 className="text-4xl font-display font-black text-hive-black uppercase tracking-tighter">Futsal Hive</h1>
                  <p className="text-gray-500 text-xs font-bold uppercase tracking-widest">Belive in your joy.</p>
                </div>
              </div>
              <div className="text-right w-auto font-mono bg-transparent rounded-xl">
                <h2 className="text-2xl font-black text-gray-300 uppercase tracking-widest mb-2">Invoice</h2>
                <p className="text-sm font-bold text-gray-800">#{booking.id.slice(-6).toUpperCase()}</p>
                <p className="text-xs text-gray-500 mt-1">Date: {format(new Date(), 'MMM dd, yyyy')}</p>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-6 mb-8">
              <div className="bg-gray-50 p-6 rounded-xl border border-gray-100">
                <p className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-2">Billed To:</p>
                <h3 className="text-xl font-black text-hive-black uppercase">{booking.userName}</h3>
                <p className="text-sm text-gray-600 font-medium font-mono mt-1">{booking.userPhone}</p>
              </div>
              <div className="bg-gray-50 p-6 rounded-xl border border-gray-100 text-right flex flex-col justify-center">
                <p className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-2">Payment Details:</p>
                <div className="flex flex-col items-end gap-1">
                  <div className="flex items-center justify-end gap-2">
                    <span className="text-xs text-gray-400 font-bold uppercase">Status:</span>
                    <span className="text-lg font-black uppercase tracking-widest" style={{ color: booking.status === 'paid' ? '#22c55e' : booking.status === 'cancelled' ? '#ef4444' : '#eab308' }}>
                      {booking.status}
                    </span>
                  </div>
                  {booking.paymentMethod && (
                    <div className="flex items-center justify-end gap-2 mt-1">
                      <span className="text-[10px] text-gray-400 font-bold uppercase tracking-widest">Method:</span>
                      <span className="text-xs font-black text-gray-700 bg-gray-200 px-2 py-0.5 rounded uppercase tracking-wider">{booking.paymentMethod}</span>
                    </div>
                  )}
                  {booking.transactionId && (
                    <div className="mt-1 text-right">
                      <span className="text-xs text-gray-500 font-mono bg-white px-2 py-1 rounded inline-block border border-gray-200">
                        TXN: {booking.transactionId}
                      </span>
                    </div>
                  )}
                </div>
              </div>
            </div>

            <div className="mb-8">
              <div className="bg-white rounded-xl overflow-hidden border border-gray-200 shadow-sm">
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="bg-gray-100 border-b border-gray-200">
                      <th className="py-4 px-6 text-xs font-bold text-gray-500 uppercase tracking-widest">Description</th>
                      <th className="py-4 px-6 text-xs font-bold text-gray-500 uppercase tracking-widest text-right">Amount</th>
                    </tr>
                  </thead>
                  <tbody className="text-sm font-medium text-gray-800">
                    <tr className="border-b border-gray-100 hover:bg-gray-50 transition-colors">
                      <td className="py-6 px-6">
                        <p className="font-black text-hive-black text-lg mb-1 uppercase tracking-tight">Arena Booking</p>
                        <div className="inline-flex items-center gap-2 px-3 py-1 bg-gray-100 rounded-md text-gray-600 font-bold font-mono text-xs mt-2">
                          <span>{format(parseISO(booking.date), 'MMM dd, yyyy')}</span>
                          <span className="w-1 h-1 bg-gray-300 rounded-full"></span>
                          <span>{formatTime12h(booking.startTime)} - {formatTime12h(booking.endTime)}</span>
                        </div>
                      </td>
                      <td className="py-6 px-6 text-right text-xl font-black text-hive-black">
                        ৳{booking.price + (booking.discountAmount || 0)}
                      </td>
                    </tr>
                    
                    {booking.discountAmount ? (
                      <tr className="border-b border-green-100 bg-green-50/30">
                        <td className="py-4 px-6 text-green-700 flex items-center gap-2 font-bold uppercase text-xs tracking-widest">
                          Discount Applied
                          {booking.couponCode && (
                            <span className="px-2 py-1 bg-green-200/50 text-green-800 rounded font-mono font-black border border-green-200/50">
                              {booking.couponCode}
                            </span>
                          )}
                        </td>
                        <td className="py-4 px-6 text-right text-green-700 font-black text-lg">
                          - ৳{booking.discountAmount}
                        </td>
                      </tr>
                    ) : null}

                    {(booking.advanceAmount || 0) > 0 ? (
                      <tr className="border-b border-blue-100 bg-blue-50/30">
                        <td className="py-4 px-6 text-blue-700 font-bold uppercase text-xs tracking-widest">
                          Advance Payment
                        </td>
                        <td className="py-4 px-6 text-right text-blue-700 font-black text-lg">
                          - ৳{booking.advanceAmount}
                        </td>
                      </tr>
                    ) : null}

                    {booking.status === 'paid' ? (
                      <tr className="border-b border-blue-100 bg-blue-50/30">
                        <td className="py-4 px-6 text-blue-700 font-bold uppercase text-xs tracking-widest">
                          {(booking.advanceAmount || 0) > 0 ? 'Remaining Balance Paid' : 'Amount Paid'}
                        </td>
                        <td className="py-4 px-6 text-right text-blue-700 font-black text-lg">
                          - ৳{booking.price - (booking.advanceAmount || 0)}
                        </td>
                      </tr>
                    ) : null}
                  </tbody>
                </table>
              </div>
            </div>

            <div className="flex flex-row justify-end items-end border-t-4 border-hive-black pt-6 gap-6">
              <div className="w-80">
                <div className="flex justify-between items-center mb-3 px-4">
                  <span className="text-gray-500 font-bold uppercase text-xs tracking-widest">Subtotal:</span>
                  <span className="font-bold text-gray-800 font-mono text-lg">৳{booking.price}</span>
                </div>
                {dueAmount > 0 && (
                  <div className="flex justify-between items-center bg-hive-black text-white p-4 rounded-xl shadow-lg mt-2">
                    <span className="font-black text-white uppercase tracking-tighter text-lg">Amount Due</span>
                    <span className="font-black text-hive-yellow text-2xl font-mono">৳{dueAmount}</span>
                  </div>
                )}
              </div>
            </div>

            <div className="mt-12 text-center border-t border-gray-100 pt-8 relative">
              <div className="absolute top-0 left-1/2 -translate-x-1/2 -translate-y-1/2 bg-white px-4">
                <span className="text-hive-yellow/40">⚽⚽⚽</span>
              </div>
              <p className="text-xs text-gray-800 font-black uppercase tracking-widest">Thank you for playing at Futsal Hive!</p>
              <p className="text-[10px] text-gray-400 mt-2 max-w-md mx-auto font-bold leading-relaxed">
                China Project, Aftabnagar, Dhaka, Bangladesh, 1212 • contact@futsalhive.com • +880 1711-000000<br/>
                Please arrive at least 15 minutes prior to your booking. Terms and conditions apply. 
                For any queries, please communicate with management.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
