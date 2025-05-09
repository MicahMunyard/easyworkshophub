
import { OAuthService } from '../services/oauth.service';
import { TokenService } from '../services/token.service';
import { MicrosoftEmailProvider } from '../providers/microsoft-email.provider';
import dotenv from 'dotenv';

// Load environment variables
dotenv.config();

/**
 * This is a simple test script to verify Microsoft OAuth integration.
 * It's not a full automated test since OAuth requires user interaction.
 */
async function testMicrosoftOAuth() {
  console.log('🔍 Testing Microsoft OAuth integration');
  
  // Step 1: Generate OAuth URL
  console.log('\n📌 Step 1: Generate Microsoft OAuth URL');
  try {
    const authUrl = OAuthService.getMicrosoftAuthUrl();
    console.log('✅ Generated Auth URL:', authUrl);
    
    // In a real test, you would need to open this URL in a browser
    // and complete the authentication flow manually
    console.log('\n⚠️ Manual step required:');
    console.log('1. Open this URL in a browser');
    console.log('2. Sign in with your Microsoft account');
    console.log('3. Copy the authorization code from the redirect URL');
    
    // Wait for user to provide the code manually
    const code = await promptForCode();
    if (!code) {
      console.log('❌ No code provided, aborting test');
      return;
    }
    
    // Step 2: Exchange code for tokens
    console.log('\n📌 Step 2: Exchange code for tokens');
    const tokens = await OAuthService.getMicrosoftTokens(code);
    console.log('✅ Received tokens:');
    console.log('  - Access token:', tokens.access_token.substring(0, 10) + '...');
    console.log('  - Refresh token:', tokens.refresh_token?.substring(0, 10) + '...');
    console.log('  - Expires in:', tokens.expires_in, 'seconds');
    
    // Step 3: Get user email
    console.log('\n📌 Step 3: Get user email');
    const email = await OAuthService.getMicrosoftUserEmail(tokens.access_token);
    console.log('✅ User email:', email);
    
    // Step 4: Store credentials
    console.log('\n📌 Step 4: Store credentials');
    const testUserId = 'test-user-' + Date.now();
    const stored = await TokenService.storeCredentials(testUserId, {
      provider: 'microsoft',
      email,
      accessToken: tokens.access_token,
      refreshToken: tokens.refresh_token,
      expiresAt: Date.now() + (tokens.expires_in * 1000)
    });
    console.log('✅ Credentials stored:', stored);
    
    // Step 5: Create provider and fetch emails
    console.log('\n📌 Step 5: Create Microsoft email provider and fetch emails');
    const provider = new MicrosoftEmailProvider(testUserId);
    const connected = await provider.connect();
    console.log('✅ Provider connected:', connected);
    
    if (connected) {
      console.log('Fetching emails...');
      const emails = await provider.fetchEmails(5);
      console.log(`✅ Fetched ${emails.length} emails`);
      if (emails.length > 0) {
        console.log('First email:');
        console.log('  - Subject:', emails[0].subject);
        console.log('  - From:', emails[0].from);
        console.log('  - Date:', emails[0].date);
      }
    }
    
    // Step 6: Test token refresh
    console.log('\n📌 Step 6: Test token refresh');
    // We'll simulate token expiration
    const credentials = await TokenService.getCredentials(testUserId);
    if (credentials) {
      const expiredCredentials = {
        ...credentials,
        expiresAt: Date.now() - 1000 // Set to expired
      };
      await TokenService.storeCredentials(testUserId, expiredCredentials);
      
      console.log('Testing token refresh...');
      const refreshed = await TokenService.refreshToken(testUserId);
      console.log('✅ Token refreshed:', refreshed);
      
      const newToken = await TokenService.getValidAccessToken(testUserId);
      console.log('✅ New token:', newToken ? 'Retrieved' : 'Failed');
    }
    
    // Step 7: Clean up
    console.log('\n📌 Step 7: Clean up');
    const removed = await TokenService.removeCredentials(testUserId);
    console.log('✅ Credentials removed:', removed);
    
    console.log('\n🎉 Test completed successfully!');
  } catch (error) {
    console.error('❌ Test failed:', error);
  }
}

/**
 * Helper function to prompt for authorization code
 * In a real test, this would be handled by the OAuth redirect
 */
async function promptForCode(): Promise<string> {
  return new Promise((resolve) => {
    const readline = require('readline').createInterface({
      input: process.stdin,
      output: process.stdout
    });
    
    readline.question('Enter the authorization code: ', (code: string) => {
      readline.close();
      resolve(code.trim());
    });
  });
}

// Run the test
testMicrosoftOAuth().catch(console.error);
