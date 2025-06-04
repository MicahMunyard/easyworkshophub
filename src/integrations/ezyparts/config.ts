

export const EZYPARTS_CONFIG = {
  PRODUCTION: {
    BASE: 'https://api.ezyparts.burson.com.au/bapcorocc/v2/EzyParts/gms',
    AUTH: 'https://api.ezyparts.burson.com.au/authorizationserver/oauth/token',
    WEB: 'https://ezyparts.burson.com.au/burson'
  },
  STAGING: {
    BASE: 'https://api.ezypartsqa.burson.com.au/bapcorocc/v2/EzyParts/gms',
    AUTH: 'https://api.ezypartsqa.burson.com.au/authorizationserver/oauth/token',
    WEB: 'https://ezypartsqa.burson.com.au/burson'
  }
} as const;

export const getEzyPartsConfig = (isProduction: boolean = false) => {
  return isProduction ? EZYPARTS_CONFIG.PRODUCTION : EZYPARTS_CONFIG.STAGING;
};

