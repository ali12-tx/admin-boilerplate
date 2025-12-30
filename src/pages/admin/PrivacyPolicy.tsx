import { useEffect, useState } from "react";
import { Save, Clock, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import RichTextEditor from "@/components/shared/RichTextEditor";
import ConfirmDialog from "@/components/shared/ConfirmDialog";
import { useToast } from "@/hooks/use-toast";
import { api, ApiClientError } from "@/config/client";
import { API_ENDPOINTS } from "@/config/config";
import type { PrivacyPolicyDocument, PrivacyPolicyResponse } from "@/types";

const PrivacyPolicy = () => {
  const [content, setContent] = useState("");
  const [lastSaved, setLastSaved] = useState<Date | null>(null);
  const [saveDialogOpen, setSaveDialogOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const { toast } = useToast();

  const extractPolicy = (
    payload: PrivacyPolicyResponse | PrivacyPolicyDocument | undefined
  ): PrivacyPolicyDocument | null => {
    if (!payload || typeof payload !== "object") return null;
    const data = "data" in payload && payload.data ? payload.data : payload;
    if (data && typeof data === "object" && "privacyPolicy" in data) {
      return (
        (data as { privacyPolicy?: PrivacyPolicyDocument }).privacyPolicy ??
        null
      );
    }
    if (data && typeof data === "object" && "content" in data) {
      return data as PrivacyPolicyDocument;
    }
    return null;
  };

  const fetchPrivacyPolicy = async () => {
    setIsLoading(true);
    try {
      const response = await api.get<PrivacyPolicyResponse>(
        API_ENDPOINTS.PRIVACY_POLICY.ROOT,
        { requiresAuth: true }
      );
      const policy = extractPolicy(response);
      const policyContent = policy?.content?.trim();

      setContent(policyContent && policyContent.length ? policyContent : "");

      if (policy?.updatedAt || policy?.createdAt) {
        setLastSaved(new Date(policy.updatedAt ?? policy.createdAt!));
      } else {
        setLastSaved(null);
      }
    } catch (error) {
      const message =
        error instanceof ApiClientError
          ? error.message
          : "Unable to load privacy policy. Showing default content.";
      toast({
        variant: "destructive",
        title: "Failed to load policy",
        description: message,
      });
      setContent("");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchPrivacyPolicy();
  }, []);

  const handleSaveClick = () => {
    setSaveDialogOpen(true);
  };

  const confirmSave = async () => {
    setIsSaving(true);
    try {
      const response = await api.post<PrivacyPolicyResponse>(
        API_ENDPOINTS.PRIVACY_POLICY.ROOT,
        { content }
      );
      const policy = extractPolicy(response);
      if (policy?.content) {
        setContent(policy.content);
      }
      setLastSaved(
        policy?.updatedAt || policy?.createdAt
          ? new Date(policy.updatedAt ?? policy.createdAt!)
          : new Date()
      );
      toast({
        title: "Changes saved",
        description: "Your privacy policy has been updated successfully.",
      });
    } catch (error) {
      const message =
        error instanceof ApiClientError
          ? error.message
          : "Server error while saving privacy policy.";
      toast({
        variant: "destructive",
        title: "Save failed",
        description: message,
      });
    } finally {
      setIsSaving(false);
      setSaveDialogOpen(false);
    }
  };

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Save Confirmation Dialog */}
      <ConfirmDialog
        open={saveDialogOpen}
        onOpenChange={setSaveDialogOpen}
        title="Save Changes?"
        description="Are you sure you want to save these changes? This will update the privacy policy visible to all users."
        confirmLabel="Save Changes"
        onConfirm={confirmSave}
      />

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
          <Button
            onClick={handleSaveClick}
            className="gap-2"
            disabled={isLoading || isSaving}
          >
            <Save className="w-4 h-4" />
            {isSaving ? "Saving..." : "Save Changes"}
          </Button>
        </div>
      </div>

      {/* Editor */}
      {isLoading ? (
        <div className="admin-card p-4 flex items-center gap-2 text-muted-foreground">
          <Loader2 className="w-4 h-4 animate-spin" />
          <span>Loading current privacy policy...</span>
        </div>
      ) : (
        <RichTextEditor initialContent={content} onChange={setContent} />
      )}

      {/* Info */}
      <div className="admin-card p-4 bg-info/5 border-info/20">
        <p className="text-sm text-info">
          <strong>Tip:</strong> Use the toolbar to format your text. Changes
          will not be published until you click "Save Changes".
        </p>
      </div>
    </div>
  );
};

export default PrivacyPolicy;
