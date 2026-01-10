'use client';

import { useState } from 'react';
import { X, Download, Copy, CheckCircle, FileText } from 'lucide-react';
import { toast } from 'react-hot-toast';

interface ContractPreviewModalProps {
  isOpen: boolean;
  onClose: () => void;
  contractData: {
    sellerName: string;
    buyerName: string;
    propertyAddress: string;
    offerAmount: string;
    earnestMoney: string;
    closingDate: string;
    inspectionPeriod: string;
  };
  contractText: string;
  contractTitle: string;
}

export default function ContractPreviewModal({
  isOpen,
  onClose,
  contractData,
  contractText,
  contractTitle
}: ContractPreviewModalProps) {
  const [copied, setCopied] = useState(false);

  if (!isOpen) return null;

  const copyToClipboard = async () => {
    try {
      await navigator.clipboard.writeText(contractText);
      setCopied(true);
      toast.success('✅ Contract copied to clipboard!');
      setTimeout(() => setCopied(false), 2000);
    } catch {
      toast.error('Failed to copy');
    }
  };

  const downloadContract = () => {
    const element = document.createElement('a');
    const file = new Blob([contractText], { type: 'text/plain' });
    element.href = URL.createObjectURL(file);
    element.download = `${contractTitle.replace(/\s+/g, '_')}_${new Date().toLocaleDateString().replace(/\//g, '-')}.txt`;
    document.body.appendChild(element);
    element.click();
    document.body.removeChild(element);
    URL.revokeObjectURL(element.href);
    toast.success('📄 Contract downloaded!');
  };

  const downloadPDF = async () => {
    try {
      const { jsPDF } = await import('jspdf');
      const doc = new jsPDF('p', 'pt', 'letter');
      
      const pageWidth = doc.internal.pageSize.getWidth();
      const pageHeight = doc.internal.pageSize.getHeight();
      const margin = 60;
      const lineHeight = 14;
      const maxLineWidth = pageWidth - (margin * 2);
      
      let currentY = margin;

      // Add header
      doc.setFontSize(20);
      doc.setFont('helvetica', 'bold');
      doc.setTextColor(218, 165, 32); // Gold
      doc.text('PASSIVE PILOT', margin, currentY);
      currentY += 10;
      doc.setFontSize(10);
      doc.setTextColor(128, 128, 128);
      doc.text('Professional Real Estate Contract', margin, currentY);
      currentY += 30;

      // Add title
      doc.setFontSize(18);
      doc.setFont('helvetica', 'bold');
      doc.setTextColor(0, 0, 0);
      const titleLines = doc.splitTextToSize(contractTitle.toUpperCase(), maxLineWidth);
      titleLines.forEach((line: string) => {
        doc.text(line, margin, currentY);
        currentY += 22;
      });
      currentY += 10;

      // Add date
      doc.setFontSize(10);
      doc.setFont('helvetica', 'normal');
      doc.setTextColor(100, 100, 100);
      doc.text(`Generated: ${new Date().toLocaleString()}`, margin, currentY);
      currentY += 30;

      // Add separator
      doc.setDrawColor(218, 165, 32);
      doc.setLineWidth(2);
      doc.line(margin, currentY, pageWidth - margin, currentY);
      currentY += 25;

      // Add content
      doc.setFontSize(11);
      doc.setFont('helvetica', 'normal');
      doc.setTextColor(0, 0, 0);

      const lines = contractText.split('\n');
      for (let i = 0; i < lines.length; i++) {
        const line = lines[i];
        
        if (currentY > pageHeight - margin - 30) {
          doc.addPage();
          currentY = margin;
          
          doc.setFontSize(9);
          doc.setTextColor(128, 128, 128);
          const pageInfo = doc.getCurrentPageInfo();
          doc.text(`Page ${pageInfo.pageNumber}`, pageWidth / 2, pageHeight - 30, { align: 'center' });
          doc.setFontSize(11);
          doc.setTextColor(0, 0, 0);
        }

        if (line.trim() === '') {
          currentY += lineHeight / 2;
          continue;
        }

        if (line.match(/^[A-Z\s]+:$/) || line.match(/^\d+\./)) {
          doc.setFont('helvetica', 'bold');
        } else {
          doc.setFont('helvetica', 'normal');
        }

        const wrappedLines = doc.splitTextToSize(line, maxLineWidth);
        wrappedLines.forEach((wrappedLine: string) => {
          if (currentY > pageHeight - margin - 30) {
            doc.addPage();
            currentY = margin;
          }
          doc.text(wrappedLine, margin, currentY);
          currentY += lineHeight;
        });
      }



      // Save PDF
      doc.save(`${contractTitle.replace(/\s+/g, '_')}_${new Date().toLocaleDateString().replace(/\//g, '-')}.pdf`);
      toast.success('📄 PDF downloaded!');
    } catch (error) {
      console.error('PDF generation error:', error);
      toast.error('Failed to generate PDF');
    }
  };

  return (
    <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-fade-in">
      <div className="relative w-full max-w-5xl max-h-[90vh] flex flex-col bg-gradient-to-br from-black via-gray-900 to-black border-2 border-amber-500/50 rounded-3xl shadow-2xl overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-5 bg-gradient-to-r from-amber-500/10 to-yellow-500/10 border-b-2 border-amber-500/30">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 bg-gradient-to-br from-amber-500 to-yellow-600 rounded-xl flex items-center justify-center shadow-lg">
              <FileText className="w-6 h-6 text-black" />
            </div>
            <div>
              <h2 className="text-2xl font-serif font-bold bg-gradient-to-r from-amber-400 to-yellow-500 bg-clip-text text-transparent">
                {contractTitle}
              </h2>
              <p className="text-sm text-gray-400 font-poppins">Review and download your contract</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-xl hover:bg-white/10 transition-all text-amber-400 hover:text-amber-300"
            type="button"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        {/* Summary Cards */}
        <div className="px-6 py-4 grid grid-cols-2 md:grid-cols-4 gap-3 bg-black/40 border-b border-amber-500/20">
          <div className="p-3 bg-gradient-to-br from-black to-gray-900 border border-amber-500/30 rounded-xl">
            <p className="text-xs text-gray-400 font-poppins mb-1">Property</p>
            <p className="text-sm font-montserrat font-semibold text-white truncate">{contractData.propertyAddress || 'N/A'}</p>
          </div>
          <div className="p-3 bg-gradient-to-br from-black to-gray-900 border border-emerald-500/30 rounded-xl">
            <p className="text-xs text-gray-400 font-poppins mb-1">Offer Amount</p>
            <p className="text-sm font-montserrat font-semibold text-emerald-400">
              ${contractData.offerAmount ? parseInt(contractData.offerAmount).toLocaleString() : 'N/A'}
            </p>
          </div>
          <div className="p-3 bg-gradient-to-br from-black to-gray-900 border border-blue-500/30 rounded-xl">
            <p className="text-xs text-gray-400 font-poppins mb-1">Earnest Money</p>
            <p className="text-sm font-montserrat font-semibold text-blue-400">
              ${contractData.earnestMoney ? parseInt(contractData.earnestMoney).toLocaleString() : 'N/A'}
            </p>
          </div>
          <div className="p-3 bg-gradient-to-br from-black to-gray-900 border border-purple-500/30 rounded-xl">
            <p className="text-xs text-gray-400 font-poppins mb-1">Closing Date</p>
            <p className="text-sm font-montserrat font-semibold text-purple-400">{contractData.closingDate || 'TBD'}</p>
          </div>
        </div>

        {/* Contract Content */}
        <div className="flex-1 overflow-y-auto px-6 py-6 bg-black/20">
          <pre className="text-sm text-gray-300 font-mono leading-relaxed whitespace-pre-wrap">
            {contractText}
          </pre>
        </div>

        {/* Action Buttons */}
        <div className="px-6 py-5 bg-gradient-to-r from-amber-500/10 to-yellow-500/10 border-t-2 border-amber-500/30">
          <div className="flex flex-col sm:flex-row items-center gap-3">
            <button
              onClick={downloadPDF}
              className="w-full sm:w-auto px-6 py-4 bg-gradient-to-r from-amber-500 via-yellow-500 to-amber-600 hover:from-amber-600 hover:via-yellow-600 hover:to-amber-700 text-black font-bold text-base rounded-xl transition-all transform hover:scale-105 active:scale-95 shadow-xl shadow-amber-500/30 flex items-center justify-center gap-2 touch-manipulation"
              type="button"
            >
              <Download className="w-5 h-5" />
              Download PDF
            </button>
            <button
              onClick={downloadContract}
              className="w-full sm:w-auto px-6 py-4 bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white font-bold text-base rounded-xl transition-all transform hover:scale-105 active:scale-95 shadow-lg flex items-center justify-center gap-2 touch-manipulation"
              type="button"
            >
              <FileText className="w-5 h-5" />
              Download TXT
            </button>
            <button
              onClick={copyToClipboard}
              className="w-full sm:w-auto px-6 py-4 bg-gradient-to-r from-purple-600 to-purple-700 hover:from-purple-700 hover:to-purple-800 text-white font-bold text-base rounded-xl transition-all transform hover:scale-105 active:scale-95 shadow-lg flex items-center justify-center gap-2 touch-manipulation"
              type="button"
            >
              {copied ? <CheckCircle className="w-5 h-5" /> : <Copy className="w-5 h-5" />}
              {copied ? 'Copied!' : 'Copy Text'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
