import { useMemo } from "react";
import { Message } from "@/lib/room-service";
import { Link as LinkIcon, ExternalLink, MessageSquare } from "lucide-react";

interface LinksListProps {
  messages: Message[];
  onJumpToMessage: (messageId: string) => void;
}

interface LinkItem {
  id: string;
  url: string;
  sender: string;
  timestamp: Date;
  previewText?: string;
}

// URL detection regex - more comprehensive
const URL_REGEX = /(https?:\/\/[^\s<>]+[^\s<>.,;:!?'")\]])/gi;

function extractLinks(text: string | null): string[] {
  if (!text) return [];

  const matches = text.match(URL_REGEX);
  return matches || [];
}

function getDomainFromUrl(url: string): string {
  try {
    const urlObj = new URL(url);
    return urlObj.hostname.replace(/^www\./, "");
  } catch {
    return url;
  }
}

function getFaviconUrl(url: string): string {
  try {
    const urlObj = new URL(url);
    return `https://www.google.com/s2/favicons?domain=${urlObj.hostname}&sz=32`;
  } catch {
    return "";
  }
}

export function LinksList({ messages, onJumpToMessage }: LinksListProps) {
  const linkItems = useMemo(() => {
    // Map to store unique URLs (key: url, value: full LinkItem)
    const uniqueLinks = new Map<string, LinkItem>();

    messages.forEach((msg) => {
      if (!msg.text) return;

      const urls = extractLinks(msg.text);

      urls.forEach((url) => {
        // Only add if not already in map (first occurrence wins)
        if (!uniqueLinks.has(url)) {
          // Extract surrounding text for preview
          const urlIndex = msg.text!.indexOf(url);
          let previewText = msg.text!.slice(0, urlIndex).trim();

          // If there's text before the URL, use last 50 chars
          if (previewText.length > 50) {
            previewText = "..." + previewText.slice(-50);
          }

          uniqueLinks.set(url, {
            id: msg.id!,
            url,
            sender: msg.sender,
            timestamp:
              msg.timestamp instanceof Date
                ? msg.timestamp
                : msg.timestamp.toDate(),
            previewText: previewText || undefined,
          });
        }
      });
    });

    // Convert to array and sort by timestamp (most recent first)
    const items = Array.from(uniqueLinks.values()).sort(
      (a, b) => b.timestamp.getTime() - a.timestamp.getTime(),
    );

    // Limit to last 200 links for performance
    return items.slice(0, 200);
  }, [messages]);

  if (linkItems.length === 0) {
    return (
      <div className="py-8 text-center">
        <LinkIcon className="h-12 w-12 mx-auto text-text-tertiary/30 mb-2" />
        <p className="text-sm text-text-tertiary">No links shared yet</p>
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
      {linkItems.map((link) => {
        const domain = getDomainFromUrl(link.url);
        const favicon = getFaviconUrl(link.url);

        return (
          <div
            key={`${link.id}-${link.url}`}
            className="group p-3 rounded-lg border border-neon-cyan/10 hover:border-neon-blue/40 bg-bg-800/30 hover:bg-bg-800/50 transition-all"
          >
            {/* Link Info */}
            <div className="flex items-start gap-3">
              {/* Favicon or Icon */}
              <div className="flex-shrink-0 w-8 h-8 rounded flex items-center justify-center bg-neon-blue/10 border border-neon-blue/30">
                {favicon ? (
                  <img
                    src={favicon}
                    alt=""
                    className="w-4 h-4"
                    onError={(e) => {
                      e.currentTarget.style.display = "none";
                      e.currentTarget.nextElementSibling?.classList.remove(
                        "hidden",
                      );
                    }}
                  />
                ) : null}
                <LinkIcon
                  className={`h-4 w-4 text-neon-blue ${favicon ? "hidden" : ""}`}
                />
              </div>

              <div className="flex-1 min-w-0">
                {/* URL */}
                <a
                  href={link.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-sm font-medium text-neon-blue hover:text-neon-cyan transition-colors block truncate underline-offset-2 hover:underline"
                >
                  {link.url}
                </a>

                {/* Domain */}
                <p className="text-xs text-text-tertiary mt-0.5">{domain}</p>

                {/* Preview text if available */}
                {link.previewText && (
                  <p className="text-xs text-text-secondary mt-1 italic truncate">
                    "{link.previewText}"
                  </p>
                )}

                {/* Metadata */}
                <div className="flex items-center gap-2 mt-2 text-xs text-text-tertiary">
                  <span className="truncate">Shared by {link.sender}</span>
                  <span>•</span>
                  <span>{formatTimestamp(link.timestamp)}</span>
                </div>
              </div>
            </div>

            {/* Actions */}
            <div className="mt-3 flex gap-2">
              <a
                href={link.url}
                target="_blank"
                rel="noopener noreferrer"
                className="flex-1 flex items-center justify-center gap-2 px-3 py-1.5 bg-neon-blue/10 hover:bg-neon-blue/20 border border-neon-blue/30 hover:border-neon-blue text-neon-blue rounded-md transition-all text-xs font-medium"
              >
                <ExternalLink className="h-3 w-3" />
                Open Link
              </a>
              <button
                onClick={() => onJumpToMessage(link.id)}
                className="flex-1 flex items-center justify-center gap-2 px-3 py-1.5 bg-neon-magenta/10 hover:bg-neon-magenta/20 border border-neon-magenta/30 hover:border-neon-magenta text-neon-magenta rounded-md transition-all text-xs font-medium"
              >
                <MessageSquare className="h-3 w-3" />
                Jump to Message
              </button>
            </div>
          </div>
        );
      })}
    </div>
  );
}
