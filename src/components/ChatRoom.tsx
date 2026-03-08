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
  FileText,
  FileSpreadsheet,
  Presentation,
  File,
  Info,
  PanelLeftClose,
  PanelLeft,
  Lock,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { GlassCard } from "@/components/ui/glass-card";
import { Badge } from "@/components/ui/badge";
import { roomService, Room, Message } from "@/lib/room-service";
import { useAnonymousUser } from "@/lib/user-service";
import { uploadToFirebaseStorage } from "@/lib/firebase-storage";
import { presenceService } from "@/lib/presence-service";
import { roomEventsService } from "@/lib/room-events";
import { RoomInfoSidebar } from "@/components/room/RoomInfoSidebar";

// Helper function to safely convert Firebase Timestamp to Date
const toSafeDate = (timestamp: any): Date | null => {
  if (!timestamp) return null;
  if (timestamp instanceof Date) return timestamp;
  if (timestamp.toDate && typeof timestamp.toDate === "function") {
    return timestamp.toDate();
  }
  if (timestamp.seconds) {
    return new Date(timestamp.seconds * 1000);
  }
  return null;
};

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
  const [isDraggingOver, setIsDraggingOver] = useState(false);
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);

  const messagesEndRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const dragCounterRef = useRef(0);
  const messageRefs = useRef<Map<string, HTMLDivElement>>(new Map());

  // Auto-scroll to bottom when new messages arrive
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  // Scroll to a specific message
  const scrollToMessage = (messageId: string) => {
    const messageElement = messageRefs.current.get(messageId);
    if (messageElement) {
      messageElement.scrollIntoView({ behavior: "smooth", block: "center" });
      // Add a temporary highlight effect
      messageElement.classList.add(
        "ring-2",
        "ring-neon-cyan",
        "ring-offset-2",
        "ring-offset-bg-900",
      );
      setTimeout(() => {
        messageElement.classList.remove(
          "ring-2",
          "ring-neon-cyan",
          "ring-offset-2",
          "ring-offset-bg-900",
        );
      }, 2000);
    }
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
        const currentRoom = await roomService.getRoom(roomId);
        setRoom(currentRoom);
        setIsLoading(false);
      } catch (error) {
        console.error("❌ Failed to load room:", error);
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

  // Presence tracking - join/leave room
  useEffect(() => {
    if (!roomId || !user) return;

    console.log("👋 Joining room presence:", {
      roomId,
      username: user.username,
      userId: user.id,
    });
    presenceService.joinRoom(user.id, roomId, user.username);

    return () => {
      console.log("👋 Leaving room presence:", { roomId, userId: user.id });
      presenceService.cleanup(user.id, roomId);
    };
  }, [roomId, user]);

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

    // Check if room is locked
    if (room?.locked) {
      console.log("❌ Room is locked");
      alert("This room is locked. Messages cannot be sent.");
      return;
    }

    const hasText = newMessage.trim().length > 0;
    const hasFile = !!selectedFile;

    if (!hasText && !hasFile) {
      console.log("❌ Validation failed - no content (no message, no file)");
      alert("Please enter a message or select a file to send.");
      return;
    }

    // Check if file uploads are disabled
    if (hasFile && room?.allowFiles === false) {
      console.log("❌ File uploads are disabled in this room");
      alert("File uploads are disabled in this room.");
      setSelectedFile(null);
      if (fileInputRef.current) {
        fileInputRef.current.value = "";
      }
      return;
    }

    // Check if links are disabled
    if (hasText && room?.allowLinks === false) {
      const urlRegex = /(https?:\/\/[^\s<>]+[^\s<>.,;:!?'")\]])/gi;
      if (urlRegex.test(newMessage)) {
        console.log("❌ Links are disabled in this room");
        alert("Links are not allowed in this room.");
        return;
      }
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

          // Log file upload event
          await roomEventsService.logFileUploaded(
            roomId,
            user.username,
            selectedFile.name,
            selectedFile.size,
          );

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

  // Validate file type and size
  const validateFile = (file: File): { valid: boolean; error?: string } => {
    // Check file size (max 10MB)
    if (file.size > 10 * 1024 * 1024) {
      return { valid: false, error: "File too large. Maximum size is 10MB." };
    }

    // Check file type - allow images, videos, PDFs, and office documents
    const validTypes = [
      // Images
      "image/jpeg",
      "image/png",
      "image/gif",
      "image/webp",
      "image/jpg",
      "image/svg+xml",
      // Videos
      "video/mp4",
      "video/webm",
      "video/quicktime",
      "video/x-msvideo",
      // Documents
      "application/pdf",
      "text/plain",
      // Microsoft Word
      "application/msword", // .doc
      "application/vnd.openxmlformats-officedocument.wordprocessingml.document", // .docx
      // Microsoft PowerPoint
      "application/vnd.ms-powerpoint", // .ppt
      "application/vnd.openxmlformats-officedocument.presentationml.presentation", // .pptx
      // Microsoft Excel
      "application/vnd.ms-excel", // .xls
      "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet", // .xlsx
      // Other formats
      "application/zip",
      "application/x-zip-compressed",
      "application/vnd.rar",
    ];

    const isValidType =
      validTypes.includes(file.type) ||
      file.type.startsWith("image/") ||
      file.type.startsWith("video/") ||
      file.type.startsWith("text/");

    if (!isValidType) {
      return {
        valid: false,
        error: `Invalid file type: ${file.type}. Supported: Images, Videos, PDFs, Word, PowerPoint, Excel, and Text files.`,
      };
    }

    return { valid: true };
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

      const validation = validateFile(file);
      if (!validation.valid) {
        alert(validation.error);
        return;
      }

      console.log("✅ File accepted, setting selectedFile");
      setSelectedFile(file);
    } else {
      console.log("❌ No file selected");
    }
  };

  // Drag and drop handlers
  const handleDragEnter = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    dragCounterRef.current++;
    if (e.dataTransfer.items && e.dataTransfer.items.length > 0) {
      setIsDraggingOver(true);
    }
  };

  const handleDragLeave = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    dragCounterRef.current--;
    if (dragCounterRef.current === 0) {
      setIsDraggingOver(false);
    }
  };

  const handleDragOver = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
  };

  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDraggingOver(false);
    dragCounterRef.current = 0;

    const files = e.dataTransfer.files;
    if (files && files.length > 0) {
      const file = files[0];
      console.log("📁 File dropped:", file);
      console.log("📁 File details:", {
        name: file.name,
        size: file.size,
        type: file.type,
        sizeMB: (file.size / (1024 * 1024)).toFixed(2) + "MB",
      });

      const validation = validateFile(file);
      if (!validation.valid) {
        alert(validation.error);
        return;
      }

      console.log("✅ File accepted from drop, setting selectedFile");
      setSelectedFile(file);
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
    <div className="h-screen bg-bg grid-bg-subtle flex flex-col overflow-hidden">
      {/* Room Header */}
      <header className="bg-bg/95 backdrop-blur-sm border-b border-neon-cyan/20 p-4 flex-shrink-0">
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
              size="sm"
              onClick={() => setIsSidebarOpen(!isSidebarOpen)}
              className="text-text-secondary hover:text-neon-cyan hover:shadow-glow-cyan transition-all"
            >
              {isSidebarOpen ? (
                <PanelLeftClose className="h-5 w-5" />
              ) : (
                <PanelLeft className="h-5 w-5" />
              )}
              <span className="ml-2 text-sm hidden sm:inline">Room Info</span>
            </Button>
          </div>
        </div>
      </header>

      {/* Messages Area */}
      <div className="flex-1 overflow-hidden flex">
        {/* Room Info Sidebar */}
        <div
          className={`transition-all duration-300 ease-in-out ${
            isSidebarOpen ? "w-80 opacity-100" : "w-0 opacity-0"
          } overflow-hidden`}
        >
          {room && (
            <RoomInfoSidebar
              room={room}
              isOpen={isSidebarOpen}
              messages={messages}
              onJumpToMessage={scrollToMessage}
            />
          )}
        </div>

        {/* Chat Messages Area */}
        <main className="flex-1 flex flex-col relative">
          {/* Drag and Drop Overlay */}
          {isDraggingOver && (
            <div className="absolute inset-0 z-50 bg-neon-cyan/10 backdrop-blur-sm border-4 border-dashed border-neon-cyan/50 flex items-center justify-center pointer-events-none">
              <div className="text-center">
                <Upload className="h-16 w-16 text-neon-cyan mx-auto mb-4 animate-pulse" />
                <p className="text-2xl font-orbitron font-bold text-neon-cyan text-shadow-glow-cyan">
                  Drop file to upload
                </p>
                <p className="text-text-secondary mt-2">
                  Images, Videos, or PDFs (max 10MB)
                </p>
              </div>
            </div>
          )}

          {/* Locked Room Banner */}
          {room.locked && (
            <div className="bg-neon-red/10 border-b-2 border-neon-red/50 p-3">
              <div className="flex items-center justify-center gap-2">
                <Lock className="h-4 w-4 text-neon-red" />
                <p className="text-sm text-neon-red font-medium">
                  This room is locked. Messages cannot be sent.
                </p>
              </div>
            </div>
          )}

          {/* Messages List */}
          <div
            className="flex-1 overflow-y-auto p-4 space-y-4"
            onDragEnter={handleDragEnter}
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
            onDrop={handleDrop}
          >
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
                  ref={(el) => {
                    if (el && message.id) {
                      messageRefs.current.set(message.id, el);
                    }
                  }}
                  className={`flex ${
                    message.sender === user?.username
                      ? "justify-end"
                      : "justify-start"
                  } transition-all duration-300`}
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
                        ) : message.mediaType === "application/pdf" ? (
                          <div className="flex items-center gap-3 p-4 bg-bg-800/50 border border-neon-cyan/30 rounded">
                            <FileText className="h-8 w-8 text-neon-cyan" />
                            <div className="flex-1">
                              <p className="text-sm font-medium text-text-primary">
                                PDF Document
                              </p>
                              <p className="text-xs text-text-tertiary">
                                Click to open in new tab
                              </p>
                            </div>
                            <a
                              href={message.mediaUrl}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="px-4 py-2 bg-neon-cyan/10 hover:bg-neon-cyan/20 border border-neon-cyan/50 rounded text-neon-cyan text-sm font-medium transition-colors"
                            >
                              Open PDF
                            </a>
                          </div>
                        ) : message.mediaType?.includes("word") ||
                          message.mediaType?.includes("document") ? (
                          <div className="flex items-center gap-3 p-4 bg-bg-800/50 border border-neon-violet/30 rounded">
                            <FileText className="h-8 w-8 text-neon-violet" />
                            <div className="flex-1">
                              <p className="text-sm font-medium text-text-primary">
                                Word Document
                              </p>
                              <p className="text-xs text-text-tertiary">
                                Click to download
                              </p>
                            </div>
                            <a
                              href={message.mediaUrl}
                              download
                              className="px-4 py-2 bg-neon-violet/10 hover:bg-neon-violet/20 border border-neon-violet/50 rounded text-neon-violet text-sm font-medium transition-colors"
                            >
                              Download
                            </a>
                          </div>
                        ) : message.mediaType?.includes("presentation") ||
                          message.mediaType?.includes("powerpoint") ? (
                          <div className="flex items-center gap-3 p-4 bg-bg-800/50 border border-neon-gold/30 rounded">
                            <Presentation className="h-8 w-8 text-neon-gold" />
                            <div className="flex-1">
                              <p className="text-sm font-medium text-text-primary">
                                PowerPoint Presentation
                              </p>
                              <p className="text-xs text-text-tertiary">
                                Click to download
                              </p>
                            </div>
                            <a
                              href={message.mediaUrl}
                              download
                              className="px-4 py-2 bg-neon-gold/10 hover:bg-neon-gold/20 border border-neon-gold/50 rounded text-neon-gold text-sm font-medium transition-colors"
                            >
                              Download
                            </a>
                          </div>
                        ) : message.mediaType?.includes("spreadsheet") ||
                          message.mediaType?.includes("excel") ? (
                          <div className="flex items-center gap-3 p-4 bg-bg-800/50 border border-neon-green/30 rounded">
                            <FileSpreadsheet className="h-8 w-8 text-neon-green" />
                            <div className="flex-1">
                              <p className="text-sm font-medium text-text-primary">
                                Excel Spreadsheet
                              </p>
                              <p className="text-xs text-text-tertiary">
                                Click to download
                              </p>
                            </div>
                            <a
                              href={message.mediaUrl}
                              download
                              className="px-4 py-2 bg-neon-green/10 hover:bg-neon-green/20 border border-neon-green/50 rounded text-neon-green text-sm font-medium transition-colors"
                            >
                              Download
                            </a>
                          </div>
                        ) : message.mediaType &&
                          !message.mediaType.startsWith("image") ? (
                          <div className="flex items-center gap-3 p-4 bg-bg-800/50 border border-text-tertiary/30 rounded">
                            <File className="h-8 w-8 text-text-tertiary" />
                            <div className="flex-1">
                              <p className="text-sm font-medium text-text-primary">
                                File Attachment
                              </p>
                              <p className="text-xs text-text-tertiary">
                                {message.mediaType}
                              </p>
                            </div>
                            <a
                              href={message.mediaUrl}
                              download
                              className="px-4 py-2 bg-text-tertiary/10 hover:bg-text-tertiary/20 border border-text-tertiary/50 rounded text-text-tertiary text-sm font-medium transition-colors"
                            >
                              Download
                            </a>
                          </div>
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
                      {toSafeDate(message.timestamp)?.toLocaleTimeString() ||
                        ""}
                    </div>
                  </div>
                </div>
              ))
            )}
            <div ref={messagesEndRef} />
          </div>

          {/* Message Input */}
          <div className="p-4 bg-bg/95 backdrop-blur-sm border-t border-neon-cyan/20 flex-shrink-0">
            <form onSubmit={handleSendMessage} className="space-y-2">
              {/* Compact Attachment Preview - Above Input */}
              {selectedFile && (
                <div className="px-2 py-1.5 bg-bg-800/50 border border-neon-gold/50 rounded flex items-center justify-between backdrop-blur-sm">
                  <div className="flex items-center space-x-2 min-w-0 flex-1">
                    {selectedFile.type === "application/pdf" ? (
                      <FileText className="h-4 w-4 text-neon-cyan flex-shrink-0" />
                    ) : selectedFile.type.includes("word") ||
                      selectedFile.type.includes("document") ? (
                      <FileText className="h-4 w-4 text-neon-violet flex-shrink-0" />
                    ) : selectedFile.type.includes("presentation") ||
                      selectedFile.type.includes("powerpoint") ? (
                      <Presentation className="h-4 w-4 text-neon-gold flex-shrink-0" />
                    ) : selectedFile.type.includes("spreadsheet") ||
                      selectedFile.type.includes("excel") ? (
                      <FileSpreadsheet className="h-4 w-4 text-neon-green flex-shrink-0" />
                    ) : selectedFile.type.startsWith("video/") ? (
                      <Upload className="h-4 w-4 text-neon-violet flex-shrink-0" />
                    ) : selectedFile.type.startsWith("image/") ? (
                      <Image className="h-4 w-4 text-neon-cyan flex-shrink-0" />
                    ) : (
                      <File className="h-4 w-4 text-text-tertiary flex-shrink-0" />
                    )}
                    <div className="min-w-0 flex-1">
                      <p className="text-white text-xs truncate">
                        {selectedFile.name}
                      </p>
                      <p className="text-text-secondary text-xs">
                        {(selectedFile.size / 1024 / 1024).toFixed(2)} MB
                      </p>
                    </div>
                  </div>
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon"
                    onClick={() => setSelectedFile(null)}
                    className="text-text-secondary hover:text-red-400 h-6 w-6 flex-shrink-0 ml-2"
                  >
                    <X className="h-3 w-3" />
                  </Button>
                </div>
              )}

              {/* Input Row */}
              <div className="flex space-x-3">
                <input
                  type="file"
                  ref={fileInputRef}
                  onChange={handleFileSelect}
                  accept="image/*,video/*,.pdf,.doc,.docx,.ppt,.pptx,.xls,.xlsx,.txt,application/pdf,application/msword,application/vnd.openxmlformats-officedocument.wordprocessingml.document,application/vnd.ms-powerpoint,application/vnd.openxmlformats-officedocument.presentationml.presentation,application/vnd.ms-excel,application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
                  className="hidden"
                />

                <Button
                  type="button"
                  variant="outline"
                  size="icon"
                  onClick={() => fileInputRef.current?.click()}
                  disabled={
                    isSending || room?.locked || room?.allowFiles === false
                  }
                  className="border-neon-violet/50 text-neon-violet hover:text-white hover:border-neon-violet hover:shadow-glow-violet hover:rotate-12 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:rotate-0"
                  title={
                    room?.allowFiles === false
                      ? "File uploads are disabled in this room"
                      : "Upload file"
                  }
                >
                  <Upload className="h-4 w-4" />
                </Button>

                <Input
                  value={newMessage}
                  onChange={(e) => setNewMessage(e.target.value)}
                  placeholder={
                    room?.locked ? "Room is locked..." : "Type your message..."
                  }
                  className="flex-1 bg-transparent border border-neon-cyan/30 focus:border-neon-cyan text-text-primary placeholder:text-text-tertiary rounded-md px-4 py-2 transition-all duration-200 focus:shadow-glow-cyan focus:outline-none disabled:opacity-50 disabled:cursor-not-allowed"
                  disabled={isSending || room?.locked}
                  maxLength={500}
                />

                <Button
                  type="submit"
                  disabled={isSending || room?.locked}
                  className="bg-transparent border border-neon-gold text-neon-gold hover:text-white hover:shadow-glow-gold hover:bg-neon-gold/5 transition-all duration-200 font-medium uppercase tracking-wider rounded-md px-4 py-2 disabled:opacity-50 disabled:cursor-not-allowed"
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
              </div>

              {uploadProgress > 0 && uploadProgress < 100 && (
                <div>
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
            </form>
          </div>
        </main>
      </div>
    </div>
  );
}
