import { useEffect, useState } from "react";
import { Users } from "lucide-react";
import { presenceService, UserPresence } from "@/lib/presence-service";
import { Badge } from "@/components/ui/badge";

interface ActiveMembersListProps {
  roomId: string;
}

export function ActiveMembersList({ roomId }: ActiveMembersListProps) {
  const [activeMembers, setActiveMembers] = useState<UserPresence[]>([]);

  useEffect(() => {
    console.log("🔵 ActiveMembersList mounted for room:", roomId);

    // Subscribe to active members with guarded cleanup to avoid double-calls
    let unsubscribe: (() => void) | undefined;

    unsubscribe = presenceService.subscribeToActiveMembers(
      roomId,
      (members) => {
        console.log("✅ ActiveMembersList received members:", {
          roomId,
          count: members.length,
          members: members.map((m) => ({
            username: m.username,
            userId: m.userId,
          })),
        });
        setActiveMembers(members);
      },
    );

    return () => {
      console.log("🔴 ActiveMembersList unmounting for room:", roomId);
      if (unsubscribe) {
        try {
          unsubscribe();
        } catch (err) {
          console.warn("⚠️ Error while unsubscribing active members:", err);
        }
        unsubscribe = undefined;
      }
    };
  }, [roomId]);

  return (
    <div className="border-t border-neon-cyan/20 pt-4">
      <div className="flex items-center justify-between mb-3">
        <h3 className="text-sm font-orbitron font-semibold text-text-primary uppercase tracking-wider flex items-center gap-2">
          <Users className="h-4 w-4 text-neon-cyan" />
          Active Members
        </h3>
        <Badge variant="secondary" className="text-xs">
          {activeMembers.length}
        </Badge>
      </div>

      <div className="space-y-1 max-h-64 overflow-y-auto custom-scrollbar">
        {activeMembers.length === 0 ? (
          <p className="text-xs text-text-tertiary italic text-center py-4">
            No active members
          </p>
        ) : (
          activeMembers.map((member) => (
            <div
              key={`${member.userId}_${member.roomId}`}
              className="flex items-center gap-2 p-2 rounded hover:bg-bg-800/50 transition-colors group"
            >
              <div className="h-2 w-2 bg-neon-green rounded-full animate-pulse group-hover:shadow-glow-green" />
              <span className="text-sm text-text-primary group-hover:text-neon-cyan transition-colors">
                {member.username}
              </span>
            </div>
          ))
        )}
      </div>

      <style>{`
        .custom-scrollbar::-webkit-scrollbar {
          width: 4px;
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
