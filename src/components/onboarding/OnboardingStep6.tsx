import { useState } from 'react';
import { Building2, Calendar, Package, TruckIcon, ArrowRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import HelpModule from './HelpModule';

interface OnboardingStep6Props {
  data: any;
  onNext: (data: any) => void;
}

const OnboardingStep6 = ({ data, onNext }: OnboardingStep6Props) => {
  const [completedModules, setCompletedModules] = useState<string[]>(
    data.completedModules || []
  );

  const handleModuleComplete = (moduleId: string) => {
    if (!completedModules.includes(moduleId)) {
      setCompletedModules([...completedModules, moduleId]);
    }
  };

  const handleNext = () => {
    onNext({ completedModules });
  };

  return (
    <div className="space-y-6">
      <div className="text-center space-y-2">
        <h2 className="text-3xl font-bold text-foreground">Learn How WorkshopBase Works</h2>
        <p className="text-muted-foreground max-w-2xl mx-auto">
          Take a few minutes to understand key workflows. This will help you get started quickly and confidently.
        </p>
      </div>

      <div className="space-y-4">
        <HelpModule
          title="Workshop Setup Deep Dive"
          duration="5 min read"
          icon={Building2}
          completed={completedModules.includes('workshop-setup')}
          onComplete={() => handleModuleComplete('workshop-setup')}
        >
          <div className="space-y-4">
            <p className="text-foreground">
              Your workshop information is the foundation of WorkshopBase. Here's how it's used throughout the system:
            </p>

            <div className="space-y-3">
              <div className="bg-accent/50 p-4 rounded-lg">
                <h4 className="font-semibold text-foreground mb-2">📧 Email Communications</h4>
                <p className="text-sm text-muted-foreground">
                  Your workshop name, email, and phone appear in all order emails sent to suppliers. 
                  Your company logo (if uploaded) displays at the top of order emails.
                </p>
              </div>

              <div className="bg-accent/50 p-4 rounded-lg">
                <h4 className="font-semibold text-foreground mb-2">🛠️ Services & Pricing</h4>
                <p className="text-sm text-muted-foreground">
                  Services you configured determine what options appear in the booking calendar. 
                  Each service has a duration (for scheduling) and price (for invoicing).
                </p>
              </div>

              <div className="bg-accent/50 p-4 rounded-lg">
                <h4 className="font-semibold text-foreground mb-2">🏗️ Service Bays</h4>
                <p className="text-sm text-muted-foreground">
                  Service bays control how many simultaneous bookings you can accept. 
                  When creating bookings, you'll assign them to specific bays to avoid double-booking.
                </p>
              </div>

              <div className="bg-accent/50 p-4 rounded-lg">
                <h4 className="font-semibold text-foreground mb-2">👥 Team Management</h4>
                <p className="text-sm text-muted-foreground">
                  Technicians can be assigned to specific jobs. They can also log into a simplified 
                  technician portal to view their jobs, track time, and request parts.
                </p>
              </div>

              <div className="bg-accent/50 p-4 rounded-lg">
                <h4 className="font-semibold text-foreground mb-2">⏰ Business Hours</h4>
                <p className="text-sm text-muted-foreground">
                  Your configured working days and hours determine available time slots in the booking calendar. 
                  Customers won't be able to book outside your operating hours.
                </p>
              </div>
            </div>

            <div className="bg-primary/10 border border-primary/20 p-4 rounded-lg">
              <p className="text-sm text-foreground font-medium">
                💡 Pro Tip: You can update all these settings anytime from Workshop Setup in the main navigation.
              </p>
            </div>
          </div>
        </HelpModule>

        <HelpModule
          title="Creating & Managing Bookings"
          duration="8 min read"
          icon={Calendar}
          completed={completedModules.includes('bookings')}
          onComplete={() => handleModuleComplete('bookings')}
        >
          <div className="space-y-4">
            <p className="text-foreground font-medium">
              The Booking Diary is your central hub for scheduling customer appointments.
            </p>

            <div className="space-y-3">
              <h4 className="font-semibold text-foreground">📅 Step-by-Step: Creating a Booking</h4>
              
              <ol className="space-y-3 list-decimal list-inside">
                <li className="text-sm">
                  <span className="font-medium text-foreground">Navigate to Booking Diary</span>
                  <p className="ml-6 text-muted-foreground mt-1">
                    Click "Bookings" in the main navigation to see your calendar view.
                  </p>
                </li>

                <li className="text-sm">
                  <span className="font-medium text-foreground">Click "New Booking" button</span>
                  <p className="ml-6 text-muted-foreground mt-1">
                    Found in the top right of the calendar. A booking form will open.
                  </p>
                </li>

                <li className="text-sm">
                  <span className="font-medium text-foreground">Select or add customer</span>
                  <p className="ml-6 text-muted-foreground mt-1">
                    Search existing customers or click "Add New Customer" to create one. 
                    You'll need: Name, Phone (required), Email (optional).
                  </p>
                </li>

                <li className="text-sm">
                  <span className="font-medium text-foreground">Choose vehicle</span>
                  <p className="ml-6 text-muted-foreground mt-1">
                    Select from the customer's vehicles or add a new one with Make, Model, Year, and Rego.
                  </p>
                </li>

                <li className="text-sm">
                  <span className="font-medium text-foreground">Select service type</span>
                  <p className="ml-6 text-muted-foreground mt-1">
                    Choose from the services you configured (e.g., "Oil Change", "Brake Service"). 
                    Duration and price are auto-filled.
                  </p>
                </li>

                <li className="text-sm">
                  <span className="font-medium text-foreground">Pick date & time</span>
                  <p className="ml-6 text-muted-foreground mt-1">
                    Available times are based on your business hours and existing bookings.
                  </p>
                </li>

                <li className="text-sm">
                  <span className="font-medium text-foreground">Assign service bay & technician</span>
                  <p className="ml-6 text-muted-foreground mt-1">
                    Choose which bay and which technician will handle the job.
                  </p>
                </li>

                <li className="text-sm">
                  <span className="font-medium text-foreground">Add notes (optional)</span>
                  <p className="ml-6 text-muted-foreground mt-1">
                    Special instructions, customer requests, or reminders for your team.
                  </p>
                </li>

                <li className="text-sm">
                  <span className="font-medium text-foreground">Save booking</span>
                  <p className="ml-6 text-muted-foreground mt-1">
                    Booking appears on the calendar immediately.
                  </p>
                </li>
              </ol>

              <div className="bg-accent/50 p-4 rounded-lg space-y-2">
                <h4 className="font-semibold text-foreground">🔄 Managing Existing Bookings</h4>
                <ul className="space-y-1 text-sm text-muted-foreground">
                  <li>• Click any booking on the calendar to view details</li>
                  <li>• Drag bookings to reschedule (if no conflicts)</li>
                  <li>• Update status: Pending → Confirmed → In Progress → Completed</li>
                  <li>• Convert to invoice when work is done</li>
                  <li>• Cancel bookings with notes explaining why</li>
                </ul>
              </div>

              <div className="bg-primary/10 border border-primary/20 p-4 rounded-lg">
                <p className="text-sm text-foreground font-medium">
                  💡 Pro Tip: Use color coding by status to quickly see your schedule at a glance. 
                  Confirmed bookings appear differently than pending ones.
                </p>
              </div>
            </div>
          </div>
        </HelpModule>

        <HelpModule
          title="Inventory Management Basics"
          duration="6 min read"
          icon={Package}
          completed={completedModules.includes('inventory')}
          onComplete={() => handleModuleComplete('inventory')}
        >
          <div className="space-y-4">
            <p className="text-foreground">
              Keep track of parts, supplies, and stock levels to ensure you never run out of critical items.
            </p>

            <div className="space-y-3">
              <div className="bg-accent/50 p-4 rounded-lg">
                <h4 className="font-semibold text-foreground mb-2">📦 Understanding Inventory</h4>
                <p className="text-sm text-muted-foreground mb-3">
                  Each inventory item has:
                </p>
                <ul className="space-y-1 text-sm text-muted-foreground">
                  <li>• <strong>Part Code</strong> - Unique identifier</li>
                  <li>• <strong>Name & Description</strong> - What it is</li>
                  <li>• <strong>Category</strong> - Organize by type (oils, filters, etc.)</li>
                  <li>• <strong>In Stock</strong> - Current quantity available</li>
                  <li>• <strong>Min Stock</strong> - Reorder threshold</li>
                  <li>• <strong>Price</strong> - Cost per unit</li>
                  <li>• <strong>Supplier</strong> - Where to order from</li>
                </ul>
              </div>

              <div className="bg-accent/50 p-4 rounded-lg">
                <h4 className="font-semibold text-foreground mb-2">🚨 Low Stock Alerts</h4>
                <p className="text-sm text-muted-foreground">
                  When stock drops below the minimum threshold, items are flagged:
                </p>
                <ul className="space-y-1 text-sm text-muted-foreground mt-2">
                  <li>• <span className="text-destructive">Red badge</span> = Critical (urgent reorder)</li>
                  <li>• <span className="text-yellow-600">Yellow badge</span> = Low (should reorder soon)</li>
                  <li>• Dashboard shows total low stock items at a glance</li>
                </ul>
              </div>

              <div className="bg-accent/50 p-4 rounded-lg">
                <h4 className="font-semibold text-foreground mb-2">🔗 Vehicle Fitment</h4>
                <p className="text-sm text-muted-foreground">
                  Link parts to specific vehicle makes/models to quickly find compatible items when servicing a vehicle.
                </p>
              </div>

              <div className="bg-primary/10 border border-primary/20 p-4 rounded-lg">
                <p className="text-sm text-foreground font-medium">
                  💡 Pro Tip: Set realistic minimum stock levels based on usage patterns. 
                  Review and adjust monthly to optimize inventory management.
                </p>
              </div>
            </div>
          </div>
        </HelpModule>

        <HelpModule
          title="Ordering & Receiving Parts - Complete Workflow"
          duration="10 min read"
          icon={TruckIcon}
          completed={completedModules.includes('ordering')}
          onComplete={() => handleModuleComplete('ordering')}
        >
          <div className="space-y-4">
            <p className="text-foreground font-medium">
              Master the complete parts ordering workflow from identification to receiving stock.
            </p>

            <div className="bg-primary/10 border border-primary/20 p-4 rounded-lg">
              <h4 className="font-semibold text-foreground mb-2">🔄 The Complete Workflow</h4>
              <div className="text-sm text-muted-foreground space-y-1">
                <p>1️⃣ Identify need (low stock alert or technician request)</p>
                <p>2️⃣ Select ordering method (API or Manual)</p>
                <p>3️⃣ Place order with supplier</p>
                <p>4️⃣ Receive delivery</p>
                <p>5️⃣ Log receipt in system</p>
                <p>6️⃣ Verify stock updated</p>
              </div>
            </div>

            <div className="space-y-3">
              <h4 className="font-semibold text-foreground">📧 Manual Email Orders (Detailed Guide)</h4>
              
              <div className="bg-accent/50 p-4 rounded-lg">
                <p className="font-medium text-foreground mb-2">Step 1: Initiate Order</p>
                <ul className="space-y-1 text-sm text-muted-foreground">
                  <li>• Navigate to Inventory page</li>
                  <li>• Find item with low stock (red/yellow badge)</li>
                  <li>• Click "Order Now" button on the item</li>
                  <li>• Or click "Send Order" to create multi-item order</li>
                </ul>
              </div>

              <div className="bg-accent/50 p-4 rounded-lg">
                <p className="font-medium text-foreground mb-2">Step 2: Select Supplier</p>
                <ul className="space-y-1 text-sm text-muted-foreground">
                  <li>• Modal displays all your active suppliers</li>
                  <li>• Each shows name, contact info, and type</li>
                  <li>• Click "Start Manual Order" for email-based suppliers</li>
                </ul>
              </div>

              <div className="bg-accent/50 p-4 rounded-lg">
                <p className="font-medium text-foreground mb-2">Step 3: Build Your Order</p>
                <p className="text-sm text-muted-foreground mb-2">Order form auto-fills with your workshop details:</p>
                <ul className="space-y-1 text-sm text-muted-foreground">
                  <li>✓ Workshop name and email</li>
                  <li>✓ Phone number and address</li>
                  <li>✓ Company logo (if uploaded in Workshop Setup)</li>
                </ul>
                <p className="text-sm text-muted-foreground mt-3 mb-2">Add items to order:</p>
                <ul className="space-y-1 text-sm text-muted-foreground">
                  <li>• Search or browse your inventory</li>
                  <li>• Click "Add to Order" for each item</li>
                  <li>• Set quantities needed</li>
                  <li>• Items show with part codes and descriptions</li>
                </ul>
              </div>

              <div className="bg-accent/50 p-4 rounded-lg">
                <p className="font-medium text-foreground mb-2">Step 4: Add Order Details</p>
                <ul className="space-y-1 text-sm text-muted-foreground">
                  <li>• <strong>PO Number:</strong> Your internal purchase order reference</li>
                  <li>• <strong>Capricorn Number:</strong> Buying group reference (if applicable)</li>
                  <li>• <strong>Additional Notes:</strong> Delivery instructions, payment terms, special requests</li>
                </ul>
              </div>

              <div className="bg-accent/50 p-4 rounded-lg">
                <p className="font-medium text-foreground mb-2">Step 5: Review & Send</p>
                <ul className="space-y-1 text-sm text-muted-foreground">
                  <li>• Review order summary with all items and quantities</li>
                  <li>• Verify supplier email address is correct</li>
                  <li>• Click "Send Order"</li>
                  <li>• Email sent to supplier with professional formatting</li>
                  <li>• CC copy sent to your workshop email for records</li>
                  <li>• Order saved with "Submitted" status</li>
                </ul>
              </div>

              <h4 className="font-semibold text-foreground mt-6">📦 Receiving Stock (Critical!)</h4>
              
              <div className="bg-accent/50 p-4 rounded-lg">
                <p className="font-medium text-foreground mb-2">When Parts Arrive</p>
                <ol className="space-y-2 text-sm text-muted-foreground list-decimal list-inside">
                  <li>Physically receive delivery from supplier</li>
                  <li>Check packing slip against your order</li>
                  <li>Go to Inventory in WorkshopBase</li>
                  <li>Find the received item (look for "On Order" badge)</li>
                  <li>Click <strong>"Receive Stock"</strong> button</li>
                  <li>Modal shows item details and quantity ordered</li>
                  <li>Enter <strong>quantity received</strong> (can be partial)</li>
                  <li>Click "Receive Stock" to confirm</li>
                </ol>
              </div>

              <div className="bg-accent/50 p-4 rounded-lg">
                <p className="font-medium text-foreground mb-2">What Happens Automatically</p>
                <ul className="space-y-1 text-sm text-muted-foreground">
                  <li>✓ Stock quantity increases immediately</li>
                  <li>✓ Low stock alert clears (if above minimum)</li>
                  <li>✓ Order status updates to "Completed" (or "Partial" if more expected)</li>
                  <li>✓ Inventory value recalculates</li>
                  <li>✓ Item becomes available for jobs</li>
                </ul>
              </div>

              <div className="bg-destructive/10 border border-destructive/20 p-4 rounded-lg">
                <p className="font-medium text-foreground mb-2">⚠️ Important Notes</p>
                <ul className="space-y-1 text-sm text-muted-foreground">
                  <li>• Always log received stock the same day for accurate inventory</li>
                  <li>• Partial deliveries are OK - just receive what arrived</li>
                  <li>• Can receive multiple times for the same order</li>
                  <li>• Stock levels won't update until you click "Receive Stock"</li>
                </ul>
              </div>

              <h4 className="font-semibold text-foreground mt-6">🔍 Tracking Orders</h4>
              
              <div className="bg-accent/50 p-4 rounded-lg">
                <p className="text-sm text-muted-foreground mb-2">View all orders in the Orders tab:</p>
                <ul className="space-y-1 text-sm text-muted-foreground">
                  <li>• Filter by status: Draft / Submitted / Completed</li>
                  <li>• See order dates and totals</li>
                  <li>• Track which orders are still pending receipt</li>
                  <li>• Access order details and item lists</li>
                </ul>
              </div>

              <div className="bg-primary/10 border border-primary/20 p-4 rounded-lg">
                <h4 className="font-semibold text-foreground mb-2">💡 Best Practices</h4>
                <ul className="space-y-1 text-sm text-foreground">
                  <li>✓ Set minimum stock levels to trigger timely reorders</li>
                  <li>✓ Review inventory weekly for low stock items</li>
                  <li>✓ Log received stock immediately when delivered</li>
                  <li>✓ Use notes field to document supplier interactions</li>
                  <li>✓ Keep supplier contact information up to date</li>
                  <li>✓ Verify workshop details are correct before first order</li>
                </ul>
              </div>

              <div className="bg-accent p-4 rounded-lg">
                <h4 className="font-semibold text-foreground mb-2">❓ Troubleshooting</h4>
                <div className="space-y-3 text-sm">
                  <div>
                    <p className="font-medium text-foreground">Workshop details don't appear in order</p>
                    <p className="text-muted-foreground">→ Go to Workshop Setup → Fill in all fields → Save</p>
                  </div>
                  <div>
                    <p className="font-medium text-foreground">Can't find "Receive Stock" button</p>
                    <p className="text-muted-foreground">→ Only items with active orders show this button. Check Orders tab to verify order was submitted.</p>
                  </div>
                  <div>
                    <p className="font-medium text-foreground">Stock didn't update after receiving</p>
                    <p className="text-muted-foreground">→ Refresh page. If still not updated, verify you confirmed the receipt (not just entered quantity).</p>
                  </div>
                  <div>
                    <p className="font-medium text-foreground">Supplier didn't receive email</p>
                    <p className="text-muted-foreground">→ Verify supplier email is correct in Suppliers page. Check spam folder. Resend from Orders tab if needed.</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </HelpModule>
      </div>

      <Card className="p-6 bg-accent/50 border-dashed">
        <div className="text-center space-y-3">
          <p className="text-sm text-muted-foreground">
            {completedModules.length === 0 
              ? "Read through the modules above to learn how WorkshopBase works. You can expand each section to dive deeper."
              : `Great progress! You've completed ${completedModules.length} of 4 modules.`
            }
          </p>
          {completedModules.length === 4 && (
            <p className="text-sm font-medium text-primary">
              🎉 Excellent! You're ready to start using WorkshopBase with confidence.
            </p>
          )}
        </div>
      </Card>

      <div className="flex justify-end">
        <Button onClick={handleNext} size="lg">
          Continue to Interactive Demo
          <ArrowRight className="w-4 h-4 ml-2" />
        </Button>
      </div>
    </div>
  );
};

export default OnboardingStep6;
