import { useState } from "react";
import { Save, Clock } from "lucide-react";
import { Button } from "@/components/ui/button";
import RichTextEditor from "@/components/admin/RichTextEditor";
import { useToast } from "@/hooks/use-toast";

const defaultContent = `Privacy Policy

Last updated: January 2024

Welcome to our Privacy Policy page. Your privacy is critically important to us.

1. Information We Collect
We collect information you provide directly to us, such as when you create an account, make a purchase, or contact us for support.

2. How We Use Your Information
We use the information we collect to:
• Provide, maintain, and improve our services
• Process transactions and send related information
• Send you technical notices and support messages

3. Information Sharing
We do not share your personal information with third parties except as described in this policy.

4. Data Security
We implement appropriate security measures to protect against unauthorized access, alteration, disclosure, or destruction of your personal information.

5. Contact Us
If you have any questions about this Privacy Policy, please contact us.`;

const PrivacyPolicy = () => {
  const [content, setContent] = useState(defaultContent);
  const [lastSaved, setLastSaved] = useState<Date | null>(null);
  const { toast } = useToast();

  const handleSave = () => {
    // UI only - no actual save
    setLastSaved(new Date());
    toast({
      title: "Changes saved",
      description: "Your privacy policy has been updated successfully.",
    });
  };

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Header */}
      <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-foreground">Privacy Policy</h2>
          <p className="text-muted-foreground">
            Manage your application's privacy policy content
          </p>
        </div>

        <div className="flex items-center gap-3">
          {lastSaved && (
            <span className="text-sm text-muted-foreground flex items-center gap-1">
              <Clock className="w-4 h-4" />
              Last saved: {lastSaved.toLocaleTimeString()}
            </span>
          )}
          <Button onClick={handleSave} className="gap-2">
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
          <strong>Tip:</strong> Use the toolbar to format your text. Changes will not be
          published until you click "Save Changes".
        </p>
      </div>
    </div>
  );
};

export default PrivacyPolicy;
