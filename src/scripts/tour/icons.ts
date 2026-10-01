export const ICONS = {
  options: '<path d="M4 7h10M18 7h2M4 17h4M12 17h8"/><circle cx="16" cy="7" r="2"/><circle cx="10" cy="17" r="2"/>',
  accent: '<circle cx="12" cy="12" r="8.5"/><circle cx="12" cy="12" r="3.5" fill="currentColor"/>',
  edition: '<rect x="6" y="3.5" width="12" height="17" rx="1.5"/><path d="M9 8h6M9 11.5h6"/>',
  language: '<circle cx="12" cy="12" r="8.5"/><path d="M3.5 12h17M12 3.5c2.5 2.6 2.5 14.4 0 17M12 3.5c-2.5 2.6-2.5 14.4 0 17"/>',
  reset: '<path d="M4.5 12a7.5 7.5 0 1 0 2.2-5.3"/><path d="M4.5 4.5v4h4"/>',
  generate: '<path d="M13 2.5 4.5 13.5h6.5l-1 8 8.5-11h-6.5z"/>',
  download: '<path d="M12 4v11M7 10.5l5 5 5-5M5 19.5h14"/>',
  all: '<path d="M14 4h6v6M20 4l-9 9M18 14v5a1 1 0 0 1-1 1H5a1 1 0 0 1-1-1V7a1 1 0 0 1 1-1h5"/>',
  choose: '<path d="M6 9.5l6 6 6-6"/>',
  preview: '<rect x="6" y="3.5" width="12" height="17" rx="1.5"/><path d="M9 8h6M9 11.5h6M9 15h4"/>',
  links: '<path d="M10 14a4.5 4.5 0 0 0 6.4 0l3-3a4.5 4.5 0 0 0-6.4-6.4l-1.1 1.1"/><path d="M14 10a4.5 4.5 0 0 0-6.4 0l-3 3a4.5 4.5 0 0 0 6.4 6.4l1.1-1.1"/>',
  expand: '<path d="M15 4h5v5M9 20H4v-5M20 4l-6.5 6.5M4 20l6.5-6.5"/>',
  a11y: '<circle cx="12" cy="12" r="9"/><circle cx="12" cy="7.6" r="1.1"/><path d="M8 10.2c2.7.7 5.3.7 8 0M12 10.8v3.4M10 17.5l2-3.3 2 3.3"/>',
  admire: '<path d="M2.5 12s3.5-6.5 9.5-6.5S21.5 12 21.5 12s-3.5 6.5-9.5 6.5S2.5 12 2.5 12z"/><circle cx="12" cy="12" r="3"/>',
  install: '<rect x="6.5" y="2.5" width="11" height="19" rx="2.5"/><path d="M12 7v7M9 11.5l3 3 3-3"/>',
  wallpaper: '<rect x="3" y="4.5" width="18" height="13" rx="2"/><path d="M12 8v6M9.5 11.5l2.5 2.5 2.5-2.5M8 20.5h8"/>',
};

export type IconName = keyof typeof ICONS;
