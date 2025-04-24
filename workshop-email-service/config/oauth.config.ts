
export const oauthConfig = {
  google: {
    clientId: '736177477108-a7cfbd4dcv3pqfk2jaolbm3j4fse0s9h.apps.googleusercontent.com',
    clientSecret: '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',
    redirectUri: 'https://app.workshopbase.com.au/email/callback',
    scopes: [
      'https://mail.google.com/',
      'https://www.googleapis.com/auth/gmail.modify',
      'https://www.googleapis.com/auth/gmail.readonly',
      'profile',
      'email'
    ]
  },
  microsoft: {
    clientId: '5193df69-f6d7-4bd7-8d6f-9442e03091f9',
    clientSecret: '5a653420-58b1-4003-ad9c-c02dcdd55151',
    redirectUri: 'https://qyjjbpyqxwrluhymvshn.supabase.co/functions/v1/email-integration/oauth-callback',
    scopes: [
      'offline_access',
      'User.Read',
      'Mail.ReadWrite',
      'Mail.Send'
    ]
  }
};
