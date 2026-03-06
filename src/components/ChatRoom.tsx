import { useState, useEffect, useRef } from "react";
import { Link } from "react-router-dom";
import {
  Send,
  Image,
  ArrowLeft,
  Users,
  Settings,
  Upload,
  X,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { GlassCard } from "@/components/ui/glass-card";
import { Badge } from "@/components/ui/badge";
import { roomService, Room, Message } from "@/lib/room-service";
import { useAnonymousUser } from "@/lib/user-service";
import { uploadToFirebaseStorage } from "@/lib/firebase-storage";

interface ChatRoomProps {
  roomId: string;
}

export function ChatRoom({ roomId }: ChatRoomProps) {
  const { user } = useAnonymousUser();

  const [room, setRoom] = useState<Room | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [newMessage, setNewMessage] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const [isSending, setIsSending] = useState(false);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [uploadProgress, setUploadProgress] = useState(0);

  const messagesEndRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Auto-scroll to bottom when new messages arrive
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  // Load room data and set up real-time listeners
  useEffect(() => {
    if (!roomId) {
      console.log("❌ No roomId provided");
      setIsLoading(false);
      return;
    }

    let timeoutId: NodeJS.Timeout;

    const loadData = async () => {
      try {
        console.log("🚀 Starting to load room data for roomId:", roomId);

        // Test Firebase connection first
        console.log("🧪 Testing Firebase connection before loading room...");
        const connectionOk = await roomService.testConnection();
        if (!connectionOk) {
          console.error("❌ Firebase connection failed - cannot proceed");
          setIsLoading(false);
          return;
        }

        console.log("✅ Firebase connection OK, loading rooms...");
        const rooms = await roomService.getRooms();
        console.log("📦 Got rooms:", rooms.length, "total rooms");

        const currentRoom = rooms.find((r) => r.id === roomId);
        console.log("🎯 Looking for room with ID:", roomId);
        console.log(
          "🏠 Found room:",
          currentRoom ? currentRoom.name : "NOT FOUND",
        );

        setRoom(currentRoom || null);
        setIsLoading(false);
        console.log("✅ Room loading completed");
      } catch (error) {
        console.error("❌ Failed to load room:", error);
        console.error("🔍 Error details:", error);
        setIsLoading(false);
      }
    };

    // Add timeout to prevent infinite loading
    timeoutId = setTimeout(() => {
      console.log("⏰ Loading timeout reached - forcing loading to stop");
      setIsLoading(false);
    }, 10000); // 10 second timeout

    loadData();

    // Subscribe to real-time messages
    const unsubscribe = roomService.subscribeToMessages(
      roomId,
      (newMessages) => {
        console.log(
          "📨 Received messages update:",
          newMessages.length,
          "messages",
        );
        newMessages.forEach((msg, index) => {
          console.log(`📨 Message ${index}:`, {
            id: msg.id,
            sender: msg.sender,
            type: msg.type,
            text: msg.text?.substring(0, 30),
            hasMediaUrl: !!msg.mediaUrl,
            mediaUrl: msg.mediaUrl,
            mediaType: msg.mediaType,
          });
        });
        setMessages(newMessages);
      },
    );

    return () => {
      clearTimeout(timeoutId);
      unsubscribe();
    };
  }, [roomId]);

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    console.log("🚦 handleSendMessage called", {
      user: user?.username,
      newMessage,
      selectedFile,
    });

    if (!user) {
      console.log("❌ Validation failed - no user");
      return;
    }

    const hasText = newMessage.trim().length > 0;
    const hasFile = !!selectedFile;

    if (!hasText && !hasFile) {
      console.log("❌ Validation failed - no content (no message, no file)");
      alert("Please enter a message or select a file to send.");
      return;
    }

    console.log("✅ Validation passed:", { hasText, hasFile });

    setIsSending(true);

    try {
      let mediaUrl = "";
      let mediaType = "";

      // Handle file upload if present
      if (selectedFile) {
        console.log("📤 Starting file upload:", {
          name: selectedFile.name,
          size: selectedFile.size,
          type: selectedFile.type,
          lastModified: selectedFile.lastModified,
        });

        // Reset progress and start upload
        setUploadProgress(0);

        try {
          const result = await uploadToFirebaseStorage(
            selectedFile,
            "chat-media",
            (progress) => {
              console.log("📊 Upload progress callback:", progress + "%");
              setUploadProgress(progress);
            },
          );

          mediaUrl = result.url;
          mediaType = selectedFile.type; // Store full MIME type
          console.log("✅ File uploaded successfully:", {
            url: mediaUrl,
            mediaType: mediaType,
            path: result.path,
          });

          // Set progress to 100% after successful upload
          setUploadProgress(100);
        } catch (uploadError: any) {
          console.error("❌ File upload failed:", {
            error: uploadError,
            message: uploadError?.message,
            stack: uploadError?.stack,
          });
          setUploadProgress(0); // Reset progress on error
          alert("Upload failed: " + uploadError.message);
          throw new Error("File upload failed: " + uploadError.message);
        }
      }

      // Determine message content and type
      const hasText = newMessage.trim().length > 0;
      const hasMedia = !!mediaUrl;

      // Determine message type
      let messageType: "text" | "media" | "mixed";
      if (hasText && hasMedia) {
        messageType = "mixed";
      } else if (hasMedia) {
        messageType = "media";
      } else {
        messageType = "text";
      }

      const messageData = {
        sender: user.username,
        text: hasText ? newMessage.trim() : null,
        mediaUrl: hasMedia ? mediaUrl : null,
        mediaType: hasMedia ? mediaType : null,
        type: messageType,
      };

      console.log(
        "📤 Message data to be sent to Firestore:",
        JSON.stringify(messageData, null, 2),
      );
      console.log("📊 Message classification:", {
        hasText,
        hasMedia,
        type: messageType,
        textLength: newMessage.trim().length,
        mediaUrl: mediaUrl || "none",
      });

      await roomService.sendMessage(roomId, messageData);
      console.log("✅ Message sent to Firestore successfully");

      // Reset form
      setNewMessage("");
      setSelectedFile(null);
      setUploadProgress(0);
      // Reset file input
      if (fileInputRef.current) {
        fileInputRef.current.value = "";
      }
    } catch (error) {
      console.error("Failed to send message:", error);
      // Don't reset form on error so user can retry
    } finally {
      setIsSending(false);
    }
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    console.log("📁 File selected:", file);
    if (file) {
      console.log("📁 File details:", {
        name: file.name,
        size: file.size,
        type: file.type,
        sizeMB: (file.size / (1024 * 1024)).toFixed(2) + "MB",
      });

      // Check file size (max 10MB)
      if (file.size > 10 * 1024 * 1024) {
        alert("File too large. Maximum size is 10MB.");
        return;
      }

      // Check file type - be more permissive for testing
      const validTypes = [
        "image/jpeg",
        "image/png",
        "image/gif",
        "image/webp",
        "image/jpg", // Sometimes reported as jpg instead of jpeg
        "video/mp4",
        "video/webm",
        "video/quicktime", // .mov files
        "video/x-msvideo", // .avi files
      ];

      // Also allow any file that starts with image/ or video/
      const isValidType =
        validTypes.includes(file.type) ||
        file.type.startsWith("image/") ||
        file.type.startsWith("video/");

      console.log(
        "📁 Checking file type:",
        file.type,
        "Is valid:",
        isValidType,
      );
      if (!isValidType) {
        alert(
          `Invalid file type: ${file.type}. Please select an image or video.`,
        );
        return;
      }

      console.log("✅ File accepted, setting selectedFile");
      setSelectedFile(file);
    } else {
      console.log("❌ No file selected");
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-bg-900 flex items-center justify-center">
        <div className="text-neon-cyan animate-pulse">Loading room...</div>
      </div>
    );
  }

  if (!room) {
    return (
      <div className="min-h-screen bg-bg-900 flex items-center justify-center">
        <GlassCard className="p-8 text-center">
          <h2 className="text-2xl font-orbitron font-bold text-neon-cyan mb-4">
            Room Not Found
          </h2>
          <p className="text-text-secondary mb-6">
            The room you're looking for doesn't exist.
          </p>
          <Link to="/">
            <Button className="bg-neon-cyan text-bg-900 hover:bg-neon-cyan/80">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to Home
            </Button>
          </Link>
        </GlassCard>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-bg grid-bg-subtle flex flex-col">
      {/* Room Header */}
      <header className="bg-bg/95 backdrop-blur-sm border-b border-neon-cyan/20 p-4">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <Link to="/">
              <Button
                variant="ghost"
                size="icon"
                className="text-text-secondary hover:text-neon-cyan"
              >
                <ArrowLeft className="h-5 w-5" />
              </Button>
            </Link>
            <div>
              <h1 className="text-2xl font-orbitron font-bold text-neon-cyan uppercase tracking-wider text-shadow-glow-cyan">
                {room.name}
              </h1>
              <p className="text-sm text-text-secondary font-exo">
                {room.description}
              </p>
            </div>
          </div>

          <div className="flex items-center space-x-2">
            <Badge
              variant="secondary"
              className="bg-neon-green/20 text-neon-green"
            >
              <div className="h-2 w-2 bg-neon-green rounded-full mr-2 animate-pulse" />
              Active
            </Badge>
            <Button
              variant="ghost"
              size="icon"
              className="text-text-secondary hover:text-neon-cyan"
            >
              <Users className="h-5 w-5" />
            </Button>
          </div>
        </div>
      </header>

      {/* Messages Area */}
      <div className="flex-1 overflow-hidden flex">
        <main className="flex-1 flex flex-col">
          {/* Messages List */}
          <div className="flex-1 overflow-y-auto p-4 space-y-4">
            {messages.length === 0 ? (
              <div className="text-center py-12">
                <div className="text-text-secondary mb-4">
                  <Users className="h-12 w-12 mx-auto mb-4 text-neon-cyan/50" />
                  <p className="text-lg">No messages yet</p>
                  <p className="text-sm">
                    Be the first to start the conversation!
                  </p>
                </div>
              </div>
            ) : (
              messages.map((message) => (
                <div
                  key={message.id}
                  className={`flex ${
                    message.sender === user?.username
                      ? "justify-end"
                      : "justify-start"
                  }`}
                >
                  <div
                    className={`max-w-[70%] transition-all duration-300 animate-fade-in-glow ${
                      message.sender === user?.username
                        ? "bg-bg-800/30 border border-neon-cyan text-text-primary shadow-glow-cyan"
                        : "bg-bg-800/30 border border-neon-violet/50 text-text-primary hover:border-neon-violet hover:shadow-glow-violet"
                    } rounded-md p-4 backdrop-blur-sm`}
                  >
                    {/* Sender name (for messages from others) */}
                    {message.sender !== user?.username && (
                      <div className="text-xs text-neon-violet font-medium mb-2 uppercase tracking-wider font-orbitron">
                        {message.sender}
                      </div>
                    )}

                    {/* Text content */}
                    {message.text && (
                      <p className="text-white break-words mb-2">
                        {message.text}
                      </p>
                    )}

                    {/* Media content */}
                    {message.mediaUrl && (
                      <div className="my-2">
                        {message.mediaType?.includes("video") ? (
                          <video
                            src={message.mediaUrl}
                            controls
                            className="max-w-full rounded border border-neon-cyan/30"
                            style={{ maxHeight: "400px" }}
                          />
                        ) : (
                          <img
                            src={message.mediaUrl}
                            alt="uploaded media"
                            className="max-w-full rounded border border-neon-cyan/30"
                            style={{ maxHeight: "400px" }}
                          />
                        )}
                      </div>
                    )}

                    {/* Timestamp */}
                    <div className="text-xs text-text-tertiary mt-2">
                      {new Date(message.timestamp as any).toLocaleTimeString()}
                    </div>
                  </div>
                </div>
              ))
            )}
            <div ref={messagesEndRef} />
          </div>

          {/* Message Input */}
          <div className="p-4 bg-bg/95 backdrop-blur-sm border-t border-neon-cyan/20">
            {selectedFile && (
              <div className="mb-4 p-3 bg-bg-800/30 border border-neon-gold/50 rounded-md flex items-center justify-between backdrop-blur-sm">
                <div className="flex items-center space-x-3">
                  <Image className="h-5 w-5 text-neon-cyan" />
                  <div>
                    <p className="text-white text-sm">{selectedFile.name}</p>
                    <p className="text-text-secondary text-xs">
                      {(selectedFile.size / 1024 / 1024).toFixed(2)} MB
                    </p>
                  </div>
                </div>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => setSelectedFile(null)}
                  className="text-text-secondary hover:text-red-400"
                >
                  <X className="h-4 w-4" />
                </Button>
              </div>
            )}

            <form onSubmit={handleSendMessage} className="flex space-x-3">
              <input
                type="file"
                ref={fileInputRef}
                onChange={handleFileSelect}
                accept="image/*,video/*"
                className="hidden"
              />

              <Button
                type="button"
                variant="outline"
                size="icon"
                onClick={() => fileInputRef.current?.click()}
                disabled={isSending}
                className="border-neon-violet/50 text-neon-violet hover:text-white hover:border-neon-violet hover:shadow-glow-violet hover:rotate-12 transition-all duration-200"
              >
                <Upload className="h-4 w-4" />
              </Button>

              <Input
                value={newMessage}
                onChange={(e) => setNewMessage(e.target.value)}
                placeholder="Type your message..."
                className="flex-1 bg-transparent border border-neon-cyan/30 focus:border-neon-cyan text-text-primary placeholder:text-text-tertiary rounded-md px-4 py-2 transition-all duration-200 focus:shadow-glow-cyan focus:outline-none"
                disabled={isSending}
                maxLength={500}
              />

              <Button
                type="submit"
                disabled={isSending}
                className="bg-transparent border border-neon-gold text-neon-gold hover:text-white hover:shadow-glow-gold hover:bg-neon-gold/5 transition-all duration-200 font-medium uppercase tracking-wider rounded-md px-4 py-2"
                onClick={() => {
                  console.log("🔘 Send button clicked:", {
                    hasMessage: !!newMessage.trim(),
                    hasFile: !!selectedFile,
                    fileName: selectedFile?.name,
                    isSending,
                    isDisabled: isSending,
                  });
                }}
              >
                {isSending ? (
                  <div className="h-4 w-4 border-2 border-bg-900 border-t-transparent rounded-full animate-spin" />
                ) : (
                  <Send className="h-4 w-4" />
                )}
              </Button>
            </form>

            {uploadProgress > 0 && uploadProgress < 100 && (
              <div className="mt-2">
                <div className="bg-bg-darker rounded-full h-2 border border-neon-cyan/20">
                  <div
                    className="bg-neon-cyan h-2 rounded-full transition-all duration-300 shadow-glow-cyan"
                    style={{ width: `${uploadProgress}%` }}
                  />
                </div>
                <p className="text-xs text-text-secondary mt-1">
                  Uploading... {uploadProgress}%
                </p>
              </div>
            )}
          </div>
        </main>
      </div>
    </div>
  );
}
