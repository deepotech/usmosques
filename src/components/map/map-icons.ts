import L from 'leaflet';

/**
 * Creates an SVG DivIcon for a mosque marker.
 * DivIcons avoid any bundler path issues with static PNG assets.
 */
export function createMosqueIcon(isSelected = false): L.DivIcon {
  const size = isSelected ? 42 : 32;
  const iconAnchor: [number, number] = [size / 2, size];
  const popupAnchor: [number, number] = [0, -size];

  const bgColor = isSelected ? '#14532d' : '#15803d'; // brand-900 vs brand-700
  const ring = isSelected
    ? 'ring-4 ring-amber-400 ring-offset-2 scale-110 shadow-lg'
    : 'shadow-md hover:scale-105';

  const html = `
    <div class="relative flex items-center justify-center transition-transform" style="width: ${size}px; height: ${size}px;">
      <div class="flex items-center justify-center rounded-full text-white ${ring}" style="background-color: ${bgColor}; width: ${size}px; height: ${size}px;">
        <svg xmlns="http://www.w3.org/2000/svg" width="${isSelected ? 22 : 16}" height="${isSelected ? 22 : 16}" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
          <!-- Minaret / Mosque Dome SVG -->
          <path d="M12 2v3" />
          <path d="M12 5a4 4 0 0 0-4 4v1h8V9a4 4 0 0 0-4-4Z" />
          <path d="M4 10h16v11H4z" />
          <path d="M10 21v-5a2 2 0 0 1 4 0v5" />
        </svg>
      </div>
      <div class="absolute -bottom-1.5 left-1/2 -translate-x-1/2 w-0 h-0 border-l-[5px] border-l-transparent border-r-[5px] border-r-transparent border-t-[6px]" style="border-t-color: ${bgColor};"></div>
    </div>
  `;

  return L.divIcon({
    className: 'mosque-div-icon',
    html,
    iconSize: [size, size],
    iconAnchor,
    popupAnchor,
  });
}

/**
 * Creates an animated SVG DivIcon for the user's current GPS location.
 */
export function createUserLocationIcon(): L.DivIcon {
  const size = 24;
  const iconAnchor: [number, number] = [size / 2, size / 2];

  const html = `
    <div class="relative flex items-center justify-center" style="width: ${size}px; height: ${size}px;">
      <span class="absolute inline-flex h-full w-full animate-ping rounded-full bg-blue-400 opacity-75"></span>
      <span class="relative inline-flex h-4 w-4 rounded-full border-2 border-white bg-blue-600 shadow-md"></span>
    </div>
  `;

  return L.divIcon({
    className: 'user-location-div-icon',
    html,
    iconSize: [size, size],
    iconAnchor,
  });
}
