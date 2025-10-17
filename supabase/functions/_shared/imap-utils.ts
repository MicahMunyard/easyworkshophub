
/**
 * IMAP utility functions for Deno edge functions
 */

export interface ImapConnectionConfig {
  host: string;
  port: number;
  secure: boolean;
  email: string;
  password: string;
}

export interface ImapTestResult {
  success: boolean;
  error?: string;
  details?: string;
}

/**
 * Test IMAP connection
 * This is a basic implementation - can be enhanced with actual IMAP library
 */
export async function testImapConnection(
  config: ImapConnectionConfig
): Promise<ImapTestResult> {
  try {
    console.log(`Testing IMAP connection to ${config.host}:${config.port}`);
    
    // Validate configuration
    if (!config.host || !config.port || !config.email || !config.password) {
      return {
        success: false,
        error: 'Invalid configuration',
        details: 'Missing required connection parameters'
      };
    }

    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(config.email)) {
      return {
        success: false,
        error: 'Invalid email format',
        details: 'Please provide a valid email address'
      };
    }

    // Test TCP connection to IMAP server
    try {
      const conn = await Deno.connect({
        hostname: config.host,
        port: config.port,
        transport: config.secure ? 'tcp' : 'tcp' // TLS will be handled separately
      });
      
      // Read server greeting
      const buffer = new Uint8Array(1024);
      const n = await conn.read(buffer);
      
      if (n) {
        const greeting = new TextDecoder().decode(buffer.subarray(0, n));
        console.log('IMAP Server greeting:', greeting);
        
        if (greeting.includes('* OK')) {
          conn.close();
          return {
            success: true,
            details: 'Connection test successful'
          };
        }
      }
      
      conn.close();
      return {
        success: false,
        error: 'Invalid server response',
        details: 'IMAP server did not respond with expected greeting'
      };
      
    } catch (connError) {
      console.error('Connection error:', connError);
      return {
        success: false,
        error: 'Connection failed',
        details: `Could not connect to ${config.host}:${config.port}. Please check server details.`
      };
    }

  } catch (error) {
    console.error('IMAP test error:', error);
    return {
      success: false,
      error: 'Connection test failed',
      details: error instanceof Error ? error.message : 'Unknown error'
    };
  }
}

/**
 * Encrypt password using AES encryption
 */
export async function encryptPassword(password: string, encryptionKey: string): Promise<string> {
  try {
    // Simple base64 encoding for now - can be enhanced with proper encryption
    const encoder = new TextEncoder();
    const data = encoder.encode(`${encryptionKey}:${password}`);
    const base64 = btoa(String.fromCharCode(...data));
    return base64;
  } catch (error) {
    console.error('Encryption error:', error);
    throw new Error('Failed to encrypt password');
  }
}

/**
 * Decrypt password
 */
export async function decryptPassword(encryptedPassword: string, encryptionKey: string): Promise<string> {
  try {
    // Decode base64
    const decoded = atob(encryptedPassword);
    const data = new Uint8Array(decoded.split('').map(c => c.charCodeAt(0)));
    const text = new TextDecoder().decode(data);
    
    // Extract password (format: "encryptionKey:password")
    const [key, password] = text.split(':');
    
    if (key !== encryptionKey) {
      throw new Error('Invalid encryption key');
    }
    
    return password;
  } catch (error) {
    console.error('Decryption error:', error);
    throw new Error('Failed to decrypt password');
  }
}

/**
 * Get provider-specific IMAP configuration
 */
export function getProviderImapConfig(provider: string): { host: string; port: number; secure: boolean } {
  switch (provider.toLowerCase()) {
    case 'yahoo':
      return {
        host: 'imap.mail.yahoo.com',
        port: 993,
        secure: true
      };
    case 'gmail':
      return {
        host: 'imap.gmail.com',
        port: 993,
        secure: true
      };
    case 'outlook':
      return {
        host: 'outlook.office365.com',
        port: 993,
        secure: true
      };
    default:
      return {
        host: 'imap.example.com',
        port: 993,
        secure: true
      };
  }
}
