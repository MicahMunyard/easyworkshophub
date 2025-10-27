import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { useEzyPartsCredentials } from '@/hooks/ezyparts/useEzyPartsCredentials';
import { Loader2, Save, Trash2, Eye, EyeOff } from 'lucide-react';

export const EzyPartsSettings = () => {
  const { credentials, loading, saveCredentials, deleteCredentials, hasCredentials } = useEzyPartsCredentials();
  const [showPassword, setShowPassword] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [formData, setFormData] = useState({
    customer_account: '',
    customer_id: '',
    password: '',
    location_id: ''
  });

  useEffect(() => {
    if (credentials) {
      setFormData({
        customer_account: credentials.customer_account || '',
        customer_id: credentials.customer_id || '',
        password: credentials.password || '',
        location_id: credentials.location_id || ''
      });
    }
  }, [credentials]);

  const handleSave = async () => {
    setIsSaving(true);
    try {
      await saveCredentials(formData);
    } finally {
      setIsSaving(false);
    }
  };

  const handleDelete = async () => {
    if (confirm('Are you sure you want to delete your EzyParts credentials?')) {
      await deleteCredentials();
      setFormData({
        customer_account: '',
        customer_id: '',
        password: '',
        location_id: ''
      });
    }
  };

  if (loading) {
    return (
      <Card>
        <CardContent className="flex items-center justify-center py-8">
          <Loader2 className="h-6 w-6 animate-spin" />
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>EzyParts Integration</CardTitle>
        <CardDescription>
          Configure your EzyParts (Burson Auto Parts) credentials for automatic parts ordering
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="customer_account">Customer Account</Label>
          <Input
            id="customer_account"
            value={formData.customer_account}
            onChange={(e) => setFormData({ ...formData, customer_account: e.target.value })}
            placeholder="e.g., 400022"
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="customer_id">Customer ID</Label>
          <Input
            id="customer_id"
            value={formData.customer_id}
            onChange={(e) => setFormData({ ...formData, customer_id: e.target.value })}
            placeholder="e.g., 400022_workshopbase"
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="password">Password</Label>
          <div className="relative">
            <Input
              id="password"
              type={showPassword ? 'text' : 'password'}
              value={formData.password}
              onChange={(e) => setFormData({ ...formData, password: e.target.value })}
              placeholder="Enter your EzyParts password"
            />
            <Button
              type="button"
              variant="ghost"
              size="sm"
              className="absolute right-0 top-0 h-full px-3 hover:bg-transparent"
              onClick={() => setShowPassword(!showPassword)}
            >
              {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
            </Button>
          </div>
        </div>

        <div className="space-y-2">
          <Label htmlFor="location_id">Location ID (Optional)</Label>
          <Input
            id="location_id"
            value={formData.location_id}
            onChange={(e) => setFormData({ ...formData, location_id: e.target.value })}
            placeholder="Leave empty if not applicable"
          />
        </div>

        <div className="flex gap-2 pt-4">
          <Button
            onClick={handleSave}
            disabled={isSaving || !formData.customer_account || !formData.customer_id || !formData.password}
          >
            {isSaving ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Saving...
              </>
            ) : (
              <>
                <Save className="mr-2 h-4 w-4" />
                Save Credentials
              </>
            )}
          </Button>

          {hasCredentials && (
            <Button variant="destructive" onClick={handleDelete}>
              <Trash2 className="mr-2 h-4 w-4" />
              Delete Credentials
            </Button>
          )}
        </div>
      </CardContent>
    </Card>
  );
};
