import { useCallback, useEffect, useState } from "react";
import { Save, Clock, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import RichTextEditor from "@/components/shared/RichTextEditor";
import ConfirmDialog from "@/components/shared/ConfirmDialog";
import { useToast } from "@/hooks/use-toast";
import { api, ApiClientError } from "@/config/client";
import { API_ENDPOINTS } from "@/config/config";
import { unwrapPolicyContent, wrapPolicyContent } from "@/lib/policyContent";
import type { PrivacyPolicyDocument, PrivacyPolicyResponse } from "@/types";

const PrivacyPolicy = () => {
  const [content, setContent] = useState("");
  const [lastSaved, setLastSaved] = useState<Date | null>(null);
  const [lastSavedContent, setLastSavedContent] = useState("");
  const [saveDialogOpen, setSaveDialogOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { toast } = useToast();
  const normalizedContent = content.trim();
  const hasChanges =
    normalizedContent.length > 0 &&
    normalizedContent !== lastSavedContent.trim();
  const isSaveDisabled = isLoading || isSaving || !hasChanges;

  const loadPrivacyPolicy = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const response = await api.get<PrivacyPolicyResponse>(
        API_ENDPOINTS.PRIVACY_POLICY.ROOT,
        { requiresAuth: true }
      );
      const policy = response.data.privacyPolicy;
      const policyContent = unwrapPolicyContent(policy?.content ?? "");
      const normalizedPolicyContent = policyContent.trim();

      setContent(normalizedPolicyContent.length ? normalizedPolicyContent : "");
      setLastSavedContent(normalizedPolicyContent ?? "");

      if (policy?.updatedAt || policy?.createdAt) {
        setLastSaved(new Date(policy.updatedAt ?? policy.createdAt!));
      } else {
        setLastSaved(null);
      }
    } catch (err) {
      if (err instanceof ApiClientError && err.statusCode === 404) {
        setContent("");
        setLastSavedContent("");
        setLastSaved(null);
        setError("No privacy policy found yet. Create the first entry.");
      } else {
        const message =
          err instanceof ApiClientError
            ? err.message
            : "Unable to load privacy policy. Please try again.";
        setError(message);
        toast({
          variant: "destructive",
          title: "Failed to load policy",
          description: message,
        });
      }
    } finally {
      setIsLoading(false);
    }
  }, [toast]);

  useEffect(() => {
    loadPrivacyPolicy();
  }, [loadPrivacyPolicy]);

  const handleSaveClick = () => {
    if (!normalizedContent) {
      toast({
        variant: "destructive",
        title: "Content required",
        description: "Privacy policy cannot be empty.",
      });
      return;
    }

    if (!hasChanges) {
      toast({
        title: "No changes to save",
        description: "Update the privacy policy before saving.",
      });
      return;
    }

    setSaveDialogOpen(true);
  };

  const confirmSave = async () => {
    setIsSaving(true);
    setError(null);
    try {
      const payloadContent = wrapPolicyContent(content);
      const response = await api.post<PrivacyPolicyResponse>(
        API_ENDPOINTS.PRIVACY_POLICY.ROOT,
        { content: payloadContent }
      );
      const policy = response.privacyPolicy;
      if (policy?.content) {
        setContent(unwrapPolicyContent(policy.content));
      }
      setLastSavedContent(unwrapPolicyContent(policy?.content ?? content));
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
      setError(message);
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
            disabled={isSaveDisabled}
          >
            <Save className="w-4 h-4" />
            {isSaving ? "Saving..." : "Save Changes"}
          </Button>
        </div>
      </div>

      {error && (
        <div className="admin-card border-destructive/20 bg-destructive/10 text-destructive px-4 py-3">
          {error}
        </div>
      )}

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
