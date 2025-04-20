
// OAuth configuration for email providers
export const oauthConfig = {
  google: {
    // Use environment variables with fallbacks for testing
    clientId: Deno.env.get('GOOGLE_CLIENT_ID') || '736177477108-a7cfbd4dcv3pqfk2jaolbm3j4fse0s9h.apps.googleusercontent.com',
    clientSecret: Deno.env.get('GOOGLE_CLIENT_SECRET') || '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',
    redirectUri: 'https://qyjjbpyqxwrluhymvshn.supabase.co/functions/v1/email-integration/oauth-callback',
    scopes: [
      'https://www.googleapis.com/auth/gmail.readonly',
      'https://www.googleapis.com/auth/gmail.send',
      'https://www.googleapis.com/auth/gmail.labels',
      'https://www.googleapis.com/auth/gmail.modify',
      'https://www.googleapis.com/auth/userinfo.email',
      'https://www.googleapis.com/auth/userinfo.profile'
    ]
  },
  microsoft: {
    clientId: Deno.env.get('MICROSOFT_CLIENT_ID') || '',
    clientSecret: Deno.env.get('MICROSOFT_CLIENT_SECRET') || '',
    redirectUri: 'https://qyjjbpyqxwrluhymvshn.supabase.co/functions/v1/email-integration/oauth-callback',
    scopes: [
      'offline_access',
      'User.Read',
      'Mail.Read',
      'Mail.Send'
    ]
  }
};
