import { useMemo } from "react";
import { Room, Message } from "@/lib/room-service";
import { GlassCard } from "@/components/ui/glass-card";
import { ActiveMembersList } from "./ActiveMembersList";
import { MediaGallery } from "./MediaGallery";
import { DocumentList } from "./DocumentList";
import { LinksList } from "./LinksList";
import { RoomStats } from "./RoomStats";
import { ActivityLog } from "./ActivityLog";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import {
  Image,
  FileText,
  Link as LinkIcon,
  Pin,
  BarChart3,
  Activity,
  ChevronRight,
} from "lucide-react";

interface RoomInfoSidebarProps {
  room: Room;
  isOpen: boolean;
  messages: Message[];
  onJumpToMessage: (messageId: string) => void;
}

export function RoomInfoSidebar({
  room,
  isOpen,
  messages,
  onJumpToMessage,
}: RoomInfoSidebarProps) {
  if (!isOpen) return null;

  // Count items for each section
  const counts = useMemo(() => {
    const mediaCount = messages.filter((msg) => {
      if (!msg.mediaUrl || !msg.mediaType) return false;
      const type = msg.mediaType.toLowerCase();
      return (
        type.startsWith("image/") ||
        type.startsWith("video/") ||
        type.includes("gif")
      );
    }).length;

    const docCount = messages.filter((msg) => {
      if (!msg.mediaUrl || !msg.mediaType) return false;
      const type = msg.mediaType.toLowerCase();
      return (
        type.includes("pdf") ||
        type.includes("doc") ||
        type.includes("word") ||
        type.includes("ppt") ||
        type.includes("powerpoint") ||
        type.includes("xls") ||
        type.includes("excel") ||
        type.includes("spreadsheet") ||
        type.includes("text/plain")
      );
    }).length;

    // Extract unique links
    const linkSet = new Set<string>();
    messages.forEach((msg) => {
      if (!msg.text) return;
      const urlRegex = /(https?:\/\/[^\s<>]+[^\s<>.,;:!?'")\]])/gi;
      const matches = msg.text.match(urlRegex);
      if (matches) {
        matches.forEach((url) => linkSet.add(url));
      }
    });

    return {
      media: mediaCount,
      documents: docCount,
      links: linkSet.size,
    };
  }, [messages]);

  return (
    <div className="w-80 h-full border-r border-neon-cyan/20 bg-bg/95 backdrop-blur-sm flex flex-col overflow-hidden">
      {/* Scrollable Content */}
      <div className="flex-1 overflow-y-auto custom-scrollbar">
        <div className="p-4 space-y-6">
          {/* Room Info Section */}
          <div>
            <h2 className="text-xl font-orbitron font-bold text-neon-cyan uppercase tracking-wider text-shadow-glow-cyan mb-2">
              {room.name}
            </h2>
            <p className="text-sm text-text-secondary leading-relaxed">
              {room.description}
            </p>
          </div>

          {/* Room Metadata */}
          <div className="space-y-2">
            <div className="text-xs text-text-tertiary">
              <span className="font-semibold">Created by:</span>{" "}
              <span className="text-neon-violet">{room.createdBy}</span>
            </div>
            <div className="text-xs text-text-tertiary">
              <span className="font-semibold">Created:</span>{" "}
              <span>
                {room.createdAt instanceof Date
                  ? room.createdAt.toLocaleDateString()
                  : room.createdAt.toDate
                    ? room.createdAt.toDate().toLocaleDateString()
                    : "N/A"}
              </span>
            </div>
          </div>

          {/* Content Explorer */}
          <Accordion type="multiple" className="space-y-2">
            {/* Media Section */}
            <AccordionItem
              value="media"
              className="border border-neon-cyan/20 rounded-lg overflow-hidden bg-bg-800/20"
            >
              <AccordionTrigger className="px-4 py-3 hover:bg-neon-cyan/5 hover:no-underline">
                <div className="flex items-center gap-3 w-full">
                  <div className="p-2 bg-neon-cyan/10 rounded-md border border-neon-cyan/30">
                    <Image className="h-4 w-4 text-neon-cyan" />
                  </div>
                  <div className="flex-1 text-left">
                    <span className="text-sm font-medium text-text-primary">
                      Media
                    </span>
                    {counts.media > 0 && (
                      <span className="ml-2 text-xs text-text-tertiary">
                        ({counts.media})
                      </span>
                    )}
                  </div>
                </div>
              </AccordionTrigger>
              <AccordionContent className="px-4 pb-4">
                <MediaGallery
                  messages={messages}
                  onJumpToMessage={onJumpToMessage}
                />
              </AccordionContent>
            </AccordionItem>

            {/* Documents Section */}
            <AccordionItem
              value="documents"
              className="border border-neon-violet/20 rounded-lg overflow-hidden bg-bg-800/20"
            >
              <AccordionTrigger className="px-4 py-3 hover:bg-neon-violet/5 hover:no-underline">
                <div className="flex items-center gap-3 w-full">
                  <div className="p-2 bg-neon-violet/10 rounded-md border border-neon-violet/30">
                    <FileText className="h-4 w-4 text-neon-violet" />
                  </div>
                  <div className="flex-1 text-left">
                    <span className="text-sm font-medium text-text-primary">
                      Documents
                    </span>
                    {counts.documents > 0 && (
                      <span className="ml-2 text-xs text-text-tertiary">
                        ({counts.documents})
                      </span>
                    )}
                  </div>
                </div>
              </AccordionTrigger>
              <AccordionContent className="px-4 pb-4">
                <DocumentList
                  messages={messages}
                  onJumpToMessage={onJumpToMessage}
                />
              </AccordionContent>
            </AccordionItem>

            {/* Links Section */}
            <AccordionItem
              value="links"
              className="border border-neon-blue/20 rounded-lg overflow-hidden bg-bg-800/20"
            >
              <AccordionTrigger className="px-4 py-3 hover:bg-neon-blue/5 hover:no-underline">
                <div className="flex items-center gap-3 w-full">
                  <div className="p-2 bg-neon-blue/10 rounded-md border border-neon-blue/30">
                    <LinkIcon className="h-4 w-4 text-neon-blue" />
                  </div>
                  <div className="flex-1 text-left">
                    <span className="text-sm font-medium text-text-primary">
                      Links
                    </span>
                    {counts.links > 0 && (
                      <span className="ml-2 text-xs text-text-tertiary">
                        ({counts.links})
                      </span>
                    )}
                  </div>
                </div>
              </AccordionTrigger>
              <AccordionContent className="px-4 pb-4">
                <LinksList
                  messages={messages}
                  onJumpToMessage={onJumpToMessage}
                />
              </AccordionContent>
            </AccordionItem>
          </Accordion>

          {/* Statistics and Activity Sections */}
          <Accordion type="multiple" className="space-y-2 mt-6">
            {/* Room Stats Section */}
            <AccordionItem
              value="stats"
              className="border border-neon-gold/20 rounded-lg overflow-hidden bg-bg-800/20"
            >
              <AccordionTrigger className="px-4 py-3 hover:bg-neon-gold/5 hover:no-underline">
                <div className="flex items-center gap-3 w-full">
                  <div className="p-2 bg-neon-gold/10 rounded-md border border-neon-gold/30">
                    <BarChart3 className="h-4 w-4 text-neon-gold" />
                  </div>
                  <div className="flex-1 text-left">
                    <span className="text-sm font-medium text-text-primary">
                      Room Stats
                    </span>
                  </div>
                </div>
              </AccordionTrigger>
              <AccordionContent className="px-4 pb-4">
                <RoomStats messages={messages} />
              </AccordionContent>
            </AccordionItem>

            {/* Activity Log Section */}
            <AccordionItem
              value="activity"
              className="border border-neon-green/20 rounded-lg overflow-hidden bg-bg-800/20"
            >
              <AccordionTrigger className="px-4 py-3 hover:bg-neon-green/5 hover:no-underline">
                <div className="flex items-center gap-3 w-full">
                  <div className="p-2 bg-neon-green/10 rounded-md border border-neon-green/30">
                    <Activity className="h-4 w-4 text-neon-green" />
                  </div>
                  <div className="flex-1 text-left">
                    <span className="text-sm font-medium text-text-primary">
                      Activity
                    </span>
                  </div>
                </div>
              </AccordionTrigger>
              <AccordionContent className="px-4 pb-4">
                <ActivityLog roomId={room.id!} />
              </AccordionContent>
            </AccordionItem>
          </Accordion>

          {/* Future Features */}
          <div className="space-y-3 mt-6">
            {/* Pinned Messages */}
            <GlassCard
              variant="default"
              className="p-3 hover:border-neon-magenta/40 transition-all cursor-not-allowed opacity-60"
            >
              <div className="flex items-center gap-2 text-text-tertiary">
                <Pin className="h-4 w-4" />
                <span className="text-sm font-medium">Pinned Messages</span>
              </div>
              <p className="text-xs text-text-tertiary mt-1">Coming soon...</p>
            </GlassCard>
          </div>
        </div>
      </div>

      {/* Active Members - Pinned to Bottom */}
      <div className="p-4 border-t border-neon-cyan/20 bg-bg-900/50">
        <ActiveMembersList roomId={room.id!} />
      </div>

      <style>{`
        .custom-scrollbar::-webkit-scrollbar {
          width: 6px;
        }
        .custom-scrollbar::-webkit-scrollbar-track {
          background: rgba(0, 0, 0, 0.2);
          border-radius: 4px;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb {
          background: rgba(0, 255, 255, 0.3);
          border-radius: 4px;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb:hover {
          background: rgba(0, 255, 255, 0.5);
        }
      `}</style>
    </div>
  );
}
