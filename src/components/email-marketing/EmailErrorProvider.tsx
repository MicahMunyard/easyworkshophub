
import React, { createContext, useContext, useState, ReactNode } from 'react';
import { AlertCircle, XCircle, AlertTriangle, Info } from 'lucide-react';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { useToast } from '@/hooks/use-toast';
import { Button } from '@/components/ui/button';

// Types of errors
export type ErrorSeverity = 'error' | 'warning' | 'info';

// Error object structure
export interface EmailError {
  id: string;
  message: string;
  details?: string;
  severity: ErrorSeverity;
  component?: string;
  timestamp: Date;
  actionable?: boolean;
  retryAction?: () => Promise<void>;
  dismissable?: boolean;
  errorCode?: string;
}

// Context interface
interface EmailErrorContextType {
  errors: EmailError[];
  addError: (error: Omit<EmailError, 'id' | 'timestamp'>) => string;
  removeError: (id: string) => void;
  clearErrors: () => void;
  retryAction: (id: string) => Promise<void>;
}

// Create context
const EmailErrorContext = createContext<EmailErrorContextType | undefined>(undefined);

// Props for the provider
interface EmailErrorProviderProps {
  children: ReactNode;
}

/**
 * Error provider component that manages email-related errors
 */
export const EmailErrorProvider: React.FC<EmailErrorProviderProps> = ({ children }) => {
  const [errors, setErrors] = useState<EmailError[]>([]);
  const { toast } = useToast();

  // Add a new error to the list
  const addError = (error: Omit<EmailError, 'id' | 'timestamp'>): string => {
    const id = `error-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
    const newError = {
      ...error,
      id,
      timestamp: new Date(),
      dismissable: error.dismissable !== false,
    };
    
    setErrors(prev => [...prev, newError]);
    
    // Also show as a toast for immediate feedback
    toast({
      title: getErrorTitle(error.severity),
      description: error.message,
      variant: error.severity === 'error' ? 'destructive' : 'default',
    });
    
    return id;
  };

  // Remove an error from the list
  const removeError = (id: string) => {
    setErrors(prev => prev.filter(error => error.id !== id));
  };

  // Clear all errors
  const clearErrors = () => {
    setErrors([]);
  };

  // Retry an action associated with an error
  const retryAction = async (id: string) => {
    const error = errors.find(e => e.id === id);
    if (error && error.retryAction) {
      try {
        await error.retryAction();
        removeError(id);
        
        // Show success toast
        toast({
          title: "Action successful",
          description: "The operation completed successfully",
        });
      } catch (e) {
        // Update the error with new timestamp
        setErrors(prev => 
          prev.map(err => 
            err.id === id 
              ? { ...err, timestamp: new Date() } 
              : err
          )
        );
        
        // Show failure toast
        toast({
          title: "Action failed",
          description: "The operation failed. Please try again.",
          variant: "destructive",
        });
      }
    }
  };

  // Helper to get title based on severity
  const getErrorTitle = (severity: ErrorSeverity): string => {
    switch (severity) {
      case 'error':
        return 'Error';
      case 'warning':
        return 'Warning';
      case 'info':
        return 'Information';
      default:
        return 'Notification';
    }
  };

  return (
    <EmailErrorContext.Provider
      value={{
        errors,
        addError,
        removeError,
        clearErrors,
        retryAction,
      }}
    >
      {children}
    </EmailErrorContext.Provider>
  );
};

/**
 * Hook to use the email error context
 */
export const useEmailErrors = () => {
  const context = useContext(EmailErrorContext);
  if (context === undefined) {
    throw new Error('useEmailErrors must be used within an EmailErrorProvider');
  }
  return context;
};

/**
 * Component to display errors in a list
 */
export const EmailErrorDisplay: React.FC = () => {
  const { errors, removeError, retryAction } = useEmailErrors();

  // If no errors, don't render anything
  if (errors.length === 0) {
    return null;
  }

  // Get icon based on severity
  const getIcon = (severity: ErrorSeverity) => {
    switch (severity) {
      case 'error':
        return <XCircle className="h-4 w-4" />;
      case 'warning':
        return <AlertTriangle className="h-4 w-4" />;
      case 'info':
        return <Info className="h-4 w-4" />;
      default:
        return <AlertCircle className="h-4 w-4" />;
    }
  };

  // Get alert variant based on severity
  const getAlertVariant = (severity: ErrorSeverity) => {
    switch (severity) {
      case 'error':
        return 'destructive';
      case 'warning':
        return 'default';
      case 'info':
        return 'default';
      default:
        return 'default';
    }
  };

  return (
    <div className="space-y-2">
      {errors.map((error) => (
        <Alert 
          key={error.id} 
          variant={getAlertVariant(error.severity) as any}
          className="relative"
        >
          {error.dismissable && (
            <button
              onClick={() => removeError(error.id)}
              className="absolute top-2 right-2 text-muted-foreground hover:text-foreground"
              aria-label="Dismiss"
            >
              <XCircle className="h-4 w-4" />
            </button>
          )}
          {getIcon(error.severity)}
          <AlertTitle>
            {error.component ? `${error.component}: ` : ''}
            {error.message}
          </AlertTitle>
          {error.details && (
            <AlertDescription>
              {error.details}
            </AlertDescription>
          )}
          {error.actionable && error.retryAction && (
            <AlertDescription>
              <Button
                variant="outline"
                size="sm" 
                onClick={() => retryAction(error.id)}
                className="mt-2"
              >
                Retry
              </Button>
            </AlertDescription>
          )}
          {error.errorCode && (
            <AlertDescription className="text-xs mt-2 text-muted-foreground">
              Error code: {error.errorCode}
            </AlertDescription>
          )}
        </Alert>
      ))}
    </div>
  );
};

/**
 * Common error handling for API requests
 */
export const handleApiError = (
  error: any,
  addError: (error: Omit<EmailError, 'id' | 'timestamp'>) => string,
  component?: string,
  retryAction?: () => Promise<void>,
): string => {
  let message = 'An error occurred while communicating with the server.';
  let details = '';
  let errorCode = '';
  
  // Determine error type and extract useful information
  if (error.response) {
    // Server responded with an error status
    const status = error.response.status;
    errorCode = `API-${status}`;
    
    switch (status) {
      case 400:
        message = 'The request was invalid.';
        details = error.response.data?.message || 'Please check your data and try again.';
        break;
      case 401:
        message = 'Authentication failed.';
        details = 'Please check your API key or login again.';
        break;
      case 403:
        message = 'You do not have permission to perform this action.';
        break;
      case 404:
        message = 'The requested resource was not found.';
        break;
      case 429:
        message = 'Rate limit exceeded.';
        details = 'Please try again later.';
        break;
      case 500:
      case 502:
      case 503:
      case 504:
        message = 'The server encountered an error.';
        details = 'Please try again later.';
        break;
      default:
        message = `Server responded with status: ${status}`;
        details = error.response.data?.message || 'An unexpected error occurred.';
    }
  } else if (error.request) {
    // Request was made but no response received
    message = 'No response from server.';
    details = 'Please check your internet connection and try again.';
    errorCode = 'NETWORK-ERROR';
  } else {
    // Error setting up the request
    message = error.message || 'An unexpected error occurred.';
    errorCode = 'CLIENT-ERROR';
  }
  
  // Add the error to our system
  return addError({
    message,
    details,
    severity: 'error',
    component,
    actionable: !!retryAction,
    retryAction,
    errorCode,
  });
};

/**
 * Error handling specifically for SendGrid API errors
 */
export const handleSendGridError = (
  error: any,
  addError: (error: Omit<EmailError, 'id' | 'timestamp'>) => string,
  component?: string,
  retryAction?: () => Promise<void>,
): string => {
  let message = 'An error occurred while communicating with SendGrid.';
  let details = '';
  let errorCode = '';
  
  // Try to parse SendGrid specific error response
  try {
    if (error.response && error.response.data) {
      const sendgridError = error.response.data;
      
      // SendGrid error responses often have specific error fields
      if (sendgridError.errors && sendgridError.errors.length > 0) {
        const firstError = sendgridError.errors[0];
        message = firstError.message || message;
        errorCode = `SENDGRID-${firstError.field || 'API'}-${firstError.code || '000'}`;
        
        // Add details for specific SendGrid error types
        switch (firstError.code) {
          case 'bad_request':
            details = 'The request was invalid. Please check your API key and request data.';
            break;
          case 'unauthorized':
            details = 'Authentication failed. Please check your API key.';
            break;
          case 'forbidden':
            details = 'You do not have permission to perform this action.';
            break;
          case 'not_found':
            details = 'The requested resource was not found.';
            break;
          case 'rate_limit_exceeded':
            details = 'Rate limit exceeded. Please try again later.';
            break;
          default:
            details = 'Please check your request and try again.';
        }
      } else {
        // Fallback if errors array is not present
        message = sendgridError.message || message;
        errorCode = `SENDGRID-${sendgridError.code || 'UNKNOWN'}`;
      }
    }
  } catch (parseError) {
    // If error parsing fails, fallback to generic error handler
    return handleApiError(error, addError, component, retryAction);
  }
  
  // Add the error to our system
  return addError({
    message,
    details,
    severity: 'error',
    component,
    actionable: !!retryAction,
    retryAction,
    errorCode,
  });
};

/**
 * Error handling for email validation
 */
export const handleEmailValidationError = (
  errors: Record<string, string[]>,
  addError: (error: Omit<EmailError, 'id' | 'timestamp'>) => string,
  component?: string,
): string => {
  // Process validation errors
  const errorEntries = Object.entries(errors);
  
  if (errorEntries.length === 0) {
    return addError({
      message: 'Validation failed.',
      details: 'Please check your input and try again.',
      severity: 'warning',
      component,
    });
  }
  
  // Format the validation errors for display
  const formattedErrors = errorEntries.map(([field, messages]) => {
    return `${field}: ${messages.join(', ')}`;
  }).join('\n');
  
  return addError({
    message: 'Email validation failed.',
    details: formattedErrors,
    severity: 'warning',
    component,
    errorCode: 'VALIDATION-ERROR',
  });
};
