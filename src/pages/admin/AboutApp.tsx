import { useState } from "react";
import { Save, Clock } from "lucide-react";
import { Button } from "@/components/ui/button";
import RichTextEditor from "@/components/admin/RichTextEditor";
import ConfirmDialog from "@/components/admin/ConfirmDialog";
import { useToast } from "@/hooks/use-toast";

const defaultContent = `About Our Application

Version 1.0.0

Welcome to our application! We are dedicated to providing you with the best experience possible.

Our Mission
To create innovative solutions that help businesses and individuals achieve their goals more efficiently.

What We Offer
• Intuitive user interface designed for ease of use
• Powerful features to boost your productivity
• Secure and reliable infrastructure
• 24/7 customer support

Our Team
We are a dedicated team of developers, designers, and product specialists committed to excellence.

History
Founded in 2024, our company has grown from a small startup to a trusted name in the industry.

Contact Information
• Email: support@example.com
• Phone: +1 (555) 123-4567
• Address: 123 Business Street, City, Country

Follow Us
Stay connected with us on social media for the latest updates and announcements.

Thank you for choosing our application. We're excited to have you on this journey with us!`;

const AboutApp = () => {
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
      description: "Your about page has been updated successfully.",
    });
  };

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Save Confirmation Dialog */}
      <ConfirmDialog
        open={saveDialogOpen}
        onOpenChange={setSaveDialogOpen}
        title="Save Changes?"
        description="Are you sure you want to save these changes? This will update the about page visible to all users."
        confirmLabel="Save Changes"
        onConfirm={confirmSave}
      />

      {/* Header */}
      <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-foreground">About App</h2>
          <p className="text-muted-foreground">
            Manage information about your application
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

      {/* Version Info */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="admin-card p-4 text-center">
          <p className="text-lg font-bold text-foreground">v1.0.0</p>
          <p className="text-sm text-muted-foreground">Current Version</p>
        </div>
        <div className="admin-card p-4 text-center">
          <p className="text-lg font-bold text-foreground">Jan 2024</p>
          <p className="text-sm text-muted-foreground">Last Updated</p>
        </div>
        <div className="admin-card p-4 text-center">
          <p className="text-lg font-bold text-success">Active</p>
          <p className="text-sm text-muted-foreground">Status</p>
        </div>
      </div>
    </div>
  );
};

export default AboutApp;
