import { MosqueOpeningHourDay, OpenStatusResult } from '@/types/mosque';
import { getStateConfig, getDefaultState } from '@/lib/config/state-registry';

/**
 * Returns IANA timezone for a US state dynamically from State Registry
 */
export function getTimezoneForState(stateCode?: string, state?: string): string {
  if (stateCode || state) {
    const config = getStateConfig(stateCode || state || '');
    if (config) {
      return config.timezone;
    }
  }

  return getDefaultState().timezone;
}

/**
 * Returns location-aware IANA timezone.
 * Resolves multi-timezone states (e.g. Texas El Paso in Mountain Time) when coordinates are available,
 * falling back to the state primary timezone.
 */
export function getTimezoneForLocation(
  lat?: number,
  lng?: number,
  stateCode?: string,
  state?: string
): string {
  const normState = (stateCode || state || '').trim().toUpperCase();

  // Texas: El Paso & Hudspeth counties (west of -104.85 longitude) observe Mountain Time
  if ((normState === 'TX' || normState === 'TEXAS') && typeof lng === 'number' && lng < -104.85) {
    return 'America/Denver';
  }

  return getTimezoneForState(stateCode, state);
}

/**
 * Returns location-aware IANA timezone for a specific mosque entity.
 */
export function getTimezoneForMosque(mosque: {
  latitude?: number;
  longitude?: number;
  stateCode?: string;
  state?: string;
}): string {
  return getTimezoneForLocation(mosque.latitude, mosque.longitude, mosque.stateCode, mosque.state);
}

/**
 * Parses time string like "5 AM", "10:05 PM", "12:30", "7" into minutes from midnight (0..1439)
 */
function parseTimeStringToMinutes(timeStr: string, defaultPeriod?: 'AM' | 'PM'): number | null {
  const clean = timeStr.trim();
  const match = clean.match(/^(\d{1,2})(?::(\d{2}))?\s*(AM|PM)?$/i);
  if (!match) return null;

  let hours = parseInt(match[1], 10);
  const minutes = match[2] ? parseInt(match[2], 10) : 0;
  const period = (match[3] ? match[3].toUpperCase() : defaultPeriod) as 'AM' | 'PM' | undefined;

  if (period === 'PM' && hours < 12) {
    hours += 12;
  } else if (period === 'AM' && hours === 12) {
    hours = 0;
  }

  return hours * 60 + minutes;
}

/**
 * Parses a single slot like "5 AM to 10:05 PM" or "7 to 10 PM"
 */
function parseSlot(slot: string): { startMinutes: number; endMinutes: number } | null {
  const parts = slot.split(/\s+to\s+/i);
  if (parts.length !== 2) return null;

  const startPart = parts[0].trim();
  const endPart = parts[1].trim();

  // Check if end part has AM/PM
  const endPeriodMatch = endPart.match(/(AM|PM)$/i);
  const endPeriod = endPeriodMatch ? (endPeriodMatch[1].toUpperCase() as 'AM' | 'PM') : undefined;

  const endMinutes = parseTimeStringToMinutes(endPart, endPeriod);
  if (endMinutes === null) return null;

  // If start part has explicit AM/PM, use it; otherwise inherit endPeriod
  const startPeriodMatch = startPart.match(/(AM|PM)$/i);
  const startPeriod = startPeriodMatch ? (startPeriodMatch[1].toUpperCase() as 'AM' | 'PM') : endPeriod;

  const startMinutes = parseTimeStringToMinutes(startPart, startPeriod);
  if (startMinutes === null) return null;

  return { startMinutes, endMinutes };
}

/**
 * Evaluates whether a mosque is currently open based on opening hours and timezone
 */
export function getMosqueOpenStatus(
  openingHours?: MosqueOpeningHourDay[] | null,
  timezone?: string,
  customDate = new Date()
): OpenStatusResult {
  const resolvedTimezone = timezone || getDefaultState().timezone;

  if (!openingHours || openingHours.length === 0) {
    return { state: 'unknown', label: 'Hours not listed' };
  }

  // Get current day and time in mosque local timezone
  const formatter = new Intl.DateTimeFormat('en-US', {
    timeZone: resolvedTimezone,
    weekday: 'long',
    hour: 'numeric',
    minute: 'numeric',
    hour12: false,
  });

  const parts = formatter.formatToParts(customDate);
  const weekday = parts.find(p => p.type === 'weekday')?.value; // e.g. "Monday"
  const hour = parseInt(parts.find(p => p.type === 'hour')?.value || '0', 10);
  const minute = parseInt(parts.find(p => p.type === 'minute')?.value || '0', 10);
  const currentMinutes = hour * 60 + minute;

  const todayHours = openingHours.find(
    oh => oh.day.toLowerCase() === weekday?.toLowerCase()
  );

  if (!todayHours || !todayHours.hours) {
    return { state: 'unknown', label: 'Hours not listed' };
  }

  const rawHours = todayHours.hours.trim();

  if (/open\s+24\s+hours/i.test(rawHours)) {
    return { state: '24hours', label: 'Open 24 Hours' };
  }

  if (/closed/i.test(rawHours)) {
    return { state: 'closed', label: 'Closed', detail: 'Closed today' };
  }

  // Handle multi-slots e.g. "4:30 to 6:30 AM, 12:30 to 10 PM"
  const slots = rawHours.split(',').map(s => s.trim());
  let isOpen = false;

  for (const slot of slots) {
    const parsed = parseSlot(slot);
    if (!parsed) continue;

    const { startMinutes, endMinutes } = parsed;

    if (startMinutes <= endMinutes) {
      if (currentMinutes >= startMinutes && currentMinutes <= endMinutes) {
        isOpen = true;
        break;
      }
    } else {
      // Overnight range (e.g. 10 PM to 2 AM)
      if (currentMinutes >= startMinutes || currentMinutes <= endMinutes) {
        isOpen = true;
        break;
      }
    }
  }

  if (isOpen) {
    return { state: 'open', label: 'Open Now', detail: todayHours.hours };
  } else {
    return { state: 'closed', label: 'Closed', detail: todayHours.hours };
  }
}
