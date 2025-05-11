
import React, { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { Badge } from "@/components/ui/badge";
import { AlertCircle, Check, Smartphone, Desktop, Tablet, Mail, Info } from "lucide-react";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { EmailTestingProps } from "./types";

// Device preview frames
const deviceFrames = {
  desktop: { width: "100%", maxWidth: "600px", border: "1px solid #e2e8f0", borderRadius: "8px" },
  mobile: { width: "320px", border: "12px solid #333", borderRadius: "24px", padding: "8px 0" },
  tablet: { width: "450px", border: "16px solid #333", borderRadius: "16px" }
};

// List of common email clients for rendering tests
const emailClients = [
  { id: "gmail", name: "Gmail", icon: "mail", popular: true },
  { id: "outlook", name: "Outlook", icon: "mail", popular: true },
  { id: "apple-mail", name: "Apple Mail", icon: "mail", popular: true },
  { id: "yahoo", name: "Yahoo Mail", icon: "mail", popular: false },
  { id: "thunderbird", name: "Thunderbird", icon: "mail", popular: false },
  { id: "samsung-email", name: "Samsung Email", icon: "mail", popular: false },
];

// Common spam trigger words
const spamTriggerWords = [
  "free", "guarantee", "no obligation", "winner", "congratulations", 
  "urgent", "act now", "limited time", "cash", "discount", "offer",
  "credit", "click here", "order now", "satisfaction", "incredible deal"
];

const EmailTesting: React.FC<EmailTestingProps> = ({
  emailSubject,
  emailContent,
  onSendTest,
  isSubmitting
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [activeTab, setActiveTab] = useState("preview");
  const [activeDevice, setActiveDevice] = useState("desktop");
  const [testRecipients, setTestRecipients] = useState("");
  const [additionalRecipient, setAdditionalRecipient] = useState("");
  const [additionalNote, setAdditionalNote] = useState("");
  const [testResults, setTestResults] = useState<{success: boolean; message?: string} | null>(null);
  const [spamCheckResults, setSpamCheckResults] = useState<{score: number; triggers: string[]} | null>(null);

  // Split multiple email addresses
  const getRecipientList = () => {
    return testRecipients
      .split(",")
      .map(email => email.trim())
      .filter(email => email.length > 0);
  };

  // Handle adding a new recipient
  const handleAddRecipient = () => {
    if (additionalRecipient && /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(additionalRecipient)) {
      setTestRecipients(prev => {
        const currentRecipients = prev.split(",").map(email => email.trim()).filter(email => email.length > 0);
        if (!currentRecipients.includes(additionalRecipient)) {
          return [...currentRecipients, additionalRecipient].join(", ");
        }
        return prev;
      });
      setAdditionalRecipient("");
    }
  };

  // Send test email
  const handleSendTest = async () => {
    const recipients = getRecipientList();
    if (recipients.length === 0) {
      setTestResults({
        success: false,
        message: "Please add at least one valid email address"
      });
      return;
    }

    const result = await onSendTest(recipients, {
      note: additionalNote
    });
    
    setTestResults(result);
    
    if (result.success) {
      // Clear form after successful send
      setAdditionalNote("");
    }
  };

  // Perform spam check on current content
  const performSpamCheck = () => {
    // Analyze content for spam triggers
    const lowerCaseContent = (emailSubject + " " + emailContent).toLowerCase();
    const foundTriggers = spamTriggerWords.filter(word => 
      lowerCaseContent.includes(word.toLowerCase())
    );
    
    // Calculate a simple spam score (0-10)
    const score = Math.min(10, Math.round((foundTriggers.length / spamTriggerWords.length) * 10));
    
    setSpamCheckResults({
      score,
      triggers: foundTriggers
    });
    
    // Switch to spam check tab to show results
    setActiveTab("spam-check");
  };

  // Get a visual indicator for spam score
  const getSpamScoreIndicator = (score: number) => {
    if (score <= 3) {
      return { color: "text-green-500", icon: <Check className="h-4 w-4" />, text: "Low" };
    } else if (score <= 6) {
      return { color: "text-amber-500", icon: <AlertCircle className="h-4 w-4" />, text: "Medium" };
    } else {
      return { color: "text-red-500", icon: <AlertCircle className="h-4 w-4" />, text: "High" };
    }
  };

  // Get email preview component for the selected device
  const getDevicePreview = () => {
    const style = deviceFrames[activeDevice as keyof typeof deviceFrames];
    
    return (
      <div className="overflow-x-auto py-4">
        <div className="flex justify-center">
          <div style={style} className="bg-white">
            <div className="email-preview-header border-b p-2">
              <div className="text-sm font-medium">Subject: {emailSubject || "[No subject]"}</div>
              <div className="text-xs text-muted-foreground">From: Your Workshop &lt;noreply@yourworkshop.com&gt;</div>
            </div>
            <div 
              className="email-preview-content p-4" 
              dangerouslySetInnerHTML={{ __html: emailContent }}
            />
          </div>
        </div>
      </div>
    );
  };

  return (
    <>
      <Button
        type="button"
        variant="outline"
        onClick={() => setIsOpen(true)}
        className="flex items-center gap-2"
      >
        <Mail className="h-4 w-4" />
        Test Send & Preview
      </Button>

      <Dialog open={isOpen} onOpenChange={setIsOpen}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Email Testing & Preview</DialogTitle>
          </DialogHeader>

          <Tabs value={activeTab} onValueChange={setActiveTab}>
            <TabsList className="grid grid-cols-3">
              <TabsTrigger value="preview">Device Preview</TabsTrigger>
              <TabsTrigger value="test-send">Test Send</TabsTrigger>
              <TabsTrigger value="spam-check">Spam Check</TabsTrigger>
            </TabsList>

            <TabsContent value="preview" className="space-y-4">
              <div className="flex justify-center space-x-4 mb-4">
                <TooltipProvider>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <Button
                        variant={activeDevice === "desktop" ? "default" : "outline"}
                        size="sm"
                        onClick={() => setActiveDevice("desktop")}
                      >
                        <Desktop className="h-4 w-4" />
                      </Button>
                    </TooltipTrigger>
                    <TooltipContent>Desktop Preview</TooltipContent>
                  </Tooltip>
                </TooltipProvider>

                <TooltipProvider>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <Button
                        variant={activeDevice === "mobile" ? "default" : "outline"}
                        size="sm"
                        onClick={() => setActiveDevice("mobile")}
                      >
                        <Smartphone className="h-4 w-4" />
                      </Button>
                    </TooltipTrigger>
                    <TooltipContent>Mobile Preview</TooltipContent>
                  </Tooltip>
                </TooltipProvider>

                <TooltipProvider>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <Button
                        variant={activeDevice === "tablet" ? "default" : "outline"}
                        size="sm"
                        onClick={() => setActiveDevice("tablet")}
                      >
                        <Tablet className="h-4 w-4" />
                      </Button>
                    </TooltipTrigger>
                    <TooltipContent>Tablet Preview</TooltipContent>
                  </Tooltip>
                </TooltipProvider>
              </div>

              {getDevicePreview()}

              <div className="space-y-4 border-t pt-4">
                <div className="text-sm font-medium">Email Client Compatibility</div>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
                  {emailClients.map(client => (
                    <div 
                      key={client.id} 
                      className="flex items-center p-2 border rounded-md"
                    >
                      <div className="h-8 w-8 rounded-full bg-primary/10 flex items-center justify-center mr-2">
                        <Mail className="h-4 w-4 text-primary" />
                      </div>
                      <div>
                        <div className="text-sm font-medium">{client.name}</div>
                        {client.popular && (
                          <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200 text-xs">
                            Popular
                          </Badge>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
                <div className="flex justify-end space-x-2">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => setActiveTab("test-send")}
                  >
                    Send Test Email
                  </Button>
                  <Button
                    type="button"
                    onClick={() => performSpamCheck()}
                  >
                    Check for Spam Triggers
                  </Button>
                </div>
              </div>
            </TabsContent>

            <TabsContent value="test-send" className="space-y-4">
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="testRecipients">Test Recipients</Label>
                  <Textarea
                    id="testRecipients"
                    value={testRecipients}
                    onChange={(e) => setTestRecipients(e.target.value)}
                    placeholder="Enter email addresses separated by commas"
                    className="h-24"
                  />
                  <div className="text-xs text-muted-foreground">
                    Enter multiple emails separated by commas
                  </div>
                </div>

                <div className="flex items-center space-x-2">
                  <div className="flex-1">
                    <Input
                      id="additionalRecipient"
                      value={additionalRecipient}
                      onChange={(e) => setAdditionalRecipient(e.target.value)}
                      placeholder="Add another recipient"
                    />
                  </div>
                  <Button 
                    type="button" 
                    onClick={handleAddRecipient}
                    disabled={!additionalRecipient || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(additionalRecipient)}
                  >
                    Add
                  </Button>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="additionalNote">Additional Note (Optional)</Label>
                  <Textarea
                    id="additionalNote"
                    value={additionalNote}
                    onChange={(e) => setAdditionalNote(e.target.value)}
                    placeholder="Add a note to include with the test email"
                    className="h-24"
                  />
                </div>

                {testResults && (
                  <Alert variant={testResults.success ? "default" : "destructive"} className="mt-4">
                    {testResults.success ? (
                      <Check className="h-4 w-4" />
                    ) : (
                      <AlertCircle className="h-4 w-4" />
                    )}
                    <AlertDescription>{testResults.message}</AlertDescription>
                  </Alert>
                )}

                <div className="flex justify-end space-x-2 pt-4">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => setActiveTab("preview")}
                  >
                    Back to Preview
                  </Button>
                  <Button
                    type="button"
                    onClick={handleSendTest}
                    disabled={isSubmitting || getRecipientList().length === 0}
                  >
                    {isSubmitting ? "Sending..." : "Send Test Email"}
                  </Button>
                </div>
              </div>
            </TabsContent>

            <TabsContent value="spam-check" className="space-y-4">
              <div className="mb-4">
                <Button
                  type="button"
                  onClick={performSpamCheck}
                  className="w-full"
                >
                  Run Spam Check
                </Button>
              </div>

              {spamCheckResults ? (
                <div className="space-y-4">
                  <Card>
                    <CardHeader>
                      <CardTitle>Spam Score Analysis</CardTitle>
                      <CardDescription>
                        Analysis of potential deliverability issues
                      </CardDescription>
                    </CardHeader>
                    <CardContent>
                      <div className="flex items-center mb-4">
                        <div className="text-2xl font-bold mr-2">
                          Spam Score: {spamCheckResults.score}/10
                        </div>
                        <div className={`flex items-center ${getSpamScoreIndicator(spamCheckResults.score).color}`}>
                          {getSpamScoreIndicator(spamCheckResults.score).icon}
                          <span className="ml-1">
                            {getSpamScoreIndicator(spamCheckResults.score).text} Risk
                          </span>
                        </div>
                      </div>

                      <Separator className="my-4" />

                      <div className="space-y-4">
                        <div>
                          <h3 className="font-medium mb-2">Detected Trigger Words</h3>
                          {spamCheckResults.triggers.length > 0 ? (
                            <div className="flex flex-wrap gap-2">
                              {spamCheckResults.triggers.map((word, index) => (
                                <Badge key={index} variant="outline" className="bg-amber-50 text-amber-700 border-amber-200">
                                  {word}
                                </Badge>
                              ))}
                            </div>
                          ) : (
                            <p className="text-sm text-muted-foreground">No common spam trigger words detected</p>
                          )}
                        </div>

                        <div>
                          <h3 className="font-medium mb-2">Recommendations</h3>
                          <ul className="space-y-2 text-sm text-muted-foreground list-disc pl-5">
                            {spamCheckResults.triggers.length > 0 && (
                              <li>Consider removing or rephrasing the highlighted trigger words</li>
                            )}
                            <li>Use a clear, specific subject line that accurately reflects the content</li>
                            <li>Avoid excessive use of capital letters and exclamation points</li>
                            <li>Maintain a balanced text-to-image ratio</li>
                            <li>Include a physical address and unsubscribe link</li>
                            <li>Send from a consistent, recognizable sender name</li>
                          </ul>
                        </div>
                      </div>
                    </CardContent>
                  </Card>

                  <Card>
                    <CardHeader>
                      <CardTitle>Deliverability Tips</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-2">
                        <div className="flex items-start gap-2">
                          <Info className="h-4 w-4 text-blue-500 mt-0.5" />
                          <p className="text-sm">
                            <span className="font-medium">Warm up your domain:</span> When starting email marketing, gradually increase sending volume
                          </p>
                        </div>
                        <div className="flex items-start gap-2">
                          <Info className="h-4 w-4 text-blue-500 mt-0.5" />
                          <p className="text-sm">
                            <span className="font-medium">SPF, DKIM, DMARC:</span> Ensure these email authentication standards are set up correctly
                          </p>
                        </div>
                        <div className="flex items-start gap-2">
                          <Info className="h-4 w-4 text-blue-500 mt-0.5" />
                          <p className="text-sm">
                            <span className="font-medium">Clean your lists:</span> Regularly remove inactive subscribers to maintain good sending reputation
                          </p>
                        </div>
                        <div className="flex items-start gap-2">
                          <Info className="h-4 w-4 text-blue-500 mt-0.5" />
                          <p className="text-sm">
                            <span className="font-medium">Test before sending:</span> Always test emails on multiple clients before sending to your full list
                          </p>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </div>
              ) : (
                <div className="text-center py-8">
                  <p className="text-muted-foreground">Run a spam check to analyze your email content</p>
                </div>
              )}
            </TabsContent>
          </Tabs>
        </DialogContent>
      </Dialog>
    </>
  );
};

export default EmailTesting;
