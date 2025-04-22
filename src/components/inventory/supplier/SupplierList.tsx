import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar';
import { Edit, Trash2, Mail, Phone } from 'lucide-react';
import { ScrollArea } from '@/components/ui/scroll-area';
import { useToast } from '@/hooks/use-toast';
import { Supplier } from '@/types/inventory';
import ApiSupplierCard from './ApiSupplierCard';

interface SupplierListProps {
  suppliers: Supplier[];
  filteredSuppliers: Supplier[];
  onEditSupplier: (supplier: Supplier) => void;
  onDeleteSupplier: (id: string, name: string) => void;
}

const SupplierList: React.FC<SupplierListProps> = ({ 
  suppliers, 
  filteredSuppliers, 
  onEditSupplier, 
  onDeleteSupplier 
}) => {
  const { toast } = useToast();
  
  const apiSuppliers = filteredSuppliers.filter(s => s.connectionType === 'api');
  const manualSuppliers = filteredSuppliers.filter(s => s.connectionType === 'manual');

  return (
    <div className="space-y-6">
      {/* API Connected Suppliers */}
      <div>
        <h2 className="text-lg font-semibold mb-4">API Connected Suppliers</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {apiSuppliers.map((supplier) => (
            <ApiSupplierCard key={supplier.id} supplier={supplier} />
          ))}
        </div>
      </div>

      {/* Manual Suppliers */}
      <div>
        <h2 className="text-lg font-semibold mb-4">Manual Suppliers</h2>
        <Card>
          <CardContent className="p-0">
            <ScrollArea className="h-[calc(100vh-280px)]">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Name</TableHead>
                    <TableHead className="hidden md:table-cell">Category</TableHead>
                    <TableHead>Contact</TableHead>
                    <TableHead className="hidden md:table-cell">Status</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {manualSuppliers.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={5} className="text-center py-8 text-muted-foreground">
                        No manual suppliers found. Add your first supplier to get started.
                      </TableCell>
                    </TableRow>
                  ) : (
                    manualSuppliers.map((supplier) => (
                      <TableRow key={supplier.id}>
                        <TableCell>
                          <div className="font-medium flex items-center gap-3">
                            <Avatar>
                              {supplier.logoUrl ? (
                                <AvatarImage src={supplier.logoUrl} alt={supplier.name} />
                              ) : (
                                <AvatarFallback>
                                  {getSupplierInitials(supplier.name)}
                                </AvatarFallback>
                              )}
                            </Avatar>
                            <div>
                              {supplier.name}
                              <div className="text-sm text-muted-foreground md:hidden">
                                {supplier.category}
                              </div>
                            </div>
                          </div>
                        </TableCell>
                        <TableCell className="hidden md:table-cell">{supplier.category}</TableCell>
                        <TableCell>
                          <div className="space-y-1">
                            <div className="text-sm">{supplier.contactPerson}</div>
                            <div className="flex items-center gap-2">
                              <Button 
                                variant="ghost" 
                                size="icon" 
                                className="h-7 w-7" 
                                onClick={() => handleCopyEmail(supplier.email)}
                                title="Copy email"
                              >
                                <Mail className="h-3.5 w-3.5" />
                              </Button>
                              <a href={`tel:${supplier.phone}`} className="inline-block">
                                <Button 
                                  variant="ghost" 
                                  size="icon" 
                                  className="h-7 w-7"
                                  title="Call phone"
                                >
                                  <Phone className="h-3.5 w-3.5" />
                                </Button>
                              </a>
                            </div>
                          </div>
                        </TableCell>
                        <TableCell className="hidden md:table-cell">
                          <Badge variant={supplier.status === 'active' ? 'default' : 'secondary'}>
                            {supplier.status === 'active' ? 'Active' : 'Inactive'}
                          </Badge>
                        </TableCell>
                        <TableCell className="text-right">
                          <div className="flex justify-end gap-2">
                            <Button 
                              variant="ghost" 
                              size="icon"
                              onClick={() => onEditSupplier(supplier)}
                            >
                              <Edit className="h-4 w-4" />
                            </Button>
                            <Button 
                              variant="ghost" 
                              size="icon"
                              onClick={() => onDeleteSupplier(supplier.id, supplier.name)}
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
            </ScrollArea>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default SupplierList;
