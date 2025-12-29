import { useState } from "react";
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

  const handleFormat = (format: string) => {
    if (activeFormats.includes(format)) {
      setActiveFormats(activeFormats.filter((f) => f !== format));
    } else {
      setActiveFormats([...activeFormats, format]);
    }
    // In a real implementation, this would apply formatting to selected text
  };

  const handleContentChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const newContent = e.target.value;
    setContent(newContent);
    onChange?.(newContent);
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
      <textarea
        value={content}
        onChange={handleContentChange}
        placeholder="Start writing your content here..."
        className="w-full min-h-[400px] p-6 bg-card text-foreground placeholder:text-muted-foreground focus:outline-none resize-y text-base leading-relaxed"
      />
    </div>
  );
};

export default RichTextEditor;
