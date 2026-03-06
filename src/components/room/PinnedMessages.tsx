import { useEffect, useState } from "react";
import { Message, roomService } from "@/lib/room-service";
import { Pin, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { GlassCard } from "@/components/ui/glass-card";

interface PinnedMessagesProps {
  roomId: string;
  messages: Message[];
  onJumpToMessage: (messageId: string) => void;
  onUnpin?: (messageId: string) => void;
}

export function PinnedMessages({
  roomId,
  messages,
  onJumpToMessage,
  onUnpin,
}: PinnedMessagesProps) {
  console.log('🔍 PinnedMessages render:', {
    totalMessages: messages.length,
    pinnedCount: messages.filter(m => m.pinned === true).length,
    messagesWithPinned: messages.filter(m => m.pinned !== undefined).length,
    sampleMessage: messages[0] ? { id: messages[0].id, pinned: messages[0].pinned } : null
  });
  
  // Filter and sort pinned messages (most recent first, like WhatsApp)
  const pinnedMessages = messages
    .filter((msg) => msg.pinned === true)
    .sort((a, b) => {
      const timeA = a.timestamp instanceof Date ? a.timestamp.getTime() : (a.timestamp as any).seconds * 1000;
      const timeB = b.timestamp instanceof Date ? b.timestamp.getTime() : (b.timestamp as any).seconds * 1000;
      return timeB - timeA; // Most recent first
    });

  if (pinnedMessages.length === 0) {
    return null;
  }

  const handleUnpin = async (messageId: string) => {
    if (!messageId) return;

    try {
      await roomService.togglePinMessage(roomId, messageId, false);
      if (onUnpin) {
        onUnpin(messageId);
      }
    } catch (error) {
      console.error("Failed to unpin message:", error);
    }
  };

  return (
    <div className="border-b border-neon-gold/30 bg-neon-gold/5 backdrop-blur-sm">
      <div className="p-3 space-y-2">
        <div className="flex items-center gap-2 mb-2">
          <Pin className="h-4 w-4 text-neon-gold" />
          <span className="text-xs font-orbitron font-bold text-neon-gold uppercase tracking-wider">
            Pinned Messages ({pinnedMessages.length})
          </span>
        </div>

        {pinnedMessages.map((message) => (
          <GlassCard
            key={message.id}
            className="p-3 border-neon-gold/30 hover:border-neon-gold/50 cursor-pointer group transition-all"
            onClick={() => message.id && onJumpToMessage(message.id)}
          >
            <div className="flex items-start justify-between gap-3">
              <div className="flex-1 min-w-0">
                <div className="text-xs text-neon-gold font-medium mb-1">
                  {message.sender}
                </div>
                <p className="text-sm text-text-primary line-clamp-2 break-words">
                  {message.text ||
                    (message.mediaUrl
                      ? "📎 Media attachment"
                      : "Empty message")}
                </p>
              </div>
              <Button
                variant="ghost"
                size="icon"
                onClick={(e) => {
                  e.stopPropagation();
                  message.id && handleUnpin(message.id);
                }}
                className="h-6 w-6 opacity-0 group-hover:opacity-100 transition-opacity hover:bg-neon-red/10 hover:text-neon-red flex-shrink-0"
                title="Unpin message"
              >
                <X className="h-3 w-3" />
              </Button>
            </div>
          </GlassCard>
        ))}
      </div>
    </div>
  );
}
