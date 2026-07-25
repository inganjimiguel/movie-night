import { Film, Instagram, Mail, Phone } from 'lucide-react';
import { Link } from 'react-router-dom';

const browseLinks = [
  { label: 'Home', href: '/' },
  { label: 'Movies', href: '/movies' },
  { label: 'TV Shows', href: '/tv-shows' },
  { label: 'Trailers', href: '/trailers' },
  { label: 'New & Popular', href: '/new' },
];

const libraryLinks = [
  { label: 'Continue Watching', href: '/continue-watching' },
  { label: 'Liked Titles', href: '/liked' },
  { label: 'My Queue', href: '/queue' },
];

const contactLinks = [
  {
    label: 'Email',
    value: 'themovienightscorps@gmail.com',
    href: 'mailto:themovienightscorps@gmail.com',
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

interface FooterLinkGroupProps {
  title: string;
  links: Array<{ label: string; href: string }>;
}

function FooterLinkGroup({ title, links }: FooterLinkGroupProps) {
  return (
    <div>
      <h2 className="text-sm font-semibold text-white">{title}</h2>
      <ul className="mt-4 space-y-3">
        {links.map((link) => (
          <li key={link.href}>
            <Link className="text-sm text-gray-400 transition-colors hover:text-white" to={link.href}>
              {link.label}
            </Link>
          </li>
        ))}
      </ul>
    </div>
  );
}

export default function Footer() {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="mt-20 border-t border-white/10 bg-[#090909]">
      <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8 lg:py-14">
        <div className="grid gap-10 border-b border-white/10 pb-10 sm:grid-cols-2 lg:grid-cols-[minmax(0,1.35fr)_minmax(140px,0.7fr)_minmax(150px,0.8fr)_minmax(230px,1fr)]">
          <div className="max-w-sm">
            <Link to="/" className="inline-flex items-center gap-3 text-white" aria-label="Movie Night home">
              <span className="flex h-10 w-10 items-center justify-center rounded-lg bg-red-600 shadow-lg shadow-red-950/40">
                <Film className="h-5 w-5" />
              </span>
              <span className="text-xl font-black tracking-tight">MovieNight</span>
            </Link>
            <p className="mt-5 text-sm leading-6 text-gray-400">
              Find movies, TV shows, trailers, and your next great watch in one place.
            </p>
            <p className="mt-4 text-sm leading-6 text-gray-500">
              Content availability, ratings, and trailers may vary by title and region.
            </p>
          </div>

          <FooterLinkGroup title="Browse" links={browseLinks} />
          <FooterLinkGroup title="Your Library" links={libraryLinks} />

          <div>
            <h2 className="text-sm font-semibold text-white">Contact</h2>
            <ul className="mt-4 space-y-4">
              {contactLinks.map((link) => {
                const Icon = link.icon;

                return (
                  <li key={link.label}>
                    <a
                      href={link.href}
                      target={link.external ? '_blank' : undefined}
                      rel={link.external ? 'noopener noreferrer' : undefined}
                      className="group flex items-start gap-3 text-sm text-gray-400 transition-colors hover:text-white"
                    >
                      <Icon className="mt-0.5 h-4 w-4 shrink-0 text-red-500 transition-colors group-hover:text-red-400" />
                      <span className="break-all">{link.value}</span>
                    </a>
                  </li>
                );
              })}
            </ul>
          </div>
        </div>

        <div className="flex flex-col gap-3 pt-6 text-sm text-gray-500 sm:flex-row sm:items-center sm:justify-between">
          <p>Copyright {currentYear} MovieNight. All rights reserved.</p>
          <p>
            Developed by <span className="font-medium text-gray-300">InganjiCorp</span>
          </p>
        </div>
      </div>
    </footer>
  );
}
