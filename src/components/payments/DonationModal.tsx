import { useEffect, useRef, useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { ExternalLink, Heart, LoaderCircle, ShieldCheck, Sparkles, X, Zap } from 'lucide-react';

interface DonationModalProps {
  isOpen: boolean;
  onClose: () => void;
  movieTitle?: string;
}

const DONORBOX_SCRIPT_ID = 'donorbox-widget-script';
const DONORBOX_SCRIPT_SRC = 'https://donorbox.org/widgets.js';
const DONORBOX_CAMPAIGN = 'donate-932583';
const DONORBOX_HOSTED_URL = `https://donorbox.org/${DONORBOX_CAMPAIGN}`;

const supportHighlights = [
  {
    icon: Zap,
    title: 'Faster updates',
    description: 'New improvements, smoother browsing, and less rough edge cleanup debt.',
  },
  {
    icon: ShieldCheck,
    title: 'Keeps the lights on',
    description: 'Hosting, maintenance, and the day-to-day work behind the scenes.',
  },
  {
    icon: Sparkles,
    title: 'Helps us keep polishing',
    description: 'More time for the details that make the experience feel premium.',
  },
];

export default function DonationModal({ isOpen, onClose, movieTitle }: DonationModalProps) {
  const widgetContainerRef = useRef<HTMLDivElement | null>(null);
  const [isWidgetLoading, setIsWidgetLoading] = useState(true);

  useEffect(() => {
    if (!isOpen || typeof document === 'undefined') {
      return;
    }

    setIsWidgetLoading(true);

    const existingScript = document.getElementById(DONORBOX_SCRIPT_ID);
    if (!existingScript) {
      const script = document.createElement('script');
      script.id = DONORBOX_SCRIPT_ID;
      script.type = 'module';
      script.async = true;
      script.src = DONORBOX_SCRIPT_SRC;
      document.body.appendChild(script);
    }

    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';

    const observer = new MutationObserver(() => {
      const host = widgetContainerRef.current?.querySelector('dbox-widget');
      if (!host) {
        return;
      }

      const hasRenderedContent =
        host.childNodes.length > 0 ||
        Boolean((host as HTMLElement).shadowRoot?.childNodes.length);

      if (hasRenderedContent) {
        setIsWidgetLoading(false);
        observer.disconnect();
      }
    });

    if (widgetContainerRef.current) {
      observer.observe(widgetContainerRef.current, { childList: true, subtree: true });
    }

    const fallbackTimer = window.setTimeout(() => {
      setIsWidgetLoading(false);
    }, 6000);

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        onClose();
      }
    };

    window.addEventListener('keydown', handleKeyDown);

    return () => {
      document.body.style.overflow = previousOverflow;
      window.removeEventListener('keydown', handleKeyDown);
      observer.disconnect();
      window.clearTimeout(fallbackTimer);
    };
  }, [isOpen, onClose]);

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/78 p-3 backdrop-blur-md sm:p-5"
          onClick={onClose}
        >
          <motion.div
            initial={{ opacity: 0, y: 24, scale: 0.98 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 18, scale: 0.98 }}
            transition={{ duration: 0.24, ease: 'easeOut' }}
            className="relative max-h-[92vh] w-full max-w-6xl overflow-hidden rounded-[28px] border border-white/10 bg-neutral-950 shadow-[0_28px_90px_rgba(0,0,0,0.55)]"
            onClick={(event) => event.stopPropagation()}
          >
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_left,rgba(220,38,38,0.18),transparent_34%),radial-gradient(circle_at_bottom_right,rgba(250,204,21,0.08),transparent_24%)]" />

            <div className="relative flex items-center justify-between border-b border-white/10 px-5 py-4 sm:px-7 sm:py-5">
              <div className="flex min-w-0 items-center gap-3">
                <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl border border-white/10 bg-gradient-to-br from-red-500 to-red-700 shadow-lg shadow-red-950/40">
                  <Heart className="h-6 w-6 fill-white text-white" />
                </div>
                <div className="min-w-0">
                  <p className="text-[11px] font-semibold uppercase tracking-[0.28em] text-red-200/72">
                    Support Movie Night
                  </p>
                  <h2 className="truncate text-xl font-black text-white sm:text-2xl">Support us</h2>
                </div>
              </div>

              <button
                onClick={onClose}
                className="rounded-xl border border-white/10 bg-white/5 p-2 text-gray-300 transition-colors hover:bg-white/10 hover:text-white"
                aria-label="Close support popup"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <div className="relative grid max-h-[calc(92vh-73px)] gap-0 overflow-y-auto lg:grid-cols-[1.05fr_1.35fr]">
              <div className="border-b border-white/10 px-5 py-5 sm:px-7 sm:py-6 lg:border-b-0 lg:border-r">
                <div className="rounded-[24px] border border-red-400/15 bg-[linear-gradient(160deg,rgba(127,29,29,0.34),rgba(10,10,10,0.92))] p-5 sm:p-6">
                  <p className="max-w-xl text-balance text-2xl font-black leading-tight text-white sm:text-3xl">
                    Help keep the site fast, alive, and getting better.
                  </p>
                  <p className="mt-3 text-sm leading-6 text-gray-300 sm:text-base">
                    {movieTitle
                      ? `If "${movieTitle}" made your night better, this is a simple way to help us keep building for the next one.`
                      : 'If the app has been useful, your support gives us room to keep refining the experience instead of just patching it.'}
                  </p>

                  <div className="mt-5 flex flex-wrap gap-2">
                    <span className="rounded-full border border-white/10 bg-white/5 px-3 py-1 text-xs font-semibold text-white/90">
                      Secure checkout
                    </span>
                    <span className="rounded-full border border-white/10 bg-white/5 px-3 py-1 text-xs font-semibold text-white/90">
                      Powered by Donorbox
                    </span>
                    <span className="rounded-full border border-white/10 bg-white/5 px-3 py-1 text-xs font-semibold text-white/90">
                      One-time or recurring
                    </span>
                  </div>
                </div>

                <div className="mt-5 space-y-3">
                  {supportHighlights.map(({ icon: Icon, title, description }) => (
                    <motion.div
                      key={title}
                      initial={{ opacity: 0, x: -10 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ duration: 0.2 }}
                      className="rounded-2xl border border-white/8 bg-white/[0.03] p-4 transition-colors hover:bg-white/[0.05]"
                    >
                      <div className="flex items-start gap-3">
                        <div className="mt-0.5 flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-red-500/12 text-red-300">
                          <Icon className="h-5 w-5" />
                        </div>
                        <div>
                          <h3 className="text-sm font-bold text-white sm:text-base">{title}</h3>
                          <p className="mt-1 text-sm leading-6 text-gray-400">{description}</p>
                        </div>
                      </div>
                    </motion.div>
                  ))}
                </div>

                <a
                  href={DONORBOX_HOSTED_URL}
                  target="_blank"
                  rel="noreferrer"
                  className="mt-5 inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-4 py-2 text-sm font-semibold text-white transition-colors hover:bg-white/10"
                >
                  Open on Donorbox
                  <ExternalLink className="h-4 w-4" />
                </a>
              </div>

              <div ref={widgetContainerRef} className="px-3 py-3 sm:px-5 sm:py-5">
                <div className="rounded-[24px] border border-white/10 bg-white p-2 shadow-[0_20px_50px_rgba(0,0,0,0.18)] sm:p-4">
                  {isWidgetLoading && (
                    <div className="flex min-h-[420px] flex-col items-center justify-center rounded-[18px] border border-dashed border-neutral-300 bg-neutral-50 text-center">
                      <LoaderCircle className="mb-4 h-8 w-8 animate-spin text-red-600" />
                      <p className="text-sm font-semibold text-neutral-900">Loading secure donation form...</p>
                      <p className="mt-2 max-w-xs text-sm text-neutral-500">
                        Donorbox is waking up. This usually takes just a moment.
                      </p>
                    </div>
                  )}
                  <dbox-widget
                    campaign={DONORBOX_CAMPAIGN}
                    type="donation_form"
                    enable-auto-scroll="true"
                  />
                </div>
              </div>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
