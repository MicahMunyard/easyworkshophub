import React, { useState, useEffect } from 'react';
import { useEzyParts } from '@/contexts/EzyPartsContext';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from "@/components/ui/table";
import { 
  CheckCircle2, 
  XCircle, 
  AlertCircle, 
  RefreshCw, 
  Loader2, 
  Search, 
  FileCode,
  BookOpen,
  Server,
  Webhook,
  Database
} from 'lucide-react';

const EzyPartsDiagnostic: React.FC = () => {
  const { 
    credentials, 
    isProduction, 
    connectionStatus, 
    testEzyPartsConnection, 
    client, 
    logAction 
  } = useEzyParts();
  
  const [activeTab, setActiveTab] = useState('status');
  const [isLoading, setIsLoading] = useState(false);
  const [testResults, setTestResults] = useState<Record<string, {success: boolean, message: string}>>({});
  const [diagnosticLogs, setDiagnosticLogs] = useState<any[]>([]);
  const [setupStatus, setSetupStatus] = useState('unknown');
  
  // Fetch initial status
  useEffect(() => {
    if (connectionStatus === 'unchecked' && client) {
      testEzyPartsConnection();
    }
  }, [connectionStatus, client, testEzyPartsConnection]);
  
  const runAllTests = async () => {
    setIsLoading(true);
    setTestResults({});
    
    try {
      // Test 1: OAuth Credentials
      const credentialsComplete = credentials.accountId && 
                                credentials.username && 
                                credentials.password && 
                                credentials.clientId && 
                                credentials.clientSecret;
      
      setTestResults(prev => ({
        ...prev,
        credentials: {
          success: Boolean(credentialsComplete),
          message: credentialsComplete ? 
            'OAuth credentials found' : 
            'Missing OAuth credentials'
        }
      }));
      
      // Test 2: EzyParts API Connection (use existing context method)
      try {
        const connectionSuccess = await testEzyPartsConnection();
        setTestResults(prev => ({
          ...prev,
          connection: {
            success: Boolean(connectionSuccess),
            message: connectionSuccess ? 
              'Successfully connected to EzyParts API' : 
              'Failed to connect to EzyParts API'
          }
        }));
      } catch (error) {
        setTestResults(prev => ({
          ...prev,
          connection: {
            success: false,
            message: `Connection error: ${error instanceof Error ? error.message : 'Unknown error'}`
          }
        }));
      }
      
      // Test 3: Edge Function Accessibility (correct endpoint)
      try {
        const baseUrl = window.location.origin;
        const diagnosticUrl = `${baseUrl}/functions/v1/ezyparts-diagnostic?action=test-api`;
        
        const response = await fetch(diagnosticUrl);
        const data = await response.json();
        
        setTestResults(prev => ({
          ...prev,
          edgeFunction: {
            success: response.ok && Boolean(data.success),
            message: response.ok && data.success ? 
              'Edge function is accessible' : 
              `Edge function issue: ${data.message || response.statusText}`
          }
        }));
      } catch (error) {
        setTestResults(prev => ({
          ...prev,
          edgeFunction: {
            success: false,
            message: `Edge function error: ${error instanceof Error ? error.message : 'Unknown error'}`
          }
        }));
      }
      
      // Test 4: Webhook Test (correct endpoint)
      try {
        const baseUrl = window.location.origin;
        const webhookTestUrl = `${baseUrl}/functions/v1/ezyparts-diagnostic?action=test-webhook`;
        
        const response = await fetch(webhookTestUrl);
        const data = await response.json();
        
        setTestResults(prev => ({
          ...prev,
          webhook: {
            success: response.ok && Boolean(data.success),
            message: response.ok && data.success ? 
              'Webhook test succeeded' : 
              `Webhook test failed: ${data.message || response.statusText}`
          }
        }));
      } catch (error) {
        setTestResults(prev => ({
          ...prev,
          webhook: {
            success: false,
            message: `Webhook test error: ${error instanceof Error ? error.message : 'Unknown error'}`
          }
        }));
      }
      
      // Log the test results
      logAction('diagnostic_tests', { results: testResults });
      
    } catch (error) {
      console.error('Error running tests:', error);
    } finally {
      setIsLoading(false);
    }
  };
  
  const setupDiagnostics = async () => {
    setIsLoading(true);
    setSetupStatus('loading');
    
    try {
      const baseUrl = window.location.origin;
      const setupUrl = `${baseUrl}/functions/v1/ezyparts-diagnostic?action=setup`;
      
      const response = await fetch(setupUrl);
      const data = await response.json();
      
      if (response.ok && data.success) {
        setSetupStatus('success');
      } else {
        setSetupStatus('error');
      }
    } catch (error) {
      console.error('Setup error:', error);
      setSetupStatus('error');
    } finally {
      setIsLoading(false);
    }
  };
  
  const fetchLogs = async () => {
    setIsLoading(true);
    
    try {
      const baseUrl = window.location.origin;
      const logsUrl = `${baseUrl}/functions/v1/ezyparts-diagnostic?action=logs`;
      
      const response = await fetch(logsUrl);
      const data = await response.json();
      
      if (response.ok && data.success) {
        setDiagnosticLogs(data.logs || []);
      }
    } catch (error) {
      console.error('Error fetching logs:', error);
    } finally {
      setIsLoading(false);
    }
  };
  
  return (
    <div className="container mx-auto py-8">
      <div className="mb-6">
        <h1 className="text-3xl font-bold">EzyParts Diagnostic Tools</h1>
        <p className="text-muted-foreground">Troubleshoot and diagnose EzyParts integration issues</p>
      </div>
      
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="mb-4">
          <TabsTrigger value="status">
            Status
          </TabsTrigger>
          <TabsTrigger value="tests">
            Run Tests
          </TabsTrigger>
          <TabsTrigger value="logs">
            Logs
          </TabsTrigger>
          <TabsTrigger value="docs">
            Documentation
          </TabsTrigger>
        </TabsList>
        
        <TabsContent value="status">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Server className="h-5 w-5" />
                  Connection Status
                </CardTitle>
                <CardDescription>Current EzyParts API connection status</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex items-center gap-4">
                    <div className="w-3 h-3 rounded-full bg-gray-400 flex-shrink-0">
                      {connectionStatus === 'ok' && <div className="w-3 h-3 rounded-full bg-green-500"></div>}
                      {connectionStatus === 'error' && <div className="w-3 h-3 rounded-full bg-red-500"></div>}
                      {connectionStatus === 'unchecked' && <div className="w-3 h-3 rounded-full bg-amber-500"></div>}
                    </div>
                    <span className="font-medium">
                      {connectionStatus === 'ok' && 'Connected to EzyParts API'}
                      {connectionStatus === 'error' && 'Error connecting to EzyParts API'}
                      {connectionStatus === 'unchecked' && 'Connection status not checked'}
                    </span>
                  </div>
                  
                  <div className="border rounded-md p-4 space-y-2">
                    <div className="flex justify-between items-center">
                      <span className="text-sm font-medium">Environment:</span>
                      <Badge variant={isProduction ? "default" : "secondary"}>
                        {isProduction ? 'Production' : 'Staging'}
                      </Badge>
                    </div>
                    
                    <div className="flex justify-between items-center">
                      <span className="text-sm font-medium">Account ID:</span>
                      <span className="text-sm">
                        {credentials.accountId || 'Not set'}
                      </span>
                    </div>
                    
                    <div className="flex justify-between items-center">
                      <span className="text-sm font-medium">Username:</span>
                      <span className="text-sm">
                        {credentials.username || 'Not set'}
                      </span>
                    </div>
                    
                    <div className="flex justify-between items-center">
                      <span className="text-sm font-medium">OAuth Client ID:</span>
                      <span className="text-sm">
                        {credentials.clientId ? 'Configured' : 'Not set'}
                      </span>
                    </div>
                    
                    <div className="flex justify-between items-center">
                      <span className="text-sm font-medium">OAuth Secret:</span>
                      <span className="text-sm">
                        {credentials.clientSecret ? 'Configured' : 'Not set'}
                      </span>
                    </div>
                  </div>
                </div>
              </CardContent>
              <CardFooter>
                <Button 
                  className="w-full"
                  onClick={() => testEzyPartsConnection()}
                  disabled={isLoading || !credentials.clientId || !credentials.clientSecret}
                >
                  {isLoading ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Testing Connection...
                    </>
                  ) : (
                    <>
                      <RefreshCw className="mr-2 h-4 w-4" />
                      Test Connection
                    </>
                  )}
                </Button>
              </CardFooter>
            </Card>
            
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Webhook className="h-5 w-5" />
                  EzyParts Quote Webhook
                </CardTitle>
                <CardDescription>Quote return webhook configuration</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <Alert>
                    <AlertCircle className="h-4 w-4" />
                    <AlertTitle>Important</AlertTitle>
                    <AlertDescription>
                      The "Send to WMS" functionality in EzyParts requires a properly configured webhook to receive the quote data.
                    </AlertDescription>
                  </Alert>
                  
                  <div className="border rounded-md p-4 space-y-2">
                    <div className="space-y-1">
                      <span className="text-sm font-medium">Webhook URL:</span>
                      <code className="block bg-muted p-2 rounded text-xs break-all">
                        {window.location.origin}/functions/v1/ezyparts-quote
                      </code>
                    </div>
                    
                    <div className="pt-2">
                      <span className="text-sm font-medium">SSL Certificate:</span>
                      <div className="mt-1 text-sm">
                        EzyParts requires your SSL certificate to be installed on their servers.
                        Please contact Bapcor support to verify your certificate is installed.
                      </div>
                    </div>
                  </div>
                </div>
              </CardContent>
              <CardFooter>
                <Button 
                  className="w-full"
                  variant="outline"
                  onClick={() => {
                    const baseUrl = window.location.origin;
                    const webhookTestUrl = `${baseUrl}/functions/v1/ezyparts-diagnostic?action=test-webhook`;
                    window.open(webhookTestUrl, '_blank');
                  }}
                >
                  <Search className="mr-2 h-4 w-4" />
                  Test Webhook
                </Button>
              </CardFooter>
            </Card>
            
            <Card className="md:col-span-2">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Database className="h-5 w-5" />
                  Diagnostic Setup
                </CardTitle>
                <CardDescription>Configure diagnostic tables to help troubleshoot issues</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <Alert>
                    <FileCode className="h-4 w-4" />
                    <AlertTitle>Diagnostic Tables</AlertTitle>
                    <AlertDescription>
                      Setup tables to store detailed logs and request data for troubleshooting the EzyParts integration.
                      This will help diagnose issues with the "Send to WMS" functionality.
                    </AlertDescription>
                  </Alert>
                  
                  <div className="border rounded-md p-4">
                    {setupStatus === 'success' ? (
                      <div className="flex items-center gap-2 text-green-600">
                        <CheckCircle2 className="h-5 w-5" />
                        <span>Diagnostic tables setup successfully</span>
                      </div>
                    ) : setupStatus === 'error' ? (
                      <div className="flex items-center gap-2 text-red-600">
                        <XCircle className="h-5 w-5" />
                        <span>Error setting up diagnostic tables</span>
                      </div>
                    ) : setupStatus === 'loading' ? (
                      <div className="flex items-center gap-2 text-amber-600">
                        <Loader2 className="h-5 w-5 animate-spin" />
                        <span>Setting up diagnostic tables...</span>
                      </div>
                    ) : (
                      <div className="flex items-center gap-2">
                        <AlertCircle className="h-5 w-5" />
                        <span>Diagnostic tables not set up</span>
                      </div>
                    )}
                  </div>
                </div>
              </CardContent>
              <CardFooter>
                <Button 
                  className="w-full"
                  onClick={setupDiagnostics}
                  disabled={isLoading || setupStatus === 'loading' || setupStatus === 'success'}
                >
                  {isLoading || setupStatus === 'loading' ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Setting Up...
                    </>
                  ) : (
                    'Setup Diagnostic Tables'
                  )}
                </Button>
              </CardFooter>
            </Card>
          </div>
        </TabsContent>
        
        <TabsContent value="tests">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Search className="h-5 w-5" />
                Diagnostic Tests
              </CardTitle>
              <CardDescription>Run tests to identify integration issues</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="border rounded-md p-4">
                    <h3 className="font-medium mb-2 flex items-center gap-2">
                      OAuth Credentials
                      {testResults.credentials && (
                        testResults.credentials.success ? 
                          <CheckCircle2 className="h-4 w-4 text-green-500" /> : 
                          <XCircle className="h-4 w-4 text-red-500" />
                      )}
                    </h3>
                    <p className="text-sm text-muted-foreground">
                      Verifies that all required OAuth credentials are configured.
                    </p>
                    {testResults.credentials && (
                      <p className={`text-sm mt-2 ${testResults.credentials.success ? 'text-green-600' : 'text-red-600'}`}>
                        {testResults.credentials.message}
                      </p>
                    )}
                  </div>
                  
                  <div className="border rounded-md p-4">
                    <h3 className="font-medium mb-2 flex items-center gap-2">
                      API Connection
                      {testResults.connection && (
                        testResults.connection.success ? 
                          <CheckCircle2 className="h-4 w-4 text-green-500" /> : 
                          <XCircle className="h-4 w-4 text-red-500" />
                      )}
                    </h3>
                    <p className="text-sm text-muted-foreground">
                      Tests the connection to the EzyParts API with your credentials.
                    </p>
                    {testResults.connection && (
                      <p className={`text-sm mt-2 ${testResults.connection.success ? 'text-green-600' : 'text-red-600'}`}>
                        {testResults.connection.message}
                      </p>
                    )}
                  </div>
                  
                  <div className="border rounded-md p-4">
                    <h3 className="font-medium mb-2 flex items-center gap-2">
                      Edge Function
                      {testResults.edgeFunction && (
                        testResults.edgeFunction.success ? 
                          <CheckCircle2 className="h-4 w-4 text-green-500" /> : 
                          <XCircle className="h-4 w-4 text-red-500" />
                      )}
                    </h3>
                    <p className="text-sm text-muted-foreground">
                      Checks if the Edge Function endpoint is accessible.
                    </p>
                    {testResults.edgeFunction && (
                      <p className={`text-sm mt-2 ${testResults.edgeFunction.success ? 'text-green-600' : 'text-red-600'}`}>
                        {testResults.edgeFunction.message}
                      </p>
                    )}
                  </div>
                  
                  <div className="border rounded-md p-4">
                    <h3 className="font-medium mb-2 flex items-center gap-2">
                      Webhook Test
                      {testResults.webhook && (
                        testResults.webhook.success ? 
                          <CheckCircle2 className="h-4 w-4 text-green-500" /> : 
                          <XCircle className="h-4 w-4 text-red-500" />
                      )}
                    </h3>
                    <p className="text-sm text-muted-foreground">
                      Tests if the quote webhook can receive and process data.
                    </p>
                    {testResults.webhook && (
                      <p className={`text-sm mt-2 ${testResults.webhook.success ? 'text-green-600' : 'text-red-600'}`}>
                        {testResults.webhook.message}
                      </p>
                    )}
                  </div>
                </div>
                
                {Object.keys(testResults).length > 0 && (
                  <Alert className={
                    Object.values(testResults).every(r => r.success) 
                      ? "bg-green-50 border-green-200" 
                      : "bg-amber-50 border-amber-200"
                  }>
                    <AlertTitle>
                      {Object.values(testResults).every(r => r.success) 
                        ? "All tests passed!" 
                        : "Some tests failed"}
                    </AlertTitle>
                    <AlertDescription>
                      {Object.values(testResults).every(r => r.success) 
                        ? "Your EzyParts integration seems to be correctly configured." 
                        : "Please check the failed tests and fix the issues."}
                    </AlertDescription>
                  </Alert>
                )}
              </div>
            </CardContent>
            <CardFooter>
              <Button 
                className="w-full"
                onClick={runAllTests}
                disabled={isLoading}
              >
                {isLoading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Running Tests...
                  </>
                ) : (
                  <>
                    <Search className="mr-2 h-4 w-4" />
                    Run All Tests
                  </>
                )}
              </Button>
            </CardFooter>
          </Card>
        </TabsContent>
        
        <TabsContent value="logs">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <FileCode className="h-5 w-5" />
                Diagnostic Logs
              </CardTitle>
              <CardDescription>View logs to debug integration issues</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex justify-end">
                  <Button 
                    variant="outline" 
                    size="sm"
                    onClick={fetchLogs}
                    disabled={isLoading}
                  >
                    {isLoading ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        Loading...
                      </>
                    ) : (
                      <>
                        <RefreshCw className="mr-2 h-4 w-4" />
                        Refresh Logs
                      </>
                    )}
                  </Button>
                </div>
                
                {diagnosticLogs.length > 0 ? (
                  <div className="border rounded-md overflow-hidden">
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>Timestamp</TableHead>
                          <TableHead>Level</TableHead>
                          <TableHead>Message</TableHead>
                          <TableHead>Details</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {diagnosticLogs.map((log, index) => (
                          <TableRow key={index}>
                            <TableCell className="whitespace-nowrap">
                              {new Date(log.created_at).toLocaleString()}
                            </TableCell>
                            <TableCell>
                              <Badge 
                                variant={
                                  log.level === 'error' ? 'destructive' : 
                                  log.level === 'warn' ? 'default' : 
                                  'secondary'
                                }
                              >
                                {log.level}
                              </Badge>
                            </TableCell>
                            <TableCell>{log.message}</TableCell>
                            <TableCell>
                              {log.data && (
                                <Accordion type="single" collapsible>
                                  <AccordionItem value="details">
                                    <AccordionTrigger className="text-xs">View Details</AccordionTrigger>
                                    <AccordionContent>
                                      <pre className="text-xs bg-muted p-2 rounded-md overflow-auto max-h-40">
                                        {JSON.stringify(log.data, null, 2)}
                                      </pre>
                                    </AccordionContent>
                                  </AccordionItem>
                                </Accordion>
                              )}
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </div>
                ) : (
                  <div className="text-center py-8 border rounded-md">
                    <p className="text-muted-foreground">No logs found</p>
                    <Button 
                      variant="outline"
                      size="sm"
                      className="mt-2"
                      onClick={fetchLogs}
                    >
                      Fetch Logs
                    </Button>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="docs">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <BookOpen className="h-5 w-5" />
                EzyParts Integration Documentation
              </CardTitle>
              <CardDescription>Key information for troubleshooting</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-6">
                <Alert className="bg-amber-50 border-amber-200">
                  <AlertCircle className="h-4 w-4 text-amber-600" />
                  <AlertTitle>SSL Certificate Requirement</AlertTitle>
                  <AlertDescription>
                    <p className="mb-2">
                      According to the EzyParts documentation (page 11), a current SSL Certificate is 
                      required to be installed on the EzyParts servers:
                    </p>
                    <blockquote className="border-l-4 border-amber-300 pl-4 italic">
                      For all web-based WMS (https) solutions wishing to have the payload sent back to a 
                      specific Web Server, a current SSL Certificate is required. This certificate will need to be 
                      installed on the EzyParts servers prior to being able to post the Quote response payload to 
                      the production version of EzyParts 2.0.
                    </blockquote>
                  </AlertDescription>
                </Alert>
                
                <Accordion type="single" collapsible className="w-full">
                  <AccordionItem value="item-1">
                    <AccordionTrigger>How the EzyParts Integration Works</AccordionTrigger>
                    <AccordionContent>
                      <ol className="space-y-2 list-decimal pl-5">
                        <li>WorkshopBase (WMS) invokes EzyParts with authentication credentials, vehicle details, and the quote URL.</li>
                        <li>The user selects parts in EzyParts and clicks "Send to WMS".</li>
                        <li>EzyParts attempts to send the JSON payload to the specified quote URL.</li>
                        <li>The Edge Function at the quote URL receives and processes the payload.</li>
                        <li>The user is redirected back to WorkshopBase with the quote data.</li>
                      </ol>
                    </AccordionContent>
                  </AccordionItem>
                  
                  <AccordionItem value="item-2">
                    <AccordionTrigger>Common "Send to WMS" Issues</AccordionTrigger>
                    <AccordionContent>
                      <ul className="space-y-2 list-disc pl-5">
                        <li><strong>SSL Certificate:</strong> Certificate not installed on EzyParts servers.</li>
                        <li><strong>Webhook URL:</strong> Incorrect or inaccessible quote URL.</li>
                        <li><strong>CORS Issues:</strong> EzyParts cannot send data due to CORS restrictions.</li>
                        <li><strong>Authentication:</strong> OAuth token expired or invalid.</li>
                        <li><strong>Content Parsing:</strong> Edge function cannot parse the returned payload format.</li>
                        <li><strong>Server Error:</strong> Edge function encounters an error while processing the payload.</li>
                      </ul>
                    </AccordionContent>
                  </AccordionItem>
                  
                  <AccordionItem value="item-3">
                    <AccordionTrigger>Solution for "Sending cart failed" Error</AccordionTrigger>
                    <AccordionContent className="space-y-4">
                      <p>Based on the message "Sending cart failed", EzyParts is unable to send the payload to your webhook. Follow these steps:</p>
                      
                      <ol className="space-y-2 list-decimal pl-5">
                        <li><strong>Contact Bapcor Support:</strong> Verify your SSL certificate is installed on their servers.</li>
                        <li><strong>Check webhook URL:</strong> Ensure the URL is correct and accessible from external sources.</li>
                        <li><strong>Review Edge Function:</strong> Make sure your function has proper CORS headers and error handling.</li>
                        <li><strong>Test with Alternative Mode:</strong> Try the fat-client approach by setting quoteUrl to blank.</li>
                        <li><strong>Enable Detailed Logging:</strong> Use the enhanced logging from this diagnostic tool.</li>
                      </ol>
                      
                      <Alert>
                        <AlertTitle>Alternative Approach</AlertTitle>
                        <AlertDescription>
                          If web-based integration continues to fail, consider using the fat-client approach described in the documentation (page 11):
                          <blockquote className="border-l-4 border-gray-300 pl-4 mt-2 italic">
                            "The quoteURL attribute should be set to blank (empty) so that the EzyParts WebHook HTML Page will be displayed with the JSON data populated into a hidden DIV in an HTML Page."
                          </blockquote>
                        </AlertDescription>
                      </Alert>
                    </AccordionContent>
                  </AccordionItem>
                </Accordion>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default EzyPartsDiagnostic;
