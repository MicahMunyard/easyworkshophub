
export const oauthConfig = {
  google: {
    clientId: Deno.env.get('GOOGLE_CLIENT_ID') || '736177477108-a7cfbd4dcv3pqfk2jaolbm3j4fse0s9h.apps.googleusercontent.com',
    clientSecret: Deno.env.get('GOOGLE_CLIENT_SECRET') || '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',
    redirectUri: 'https://app.workshopbase.com.au/email/callback',
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
    clientId: Deno.env.get('MICROSOFT_CLIENT_ID') || '5193df69-f6d7-4bd7-8d6f-9442e03091f9',
    clientSecret: Deno.env.get('MICROSOFT_CLIENT_SECRET') || '5a653420-58b1-4003-ad9c-c02dcdd55151',
    redirectUri: 'https://qyjjbpyqxwrluhymvshn.supabase.co/functions/v1/email-integration/oauth-callback',
    scopes: [
      'offline_access',
      'User.Read',
      'Mail.Read',
      'Mail.Send'
    ]
  }
};
