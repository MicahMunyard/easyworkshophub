export const oauthConfig = {
  google: {
    clientId: '736177477108-a7cfbd4dcv3pqfk2jaolbm3j4fse0s9h.apps.googleusercontent.com',
    clientSecret: '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',
    redirectUri: 'https://qyjjbpyqxwrluhymvshn.supabase.co/functions/v1/email-integration',
    scopes: [
      'https://mail.google.com/',
      'https://www.googleapis.com/auth/gmail.modify',
      'https://www.googleapis.com/auth/gmail.readonly',
      'profile',
      'email'
    ]
  },
  microsoft: {
    clientId: process.env.MICROSOFT_CLIENT_ID || '',
    clientSecret: process.env.MICROSOFT_CLIENT_SECRET || '',
    redirectUri: process.env.MICROSOFT_REDIRECT_URI || '',
    scopes: [
      'offline_access',
      'User.Read',
      'Mail.ReadWrite',
      'Mail.Send'
    ]
  }
};
