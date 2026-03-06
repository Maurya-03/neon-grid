import { useMemo } from "react";
import { Message } from "@/lib/room-service";
import {
  FileText,
  FileSpreadsheet,
  FileImage,
  Download,
  ExternalLink,
  MessageSquare,
} from "lucide-react";

interface DocumentListProps {
  messages: Message[];
  onJumpToMessage: (messageId: string) => void;
}

interface DocumentItem {
  id: string;
  fileName: string;
  fileUrl: string;
  fileType: string;
  sender: string;
  timestamp: Date;
}

// Extract file extension from URL or mediaType
function getFileExtension(url: string, mediaType: string | null): string {
  if (mediaType) {
    const type = mediaType.toLowerCase();
    if (type.includes("pdf")) return "pdf";
    if (type.includes("word") || type.includes("msword")) return "doc";
    if (type.includes("powerpoint") || type.includes("presentation"))
      return "ppt";
    if (type.includes("excel") || type.includes("spreadsheet")) return "xls";
    if (type.includes("text")) return "txt";
  }

  // Extract from URL
  const match = url.match(/\.([^.?#]+)(?:\?|#|$)/);
  return match ? match[1].toLowerCase() : "file";
}

function getFileIcon(extension: string) {
  switch (extension) {
    case "pdf":
      return { Icon: FileText, color: "text-cyan-400", glow: "" };
    case "doc":
    case "docx":
      return { Icon: FileText, color: "text-violet-400", glow: "" };
    case "ppt":
    case "pptx":
      return { Icon: FileImage, color: "text-neon-gold", glow: "" };
    case "xls":
    case "xlsx":
      return { Icon: FileSpreadsheet, color: "text-neon-green", glow: "" };
    case "txt":
      return { Icon: FileText, color: "text-gray-400", glow: "" };
    default:
      return { Icon: FileText, color: "text-text-tertiary", glow: "" };
  }
}

function extractFileName(url: string): string {
  try {
    const urlObj = new URL(url);
    const pathname = urlObj.pathname;
    const segments = pathname.split("/");
    const fileName = segments[segments.length - 1];
    return decodeURIComponent(fileName) || "Untitled Document";
  } catch {
    return "Untitled Document";
  }
}

export function DocumentList({ messages, onJumpToMessage }: DocumentListProps) {
  const documentItems = useMemo(() => {
    // Filter messages with document files
    const items = messages
      .filter((msg) => {
        if (!msg.mediaUrl || !msg.mediaType) return false;

        const type = msg.mediaType.toLowerCase();
        // Check for document types
        return (
          type.includes("pdf") ||
          type.includes("doc") ||
          type.includes("docx") ||
          type.includes("word") ||
          type.includes("msword") ||
          type.includes("ppt") ||
          type.includes("pptx") ||
          type.includes("powerpoint") ||
          type.includes("presentation") ||
          type.includes("xls") ||
          type.includes("xlsx") ||
          type.includes("excel") ||
          type.includes("spreadsheet") ||
          type.includes("text/plain")
        );
      })
      .map((msg): DocumentItem => {
        const extension = getFileExtension(msg.mediaUrl!, msg.mediaType);
        return {
          id: msg.id!,
          fileName: extractFileName(msg.mediaUrl!),
          fileUrl: msg.mediaUrl!,
          fileType: extension,
          sender: msg.sender,
          timestamp:
            msg.timestamp instanceof Date
              ? msg.timestamp
              : msg.timestamp.toDate(),
        };
      })
      .reverse(); // Most recent first

    // Limit to last 200 documents for performance
    return items.slice(0, 200);
  }, [messages]);

  if (documentItems.length === 0) {
    return (
      <div className="py-8 text-center">
        <FileText className="h-12 w-12 mx-auto text-text-tertiary/30 mb-2" />
        <p className="text-sm text-text-tertiary">No documents shared yet</p>
      </div>
    );
  }

  const formatTimestamp = (date: Date) => {
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffHours = diffMs / (1000 * 60 * 60);
    const diffDays = diffMs / (1000 * 60 * 60 * 24);

    if (diffHours < 1) {
      const mins = Math.floor(diffMs / (1000 * 60));
      return `${mins} min${mins !== 1 ? "s" : ""} ago`;
    } else if (diffHours < 24) {
      const hours = Math.floor(diffHours);
      return `${hours} hour${hours !== 1 ? "s" : ""} ago`;
    } else if (diffDays < 7) {
      const days = Math.floor(diffDays);
      return `${days} day${days !== 1 ? "s" : ""} ago`;
    } else {
      return date.toLocaleDateString("en-US", {
        month: "short",
        day: "numeric",
        year:
          date.getFullYear() !== new Date().getFullYear()
            ? "numeric"
            : undefined,
      });
    }
  };

  return (
    <div className="space-y-2">
      {documentItems.map((doc) => {
        const { Icon, color, glow } = getFileIcon(doc.fileType);

        return (
          <div
            key={doc.id}
            className="group p-3 rounded-lg border border-neon-cyan/10 hover:border-neon-cyan/30 bg-bg-800/30 hover:bg-bg-800/50 transition-all"
          >
            {/* File Info */}
            <div className="flex items-start gap-3">
              <div className={`flex-shrink-0 ${color} ${glow}`}>
                <Icon className="h-8 w-8" />
              </div>

              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-text-primary truncate group-hover:text-neon-cyan transition-colors">
                  {doc.fileName}
                </p>
                <div className="flex items-center gap-2 mt-1 text-xs text-text-tertiary">
                  <span className="truncate">{doc.sender}</span>
                  <span>•</span>
                  <span>{formatTimestamp(doc.timestamp)}</span>
                </div>
              </div>

              <div className="flex-shrink-0 flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                <span className="text-xs text-neon-cyan font-medium uppercase px-2 py-1 bg-neon-cyan/10 rounded">
                  {doc.fileType}
                </span>
              </div>
            </div>

            {/* Actions */}
            <div className="mt-3 flex gap-2">
              <a
                href={doc.fileUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="flex-1 flex items-center justify-center gap-2 px-3 py-1.5 bg-neon-cyan/10 hover:bg-neon-cyan/20 border border-neon-cyan/30 hover:border-neon-cyan text-neon-cyan rounded-md transition-all text-xs font-medium"
              >
                <ExternalLink className="h-3 w-3" />
                Open
              </a>
              <a
                href={doc.fileUrl}
                download
                className="flex-1 flex items-center justify-center gap-2 px-3 py-1.5 bg-neon-violet/10 hover:bg-neon-violet/20 border border-neon-violet/30 hover:border-neon-violet text-neon-violet rounded-md transition-all text-xs font-medium"
              >
                <Download className="h-3 w-3" />
                Download
              </a>
              <button
                onClick={() => onJumpToMessage(doc.id)}
                className="flex-1 flex items-center justify-center gap-2 px-3 py-1.5 bg-neon-magenta/10 hover:bg-neon-magenta/20 border border-neon-magenta/30 hover:border-neon-magenta text-neon-magenta rounded-md transition-all text-xs font-medium"
              >
                <MessageSquare className="h-3 w-3" />
                Jump
              </button>
            </div>
          </div>
        );
      })}
    </div>
  );
}
