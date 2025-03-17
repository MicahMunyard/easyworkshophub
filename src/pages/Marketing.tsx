
import React, { useState } from "react";
import { 
  Card, 
  CardContent, 
  CardDescription, 
  CardHeader, 
  CardTitle,
  CardFooter
} from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { 
  Shirt, 
  Megaphone, 
  Sticker, 
  Globe, 
  FileImage, 
  Calendar, 
  Check,
  Instagram,
  Facebook,
  Twitter,
  Youtube,
  Send
} from "lucide-react";

const MarketingServiceCard = ({ 
  icon: Icon, 
  title, 
  description, 
  buttonText = "Request Service", 
  className = ""
}) => (
  <Card className={`performance-card hover:shadow-lg transition-all ${className}`}>
    <CardHeader>
      <div className="flex items-center space-x-2">
        <div className="p-2 rounded-full bg-sidebar-accent">
          <Icon className="h-5 w-5 text-workshop-red" />
        </div>
        <CardTitle>{title}</CardTitle>
      </div>
      <CardDescription>{description}</CardDescription>
    </CardHeader>
    <CardContent className="space-y-4">
      <div className="rounded-md bg-muted h-40 flex items-center justify-center">
        <span className="text-sm text-muted-foreground">Preview Image</span>
      </div>
    </CardContent>
    <CardFooter>
      <Button className="w-full bg-workshop-red hover:bg-workshop-red/90">
        <Send className="mr-2 h-4 w-4" /> {buttonText}
      </Button>
    </CardFooter>
  </Card>
);

