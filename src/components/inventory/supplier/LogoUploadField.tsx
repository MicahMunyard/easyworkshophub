import React from 'react';
import { FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar';
import { Building2, Upload, X } from 'lucide-react';
import { UseFormReturn } from 'react-hook-form';
import { cn } from '@/lib/utils';
import { SupplierFormValues } from './types';

interface LogoUploadFieldProps {
  form: UseFormReturn<SupplierFormValues>;
  logoPreview: string | undefined;
  setLogoPreview: (value: string | undefined) => void;
}

const LogoUploadField: React.FC<LogoUploadFieldProps> = ({
  form,
  logoPreview,
  setLogoPreview
}) => {
  const handleLogoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Check file size (limit to 1MB)
    if (file.size > 1024 * 1024) {
      alert('File size must be less than 1MB');
      return;
    }

    // Check file type
    if (!file.type.startsWith('image/')) {
      alert('Only image files are allowed');
      return;
    }

    const reader = new FileReader();
    reader.onload = (event) => {
      const result = event.target?.result as string;
      setLogoPreview(result);
      form.setValue('logoUrl', result);
    };
    reader.readAsDataURL(file);
  };

  const clearLogo = () => {
    setLogoPreview(undefined);
    form.setValue('logoUrl', '');
  };

  return (
    <FormField
      control={form.control}
      name="logoUrl"
      render={({ field }) => (
        <FormItem className="w-full">
          <FormLabel className="text-center block">Logo</FormLabel>
          <FormControl>
            <div className="flex flex-col items-center">
              <div className="mb-2 relative">
                <Avatar className={cn(
                  "h-20 w-20 bg-muted",
                  !logoPreview && "border-2 border-dashed border-muted-foreground/50 p-2"
                )}>
                  {logoPreview ? (
                    <AvatarImage src={logoPreview} alt="Supplier logo" />
                  ) : (
                    <AvatarFallback>
                      <Building2 className="h-10 w-10 text-muted-foreground/50" />
                    </AvatarFallback>
                  )}
                </Avatar>
                {logoPreview && (
                  <Button 
                    type="button" 
                    variant="destructive" 
                    size="icon"
                    className="absolute -top-2 -right-2 h-6 w-6"
                    onClick={clearLogo}
                  >
                    <X className="h-3 w-3" />
                  </Button>
                )}
              </div>
              <Input 
                type="file" 
                accept="image/*"
                onChange={handleLogoChange}
                className="hidden"
                id="logo-upload"
              />
              <Button 
                type="button" 
                variant="outline" 
                size="sm"
                onClick={() => document.getElementById('logo-upload')?.click()}
              >
                <Upload className="h-3 w-3 mr-2" /> Upload Logo
              </Button>
              <input 
                type="hidden" 
                {...field}
              />
            </div>
          </FormControl>
          <FormMessage />
        </FormItem>
      )}
    />
  );
};

export default LogoUploadField;
