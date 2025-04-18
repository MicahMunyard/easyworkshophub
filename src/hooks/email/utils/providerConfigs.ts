
import { EmailConnectionConfig } from "@/types/email";

export const getProviderConfig = (providerName: string): EmailConnectionConfig => {
  switch (providerName) {
    case 'gmail':
      return {
        provider: 'gmail',
        host: 'imap.gmail.com',
        port: 993,
        secure: true
      };
    case 'outlook':
      return {
        provider: 'outlook',
        host: 'outlook.office365.com',
        port: 993,
        secure: true
      };
    case 'yahoo':
      return {
        provider: 'yahoo',
        host: 'imap.mail.yahoo.com',
        port: 993,
        secure: true
      };
    default:
      return {
        provider: 'other',
        host: 'imap.example.com',
        port: 993,
        secure: true
      };
  }
};
