import { useMemo } from "react";
import { Message } from "@/lib/room-service";
import {
  MessageSquare,
  Image as ImageIcon,
  Video,
  FileText,
  Link as LinkIcon,
  Users,
  HardDrive,
} from "lucide-react";

interface RoomStatsProps {
  messages: Message[];
}

interface Stats {
  totalMessages: number;
  images: number;
  videos: number;
  documents: number;
  links: number;
  uniqueMembers: number;
  totalFileSizeMB: string;
}

// URL detection regex
const URL_REGEX = /(https?:\/\/[^\s<>]+[^\s<>.,;:!?'")\]])/gi;

export function RoomStats({ messages }: RoomStatsProps) {
  const stats: Stats = useMemo(() => {
    // Limit to last 500 messages for performance
    const limitedMessages = messages.slice(-500);

    let imageCount = 0;
    let videoCount = 0;
    let documentCount = 0;
    let linkCount = 0;
    let totalFileSize = 0;
    const uniqueSenders = new Set<string>();
    const uniqueLinks = new Set<string>();

    limitedMessages.forEach((msg) => {
      // Track unique senders
      uniqueSenders.add(msg.sender);

      // Count media types
      if (msg.mediaUrl && msg.mediaType) {
        const type = msg.mediaType.toLowerCase();

        // Images
        if (type.startsWith("image/") || type.includes("gif")) {
          imageCount++;
        }
        // Videos
        else if (type.startsWith("video/")) {
          videoCount++;
        }
        // Documents
        else if (
          type.includes("pdf") ||
          type.includes("doc") ||
          type.includes("word") ||
          type.includes("ppt") ||
          type.includes("powerpoint") ||
          type.includes("xls") ||
          type.includes("excel") ||
          type.includes("spreadsheet") ||
          type.includes("text/plain")
        ) {
          documentCount++;
        }

        // Estimate file size (would need actual metadata in real implementation)
        // For now, we'll just count files
      }

      // Extract and count unique links from text
      if (msg.text) {
        const matches = msg.text.match(URL_REGEX);
        if (matches) {
          matches.forEach((url) => uniqueLinks.add(url));
        }
      }
    });

    return {
      totalMessages: limitedMessages.length,
      images: imageCount,
      videos: videoCount,
      documents: documentCount,
      links: uniqueLinks.size,
      uniqueMembers: uniqueSenders.size,
      totalFileSizeMB: "—", // Placeholder - would need actual file metadata
    };
  }, [messages]);

  const statItems = [
    {
      icon: MessageSquare,
      label: "Messages",
      value: stats.totalMessages.toLocaleString(),
      color: "text-neon-cyan",
      bgColor: "bg-neon-cyan/10",
      borderColor: "border-neon-cyan/30",
    },
    {
      icon: ImageIcon,
      label: "Images",
      value: stats.images.toLocaleString(),
      color: "text-neon-violet",
      bgColor: "bg-neon-violet/10",
      borderColor: "border-neon-violet/30",
    },
    {
      icon: Video,
      label: "Videos",
      value: stats.videos.toLocaleString(),
      color: "text-neon-magenta",
      bgColor: "bg-neon-magenta/10",
      borderColor: "border-neon-magenta/30",
    },
    {
      icon: FileText,
      label: "Documents",
      value: stats.documents.toLocaleString(),
      color: "text-neon-gold",
      bgColor: "bg-neon-gold/10",
      borderColor: "border-neon-gold/30",
    },
    {
      icon: LinkIcon,
      label: "Links",
      value: stats.links.toLocaleString(),
      color: "text-neon-blue",
      bgColor: "bg-neon-blue/10",
      borderColor: "border-neon-blue/30",
    },
    {
      icon: Users,
      label: "Members",
      value: stats.uniqueMembers.toLocaleString(),
      color: "text-neon-green",
      bgColor: "bg-neon-green/10",
      borderColor: "border-neon-green/30",
    },
  ];

  return (
    <div className="space-y-3">
      {/* Stats Grid */}
      <div className="grid grid-cols-2 gap-3">
        {statItems.map((stat) => {
          const Icon = stat.icon;
          return (
            <div
              key={stat.label}
              className={`p-3 rounded-lg border ${stat.borderColor} ${stat.bgColor} backdrop-blur-sm transition-all hover:scale-105 hover:shadow-lg`}
            >
              <div className="flex items-center gap-2 mb-2">
                <Icon className={`h-4 w-4 ${stat.color}`} />
                <span className="text-xs text-text-tertiary font-medium uppercase tracking-wide">
                  {stat.label}
                </span>
              </div>
              <div className={`text-2xl font-orbitron font-bold ${stat.color}`}>
                {stat.value}
              </div>
            </div>
          );
        })}
      </div>

      {/* Summary Note */}
      {messages.length > 500 && (
        <p className="text-xs text-text-tertiary text-center italic">
          Showing stats for last 500 messages
        </p>
      )}

      {messages.length === 0 && (
        <div className="py-8 text-center">
          <MessageSquare className="h-12 w-12 mx-auto text-text-tertiary/30 mb-2" />
          <p className="text-sm text-text-tertiary">No activity yet</p>
        </div>
      )}
    </div>
  );
}
