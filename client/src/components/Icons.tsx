import type { SVGProps } from 'react';

type IconName = 'grid' | 'folder' | 'sparkles' | 'mic' | 'plus' | 'chevron' | 'logout' | 'code' | 'check' | 'arrow' | 'activity' | 'menu' | 'close' | 'save' | 'copy' | 'send' | 'play' | 'trash' | 'clock' | 'shield' | 'settings';
const paths: Record<IconName, string> = {
  grid: 'M3 3h7v7H3zM14 3h7v7h-7zM14 14h7v7h-7zM3 14h7v7H3z', folder: 'M3 7a2 2 0 0 1 2-2h5l2 2h7a2 2 0 0 1 2 2v9a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z', sparkles: 'm12 3 1.9 5.8L20 11l-6.1 2.2L12 19l-1.9-5.8L4 11l6.1-2.2zM19 14l1 2.5 2 1-2 1L19 21l-1-2.5-2-1 2-1z', mic: 'M12 2a3 3 0 0 0-3 3v7a3 3 0 0 0 6 0V5a3 3 0 0 0-3-3zM19 11v1a7 7 0 0 1-14 0v-1m7 8v3m-4 0h8', plus: 'M12 5v14m-7-7h14', chevron: 'm9 18 6-6-6-6', logout: 'M10 17l5-5-5-5m5 5H3m9-9h6a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2h-6', code: 'm8 8-4 4 4 4m8-8 4 4-4 4m-3-11-2 14', check: 'm5 12 4 4L19 6', arrow: 'M5 12h14m-7-7 7 7-7 7', activity: 'M3 12h4l3-8 4 16 3-8h4', menu: 'M4 6h16M4 12h16M4 18h16', close: 'm6 6 12 12M18 6 6 18', save: 'M19 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11l5 5v11a2 2 0 0 1-2 2zM17 21v-8H7v8M7 3v5h8', copy: 'M8 8V4a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2v12a2 2 0 0 1-2 2h-4M4 8h10a2 2 0 0 1 2 2v10a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V10a2 2 0 0 1 2-2z', send: 'm22 2-7 20-4-9-9-4zM22 2 11 13', play: 'm7 4 14 8-14 8z', trash: 'M3 6h18m-2 0-1 14H6L5 6m4 0V4h6v2m-5 4v6m4-6v6', clock: 'M12 8v4l3 2m6-2a9 9 0 1 1-18 0 9 9 0 0 1 18 0', shield: 'M12 22s8-4 8-11V5l-8-3-8 3v6c0 7 8 11 8 11zm-3-11 2 2 4-4', settings: 'M12 8a4 4 0 1 0 0 8 4 4 0 0 0 0-8zm0-6v2m0 16v2M4.9 4.9l1.4 1.4m11.4 11.4 1.4 1.4M2 12h2m16 0h2M4.9 19.1l1.4-1.4M17.7 6.3l1.4-1.4',
};

export function Icon({ name, size = 18, ...props }: SVGProps<SVGSVGElement> & { name: IconName; size?: number }) {
  return <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true" {...props}><path d={paths[name]} /></svg>;
}
