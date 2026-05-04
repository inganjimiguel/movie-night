import { Film, Instagram, Mail, Phone } from 'lucide-react';

const footerLinks = [
  {
    label: 'Email',
    value: 'miguelinganji@gmail.com',
    href: 'mailto:miguelinganji@gmail.com',
    icon: Mail,
  },
  {
    label: 'Phone',
    value: '+250 795 166 720',
    href: 'tel:+250795166720',
    icon: Phone,
  },
  {
    label: 'Instagram',
    value: '@themovienightscorps',
    href: 'https://www.instagram.com/themovienightscorps/',
    icon: Instagram,
    external: true,
  },
];

export default function Footer() {
  return (
    <footer className="relative mt-20 border-t border-white/10 bg-black">
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_top,_rgba(239,68,68,0.14),_transparent_45%)]" />

      <div className="relative mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
        <div className="grid gap-10 lg:grid-cols-[minmax(0,1.25fr)_minmax(0,1fr)]">
          <div className="space-y-5">
            <div className="inline-flex items-center gap-3 rounded-2xl border border-white/10 bg-white/[0.03] px-4 py-3 backdrop-blur-sm">
              <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-br from-red-600 via-red-500 to-orange-500 shadow-lg shadow-red-950/40">
                <Film className="h-6 w-6 text-white" />
              </div>
              <div>
                <p className="text-[11px] font-semibold uppercase tracking-[0.28em] text-red-400">MovieNight</p>
                <h3 className="text-xl font-black tracking-tight text-white sm:text-2xl">InganjiCorp</h3>
              </div>
            </div>

            <div className="max-w-2xl space-y-3">
              <p className="text-base font-medium text-white sm:text-lg">
                Streaming discovery for movies, TV shows, and animation.
              </p>
              <p className="text-sm leading-7 text-gray-400 sm:text-base">
                Fast browsing, clean search, trailer previews, and direct playback in one place.
              </p>
            </div>
          </div>

          <div className="grid gap-4 sm:grid-cols-3 lg:grid-cols-1">
            {footerLinks.map((link) => {
              const Icon = link.icon;

              return (
                <a
                  key={link.label}
                  href={link.href}
                  target={link.external ? '_blank' : undefined}
                  rel={link.external ? 'noopener noreferrer' : undefined}
                  className="group rounded-2xl border border-white/10 bg-white/[0.03] p-4 transition-all hover:-translate-y-1 hover:border-red-500/30 hover:bg-white/[0.05]"
                >
                  <div className="mb-3 flex h-11 w-11 items-center justify-center rounded-xl bg-white/5 text-red-400 transition-colors group-hover:bg-red-600/15">
                    <Icon className="h-5 w-5" />
                  </div>
                  <p className="text-xs font-semibold uppercase tracking-[0.24em] text-gray-500">{link.label}</p>
                  <p className="mt-2 break-all text-sm font-medium text-white sm:text-base">{link.value}</p>
                </a>
              );
            })}
          </div>
        </div>

        <div className="mt-10 border-t border-white/10 pt-6 text-sm text-gray-500">
          <p>© {new Date().getFullYear()} MovieNight.</p>
        </div>
      </div>
    </footer>
  );
}
