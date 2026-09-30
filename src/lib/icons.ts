export const ICONS = {
  reset: '<path d="M4.5 12a7.5 7.5 0 1 0 2.2-5.3"/><path d="M4.5 4.5v4h4"/>',
  close: '<path d="M6 6l12 12M18 6L6 18"/>',
  download: '<path d="M12 4v11M7 10.5l5 5 5-5M5 19.5h14"/>',
  generate: '<path d="M13 2.5 4.5 13.5h6.5l-1 8 8.5-11h-6.5z"/>',
  allCopies:
    '<path d="M14 4h6v6M20 4l-9 9M18 14v5a1 1 0 0 1-1 1H5a1 1 0 0 1-1-1V7a1 1 0 0 1 1-1h5"/>',
  eye: '<path d="M2.5 12s3.5-6.5 9.5-6.5S21.5 12 21.5 12s-3.5 6.5-9.5 6.5S2.5 12 2.5 12z"/><circle cx="12" cy="12" r="3"/>',
  install: '<rect x="6.5" y="2.5" width="11" height="19" rx="2.5"/><path d="M12 7v7M9 11.5l3 3 3-3"/>',
  uninstall: '<rect x="6.5" y="2.5" width="11" height="19" rx="2.5"/><path d="M9.5 9.5l5 5M14.5 9.5l-5 5"/>',
  link: '<path d="M10 14a4.5 4.5 0 0 0 6.4 0l3-3a4.5 4.5 0 0 0-6.4-6.4l-1.1 1.1"/><path d="M14 10a4.5 4.5 0 0 0-6.4 0l-3 3a4.5 4.5 0 0 0 6.4 6.4l1.1-1.1"/>',
  fitWidth: '<path d="M4 7v10M20 7v10M8 12h8M8 12l2.5-2.5M8 12l2.5 2.5M16 12l-2.5-2.5M16 12l-2.5 2.5"/>',
  fitPage: '<rect x="6" y="3.5" width="12" height="17" rx="1.5"/><path d="M9 8h6M9 11.5h6M9 15h4"/>',
  zoomOut: '<path d="M6 12h12"/>',
  zoomIn: '<path d="M6 12h12M12 6v12"/>',
  caretUp: '<path d="M7 14l5-5 5 5"/>',
};

export type IconName = keyof typeof ICONS;
