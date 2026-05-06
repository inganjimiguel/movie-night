import type { DetailedHTMLProps, HTMLAttributes } from 'react';

declare module 'react/jsx-runtime' {
  namespace JSX {
    interface IntrinsicElements {
      'dbox-widget': DetailedHTMLProps<HTMLAttributes<HTMLElement>, HTMLElement> & {
        campaign: string;
        type?: string;
        'enable-auto-scroll'?: string;
      };
    }
  }
}
