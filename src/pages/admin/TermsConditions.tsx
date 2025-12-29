import { useState } from "react";
import { Save, Clock } from "lucide-react";
import { Button } from "@/components/ui/button";
import RichTextEditor from "@/components/admin/RichTextEditor";
import ConfirmDialog from "@/components/admin/ConfirmDialog";
import { useToast } from "@/hooks/use-toast";

const defaultContent = `Terms and Conditions

Last updated: January 2024

Please read these Terms and Conditions carefully before using our service.

1. Acceptance of Terms
By accessing and using this service, you accept and agree to be bound by the terms and provision of this agreement.

2. User Accounts
When you create an account with us, you must provide accurate, complete, and current information at all times.

3. Intellectual Property
The service and its original content, features, and functionality are and will remain the exclusive property of the Company.

4. Termination
We may terminate or suspend your account immediately, without prior notice or liability, for any reason whatsoever.

5. Limitation of Liability
In no event shall the Company be liable for any indirect, incidental, special, consequential, or punitive damages.

6. Governing Law
These Terms shall be governed and construed in accordance with the laws applicable in your jurisdiction.

7. Changes to Terms
We reserve the right, at our sole discretion, to modify or replace these Terms at any time.

8. Contact Us
If you have any questions about these Terms, please contact our support team.`;

const TermsConditions = () => {
  const [content, setContent] = useState(defaultContent);
  const [lastSaved, setLastSaved] = useState<Date | null>(null);
  const [saveDialogOpen, setSaveDialogOpen] = useState(false);
  const { toast } = useToast();

  const handleSaveClick = () => {
    setSaveDialogOpen(true);
  };

  const confirmSave = () => {
    setLastSaved(new Date());
    toast({
      title: "Changes saved",
      description: "Your terms and conditions have been updated successfully.",
    });
  };

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Save Confirmation Dialog */}
      <ConfirmDialog
        open={saveDialogOpen}
        onOpenChange={setSaveDialogOpen}
        title="Save Changes?"
        description="Are you sure you want to save these changes? This will update the terms and conditions visible to all users."
        confirmLabel="Save Changes"
        onConfirm={confirmSave}
      />

      {/* Header */}
      <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-foreground">Terms & Conditions</h2>
          <p className="text-muted-foreground">
            Manage your application's terms of service
          </p>
        </div>

        <div className="flex items-center gap-3">
          {lastSaved && (
            <span className="text-sm text-muted-foreground flex items-center gap-1">
              <Clock className="w-4 h-4" />
              Last saved: {lastSaved.toLocaleTimeString()}
            </span>
          )}
          <Button onClick={handleSaveClick} className="gap-2">
            <Save className="w-4 h-4" />
            Save Changes
          </Button>
        </div>
      </div>

      {/* Editor */}
      <RichTextEditor initialContent={content} onChange={setContent} />

      {/* Info */}
      <div className="admin-card p-4 bg-info/5 border-info/20">
        <p className="text-sm text-info">
          <strong>Tip:</strong> Make sure to review and update your terms regularly to
          comply with applicable laws and regulations.
        </p>
      </div>
    </div>
  );
};

export default TermsConditions;
