import { useState, useEffect } from "react";
import { roomEventsService, RoomEvent, RoomEventType } from "@/lib/room-events";
import {
  UserPlus,
  UserMinus,
  Upload,
  Trash2,
  Pin,
  Lock,
  Unlock,
  Flag,
  PlusCircle,
  Activity,
} from "lucide-react";

interface ActivityLogProps {
  roomId: string;
}

// Get icon for event type
function getEventIcon(eventType: RoomEventType) {
  switch (eventType) {
    case "user_joined":
      return { Icon: UserPlus, color: "text-neon-green" };
    case "user_left":
      return { Icon: UserMinus, color: "text-text-tertiary" };
    case "file_uploaded":
      return { Icon: Upload, color: "text-neon-cyan" };
    case "message_deleted":
      return { Icon: Trash2, color: "text-neon-red" };
    case "message_pinned":
      return { Icon: Pin, color: "text-neon-gold" };
    case "room_locked":
      return { Icon: Lock, color: "text-neon-red" };
    case "room_unlocked":
      return { Icon: Unlock, color: "text-neon-green" };
    case "message_flagged":
      return { Icon: Flag, color: "text-neon-gold" };
    case "room_created":
      return { Icon: PlusCircle, color: "text-neon-violet" };
    default:
      return { Icon: Activity, color: "text-text-secondary" };
  }
}

// Format event description
function getEventDescription(event: RoomEvent): string {
  switch (event.type) {
    case "user_joined":
      return `${event.user} joined the room`;
    case "user_left":
      return `${event.user} left the room`;
    case "file_uploaded":
      return event.target
        ? `${event.user} uploaded ${event.target}`
        : `${event.user} uploaded a file`;
    case "message_deleted":
      return `${event.user} deleted a message`;
    case "message_pinned":
      return `${event.user} pinned a message`;
    case "room_locked":
      return `${event.user} locked the room`;
    case "room_unlocked":
      return `${event.user} unlocked the room`;
    case "message_flagged":
      return `${event.user} flagged a message`;
    case "room_created":
      return `${event.user} created this room`;
    default:
      return `${event.user} performed an action`;
  }
}

// Format relative timestamp
function formatRelativeTime(timestamp: any): string {
  const date =
    timestamp instanceof Date
      ? timestamp
      : timestamp.toDate
        ? timestamp.toDate()
        : new Date(timestamp.seconds * 1000);

  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffSeconds = Math.floor(diffMs / 1000);
  const diffMinutes = Math.floor(diffSeconds / 60);
  const diffHours = Math.floor(diffMinutes / 60);
  const diffDays = Math.floor(diffHours / 24);

  if (diffSeconds < 60) {
    return "Just now";
  } else if (diffMinutes < 60) {
    return `${diffMinutes} minute${diffMinutes !== 1 ? "s" : ""} ago`;
  } else if (diffHours < 24) {
    return `${diffHours} hour${diffHours !== 1 ? "s" : ""} ago`;
  } else if (diffDays === 1) {
    return "Yesterday";
  } else if (diffDays < 7) {
    return `${diffDays} days ago`;
  } else {
    return date.toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: date.getFullYear() !== now.getFullYear() ? "numeric" : undefined,
    });
  }
}

export function ActivityLog({ roomId }: ActivityLogProps) {
  const [events, setEvents] = useState<RoomEvent[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (!roomId) return;

    setIsLoading(true);
    const unsubscribe = roomEventsService.subscribeToRoomEvents(
      roomId,
      (newEvents) => {
        setEvents(newEvents);
        setIsLoading(false);
      },
      50, // limit to 50 most recent events
    );

    return () => {
      unsubscribe();
    };
  }, [roomId]);

  if (isLoading) {
    return (
      <div className="py-8 text-center">
        <Activity className="h-8 w-8 mx-auto text-neon-cyan/50 mb-2 animate-pulse" />
        <p className="text-sm text-text-tertiary">Loading activity...</p>
      </div>
    );
  }

  if (events.length === 0) {
    return (
      <div className="py-8 text-center">
        <Activity className="h-12 w-12 mx-auto text-text-tertiary/30 mb-2" />
        <p className="text-sm text-text-tertiary">No activity yet</p>
      </div>
    );
  }

  return (
    <div className="space-y-2">
      {events.map((event) => {
        const { Icon, color } = getEventIcon(event.type);
        const description = getEventDescription(event);
        const timeAgo = formatRelativeTime(event.timestamp);

        return (
          <div
            key={event.id}
            className="group p-3 rounded-lg border border-text-tertiary/10 hover:border-neon-cyan/30 bg-bg-800/20 hover:bg-bg-800/40 transition-all"
          >
            <div className="flex items-start gap-3">
              {/* Icon */}
              <div
                className={`flex-shrink-0 p-2 rounded-md bg-bg-900/50 border border-text-tertiary/20 ${color}`}
              >
                <Icon className="h-4 w-4" />
              </div>

              {/* Content */}
              <div className="flex-1 min-w-0">
                <p className="text-sm text-text-primary group-hover:text-white transition-colors">
                  {description}
                </p>
                <p className="text-xs text-text-tertiary mt-1">{timeAgo}</p>
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
}
