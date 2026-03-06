import { useMemo, useState } from "react";
import { Message } from "@/lib/room-service";
import { PlayCircle, Image as ImageIcon } from "lucide-react";
import { Dialog, DialogContent } from "@/components/ui/dialog";

interface MediaGalleryProps {
  messages: Message[];
  onJumpToMessage: (messageId: string) => void;
}

interface MediaItem {
  id: string;
  mediaUrl: string;
  mediaType: string;
  sender: string;
  timestamp: Date;
  isVideo: boolean;
  isGif: boolean;
}

export function MediaGallery({ messages, onJumpToMessage }: MediaGalleryProps) {
  const [selectedMedia, setSelectedMedia] = useState<MediaItem | null>(null);

  const mediaItems = useMemo(() => {
    // Filter messages with media (images, videos, gifs)
    const items = messages
      .filter((msg) => {
        if (!msg.mediaUrl || !msg.mediaType) return false;

        const type = msg.mediaType.toLowerCase();
        return (
          type.startsWith("image/") ||
          type.startsWith("video/") ||
          type.includes("gif")
        );
      })
      .map(
        (msg): MediaItem => ({
          id: msg.id!,
          mediaUrl: msg.mediaUrl!,
          mediaType: msg.mediaType!,
          sender: msg.sender,
          timestamp:
            msg.timestamp instanceof Date
              ? msg.timestamp
              : msg.timestamp.toDate(),
          isVideo: msg.mediaType!.toLowerCase().startsWith("video/"),
          isGif: msg.mediaType!.toLowerCase().includes("gif"),
        }),
      )
      .reverse(); // Most recent first

    // Limit to last 200 media items for performance
    return items.slice(0, 200);
  }, [messages]);

  if (mediaItems.length === 0) {
    return (
      <div className="py-8 text-center">
        <ImageIcon className="h-12 w-12 mx-auto text-text-tertiary/30 mb-2" />
        <p className="text-sm text-text-tertiary">No media shared yet</p>
      </div>
    );
  }

  const formatTimestamp = (date: Date) => {
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffHours = diffMs / (1000 * 60 * 60);
    const diffDays = diffMs / (1000 * 60 * 60 * 24);

    if (diffHours < 24) {
      return date.toLocaleTimeString("en-US", {
        hour: "numeric",
        minute: "2-digit",
      });
    } else if (diffDays < 7) {
      return date.toLocaleDateString("en-US", {
        weekday: "short",
      });
    } else {
      return date.toLocaleDateString("en-US", {
        month: "short",
        day: "numeric",
      });
    }
  };

  return (
    <>
      <div className="grid grid-cols-3 gap-2">
        {mediaItems.map((item) => (
          <div
            key={item.id}
            className="relative aspect-square rounded-md overflow-hidden group cursor-pointer border border-neon-cyan/20 hover:border-neon-cyan transition-all"
            onClick={() => setSelectedMedia(item)}
          >
            {/* Thumbnail */}
            {item.isVideo ? (
              <>
                <video
                  src={item.mediaUrl}
                  className="w-full h-full object-cover"
                  preload="metadata"
                />
                <div className="absolute inset-0 flex items-center justify-center bg-black/30 group-hover:bg-black/50 transition-colors">
                  <PlayCircle className="h-8 w-8 text-white drop-shadow-lg" />
                </div>
              </>
            ) : (
              <img
                src={item.mediaUrl}
                alt="Media"
                className="w-full h-full object-cover transition-transform group-hover:scale-110"
                loading="lazy"
              />
            )}

            {/* Hover overlay with neon glow */}
            <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity">
              <div className="absolute bottom-0 left-0 right-0 p-2">
                <p className="text-xs text-white font-medium truncate drop-shadow-md">
                  {item.sender}
                </p>
                <p className="text-xs text-white/80 drop-shadow-md">
                  {formatTimestamp(item.timestamp)}
                </p>
              </div>
            </div>

            {/* Neon glow effect on hover */}
            <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none">
              <div className="absolute inset-0 shadow-[0_0_15px_rgba(0,255,255,0.5)]" />
            </div>
          </div>
        ))}
      </div>

      {/* Media Preview Dialog */}
      <Dialog
        open={!!selectedMedia}
        onOpenChange={() => setSelectedMedia(null)}
      >
        <DialogContent className="max-w-4xl bg-bg-900 border-neon-cyan/30">
          {selectedMedia && (
            <div className="space-y-4">
              {/* Media Display */}
              <div className="max-h-[70vh] flex items-center justify-center bg-black/30 rounded-lg overflow-hidden">
                {selectedMedia.isVideo ? (
                  <video
                    src={selectedMedia.mediaUrl}
                    controls
                    autoPlay
                    className="max-w-full max-h-[70vh]"
                  />
                ) : (
                  <img
                    src={selectedMedia.mediaUrl}
                    alt="Preview"
                    className="max-w-full max-h-[70vh] object-contain"
                  />
                )}
              </div>

              {/* Media Info */}
              <div className="flex items-center justify-between text-sm">
                <div>
                  <p className="text-neon-cyan font-medium">
                    {selectedMedia.sender}
                  </p>
                  <p className="text-text-tertiary text-xs">
                    {selectedMedia.timestamp.toLocaleString()}
                  </p>
                </div>
                <button
                  onClick={() => {
                    onJumpToMessage(selectedMedia.id);
                    setSelectedMedia(null);
                  }}
                  className="px-4 py-2 bg-neon-cyan/10 hover:bg-neon-cyan/20 border border-neon-cyan/30 hover:border-neon-cyan text-neon-cyan rounded-md transition-all text-sm font-medium"
                >
                  Jump to Message
                </button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </>
  );
}
