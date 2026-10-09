import React, { useState } from 'react';
import type { PublicAlertTemplate } from '../../types/PublicAlert';
import { Megaphone, MessageSquare, Smartphone, Check, Copy } from 'lucide-react';

interface PublicAlertGeneratorProps {
  alert: PublicAlertTemplate;
  demoMode?: boolean;
}

export const PublicAlertGenerator: React.FC<PublicAlertGeneratorProps> = ({
  alert,
  demoMode = false
}) => {
  const [language, setLanguage] = useState<'english' | 'kannada'>('english');
  const [format, setFormat] = useState<'official' | 'sms' | 'whatsapp'>('official');
  const [copied, setCopied] = useState<boolean>(false);

  const activeContent = alert[language];

  const handleCopy = () => {
    let textToCopy = activeContent.body;
    if (format === 'sms') textToCopy = activeContent.sms_text;
    if (format === 'whatsapp') textToCopy = activeContent.whatsapp_text;

    navigator.clipboard.writeText(textToCopy);
    setCopied(true);
    setTimeout(() => setCopied(false), 2500);
  };

  return (
    <div className="bg-white border border-slate-200 rounded-lg p-5 shadow-sm font-mono text-xs space-y-4">
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between pb-3 mb-2 border-b border-slate-200 gap-2">
        <div className="flex items-center gap-2">
          <div className="p-1.5 rounded-md bg-orange-50 text-orange-700">
            <Megaphone className="w-4 h-4" />
          </div>
          <div>
            <h3 className="text-sm font-bold text-slate-900 tracking-wide uppercase">
              PUBLIC ALERT GENERATOR & MULTI-CHANNEL DISPATCH
            </h3>
            <span className="text-[10px] text-slate-500">
              Deterministic multilingual emergency broadcast generator (CAP & Telecom compliant)
            </span>
          </div>
        </div>

        {demoMode && (
          <div role="alert" className="rounded border border-red-300 bg-red-50 p-3 font-sans text-xs font-bold text-red-900">
            DEMO ONLY — synthetic content for internal review. Do not distribute or send as a public warning.
          </div>
        )}

        <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-blue-50 text-blue-700 border border-blue-200 uppercase">
          DRAFT ALERT TEMPLATE • NOT OFFICIAL
        </span>
      </div>

      {/* Control Buttons Bar: Language & Preview Formats */}
      <div className="flex flex-wrap items-center justify-between gap-3 bg-slate-50 p-2.5 rounded-md border border-slate-200">
        {/* Language Selection */}
        <div className="flex items-center gap-1.5">
          <span className="text-[10px] text-slate-500 font-bold uppercase mr-1">LANGUAGE:</span>
          <button
            type="button"
            onClick={() => setLanguage('english')}
            className={`px-3 py-1.5 rounded text-xs transition-colors cursor-pointer ${
              language === 'english'
                ? 'bg-blue-600 text-white font-bold shadow-2xs'
                : 'bg-white text-slate-700 border border-slate-300 hover:bg-slate-100'
            }`}
          >
            ENGLISH
          </button>
          <button
            type="button"
            onClick={() => setLanguage('kannada')}
            className={`px-3 py-1.5 rounded text-xs transition-colors cursor-pointer ${
              language === 'kannada'
                ? 'bg-blue-600 text-white font-bold shadow-2xs'
                : 'bg-white text-slate-700 border border-slate-300 hover:bg-slate-100'
            }`}
          >
            ಕನ್ನಡ (KANNADA)
          </button>
        </div>

        {/* Format Selection */}
        <div className="flex items-center gap-1.5">
          <span className="text-[10px] text-slate-500 font-bold uppercase mr-1">PREVIEW FORMAT:</span>
          <button
            type="button"
            onClick={() => setFormat('official')}
            className={`px-2.5 py-1.5 rounded text-[11px] transition-colors cursor-pointer ${
              format === 'official'
                ? 'bg-slate-800 text-white font-bold'
                : 'bg-white text-slate-700 border border-slate-300 hover:bg-slate-100'
            }`}
          >
            OFFICIAL BULLETIN
          </button>
          <button
            type="button"
            onClick={() => setFormat('sms')}
            className={`flex items-center gap-1 px-2.5 py-1.5 rounded text-[11px] transition-colors cursor-pointer ${
              format === 'sms'
                ? 'bg-slate-800 text-white font-bold'
                : 'bg-white text-slate-700 border border-slate-300 hover:bg-slate-100'
            }`}
          >
            <Smartphone className="w-3 h-3" />
            <span>SMS PREVIEW</span>
          </button>
          <button
            type="button"
            onClick={() => setFormat('whatsapp')}
            className={`flex items-center gap-1 px-2.5 py-1.5 rounded text-[11px] transition-colors cursor-pointer ${
              format === 'whatsapp'
                ? 'bg-emerald-700 text-white font-bold'
                : 'bg-white text-slate-700 border border-slate-300 hover:bg-slate-100'
            }`}
          >
            <MessageSquare className="w-3 h-3 text-emerald-600" />
            <span>WHATSAPP PREVIEW</span>
          </button>
        </div>
      </div>

      {/* Main Preview Container */}
      <div className="space-y-3">
        {format === 'official' && (
          <div className="bg-slate-50 border border-slate-200 rounded-lg p-4 space-y-3">
            <div className="flex items-center justify-between border-b border-slate-200 pb-2">
              <span className="text-sm font-bold text-slate-900">{activeContent.title}</span>
              <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-orange-100 text-orange-800 border border-orange-200">
                {alert.risk_level} RISK
              </span>
            </div>

            <div className="font-sans text-xs text-slate-800 leading-relaxed whitespace-pre-line bg-white p-3.5 rounded border border-slate-200">
              {activeContent.body}
            </div>

            <div className="flex items-center justify-between text-[11px] text-slate-600">
              <span className="font-semibold text-emerald-700">
                Advisory: {activeContent.advisory}
              </span>
              <button
                type="button"
                onClick={handleCopy}
                className="flex items-center gap-1 px-2.5 py-1 rounded bg-white hover:bg-slate-100 text-blue-700 border border-slate-300 font-mono text-[10px] font-bold cursor-pointer"
              >
                {copied ? <Check className="w-3 h-3 text-emerald-600" /> : <Copy className="w-3 h-3" />}
                <span>{copied ? 'COPIED' : 'COPY ADVISORY'}</span>
              </button>
            </div>
          </div>
        )}

        {/* SMS Preview Card */}
        {format === 'sms' && (
          <div className="bg-slate-100 border border-slate-300 rounded-xl p-4 max-w-lg mx-auto">
            <div className="flex items-center justify-between pb-2 mb-2 border-b border-slate-200 text-[10px] text-slate-500">
              <span className="flex items-center gap-1">
                <Smartphone className="w-3 h-3" />
                <span>GOV-NDMA • SMS Cell Broadcast</span>
              </span>
              <span>DRAFT TEMPLATE</span>
            </div>

            <div className="bg-white p-3.5 rounded-lg border border-slate-200 shadow-2xs space-y-2">
              <p className="font-sans text-xs text-slate-900 leading-normal">
                {activeContent.sms_text}
              </p>
              <div className="text-right text-[10px] text-slate-400">17:30 IST • 142 chars</div>
            </div>

            <div className="mt-3 flex justify-end">
              <button
                type="button"
                onClick={handleCopy}
                className="flex items-center gap-1 px-2.5 py-1 rounded bg-white hover:bg-slate-50 text-blue-700 border border-slate-300 text-[10px] font-bold cursor-pointer"
              >
                {copied ? <Check className="w-3 h-3" /> : <Copy className="w-3 h-3" />}
                <span>{copied ? 'COPIED' : 'COPY SMS'}</span>
              </button>
            </div>
          </div>
        )}

        {/* WhatsApp Preview Card */}
        {format === 'whatsapp' && (
          <div className="bg-[#EFEAE2] border border-[#D1D7DB] rounded-xl p-4 max-w-md mx-auto">
            <div className="bg-[#008069] text-white p-2 rounded-t-lg flex items-center justify-between text-xs">
              <div className="flex items-center gap-1.5 font-bold">
                <div className="w-5 h-5 rounded-full bg-white/20 flex items-center justify-center text-[10px]">
                  🛡
                </div>
                <span>DDMA Mangaluru Official Dispatch</span>
              </div>
              <span className="text-[10px] text-emerald-100">Verified</span>
            </div>

            <div className="bg-white p-3.5 rounded-b-lg shadow-xs space-y-2 font-sans text-xs text-slate-900">
              <div className="whitespace-pre-line leading-relaxed">
                {activeContent.whatsapp_text}
              </div>
              <div className="text-right text-[10px] text-slate-400 flex items-center justify-end gap-1">
                <span>17:30</span>
                <span className="text-blue-500 font-bold">✓✓</span>
              </div>
            </div>

            <div className="mt-2.5 flex justify-end">
              <button
                type="button"
                onClick={handleCopy}
                className="flex items-center gap-1 px-2.5 py-1 rounded bg-white hover:bg-slate-50 text-emerald-700 border border-emerald-300 text-[10px] font-bold cursor-pointer"
              >
                {copied ? <Check className="w-3 h-3" /> : <Copy className="w-3 h-3" />}
                <span>{copied ? 'COPIED' : 'COPY WHATSAPP DISPATCH'}</span>
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Footer Info */}
      <div className="pt-2 border-t border-slate-200 text-[10px] text-slate-500 flex items-center justify-between">
        <span>Ready for Common Alerting Protocol (CAP) and SMS gateway API integration</span>
        <span className="text-slate-400">DEMO ONLY</span>
      </div>
    </div>
  );
};
