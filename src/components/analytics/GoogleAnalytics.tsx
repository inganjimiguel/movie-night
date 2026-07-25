import { useEffect } from 'react';
import { useLocation } from 'react-router-dom';

const GA_MEASUREMENT_ID = 'G-TEZ22J37Z5';

declare global {
  interface Window {
    gtag?: (
      command: 'config' | 'event' | 'js',
      targetId: string | Date,
      config?: Record<string, unknown>
    ) => void;
  }
}

interface GoogleAnalyticsProps {
  pageTitle: string;
}

export default function GoogleAnalytics({ pageTitle }: GoogleAnalyticsProps) {
  const location = useLocation();

  useEffect(() => {
    if (!window.gtag) {
      return;
    }

    window.gtag('config', GA_MEASUREMENT_ID, {
      page_path: `${location.pathname}${location.search}`,
      page_title: pageTitle,
    });
  }, [location.pathname, location.search, pageTitle]);

  return null;
}
