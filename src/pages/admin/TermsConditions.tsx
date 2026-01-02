import { useCallback, useEffect, useMemo, useState } from "react";
import { Save, Clock, Loader2, RefreshCcw } from "lucide-react";
import { Button } from "@/components/ui/button";
import RichTextEditor from "@/components/shared/RichTextEditor";
import ConfirmDialog from "@/components/shared/ConfirmDialog";
import { useToast } from "@/hooks/use-toast";
import { api, ApiClientError } from "@/config/client";
import { API_ENDPOINTS } from "@/config/config";
import type { TermsDocument, TermsResponse } from "@/types";

const TermsConditions = () => {
  const [content, setContent] = useState("");
  const [lastSaved, setLastSaved] = useState<Date | null>(null);
  const [saveDialogOpen, setSaveDialogOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [language, setLanguage] = useState("en");
  const [currentVersion, setCurrentVersion] = useState<string | null>(null);
  const [lastSavedContent, setLastSavedContent] = useState("");
  const [error, setError] = useState<string | null>(null);
  const { toast } = useToast();
  const normalizedContent = content.trim();
  const hasChanges =
    normalizedContent.length > 0 &&
    normalizedContent !== lastSavedContent.trim();

  const formattedLastSaved = useMemo(
    () => (lastSaved ? lastSaved.toLocaleString() : null),
    [lastSaved]
  );

  const loadTerms = useCallback(
    async (lang: string) => {
      setIsLoading(true);
      setError(null);
      try {
        const response = await api.get<TermsResponse>(
          API_ENDPOINTS.TERMS.ROOT,
          {
            headers: { "Accept-Language": lang },
          }
        );
        const terms: TermsDocument = response.terms;

        setContent(terms.content || "");
        setLastSavedContent(terms.content || "");
        setCurrentVersion(terms.version ?? null);
        setLastSaved(terms.createdAt ? new Date(terms.createdAt) : null);
      } catch (err) {
        if (err instanceof ApiClientError && err.statusCode === 404) {
          setContent("");
          setLastSavedContent("");
          setCurrentVersion(null);
          setLastSaved(null);
          setError(
            "No terms found for this language yet. Create the first entry."
          );
        } else {
          const message =
            err instanceof ApiClientError
              ? err.message
              : "Unable to load terms. Please try again.";
          setError(message);
          toast({
            variant: "destructive",
            title: "Failed to load terms",
            description: message,
          });
        }
      } finally {
        setIsLoading(false);
      }
    },
    [toast]
  );

  useEffect(() => {
    loadTerms(language);
  }, [language, loadTerms]);

  const handleSaveClick = () => {
    if (!normalizedContent) {
      setError("Content is required to save new terms.");
      return;
    }

    if (!hasChanges) {
      setError("No changes to save.");
      return;
    }
    setSaveDialogOpen(true);
  };

  const confirmSave = async () => {
    setIsSaving(true);
    setError(null);
    try {
      const response = await api.post<TermsResponse>(
        API_ENDPOINTS.TERMS.ROOT,
        { content },
        {
          headers: { "Accept-Language": language },
        }
      );
      const terms: TermsDocument = response.terms;

      setContent(terms.content);
      setLastSavedContent(terms.content);
      setCurrentVersion(terms.version ?? null);
      setLastSaved(terms.createdAt ? new Date(terms.createdAt) : new Date());

      toast({
        title: "Changes saved",
        description: `Version ${terms.version ?? ""} has been created.`,
      });
    } catch (err) {
      const message =
        err instanceof ApiClientError
          ? err.message
          : "Unable to save terms. Please try again.";
      setError(message);
      toast({
        variant: "destructive",
        title: "Save failed",
        description: message,
      });
    } finally {
      setIsSaving(false);
    }
  };

  const handleLanguageChange = (
    event: React.ChangeEvent<HTMLSelectElement>
  ) => {
    setLanguage(event.target.value);
  };

  const isSaveDisabled = isSaving || isLoading || !hasChanges;

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
          <h2 className="text-2xl font-bold text-foreground">
            Terms & Conditions
          </h2>
          <p className="text-muted-foreground">
            Manage your application's terms of service by language and version.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          <div className="flex items-center gap-2">
            <label
              className="text-sm font-medium text-foreground"
              htmlFor="language-select"
            >
              Language
            </label>
            <select
              id="language-select"
              value={language}
              onChange={handleLanguageChange}
              disabled={isLoading || isSaving}
              className="px-3 py-2 rounded-lg bg-input border border-border text-sm text-foreground focus:ring-2 focus:ring-primary/20 focus:outline-none"
            >
              <option value="en">English</option>
              <option value="es">Spanish</option>
              <option value="fr">French</option>
              <option value="de">German</option>
            </select>
          </div>

          <Button
            onClick={handleSaveClick}
            className="gap-2"
            disabled={isSaveDisabled}
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
        <div className="admin-card border-destructive/20 bg-destructive/10 text-destructive px-4 py-3">
          {error}
        </div>
      )}

      {/* Editor */}
      {isLoading ? (
        <div className="admin-card p-4 flex items-center gap-2 text-muted-foreground">
          <Loader2 className="w-4 h-4 animate-spin" />
          <span>Loading terms...</span>
        </div>
      ) : (
        <RichTextEditor initialContent={content} onChange={setContent} />
      )}

      {/* Info */}
      <div className="admin-card p-4 bg-info/5 border-info/20">
        <p className="text-sm text-info">
          <strong>Tip:</strong> Make sure to review and update your terms
          regularly to comply with applicable laws and regulations. Versions are
          generated automatically for the selected language.
        </p>
      </div>
    </div>
  );
};

export default TermsConditions;