const Marketing = () => {
  const [activeServiceTab, setActiveServiceTab] = useState("stickers");
  
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold tracking-tight">Marketing</h1>
      </div>
      
      <Card className="performance-card bg-gradient-to-br from-background to-sidebar-accent">
        <CardContent className="p-6 md:p-8">
          <div className="grid gap-6 md:grid-cols-2 items-center">
            <div className="space-y-4">
              <h2 className="text-2xl font-bold">Boost Your Shop's Visibility</h2>
              <p className="text-muted-foreground">
                Our marketing services help your performance workshop stand out from the competition.
                From custom merchandise to digital marketing, we've got you covered.
              </p>
              <div className="flex space-x-3">
                <Button className="bg-workshop-red hover:bg-workshop-red/90">
                  <Megaphone className="mr-2 h-4 w-4" /> Learn More
                </Button>
                <Button variant="outline">
                  <Calendar className="mr-2 h-4 w-4" /> Schedule Consultation
                </Button>
              </div>
            </div>
            <div className="hidden md:flex justify-end">
              <div className="w-64 h-64 rounded-full bg-sidebar-accent flex items-center justify-center">
                <Megaphone className="h-20 w-20 text-workshop-red/50" />
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
      
      <Tabs value={activeServiceTab} onValueChange={setActiveServiceTab} className="space-y-4">
        <TabsList className="bg-sidebar-accent text-sidebar-foreground">
          <TabsTrigger value="stickers">
            <Sticker className="mr-2 h-4 w-4" /> Stickers
          </TabsTrigger>
          <TabsTrigger value="uniforms">
            <Shirt className="mr-2 h-4 w-4" /> Work Uniforms
          </TabsTrigger>
          <TabsTrigger value="design">
            <FileImage className="mr-2 h-4 w-4" /> Graphic Design
          </TabsTrigger>
          <TabsTrigger value="social">
            <Instagram className="mr-2 h-4 w-4" /> Social Media
          </TabsTrigger>
          <TabsTrigger value="website">
            <Globe className="mr-2 h-4 w-4" /> Website Design
          </TabsTrigger>
        </TabsList>
        
        <TabsContent value="stickers" className="space-y-6">
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            <MarketingServiceCard 
              icon={Sticker} 
              title="Custom Car Stickers" 
              description="High-quality vinyl stickers for customer vehicles"
            />
            <MarketingServiceCard 
              icon={Sticker} 
              title="Shop Logo Stickers" 
              description="Promote your brand with logo stickers"
            />
            <MarketingServiceCard 
              icon={Sticker} 
              title="QR Code Stickers" 
              description="Link to your website or social media"
            />
          </div>
          
          <Card className="performance-card">
            <CardHeader>
              <CardTitle>Custom Sticker Request</CardTitle>
              <CardDescription>
                Request custom stickers for your performance shop
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid gap-4 md:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="sticker-type">Sticker Type</Label>
                  <Input id="sticker-type" placeholder="e.g. Logo, QR Code, etc." />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="sticker-size">Size</Label>
                  <Input id="sticker-size" placeholder="e.g. 3x3 inches" />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="sticker-quantity">Quantity</Label>
                  <Input id="sticker-quantity" type="number" placeholder="e.g. 100" />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="sticker-material">Material</Label>
                  <Input id="sticker-material" placeholder="e.g. Vinyl, Holographic" />
                </div>
                <div className="space-y-2 md:col-span-2">
                  <Label htmlFor="sticker-notes">Additional Notes</Label>
                  <Input id="sticker-notes" placeholder="Any special instructions or design details" />
                </div>
              </div>
            </CardContent>
            <CardFooter>
              <Button className="w-full bg-workshop-red hover:bg-workshop-red/90">
                <Send className="mr-2 h-4 w-4" /> Submit Sticker Request
              </Button>
            </CardFooter>
          </Card>
        </TabsContent>
        
        <TabsContent value="uniforms" className="space-y-6">
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            <MarketingServiceCard 
              icon={Shirt} 
              title="Mechanic Shirts" 
              description="Professional button-up work shirts with embroidered logo"
            />
            <MarketingServiceCard 
              icon={Shirt} 
              title="Performance Polos" 
              description="Smart casual polos for customer-facing staff"
            />
            <MarketingServiceCard 
              icon={Shirt} 
              title="Shop T-Shirts" 
              description="Casual branded t-shirts for everyday wear"
            />
          </div>
          
          <Card className="performance-card">
            <CardHeader>
              <CardTitle>Work Uniform Order</CardTitle>
              <CardDescription>
                Order custom uniforms for your team
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid gap-4 md:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="uniform-type">Uniform Type</Label>
                  <Input id="uniform-type" placeholder="e.g. Button-up Shirt, Polo, T-Shirt" />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="uniform-quantity">Quantity</Label>
                  <Input id="uniform-quantity" type="number" placeholder="Total number of items" />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="uniform-sizes">Sizes Required</Label>
                  <Input id="uniform-sizes" placeholder="e.g. 2 S, 5 M, 3 L, 2 XL" />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="uniform-color">Color</Label>
                  <Input id="uniform-color" placeholder="Preferred color" />
                </div>
                <div className="space-y-2 md:col-span-2">
                  <Label htmlFor="uniform-logo">Logo Placement</Label>
                  <Input id="uniform-logo" placeholder="e.g. Left chest, full back" />
                </div>
                <div className="space-y-2 md:col-span-2">
                  <Label htmlFor="uniform-notes">Additional Notes</Label>
                  <Input id="uniform-notes" placeholder="Any special requirements" />
                </div>
              </div>
            </CardContent>
            <CardFooter>
              <Button className="w-full bg-workshop-red hover:bg-workshop-red/90">
                <Send className="mr-2 h-4 w-4" /> Submit Uniform Order
              </Button>
            </CardFooter>
          </Card>
        </TabsContent>
        
        <TabsContent value="design" className="space-y-6">
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            <MarketingServiceCard 
              icon={FileImage} 
              title="Custom Flyers" 
              description="Professional flyers to promote specials and services"
            />
            <MarketingServiceCard 
              icon={FileImage} 
              title="Promotional Posters" 
              description="Eye-catching posters for your shop"
            />
            <MarketingServiceCard 
              icon={FileImage} 
              title="Business Cards" 
              description="Professional business cards for your team"
            />
          </div>
          
          <Card className="performance-card">
            <CardHeader>
              <CardTitle>Graphic Design Request</CardTitle>
              <CardDescription>
                Request custom graphic design services
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid gap-4 md:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="design-type">Design Type</Label>
                  <Input id="design-type" placeholder="e.g. Flyer, Poster, Business Card" />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="design-size">Size</Label>
                  <Input id="design-size" placeholder="e.g. 8.5x11 inches, 3.5x2 inches" />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="design-quantity">Quantity</Label>
                  <Input id="design-quantity" type="number" placeholder="Number of prints needed" />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="design-deadline">Needed By</Label>
                  <Input id="design-deadline" type="date" />
                </div>
                <div className="space-y-2 md:col-span-2">
                  <Label htmlFor="design-details">Design Details</Label>
                  <Input id="design-details" placeholder="What should be included in the design" />
                </div>
                <div className="space-y-2 md:col-span-2">
                  <Label htmlFor="design-notes">Additional Notes</Label>
                  <Input id="design-notes" placeholder="Any special instructions" />
                </div>
              </div>
            </CardContent>
            <CardFooter>
              <Button className="w-full bg-workshop-red hover:bg-workshop-red/90">
                <Send className="mr-2 h-4 w-4" /> Submit Design Request
              </Button>
            </CardFooter>
          </Card>
        </TabsContent>
        
        <TabsContent value="social" className="space-y-6">
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
            <MarketingServiceCard 
              icon={Instagram} 
              title="Instagram Management" 
              description="Professional Instagram content and management"
            />
            <MarketingServiceCard 
              icon={Facebook} 
              title="Facebook Management" 
              description="Facebook page management and advertising"
            />
            <MarketingServiceCard 
              icon={Twitter} 
              title="Twitter/X Management" 
              description="Twitter content and engagement"
            />
            <MarketingServiceCard 
              icon={Youtube} 
              title="YouTube Content" 
              description="Video content creation for your shop"
            />
          </div>
          
          <Card className="performance-card">
            <CardHeader>
              <CardTitle>Social Media Support Request</CardTitle>
              <CardDescription>
                Request social media management services
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid gap-4 md:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="social-platforms">Platform(s)</Label>
                  <Input id="social-platforms" placeholder="e.g. Instagram, Facebook, Twitter, YouTube" />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="social-service">Service Type</Label>
                  <Input id="social-service" placeholder="e.g. Content Creation, Management, Advertising" />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="social-frequency">Posting Frequency</Label>
                  <Input id="social-frequency" placeholder="e.g. Daily, 3x/week, etc." />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="social-goal">Primary Goal</Label>
                  <Input id="social-goal" placeholder="e.g. Brand Awareness, Lead Generation" />
                </div>
                <div className="space-y-2 md:col-span-2">
                  <Label htmlFor="social-notes">Additional Information</Label>
                  <Input id="social-notes" placeholder="Any specific content ideas or requirements" />
                </div>
              </div>
            </CardContent>
            <CardFooter>
              <Button className="w-full bg-workshop-red hover:bg-workshop-red/90">
                <Send className="mr-2 h-4 w-4" /> Submit Social Media Request
              </Button>
            </CardFooter>
          </Card>
        </TabsContent>
        
        <TabsContent value="website" className="space-y-6">
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            <MarketingServiceCard 
              icon={Globe} 
              title="Basic Website" 
              description="Simple informational website for your shop"
            />
            <MarketingServiceCard 
              icon={Globe} 
              title="Advanced Website" 
              description="Full-featured website with booking system"
            />
            <MarketingServiceCard 
              icon={Globe} 
              title="E-Commerce" 
              description="Online store for parts and merchandise"
            />
          </div>
          
          <Card className="performance-card">
            <CardHeader>
              <CardTitle>Website Design Request</CardTitle>
              <CardDescription>
                Request custom website design services
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid gap-4 md:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="website-type">Website Type</Label>
                  <Input id="website-type" placeholder="e.g. Basic, Advanced, E-Commerce" />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="website-pages">Pages Needed</Label>
                  <Input id="website-pages" placeholder="e.g. Home, Services, About, Contact" />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="website-domain">Domain Name</Label>
                  <Input id="website-domain" placeholder="e.g. yourshop.com" />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="website-features">Special Features</Label>
                  <Input id="website-features" placeholder="e.g. Booking System, Chat, Gallery" />
                </div>
                <div className="space-y-2 md:col-span-2">
                  <Label htmlFor="website-competitors">Competitor Websites</Label>
                  <Input id="website-competitors" placeholder="URLs of websites you like" />
                </div>
                <div className="space-y-2 md:col-span-2">
                  <Label htmlFor="website-notes">Additional Notes</Label>
                  <Input id="website-notes" placeholder="Any special requirements" />
                </div>
              </div>
            </CardContent>
            <CardFooter>
              <Button className="w-full bg-workshop-red hover:bg-workshop-red/90">
                <Send className="mr-2 h-4 w-4" /> Submit Website Request
              </Button>
            </CardFooter>
          </Card>
        </TabsContent>
      </Tabs>
      
      <Card className="performance-card">
        <CardHeader>
          <CardTitle>Marketing Services</CardTitle>
          <CardDescription>
            Comprehensive marketing packages for your performance shop
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid gap-6 md:grid-cols-3">
            <Card className="border-workshop-red/40">
              <CardHeader className="pb-2">
                <CardTitle className="text-center">Basic Package</CardTitle>
                <CardDescription className="text-center">Essential marketing tools</CardDescription>
                <div className="text-center text-3xl font-bold mt-2">$499</div>
                <p className="text-center text-xs text-muted-foreground">One-time setup</p>
              </CardHeader>
              <CardContent className="space-y-2">
                <div className="flex items-center">
                  <Check className="h-4 w-4 mr-2 text-workshop-green" />
                  <span className="text-sm">Logo Design</span>
                </div>
                <div className="flex items-center">
                  <Check className="h-4 w-4 mr-2 text-workshop-green" />
                  <span className="text-sm">Business Cards</span>
                </div>
                <div className="flex items-center">
                  <Check className="h-4 w-4 mr-2 text-workshop-green" />
                  <span className="text-sm">Basic Website</span>
                </div>
                <div className="flex items-center">
                  <Check className="h-4 w-4 mr-2 text-workshop-green" />
                  <span className="text-sm">Social Media Setup</span>
                </div>
              </CardContent>
              <CardFooter>
                <Button className="w-full">Select Package</Button>
              </CardFooter>
            </Card>
            
            <Card className="border-workshop-blue/40 shadow-md relative">
              <div className="absolute top-0 left-0 right-0 bg-workshop-blue text-white py-1 text-center text-xs uppercase font-bold rounded-t-md">
                Most Popular
              </div>
              <CardHeader className="pb-2 pt-8">
                <CardTitle className="text-center">Pro Package</CardTitle>
                <CardDescription className="text-center">Comprehensive marketing solution</CardDescription>
                <div className="text-center text-3xl font-bold mt-2">$999</div>
                <p className="text-center text-xs text-muted-foreground">One-time setup</p>
              </CardHeader>
              <CardContent className="space-y-2">
                <div className="flex items-center">
                  <Check className="h-4 w-4 mr-2 text-workshop-green" />
                  <span className="text-sm">Everything in Basic</span>
                </div>
                <div className="flex items-center">
                  <Check className="h-4 w-4 mr-2 text-workshop-green" />
                  <span className="text-sm">Advanced Website</span>
                </div>
                <div className="flex items-center">
                  <Check className="h-4 w-4 mr-2 text-workshop-green" />
                  <span className="text-sm">Staff Uniforms</span>
                </div>
                <div className="flex items-center">
                  <Check className="h-4 w-4 mr-2 text-workshop-green" />
                  <span className="text-sm">Promotional Materials</span>
                </div>
                <div className="flex items-center">
                  <Check className="h-4 w-4 mr-2 text-workshop-green" />
                  <span className="text-sm">1 Month Social Management</span>
                </div>
              </CardContent>
              <CardFooter>
                <Button className="w-full bg-workshop-blue hover:bg-workshop-blue/90">Select Package</Button>
              </CardFooter>
            </Card>
            
            <Card className="border-workshop-orange/40">
              <CardHeader className="pb-2">
                <CardTitle className="text-center">Premium Package</CardTitle>
                <CardDescription className="text-center">Complete marketing system</CardDescription>
                <div className="text-center text-3xl font-bold mt-2">$2,499</div>
                <p className="text-center text-xs text-muted-foreground">One-time setup</p>
              </CardHeader>
              <CardContent className="space-y-2">
                <div className="flex items-center">
                  <Check className="h-4 w-4 mr-2 text-workshop-green" />
                  <span className="text-sm">Everything in Pro</span>
                </div>
                <div className="flex items-center">
                  <Check className="h-4 w-4 mr-2 text-workshop-green" />
                  <span className="text-sm">E-Commerce Website</span>
                </div>
                <div className="flex items-center">
                  <Check className="h-4 w-4 mr-2 text-workshop-green" />
                  <span className="text-sm">Professional Photography</span>
                </div>
                <div className="flex items-center">
                  <Check className="h-4 w-4 mr-2 text-workshop-green" />
                  <span className="text-sm">3 Months Social Management</span>
                </div>
                <div className="flex items-center">
                  <Check className="h-4 w-4 mr-2 text-workshop-green" />
                  <span className="text-sm">SEO Optimization</span>
                </div>
              </CardContent>
              <CardFooter>
                <Button className="w-full">Select Package</Button>
              </CardFooter>
            </Card>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default Marketing;
