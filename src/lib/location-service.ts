// Location Detection Service
// Detects user location using multiple methods with fallback hierarchy

import { LocationData } from '@/types/market';

interface GeolocationPosition {
  coords: {
    latitude: number;
    longitude: number;
    accuracy: number;
  };
}

interface IPGeolocationResponse {
  country_code: string;
  country_name: string;
  city: string;
  latitude: number;
  longitude: number;
  timezone: string;
}

// Country code to name mapping
const COUNTRY_NAMES: Record<string, string> = {
  US: 'United States',
  CA: 'Canada',
  GB: 'United Kingdom',
  DE: 'Germany',
  FR: 'France',
  IT: 'Italy',
  ES: 'Spain',
  JP: 'Japan',
  CN: 'China',
  IN: 'India',
  BR: 'Brazil',
  AU: 'Australia',
  // Add more as needed
};

// Timezone to country mapping (common cases)
const TIMEZONE_COUNTRY_MAP: Record<string, string> = {
  'America/New_York': 'US',
  'America/Chicago': 'US',
  'America/Denver': 'US',
  'America/Los_Angeles': 'US',
  'America/Toronto': 'CA',
  'America/Vancouver': 'CA',
  'America/Sao_Paulo': 'BR',
  'America/Mexico_City': 'MX',
  'America/Argentina/Buenos_Aires': 'AR',
  'Europe/London': 'GB',
  'Europe/Paris': 'FR',
  'Europe/Berlin': 'DE',
  'Europe/Rome': 'IT',
  'Europe/Madrid': 'ES',
  'Europe/Amsterdam': 'NL',
  'Europe/Zurich': 'CH',
  'Europe/Brussels': 'BE',
  'Europe/Stockholm': 'SE',
  'Europe/Oslo': 'NO',
  'Europe/Copenhagen': 'DK',
  'Europe/Moscow': 'RU',
  'Europe/Warsaw': 'PL',
  'Europe/Istanbul': 'TR',
  'Asia/Tokyo': 'JP',
  'Asia/Shanghai': 'CN',
  'Asia/Hong_Kong': 'HK',
  'Asia/Kolkata': 'IN',
  'Asia/Seoul': 'KR',
  'Asia/Taipei': 'TW',
  'Asia/Singapore': 'SG',
  'Asia/Bangkok': 'TH',
  'Asia/Jakarta': 'ID',
  'Asia/Manila': 'PH',
  'Asia/Ho_Chi_Minh': 'VN',
  'Asia/Kuala_Lumpur': 'MY',
  'Asia/Dubai': 'AE',
  'Asia/Riyadh': 'SA',
  'Asia/Qatar': 'QA',
  'Asia/Kuwait': 'KW',
  'Asia/Jerusalem': 'IL',
  'Asia/Karachi': 'PK',
  'Asia/Dhaka': 'BD',
  'Asia/Colombo': 'LK',
  'Australia/Sydney': 'AU',
  'Pacific/Auckland': 'NZ',
  'Africa/Johannesburg': 'ZA',
  'Africa/Lagos': 'NG',
  'Africa/Nairobi': 'KE',
  'Africa/Cairo': 'EG',
  'Africa/Casablanca': 'MA',
};

/**
 * Location Detection Service
 * Hierarchy: Geolocation API → IP Geolocation → Browser Locale → Default (US)
 */
class LocationService {
  private cachedLocation: LocationData | null = null;
  private cacheTimestamp: number = 0;
  private readonly CACHE_DURATION = 24 * 60 * 60 * 1000; // 24 hours

  /**
   * Get user location with caching
   */
  async getUserLocation(): Promise<LocationData> {
    // Check localStorage first for manual or cached location
    const cachedLocation = this.getCachedLocation();
    if (cachedLocation) {
      this.cachedLocation = cachedLocation;
      this.cacheTimestamp = cachedLocation.timestamp || Date.now();
      
      // If it's a manual selection, always use it (don't auto-detect)
      if (cachedLocation.detectionMethod === 'manual') {
        return cachedLocation;
      }
      
      // If cached location is still valid, use it
      if (Date.now() - this.cacheTimestamp < this.CACHE_DURATION) {
        return cachedLocation;
      }
    }

    // Try geolocation API first
    const geoLocation = await this.tryGeolocationAPI();
    if (geoLocation) {
      this.cacheLocation(geoLocation);
      return geoLocation;
    }

    // Fallback to IP geolocation
    const ipLocation = await this.tryIPGeolocation();
    if (ipLocation) {
      this.cacheLocation(ipLocation);
      return ipLocation;
    }

    // Fallback to browser locale
    const localeLocation = this.getLocationFromLocale();
    if (localeLocation) {
      this.cacheLocation(localeLocation);
      return localeLocation;
    }

    // Final fallback to US
    const defaultLocation = this.getDefaultLocation();
    this.cacheLocation(defaultLocation);
    return defaultLocation;
  }

