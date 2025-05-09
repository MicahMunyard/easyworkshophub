
export const oauthConfig = {
  google: {
    clientId: process.env.GOOGLE_CLIENT_ID || '736177477108-a7cfbd4dcv3pqfk2jaolbm3j4fse0s9h.apps.googleusercontent.com',
    clientSecret: process.env.GOOGLE_CLIENT_SECRET || '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',
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
    clientId: process.env.MICROSOFT_CLIENT_ID || '',
    clientSecret: process.env.MICROSOFT_CLIENT_SECRET || '',
    redirectUri: 'https://app.workshopbase.com.au/email/callback',
    scopes: [
      'offline_access',
      'User.Read',
      'Mail.ReadWrite',
      'Mail.Send'
    ]
  }
};
