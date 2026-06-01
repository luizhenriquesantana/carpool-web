import { Injectable } from '@angular/core';

/**
 * Service for client-side cryptographic operations.
 * Uses the Web Crypto API for secure hashing.
 */
@Injectable({ providedIn: 'root' })
export class CryptoService {
  /**
   * Hashes a password using SHA-256.
   * This provides an extra layer of security by ensuring the raw password
   * never travels over the network, even over HTTPS.
   */
  async hashPassword(password: string): Promise<string> {
    const encoder = new TextEncoder();
    const data = encoder.encode(password);
    const hashBuffer = await crypto.subtle.digest('SHA-256', data);
    const hashArray = Array.from(new Uint8Array(hashBuffer));
    return hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
  }
}
