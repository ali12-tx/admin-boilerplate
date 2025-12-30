import { useEffect, useRef, useState, type FormEvent } from "react";
import {
  Bold,
  Italic,
  Underline,
  Heading1,
  Heading2,
  List,
  Link,
  AlignLeft,
  AlignCenter,
  AlignRight,
} from "lucide-react";
import { cn } from "@/lib/utils";

interface RichTextEditorProps {
  initialContent?: string;
  onChange?: (content: string) => void;
}

const ToolbarButton = ({
  icon: Icon,
  active,
  onClick,
  title,
}: {
  icon: React.ElementType;
  active?: boolean;
  onClick: () => void;
  title: string;
}) => (
  <button
    type="button"
    onClick={onClick}
    title={title}
    className={cn(
      "p-2 rounded-lg transition-colors",
      active
        ? "bg-primary text-primary-foreground"
        : "text-muted-foreground hover:bg-muted hover:text-foreground"
    )}
  >
    <Icon className="w-4 h-4" />
  </button>
);

const RichTextEditor = ({ initialContent = "", onChange }: RichTextEditorProps) => {
  const [content, setContent] = useState(initialContent);
  const [activeFormats, setActiveFormats] = useState<string[]>([]);
  const editorRef = useRef<HTMLDivElement>(null);

  const syncActiveFormats = () => {
    const selection = document.getSelection();
    const editor = editorRef.current;

    if (!selection || !editor || !editor.contains(selection.anchorNode)) {
      setActiveFormats([]);
      return;
    }

    const formats: string[] = [];

    if (document.queryCommandState("bold")) formats.push("bold");
    if (document.queryCommandState("italic")) formats.push("italic");
    if (document.queryCommandState("underline")) formats.push("underline");
    if (document.queryCommandState("insertUnorderedList")) formats.push("list");
    if (document.queryCommandState("justifyLeft")) formats.push("left");
    if (document.queryCommandState("justifyCenter")) formats.push("center");
    if (document.queryCommandState("justifyRight")) formats.push("right");

    const block = (document.queryCommandValue("formatBlock") || "")
      .toString()
      .toLowerCase();

    if (block.includes("h1")) formats.push("h1");
    if (block.includes("h2")) formats.push("h2");

    setActiveFormats(formats);
  };

  const updateContent = () => {
    const editor = editorRef.current;
    if (!editor) return;

    const html = editor.innerHTML;
    setContent(html);
    onChange?.(html);
  };

  const applyContent = (value: string) => {
    const editor = editorRef.current;
    if (!editor) return;

    const incoming = value ?? "";
    const looksLikeHtml = /<[^>]+>/g.test(incoming.trim());

    if (looksLikeHtml) {
      editor.innerHTML = incoming;
    } else {
      editor.innerText = incoming;
    }

    setContent(editor.innerHTML);
  };

  useEffect(() => {
    applyContent(initialContent);
  }, []);

  useEffect(() => {
    if (initialContent === content) return;
    applyContent(initialContent);
  }, [initialContent, content]);

  useEffect(() => {
    document.addEventListener("selectionchange", syncActiveFormats);
    return () => document.removeEventListener("selectionchange", syncActiveFormats);
  }, []);

  const handleFormat = (format: string) => {
    const editor = editorRef.current;
    if (!editor) return;

    editor.focus();

    switch (format) {
      case "bold":
      case "italic":
      case "underline":
        document.execCommand(format);
        break;
      case "h1":
      case "h2":
        document.execCommand("formatBlock", false, format);
        break;
      case "list":
        document.execCommand("insertUnorderedList");
        break;
      case "link": {
        const url = window.prompt("Enter URL");
        if (url) {
          document.execCommand("createLink", false, url);
        }
        break;
      }
      case "left":
        document.execCommand("justifyLeft");
        break;
      case "center":
        document.execCommand("justifyCenter");
        break;
      case "right":
        document.execCommand("justifyRight");
        break;
      default:
        break;
    }

    updateContent();
    syncActiveFormats();
  };

  const handleContentChange = (_event: FormEvent<HTMLDivElement>) => {
    updateContent();
  };

  return (
    <div className="admin-card overflow-hidden">
      {/* Toolbar */}
      <div className="flex flex-wrap items-center gap-1 p-3 border-b border-border bg-muted/30">
        <div className="flex items-center gap-1">
          <ToolbarButton
            icon={Bold}
            active={activeFormats.includes("bold")}
            onClick={() => handleFormat("bold")}
            title="Bold"
          />
          <ToolbarButton
            icon={Italic}
            active={activeFormats.includes("italic")}
            onClick={() => handleFormat("italic")}
            title="Italic"
          />
          <ToolbarButton
            icon={Underline}
            active={activeFormats.includes("underline")}
            onClick={() => handleFormat("underline")}
            title="Underline"
          />
        </div>

        <div className="w-px h-6 bg-border mx-2" />

        <div className="flex items-center gap-1">
          <ToolbarButton
            icon={Heading1}
            active={activeFormats.includes("h1")}
            onClick={() => handleFormat("h1")}
            title="Heading 1"
          />
          <ToolbarButton
            icon={Heading2}
            active={activeFormats.includes("h2")}
            onClick={() => handleFormat("h2")}
            title="Heading 2"
          />
        </div>

        <div className="w-px h-6 bg-border mx-2" />

        <div className="flex items-center gap-1">
          <ToolbarButton
            icon={List}
            active={activeFormats.includes("list")}
            onClick={() => handleFormat("list")}
            title="Bullet List"
          />
          <ToolbarButton
            icon={Link}
            active={activeFormats.includes("link")}
            onClick={() => handleFormat("link")}
            title="Insert Link"
          />
        </div>

        <div className="w-px h-6 bg-border mx-2" />

        <div className="flex items-center gap-1">
          <ToolbarButton
            icon={AlignLeft}
            active={activeFormats.includes("left")}
            onClick={() => handleFormat("left")}
            title="Align Left"
          />
          <ToolbarButton
            icon={AlignCenter}
            active={activeFormats.includes("center")}
            onClick={() => handleFormat("center")}
            title="Align Center"
          />
          <ToolbarButton
            icon={AlignRight}
            active={activeFormats.includes("right")}
            onClick={() => handleFormat("right")}
            title="Align Right"
          />
        </div>
      </div>

      {/* Editor */}
      <div
        ref={editorRef}
        contentEditable
        suppressContentEditableWarning
        role="textbox"
        aria-label="Rich text editor"
        onInput={handleContentChange}
        className="w-full min-h-[400px] p-6 bg-card text-foreground focus:outline-none text-base leading-relaxed whitespace-pre-wrap"
      />
    </div>
  );
};

export default RichTextEditor;
