import { useEffect, useState } from "react";
import { Save, Clock, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import RichTextEditor from "@/components/shared/RichTextEditor";
import ConfirmDialog from "@/components/shared/ConfirmDialog";
import { useToast } from "@/hooks/use-toast";
import { api, ApiClientError } from "@/config/client";
import { API_ENDPOINTS } from "@/config/config";
import type {
  AboutAppContent,
  CreateAboutAppResponse,
  GetAboutAppResponse,
} from "@/types";

const AboutApp = () => {
  const [content, setContent] = useState("");
  const [lastSaved, setLastSaved] = useState<Date | null>(null);
  const [saveDialogOpen, setSaveDialogOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const language = "en";
  const platform = "android";
  const { toast } = useToast();

  const normalizeAboutAppPayload = (
    payload?: GetAboutAppResponse | CreateAboutAppResponse | null
  ): AboutAppContent | null => {
    if (!payload || typeof payload !== "object") return null;

    const record =
      (payload as { aboutApp?: AboutAppContent }).aboutApp ??
      (payload as { content?: AboutAppContent | string }).content ??
      (payload as { data?: AboutAppContent | string }).data;

    if (!record) return null;
    if (typeof record === "string") {
      return { content: record };
    }

    return record;
  };

  const updateLastSaved = (record?: AboutAppContent | null) => {
    if (!record) {
      setLastSaved(null);
      return;
    }

    const timestamp = record.updatedAt ?? record.createdAt;
    setLastSaved(timestamp ? new Date(timestamp) : new Date());
  };

  useEffect(() => {
    let isMounted = true;

    const fetchAboutApp = async () => {
      setIsLoading(true);
      setError(null);

      try {
        const response = await api.get<GetAboutAppResponse>(
          `${API_ENDPOINTS.ABOUT_APP.ROOT}?language=${language}&platform=${platform}`
        );
        const aboutApp = normalizeAboutAppPayload(response);

        if (isMounted) {
          setContent(aboutApp?.content || "");
          updateLastSaved(aboutApp);
        }
      } catch (err) {
        const message =
          err instanceof ApiClientError
            ? err.message
            : "Unable to load About App content.";

        if (isMounted) {
          setError(message);
          setContent("");
          setLastSaved(null);
        }

        toast({
          variant: "destructive",
          title: "Failed to load About App",
          description: message,
        });
      } finally {
        isMounted && setIsLoading(false);
      }
    };

    fetchAboutApp();

    return () => {
      isMounted = false;
    };
  }, [language, platform, toast]);

  const handleSaveClick = () => {
    if (isSaving) return;
    setSaveDialogOpen(true);
  };

  const confirmSave = async () => {
    setIsSaving(true);
    setError(null);

    try {
      const response = await api.post<CreateAboutAppResponse>(
        API_ENDPOINTS.ABOUT_APP.ROOT,
        { content, language, platform }
      );
      const aboutApp = normalizeAboutAppPayload(response) ?? {
        content,
        language,
        platform,
      };

      setContent(aboutApp.content || content);
      updateLastSaved(aboutApp);

      toast({
        title: "Changes saved",
        description:
          response.message ||
          "Your about page has been updated successfully.",
      });
    } catch (err) {
      const message =
        err instanceof ApiClientError
          ? err.message
          : "Unable to save About App content.";

      setError(message);
      toast({
        variant: "destructive",
        title: "Failed to save About App",
        description: message,
      });
    } finally {
      setIsSaving(false);
    }
  };

  const isContentEmpty = !content.trim();

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
          <Button
            onClick={handleSaveClick}
            className="gap-2"
            disabled={isSaving || isLoading || isContentEmpty}
          >
            {isSaving ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                Saving...
              </>
            ) : (
              <>
                <Save className="w-4 h-4" />
                Save Changes
              </>
            )}
          </Button>
        </div>
      </div>

      {error && (
        <div className="admin-card p-4 bg-destructive/10 border border-destructive/20 text-destructive">
          {error}
        </div>
      )}

      {/* Editor */}
      <div className="space-y-3">
        {isLoading ? (
          <div className="admin-card p-4 flex items-center gap-2 text-muted-foreground">
            <Loader2 className="w-4 h-4 animate-spin" />
            <span>Loading About App content...</span>
          </div>
        ) : (
          <RichTextEditor initialContent={content} onChange={setContent} />
        )}
      </div>

    </div>
  );
};

export default AboutApp;