  /**
   * Try browser Geolocation API
   */
  private async tryGeolocationAPI(): Promise<LocationData | null> {
    if (!navigator.geolocation) {
      return null;
    }

    try {
      const position = await new Promise<GeolocationPosition>((resolve, reject) => {
        navigator.geolocation.getCurrentPosition(resolve, reject, {
          timeout: 5000,
          maximumAge: 60000,
          enableHighAccuracy: false,
        });
      });

      // Reverse geocode to get country
      const country = await this.reverseGeocode(
        position.coords.latitude,
        position.coords.longitude
      );

      return {
        country,
        countryName: COUNTRY_NAMES[country] || country,
        latitude: position.coords.latitude,
        longitude: position.coords.longitude,
        detectionMethod: 'geolocation',
        timestamp: Date.now(),
      };
    } catch (error) {
      console.warn('Geolocation API failed:', error);
      return null;
    }
  }

  /**
   * Reverse geocode coordinates to country code
   * Uses Nominatim (OpenStreetMap) - free, no API key required
   */
  private async reverseGeocode(lat: number, lon: number): Promise<string> {
    try {
      const response = await fetch(
        `https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lon}&zoom=3`,
        {
          headers: {
            'User-Agent': 'NewsTRNT News Platform',
          },
        }
      );

      if (!response.ok) {
        throw new Error('Reverse geocoding failed');
      }

      const data = await response.json();
      return data.address?.country_code?.toUpperCase() || 'US';
    } catch (error) {
      console.warn('Reverse geocoding failed:', error);
      return 'US';
    }
  }

  /**
   * Try IP-based geolocation
   * Uses ipapi.co - free tier allows 1000 requests/day without API key
   */
  private async tryIPGeolocation(): Promise<LocationData | null> {
    try {
      const response = await fetch('https://ipapi.co/json/', {
        headers: {
          'User-Agent': 'NewsTRNT News Platform',
        },
      });

      if (!response.ok) {
        throw new Error('IP geolocation failed');
      }

      const data: IPGeolocationResponse = await response.json();

      return {
        country: data.country_code,
        countryName: data.country_name,
        latitude: data.latitude,
        longitude: data.longitude,
        timezone: data.timezone,
        detectionMethod: 'ip',
        timestamp: Date.now(),
      };
    } catch (error) {
      console.warn('IP geolocation failed:', error);
      return null;
    }
  }

  /**
   * Get location from browser locale
   */
  private getLocationFromLocale(): LocationData | null {
    try {
      // Try timezone first
      const timezone = Intl.DateTimeFormat().resolvedOptions().timeZone;
      const countryFromTimezone = TIMEZONE_COUNTRY_MAP[timezone];

      if (countryFromTimezone) {
        return {
          country: countryFromTimezone,
          countryName: COUNTRY_NAMES[countryFromTimezone] || countryFromTimezone,
          timezone,
          detectionMethod: 'locale',
          timestamp: Date.now(),
        };
      }

      // Try navigator.language
      const language = navigator.language || (navigator as any).userLanguage;
      if (language) {
        // Extract country code from locale (e.g., en-US → US)
        const parts = language.split('-');
        if (parts.length > 1) {
          const country = parts[1].toUpperCase();
          return {
            country,
            countryName: COUNTRY_NAMES[country] || country,
            timezone,
            detectionMethod: 'locale',
            timestamp: Date.now(),
          };
        }
      }

      return null;
    } catch (error) {
      console.warn('Locale detection failed:', error);
      return null;
    }
  }

  /**
   * Get default location (US)
   */
  private getDefaultLocation(): LocationData {
    return {
      country: 'US',
      countryName: 'United States',
      timezone: 'America/New_York',
      detectionMethod: 'default',
      timestamp: Date.now(),
    };
  }

  /**
   * Cache location data
   */
  private cacheLocation(location: LocationData): void {
    this.cachedLocation = location;
    this.cacheTimestamp = Date.now();

    // Store in localStorage for persistence
    try {
      localStorage.setItem('user_location', JSON.stringify(location));
      localStorage.setItem('user_location_timestamp', String(this.cacheTimestamp));
    } catch (error) {
      console.warn('Failed to cache location in localStorage:', error);
    }
  }

  /**
   * Get cached location from localStorage
   */
  getCachedLocation(): LocationData | null {
    try {
      const cached = localStorage.getItem('user_location');
      const timestamp = localStorage.getItem('user_location_timestamp');

      if (cached && timestamp) {
        const timestampNum = parseInt(timestamp, 10);
        if (Date.now() - timestampNum < this.CACHE_DURATION) {
          return JSON.parse(cached);
        }
      }
    } catch (error) {
      console.warn('Failed to retrieve cached location:', error);
    }

    return null;
  }

  /**
   * Clear cached location
   */
  clearCache(): void {
    this.cachedLocation = null;
    this.cacheTimestamp = 0;
    try {
      localStorage.removeItem('user_location');
      localStorage.removeItem('user_location_timestamp');
    } catch (error) {
      console.warn('Failed to clear location cache:', error);
    }
  }

  /**
   * Manually set user location (for user preference)
   */
  setUserLocation(country: string, countryName?: string): void {
    const location: LocationData = {
      country,
      countryName: countryName || COUNTRY_NAMES[country] || country,
      detectionMethod: 'manual',
      timestamp: Date.now(),
    };

    this.cacheLocation(location);
  }
}

// Export singleton instance
export const locationService = new LocationService();

// Export helper functions
export const getUserLocation = () => locationService.getUserLocation();
export const getCachedLocation = () => locationService.getCachedLocation();
export const clearLocationCache = () => locationService.clearCache();
export const setManualLocation = (country: string, countryName?: string) =>
  locationService.setUserLocation(country, countryName);
