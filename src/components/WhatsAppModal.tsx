import React, { useState } from 'react';
import { Send, Check, Copy, X } from 'lucide-react';
import { getWhatsAppUrl } from '../utils/whatsapp';

interface WhatsAppModalProps {
  isOpen: boolean;
  onClose: () => void;
  phone?: string;
  recipientName?: string;
  messageText: string;
  title?: string;
}

export const WhatsAppModal: React.FC<WhatsAppModalProps> = ({
  isOpen,
  onClose,
  phone,
  recipientName,
  messageText,
  title = 'Kirim Bukti Transaksi via WhatsApp?',
}) => {
  const [copied, setCopied] = useState(false);

  if (!isOpen) return null;

  const waUrl = getWhatsAppUrl(phone, messageText);

  const handleCopy = () => {
    navigator.clipboard.writeText(messageText);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleOpenWhatsApp = () => {
    // Open WhatsApp link in new window or directly
    window.open(waUrl, '_blank', 'noopener,noreferrer');
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in">
      <div className="bg-white rounded-2xl max-w-md w-full shadow-2xl overflow-hidden border border-slate-100">
        {/* Header */}
        <div className="bg-emerald-600 text-white px-5 py-4 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-full bg-white/20 flex items-center justify-center">
              <Send className="w-4 h-4 text-white" />
            </div>
            <div>
              <h3 className="font-bold text-base leading-snug">{title}</h3>
              <p className="text-xs text-emerald-100">
                {recipientName ? `Untuk: ${recipientName}` : 'Pilih kontak tujuan'}
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-white/80 hover:text-white p-1 rounded-full hover:bg-emerald-700 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Message Preview Box */}
        <div className="p-5">
          <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-2">
            Pratinjau Pesan:
          </p>
          <div className="bg-slate-50 border border-slate-200 rounded-xl p-3.5 text-xs text-slate-700 whitespace-pre-wrap font-mono leading-relaxed max-h-52 overflow-y-auto">
            {messageText}
          </div>

          {phone && (
            <p className="text-xs text-slate-500 mt-2.5 flex items-center gap-1.5">
              <span className="font-medium text-slate-700">Nomor WhatsApp:</span>
              <span className="font-mono bg-slate-100 px-1.5 py-0.5 rounded text-slate-800">
                {phone}
              </span>
            </p>
          )}

          {/* Action buttons */}
          <div className="grid grid-cols-2 gap-3 mt-5">
            <button
              onClick={handleCopy}
              className="flex items-center justify-center gap-2 py-2.5 px-3 border border-slate-300 rounded-xl text-xs font-semibold text-slate-700 hover:bg-slate-50 active:scale-95 transition-all"
            >
              {copied ? (
                <>
                  <Check className="w-4 h-4 text-emerald-600" />
                  <span className="text-emerald-700">Tersalin</span>
                </>
              ) : (
                <>
                  <Copy className="w-4 h-4" />
                  <span>Salin Teks</span>
                </>
              )}
            </button>

            <button
              onClick={handleOpenWhatsApp}
              className="flex items-center justify-center gap-2 py-2.5 px-3 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-semibold shadow-md shadow-emerald-600/20 active:scale-95 transition-all"
            >
              <Send className="w-4 h-4" />
              <span>Buka WhatsApp</span>
            </button>
          </div>

          <button
            onClick={onClose}
            className="w-full text-center mt-3 text-xs text-slate-500 hover:text-slate-800 py-1"
          >
            Tidak Sekarang / Tutup
          </button>
        </div>
      </div>
    </div>
  );
};
