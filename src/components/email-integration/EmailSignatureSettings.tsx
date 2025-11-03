import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Pencil, Trash2, Plus, Check } from 'lucide-react';
import { useEmailSignatures } from '@/hooks/email/useEmailSignatures';
import EmailSignatureEditor from './EmailSignatureEditor';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";

const EmailSignatureSettings: React.FC = () => {
  const { signatures, isLoading, deleteSignature, setAsDefault } = useEmailSignatures();
  const [editingSignature, setEditingSignature] = useState<any>(null);
  const [showEditor, setShowEditor] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [signatureToDelete, setSignatureToDelete] = useState<string | null>(null);

  const handleEdit = (signature: any) => {
    setEditingSignature(signature);
    setShowEditor(true);
  };

  const handleCreate = () => {
    setEditingSignature(null);
    setShowEditor(true);
  };

  const handleSave = () => {
    setShowEditor(false);
    setEditingSignature(null);
  };

  const handleCancel = () => {
    setShowEditor(false);
    setEditingSignature(null);
  };

  const handleDeleteClick = (id: string) => {
    setSignatureToDelete(id);
    setDeleteDialogOpen(true);
  };

  const handleDeleteConfirm = async () => {
    if (signatureToDelete) {
      await deleteSignature(signatureToDelete);
      setDeleteDialogOpen(false);
      setSignatureToDelete(null);
    }
  };

  if (showEditor) {
    return (
      <EmailSignatureEditor
        signature={editingSignature}
        onSave={handleSave}
        onCancel={handleCancel}
      />
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold">Email Signatures</h2>
          <p className="text-muted-foreground">
            Manage your professional email signatures
          </p>
        </div>
        <Button onClick={handleCreate}>
          <Plus className="h-4 w-4 mr-2" />
          Create Signature
        </Button>
      </div>

      {isLoading ? (
        <Card>
          <CardContent className="pt-6">
            <p className="text-center text-muted-foreground">Loading signatures...</p>
          </CardContent>
        </Card>
      ) : signatures.length === 0 ? (
        <Card>
          <CardContent className="pt-6">
            <div className="text-center space-y-4">
              <p className="text-muted-foreground">No email signatures yet</p>
              <Button onClick={handleCreate}>
                <Plus className="h-4 w-4 mr-2" />
                Create Your First Signature
              </Button>
            </div>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-4">
          {signatures.map((signature) => (
            <Card key={signature.id}>
              <CardHeader>
                <div className="flex justify-between items-start">
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <CardTitle>{signature.name}</CardTitle>
                      {signature.is_default && (
                        <Badge variant="secondary">
                          <Check className="h-3 w-3 mr-1" />
                          Default
                        </Badge>
                      )}
                    </div>
                    <CardDescription>
                      Last updated: {new Date(signature.updated_at).toLocaleDateString()}
                    </CardDescription>
                  </div>
                  <div className="flex gap-2">
                    {!signature.is_default && (
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => setAsDefault(signature.id)}
                      >
                        Set as Default
                      </Button>
                    )}
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleEdit(signature)}
                    >
                      <Pencil className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleDeleteClick(signature.id)}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <div 
                  className="prose prose-sm max-w-none border rounded-md p-4 bg-muted/50"
                  dangerouslySetInnerHTML={{ __html: signature.html_content }}
                />
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Email Signature</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete this signature? This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleDeleteConfirm}>
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
};

export default EmailSignatureSettings;
