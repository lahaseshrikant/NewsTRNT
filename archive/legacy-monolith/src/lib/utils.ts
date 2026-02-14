/**
 * Shared utility functions for the NewsTRNT platform
 */

/**
 * Safely extracts an email string from potentially nested email objects.
 * Handles cases where API returns { email: "user@example.com" } instead of just "user@example.com"
 * 
 * @param email - The email value, which could be a string or an object with email property
 * @returns The email as a string, or empty string if not found
 */
export function getEmailString(email: unknown): string {
  if (typeof email === 'string') {
    return email;
  }
  if (email && typeof email === 'object' && 'email' in email) {
    const nestedEmail = (email as { email: unknown }).email;
    if (typeof nestedEmail === 'string') {
      return nestedEmail;
    }
  }
  return '';
}

/**
 * Safely extracts a display name from user/session objects.
 * Falls back through displayName -> username -> name -> email prefix
 * 
 * @param user - User or session object
 * @returns The display name as a string
 */
export function getDisplayName(user: unknown): string {
  if (!user || typeof user !== 'object') {
    return 'User';
  }
  const u = user as Record<string, unknown>;
  if (typeof u.displayName === 'string' && u.displayName) {
    return u.displayName;
  }
  if (typeof u.username === 'string' && u.username) {
    return u.username;
  }
  if (typeof u.name === 'string' && u.name) {
    return u.name;
  }
  const email = getEmailString(u.email);
  if (email) {
    return email.split('@')[0];
  }
  return 'User';
}

/**
 * Safely encodes a string to base64, handling Unicode characters.
 * Uses encodeURIComponent to handle characters outside Latin1 range.
 * 
 * @param str - The string to encode
 * @returns Base64 encoded string
 */
export function safeBase64Encode(str: string): string {
  try {
    return btoa(unescape(encodeURIComponent(str)));
  } catch {
    // Fallback for edge cases
    return btoa(str.replace(/[^\x00-\xff]/g, '?'));
  }
}

/**
 * Safely decodes a base64 string, handling Unicode characters.
 * 
 * @param str - The base64 encoded string
 * @returns Decoded string
 */
export function safeBase64Decode(str: string): string {
  try {
    return decodeURIComponent(escape(atob(str)));
  } catch {
    // Fallback for edge cases
    return atob(str);
  }
}
