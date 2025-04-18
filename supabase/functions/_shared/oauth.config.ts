
// OAuth configuration for email providers
export const oauthConfig = {
  google: {
    clientId: Deno.env.get('GOOGLE_CLIENT_ID') || '',
    clientSecret: Deno.env.get('GOOGLE_CLIENT_SECRET') || '',
    redirectUri: Deno.env.get('GOOGLE_REDIRECT_URI') || `${Deno.env.get('PROJECT_URL') || ''}/email/callback`,
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
    redirectUri: Deno.env.get('MICROSOFT_REDIRECT_URI') || `${Deno.env.get('PROJECT_URL') || ''}/email/callback`,
    scopes: [
      'offline_access',
      'User.Read',
      'Mail.Read',
      'Mail.Send'
    ]
  }
};
