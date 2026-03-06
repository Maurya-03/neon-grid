import { useState, useEffect } from "react";
import {
  Shield,
  Users,
  MessageSquare,
  Image,
  Settings,
  Trash2,
  Edit,
  Plus,
  Search,
  LogOut,
  Clock,
  Lock,
  Unlock,
  AlertTriangle,
} from "lucide-react";
import { GlassCard } from "@/components/ui/glass-card";
import { NeonButton } from "@/components/ui/neon-button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { useAdmin } from "@/lib/admin-service";
import { roomService, Room, Message } from "@/lib/room-service";
import { useToast } from "@/hooks/use-toast";

// Admin Dashboard - Connected to real Firebase data
// Login with: username "admin", password "NeonGrid2025!"

const AdminDashboard = () => {
  const [activeTab, setActiveTab] = useState("rooms");
  const { session, logout } = useAdmin();
  const { toast } = useToast();

  // Real data states
  const [rooms, setRooms] = useState<Room[]>([]);
  const [recentMessages, setRecentMessages] = useState<
    (Message & { roomId: string })[]
  >([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [deletingRoom, setDeletingRoom] = useState<string | null>(null);
  const [deletingMessage, setDeletingMessage] = useState<string | null>(null);

  // Load admin data
  useEffect(() => {
    loadAdminData();
  }, []);

  const loadAdminData = async () => {
    setLoading(true);
    try {
      console.log("🔧 Admin: Loading rooms data...");
      const roomsData = await roomService.getRooms();
      setRooms(roomsData);

      // Get recent messages from all rooms
      const allMessages: (Message & { roomId: string })[] = [];
      for (const room of roomsData.slice(0, 5)) {
        // Limit to first 5 rooms for performance
        try {
          const messages = await roomService.getMessages(room.id!);
          // Add roomId to each message
          const messagesWithRoomId = messages.map((msg) => ({
            ...msg,
            roomId: room.id!,
          }));
          allMessages.push(...messagesWithRoomId.slice(-3)); // Get last 3 messages per room
        } catch (error) {
          console.warn(`Failed to load messages for room ${room.id}:`, error);
        }
      }

      // Sort by timestamp and take most recent
      const sortedMessages = allMessages
        .sort((a, b) => {
          const aTime =
            a.timestamp instanceof Date
              ? a.timestamp.getTime()
              : a.timestamp.toMillis();
          const bTime =
            b.timestamp instanceof Date
              ? b.timestamp.getTime()
              : b.timestamp.toMillis();
          return bTime - aTime;
        })
        .slice(0, 10);

      setRecentMessages(sortedMessages);
      console.log("✅ Admin: Data loaded successfully");
    } catch (error) {
      console.error("❌ Admin: Failed to load data:", error);
      toast({
        title: "Error",
        description: "Failed to load admin data. Please try refreshing.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteRoom = async (roomId: string) => {
    if (
      !confirm(
        "Are you sure you want to delete this room? This action cannot be undone.",
      )
    ) {
      return;
    }

    setDeletingRoom(roomId);
    try {
      console.log("🗑️ Admin: Deleting room:", roomId);
      await roomService.deleteRoom(roomId);
      setRooms(rooms.filter((room) => room.id !== roomId));
      console.log("✅ Admin: Room deleted successfully");
      toast({
        title: "Success",
        description: "Room deleted successfully",
      });
    } catch (error: any) {
      console.error("❌ Admin: Failed to delete room:", error);
      const errorMessage =
        error.code === "permission-denied"
          ? "Permission denied. Please check Firestore rules."
          : error.message || "Failed to delete room. Please try again.";

      toast({
        title: "Error",
        description: errorMessage,
        variant: "destructive",
      });
    } finally {
      setDeletingRoom(null);
    }
  };

  const handleToggleRoomLock = async (
    roomId: string,
    currentLocked: boolean,
  ) => {
    try {
      console.log("🔒 Admin: Toggling room lock:", { roomId, currentLocked });
      await roomService.lockRoom(roomId, !currentLocked);
      setRooms(
        rooms.map((room) =>
          room.id === roomId ? { ...room, locked: !currentLocked } : room,
        ),
      );
      console.log("✅ Admin: Room lock toggled successfully");
      toast({
        title: "Success",
        description: `Room ${
          !currentLocked ? "locked" : "unlocked"
        } successfully`,
      });
    } catch (error: any) {
      console.error("❌ Admin: Failed to toggle room lock:", error);
      const errorMessage =
        error.code === "permission-denied"
          ? "Permission denied. Please check Firestore rules."
          : error.message || "Failed to update room status. Please try again.";

      toast({
        title: "Error",
        description: errorMessage,
        variant: "destructive",
      });
    }
  };

  const handleDeleteMessage = async (roomId: string, messageId: string) => {
    if (
      !confirm(
        "Are you sure you want to delete this message? This action cannot be undone.",
      )
    ) {
      return;
    }

    setDeletingMessage(messageId);
    try {
      console.log("🗑️ Admin: Deleting message:", { roomId, messageId });
      await roomService.deleteMessage(roomId, messageId);

      // Update the local state to mark message as deleted
      setRecentMessages(
        recentMessages.map((msg) =>
          msg.id === messageId ? { ...msg, deleted: true } : msg,
        ),
      );

      console.log("✅ Admin: Message deleted successfully");
      toast({
        title: "Success",
        description: "Message deleted successfully",
      });
    } catch (error: any) {
      console.error("❌ Admin: Failed to delete message:", error);
      const errorMessage =
        error.code === "permission-denied"
          ? "Permission denied. Please check Firestore rules."
          : error.message || "Failed to delete message. Please try again.";

      toast({
        title: "Error",
        description: errorMessage,
        variant: "destructive",
      });
    } finally {
      setDeletingMessage(null);
    }
  };

  const handleFlagMessage = async (
    roomId: string,
    messageId: string,
    flagged: boolean,
  ) => {
    try {
      console.log("🚩 Admin: Flagging message:", {
        roomId,
        messageId,
        flagged,
      });
      await roomService.flagMessage(roomId, messageId, flagged);

      // Update the local state
      setRecentMessages(
        recentMessages.map((msg) =>
          msg.id === messageId ? { ...msg, flagged } : msg,
        ),
      );

      console.log("✅ Admin: Message flagged successfully");
      toast({
        title: "Success",
        description: `Message ${flagged ? "flagged" : "unflagged"} successfully`,
      });
    } catch (error: any) {
      console.error("❌ Admin: Failed to flag message:", error);
      const errorMessage =
        error.code === "permission-denied"
          ? "Permission denied. Please check Firestore rules."
          : error.message || "Failed to update message. Please try again.";

      toast({
        title: "Error",
        description: errorMessage,
        variant: "destructive",
      });
    }
  };

  const filteredRooms = rooms.filter(
    (room) =>
      room.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      room.description.toLowerCase().includes(searchTerm.toLowerCase()),
  );

  const tabs = [
    { id: "rooms", label: "Rooms", icon: MessageSquare },
    { id: "users", label: "Users", icon: Users },
    { id: "messages", label: "Messages", icon: MessageSquare },
    { id: "media", label: "Media", icon: Image },
    { id: "settings", label: "Settings", icon: Settings },
  ];

  const handleLogout = () => {
    if (confirm("Are you sure you want to logout?")) {
      logout();
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-bg-900 to-bg-800 p-6">
      <div className="container-responsive">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between">
            <div>
              <div className="flex items-center space-x-3 mb-2">
                <Shield className="h-8 w-8 text-neon-violet" />
                <h1 className="text-4xl font-orbitron font-bold text-neon-cyan uppercase tracking-wider text-shadow-glow-cyan">
                  Admin Console
                </h1>
              </div>
              <p className="text-text-secondary">
                Manage your NeonGrid chat application
              </p>
            </div>

            {/* Admin Session Info */}
            <div className="text-right">
              <div className="flex items-center space-x-4">
                <div className="text-sm">
                  <p className="text-neon-cyan font-medium">
                    Welcome, {session?.username}
                  </p>
                  <p className="text-text-tertiary flex items-center">
                    <Clock className="h-3 w-3 mr-1" />
                    Session: {session?.loginTime.toLocaleTimeString()}
                  </p>
                </div>
                <Button
                  onClick={handleLogout}
                  variant="outline"
                  size="sm"
                  className="border-red-500/20 text-red-400 hover:bg-red-500/10 hover:border-red-500/40"
                >
                  <LogOut className="h-4 w-4 mr-2" />
                  Logout
                </Button>
              </div>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          {/* Sidebar Navigation */}
          <div className="lg:col-span-1">
            <GlassCard variant="strong" className="p-4">
              <nav className="space-y-2">
                {tabs.map((tab) => (
                  <NeonButton
                    key={tab.id}
                    variant={activeTab === tab.id ? "neon" : "ghost"}
                    className="w-full justify-start gap-3"
                    onClick={() => setActiveTab(tab.id)}
                  >
                    <tab.icon className="h-4 w-4" />
                    {tab.label}
                  </NeonButton>
                ))}
              </nav>
            </GlassCard>
          </div>

          {/* Main Content */}
          <div className="lg:col-span-3">
            {/* Admin Stats Overview */}
            <div className="mb-6 grid grid-cols-1 md:grid-cols-3 gap-4">
              <GlassCard variant="default" className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-text-secondary mb-1">
                      Total Rooms
                    </p>
                    <p className="text-2xl font-bold text-neon-cyan">
                      {rooms.length}
                    </p>
                  </div>
                  <MessageSquare className="h-8 w-8 text-neon-cyan opacity-60" />
                </div>
              </GlassCard>

              <GlassCard variant="default" className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-text-secondary mb-1">
                      Active Users
                    </p>
                    <p className="text-2xl font-bold text-neon-green">
                      {rooms.reduce(
                        (acc, room) => acc + (room.activeUsers?.length || 0),
                        0,
                      )}
                    </p>
                  </div>
                  <Users className="h-8 w-8 text-neon-green opacity-60" />
                </div>
              </GlassCard>

              <GlassCard variant="default" className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-text-secondary mb-1">
                      Recent Messages
                    </p>
                    <p className="text-2xl font-bold text-neon-violet">
                      {recentMessages.length}
                    </p>
                  </div>
                  <MessageSquare className="h-8 w-8 text-neon-violet opacity-60" />
                </div>
              </GlassCard>
            </div>

            {activeTab === "rooms" && (
              <div className="space-y-6">
                {/* Rooms Header */}
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                  <h2 className="text-xl font-orbitron font-semibold text-text-primary">
                    Room Management
                  </h2>
                  <NeonButton variant="hero" size="sm">
                    <Plus className="h-4 w-4" />
                    Create Room
                  </NeonButton>
                </div>

                {/* Search & Filters */}
                <GlassCard variant="default" className="p-4">
                  <div className="flex flex-col sm:flex-row gap-4">
                    <div className="flex-1">
                      <Input
                        placeholder="Search rooms..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="bg-bg-800 border-bg-700 focus:border-neon-cyan"
                      />
                    </div>
                    <div className="flex items-center gap-2">
                      <Badge variant="secondary" className="text-xs">
                        {filteredRooms.length} rooms
                      </Badge>
                      <NeonButton
                        variant="outline"
                        size="sm"
                        onClick={loadAdminData}
                        disabled={loading}
                      >
                        <Search className="h-4 w-4" />
                        {loading ? "Loading..." : "Refresh"}
                      </NeonButton>
                    </div>
                  </div>
                </GlassCard>

                {/* Rooms List */}
                {loading ? (
                  <div className="text-center py-12">
                    <div className="w-12 h-12 border-4 border-neon-cyan border-t-transparent rounded-full animate-spin mx-auto mb-4" />
                    <p className="text-text-secondary">Loading rooms...</p>
                  </div>
                ) : filteredRooms.length === 0 ? (
                  <GlassCard variant="default" className="p-12 text-center">
                    <MessageSquare className="h-12 w-12 mx-auto mb-4 text-text-tertiary" />
                    <h3 className="text-lg font-semibold text-text-primary mb-2">
                      {searchTerm
                        ? "No rooms match your search"
                        : "No rooms found"}
                    </h3>
                    <p className="text-text-secondary">
                      {searchTerm
                        ? "Try adjusting your search terms."
                        : "Rooms will appear here once users create them."}
                    </p>
                  </GlassCard>
                ) : (
                  <div className="space-y-4">
                    {filteredRooms.map((room) => (
                      <GlassCard
                        key={room.id}
                        variant="default"
                        className="p-6 hover-lift"
                      >
                        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
                          <div className="flex-1">
                            <div className="flex items-center gap-2 mb-2">
                              <h3 className="text-lg font-semibold text-neon-cyan">
                                {room.name}
                              </h3>
                              {room.locked && (
                                <Badge
                                  variant="destructive"
                                  className="text-xs"
                                >
                                  <Lock className="h-3 w-3 mr-1" />
                                  Locked
                                </Badge>
                              )}
                            </div>
                            <p className="text-text-secondary mb-3">
                              {room.description}
                            </p>
                            <div className="flex flex-wrap gap-4 text-sm">
                              <div className="flex items-center space-x-1">
                                <Users className="h-4 w-4 text-neon-blue" />
                                <span className="text-text-tertiary">
                                  {room.activeUsers?.length || 0} active users
                                </span>
                              </div>
                              <div className="flex items-center space-x-1">
                                <Users className="h-4 w-4 text-neon-green" />
                                <span className="text-text-tertiary">
                                  Created by {room.createdBy}
                                </span>
                              </div>
                              <Badge
                                variant="outline"
                                className="text-text-tertiary"
                              >
                                Created{" "}
                                {room.createdAt instanceof Date
                                  ? room.createdAt.toLocaleDateString()
                                  : room.createdAt
                                      .toDate()
                                      .toLocaleDateString()}
                              </Badge>
                            </div>
                          </div>
                          <div className="flex items-center space-x-2">
                            <NeonButton
                              variant="ghost"
                              size="sm"
                              onClick={() =>
                                handleToggleRoomLock(room.id!, room.locked)
                              }
                              title={room.locked ? "Unlock room" : "Lock room"}
                            >
                              {room.locked ? (
                                <Unlock className="h-4 w-4" />
                              ) : (
                                <Lock className="h-4 w-4" />
                              )}
                              {room.locked ? "Unlock" : "Lock"}
                            </NeonButton>
                            <NeonButton
                              variant="red"
                              size="sm"
                              onClick={() => handleDeleteRoom(room.id!)}
                              disabled={deletingRoom === room.id}
                            >
                              <Trash2 className="h-4 w-4" />
                              {deletingRoom === room.id
                                ? "Deleting..."
                                : "Delete"}
                            </NeonButton>
                          </div>
                        </div>
                      </GlassCard>
                    ))}
                  </div>
                )}
              </div>
            )}

            {activeTab === "messages" && (
              <div className="space-y-6">
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                  <h2 className="text-xl font-orbitron font-semibold text-text-primary">
                    Recent Messages
                  </h2>
                  <div className="flex items-center gap-2">
                    <Badge variant="secondary" className="text-xs">
                      {recentMessages.length} messages
                    </Badge>
                    <NeonButton
                      variant="outline"
                      size="sm"
                      onClick={loadAdminData}
                      disabled={loading}
                    >
                      <Search className="h-4 w-4" />
                      Refresh
                    </NeonButton>
                  </div>
                </div>

                {loading ? (
                  <div className="text-center py-12">
                    <div className="w-12 h-12 border-4 border-neon-cyan border-t-transparent rounded-full animate-spin mx-auto mb-4" />
                    <p className="text-text-secondary">Loading messages...</p>
                  </div>
                ) : recentMessages.length === 0 ? (
                  <GlassCard variant="default" className="p-12 text-center">
                    <MessageSquare className="h-12 w-12 mx-auto mb-4 text-text-tertiary" />
                    <h3 className="text-lg font-semibold text-text-primary mb-2">
                      No messages found
                    </h3>
                    <p className="text-text-secondary">
                      Messages will appear here as users chat in rooms.
                    </p>
                  </GlassCard>
                ) : (
                  <div className="space-y-4">
                    {recentMessages.map((message) => (
                      <GlassCard
                        key={message.id}
                        variant="default"
                        className="p-4"
                      >
                        <div className="flex items-start justify-between">
                          <div className="flex-1">
                            <div className="flex items-center space-x-2 mb-2">
                              <span className="font-semibold text-neon-cyan">
                                {message.sender}
                              </span>
                              <span className="text-text-tertiary">•</span>
                              <span className="text-sm text-text-tertiary">
                                {message.timestamp instanceof Date
                                  ? message.timestamp.toLocaleString()
                                  : message.timestamp.toDate().toLocaleString()}
                              </span>
                              {message.flagged && (
                                <Badge
                                  variant="destructive"
                                  className="text-xs"
                                >
                                  <AlertTriangle className="h-3 w-3 mr-1" />
                                  Flagged
                                </Badge>
                              )}
                              {message.deleted && (
                                <Badge variant="outline" className="text-xs">
                                  Deleted
                                </Badge>
                              )}
                            </div>

                            {message.text && (
                              <p className="text-text-primary mb-2">
                                {message.deleted
                                  ? "[Message deleted]"
                                  : message.text}
                              </p>
                            )}

                            {message.mediaURL && !message.deleted && (
                              <div className="mb-2">
                                {message.mediaType === "image" ? (
                                  <img
                                    src={message.mediaURL}
                                    alt="Shared image"
                                    className="max-w-sm max-h-64 rounded border border-bg-600"
                                  />
                                ) : message.mediaType === "video" ? (
                                  <video
                                    src={message.mediaURL}
                                    controls
                                    className="max-w-sm max-h-64 rounded border border-bg-600"
                                  />
                                ) : (
                                  <Badge
                                    variant="secondary"
                                    className="text-xs"
                                  >
                                    {message.mediaType} media
                                  </Badge>
                                )}
                              </div>
                            )}
                          </div>

                          {!message.deleted && (
                            <div className="flex items-center space-x-2">
                              <NeonButton
                                variant="ghost"
                                size="sm"
                                onClick={() =>
                                  handleFlagMessage(
                                    message.roomId,
                                    message.id!,
                                    !message.flagged,
                                  )
                                }
                                title="Flag message"
                              >
                                <AlertTriangle className="h-4 w-4" />
                              </NeonButton>
                              <NeonButton
                                variant="red"
                                size="sm"
                                onClick={() =>
                                  handleDeleteMessage(
                                    message.roomId,
                                    message.id!,
                                  )
                                }
                                disabled={deletingMessage === message.id}
                                title="Delete message"
                              >
                                <Trash2 className="h-4 w-4" />
                                {deletingMessage === message.id
                                  ? "Deleting..."
                                  : ""}
                              </NeonButton>
                            </div>
                          )}
                        </div>
                      </GlassCard>
                    ))}
                  </div>
                )}
              </div>
            )}

            {/* Placeholder for other tabs */}
            {!["rooms", "messages"].includes(activeTab) && (
              <GlassCard variant="default" className="p-12 text-center">
                <div className="max-w-md mx-auto">
                  <h3 className="text-xl font-orbitron font-semibold text-neon-cyan mb-4">
                    Coming Soon
                  </h3>
                  <p className="text-text-secondary">
                    The {tabs.find((t) => t.id === activeTab)?.label} management
                    panel is under development.
                  </p>
                </div>
              </GlassCard>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;
