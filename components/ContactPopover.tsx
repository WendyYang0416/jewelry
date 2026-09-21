'use client';

import { useState } from 'react';
import { FaWhatsapp, FaWeixin, FaEnvelope, FaCopy, FaCheck } from 'react-icons/fa6';

interface Props {
  whatsapp: string;
  wechat: string;
  email: string;
  labels: { whatsapp: string; wechat: string; email: string; copy: string; copied: string };
}

function buildWhatsAppLink(num: string) {
  const digits = num.replace(/[^\d]/g, '');
  return `https://wa.me/${digits}`;
}

function buildMailto(addr: string) {
  return `mailto:${addr}`;
}

export default function ContactPopover({ whatsapp, wechat, email, labels }: Props) {
  const [open, setOpen] = useState(false);
  const [copiedKey, setCopiedKey] = useState<string | null>(null);

  function copy(text: string, key: string) {
    navigator.clipboard.writeText(text).then(() => {
      setCopiedKey(key);
      setTimeout(() => setCopiedKey(null), 1500);
    });
  }

  const items = [
    { key: 'wa', icon: <FaWhatsapp className="text-green-600" />, label: labels.whatsapp, value: whatsapp, href: buildWhatsAppLink(whatsapp) },
    { key: 'wc', icon: <FaWeixin className="text-green-700" />, label: labels.wechat, value: wechat, href: undefined },
    { key: 'em', icon: <FaEnvelope className="text-brand-600" />, label: labels.email, value: email, href: buildMailto(email) },
  ];

  return (
    <div className="relative" onMouseLeave={() => setOpen(false)}>
      <button
        type="button"
        onMouseEnter={() => setOpen(true)}
        onClick={() => setOpen((v) => !v)}
        className="rounded-full bg-brand-600 px-4 py-1.5 text-sm font-medium text-white hover:bg-brand-700"
      >
        {labels.whatsapp.split(' ')[0] === 'WhatsApp' ? 'Contact us' : labels.whatsapp}
      </button>

      {open && (
        <div className="absolute end-0 mt-2 w-72 rounded-xl border border-brand-100 bg-white p-2 shadow-xl z-50">
          {items.map((it) => (
            <div key={it.key} className="flex items-center justify-between gap-2 rounded-lg px-3 py-2 hover:bg-brand-50">
              <div className="flex items-center gap-2 text-sm text-gray-700">
                {it.icon}
                <div className="flex flex-col">
                  <span className="text-xs text-gray-400">{it.label}</span>
                  <span className="font-mono">{it.value}</span>
                </div>
              </div>
              <div className="flex items-center gap-1">
                {it.href && (
                  <a
                    href={it.href}
                    target="_blank"
                    rel="noreferrer"
                    className="rounded-md bg-brand-600 px-2 py-1 text-xs text-white hover:bg-brand-700"
                  >
                    {it.key === 'wa' ? 'Chat' : it.key === 'em' ? 'Send' : 'Open'}
                  </a>
                )}
                <button
                  type="button"
                  onClick={() => copy(it.value, it.key)}
                  className="rounded-md border border-brand-200 p-1.5 text-brand-600 hover:bg-brand-50"
                  aria-label={labels.copy}
                  title={labels.copy}
                >
                  {copiedKey === it.key ? <FaCheck className="h-3 w-3 text-green-600" /> : <FaCopy className="h-3 w-3" />}
                </button>
              </div>
            </div>
          ))}
          <p className="px-3 py-1 text-[11px] text-gray-400">
            {copiedKey ? labels.copied : 'Click the icon to copy the account.'}
          </p>
        </div>
      )}
    </div>
  );
}
