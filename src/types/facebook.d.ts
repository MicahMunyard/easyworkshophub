
interface FacebookLoginStatus {
  status: 'connected' | 'not_authorized' | 'unknown';
  authResponse?: {
    accessToken: string;
    expiresIn: string;
    signedRequest: string;
    userID: string;
  };
}

interface FacebookSDK {
  init(options: {
    appId: string;
    cookie?: boolean;
    xfbml?: boolean;
    version: string;
  }): void;
  getLoginStatus(callback: (response: FacebookLoginStatus) => void): void;
  login(callback: (response: FacebookLoginStatus) => void, options?: { scope: string }): void;
  logout(callback: (response: any) => void): void;
  AppEvents: {
    logPageView(): void;
  };
}

declare global {
  interface Window {
    FB: FacebookSDK;
    fbAsyncInit: () => void;
  }
}
