import { useState } from "react";
import { Message, roomService } from "@/lib/room-service";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import {
  MoreVertical,
  Reply,
  Smile,
  Clipboard,
  Link as LinkIcon,
  Pin,
  PinOff,
  Trash2,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";

interface MessageActionsMenuProps {
  message: Message;
  roomId: string;
  currentUsername?: string;
  onReply?: (message: Message) => void;
  onReact?: (message: Message) => void;
}

export function MessageActionsMenu({
  message,
  roomId,
  currentUsername,
  onReply,
  onReact,
}: MessageActionsMenuProps) {
  const { toast } = useToast();
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [isOpen, setIsOpen] = useState(false);

  const isPinned = message.pinned || false;
  const isOwnMessage = message.sender === currentUsername;

  console.log('🔵 MessageActionsMenu render:', { 
    messageId: message.id, 
    isPinned, 
    rawPinned: message.pinned,
    sender: message.sender 
  });

  const handleCopyMessage = async () => {
    if (!message.text) {
      toast({
        title: "Nothing to copy",
        description: "This message has no text content.",
        variant: "destructive",
      });
      return;
    }

    try {
      await navigator.clipboard.writeText(message.text);
      toast({
        title: "✅ Message copied",
        description: "Message text copied to clipboard.",
        className: "border-neon-cyan/50 bg-bg-900",
      });
    } catch (error) {
      console.error("Failed to copy message:", error);
      toast({
        title: "❌ Copy failed",
        description: "Could not copy message to clipboard.",
        variant: "destructive",
      });
    }
    setIsOpen(false);
  };

  const handleCopyMessageLink = async () => {
    if (!message.id) return;

    const messageLink = `${window.location.origin}${window.location.pathname}#${message.id}`;

    try {
      await navigator.clipboard.writeText(messageLink);
      toast({
        title: "✅ Link copied",
        description: "Message link copied to clipboard.",
        className: "border-neon-cyan/50 bg-bg-900",
      });
    } catch (error) {
      console.error("Failed to copy link:", error);
      toast({
        title: "❌ Copy failed",
        description: "Could not copy link to clipboard.",
        variant: "destructive",
      });
    }
    setIsOpen(false);
  };

  const handleTogglePin = async () => {
    if (!message.id) {
      console.error('❌ Cannot pin: message has no ID');
      toast({
        title: "❌ Pin failed",
        description: "Message ID is missing.",
        variant: "destructive",
      });
      return;
    }

    if (!roomId) {
      console.error('❌ Cannot pin: room ID is missing');
      toast({
        title: "❌ Pin failed",
        description: "Room ID is missing.",
        variant: "destructive",
      });
      return;
    }

    console.log('🔵 Starting pin toggle:', { messageId: message.id, roomId, currentPinned: isPinned, newPinned: !isPinned });

    try {
      await roomService.togglePinMessage(roomId, message.id, !isPinned);
      
      console.log('✅ Pin toggle successful');
      
      toast({
        title: isPinned ? "📌 Message unpinned" : "📌 Message pinned",
        description: isPinned
          ? "Message removed from pinned messages."
          : "Message pinned successfully.",
        className: "border-neon-gold/50 bg-bg-900",
      });
    } catch (error) {
      console.error("❌ Failed to toggle pin:", error);
      console.error("❌ Error details:", {
        error: (error as Error).message,
        code: (error as any).code,
        messageId: message.id,
        roomId,
        isPinned
      });
      
      toast({
        title: "❌ Pin failed",
        description: `Could not update pin status. ${(error as Error).message || 'Unknown error'}`,
        variant: "destructive",
      });
    }
    setIsOpen(false);
  };

  const handleDeleteMessage = async () => {
    if (!message.id) return;

    setIsDeleting(true);
    try {
      await roomService.deleteMessage(roomId, message.id);
      toast({
        title: "✅ Message deleted",
        description: "Message has been permanently deleted.",
        className: "border-neon-red/50 bg-bg-900",
      });
      setShowDeleteDialog(false);
    } catch (error) {
      console.error("Failed to delete message:", error);
      toast({
        title: "❌ Delete failed",
        description: "Could not delete message.",
        variant: "destructive",
      });
    } finally {
      setIsDeleting(false);
      setIsOpen(false);
    }
  };

  const handleReply = () => {
    if (onReply) {
      onReply(message);
    }
    setIsOpen(false);
  };

  const handleReact = () => {
    if (onReact) {
      onReact(message);
    }
    setIsOpen(false);
  };

  return (
    <>
      <DropdownMenu open={isOpen} onOpenChange={setIsOpen}>
        <DropdownMenuTrigger asChild>
          <Button
            variant="ghost"
            size="icon"
            className="h-8 w-8 opacity-30 group-hover:opacity-100 transition-all duration-200 hover:bg-neon-cyan/20 hover:text-neon-cyan hover:scale-110 border border-neon-cyan/20 group-hover:border-neon-cyan/50 rounded-md shadow-sm hover:shadow-glow-cyan"
          >
            <MoreVertical className="h-5 w-5" />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent
          align="end"
          className="w-48 bg-bg-900 border-neon-cyan/30 backdrop-blur-sm"
        >
          {/* Reply Action */}
          {onReply && (
            <DropdownMenuItem
              onClick={handleReply}
              className="cursor-pointer hover:bg-neon-cyan/10 hover:text-neon-cyan focus:bg-neon-cyan/10 focus:text-neon-cyan"
            >
              <Reply className="h-4 w-4 mr-2" />
              Reply
            </DropdownMenuItem>
          )}

          {/* React Action */}
          {onReact && (
            <DropdownMenuItem
              onClick={handleReact}
              className="cursor-pointer hover:bg-neon-magenta/10 hover:text-neon-magenta focus:bg-neon-magenta/10 focus:text-neon-magenta"
            >
              <Smile className="h-4 w-4 mr-2" />
              React
            </DropdownMenuItem>
          )}

          {(onReply || onReact) && (
            <DropdownMenuSeparator className="bg-neon-cyan/20" />
          )}

          {/* Copy Message */}
          {message.text && (
            <DropdownMenuItem
              onClick={handleCopyMessage}
              className="cursor-pointer hover:bg-neon-violet/10 hover:text-neon-violet focus:bg-neon-violet/10 focus:text-neon-violet"
            >
              <Clipboard className="h-4 w-4 mr-2" />
              Copy Message
            </DropdownMenuItem>
          )}

          {/* Copy Message Link */}
          <DropdownMenuItem
            onClick={handleCopyMessageLink}
            className="cursor-pointer hover:bg-neon-blue/10 hover:text-neon-blue focus:bg-neon-blue/10 focus:text-neon-blue"
          >
            <LinkIcon className="h-4 w-4 mr-2" />
            Copy Link
          </DropdownMenuItem>

          <DropdownMenuSeparator className="bg-neon-cyan/20" />

          {/* Pin / Unpin Message */}
          <DropdownMenuItem
            onClick={handleTogglePin}
            className="cursor-pointer hover:bg-neon-gold/10 hover:text-neon-gold focus:bg-neon-gold/10 focus:text-neon-gold"
          >
            {isPinned ? (
              <>
                <PinOff className="h-4 w-4 mr-2" />
                Unpin Message
              </>
            ) : (
              <>
                <Pin className="h-4 w-4 mr-2" />
                Pin Message
              </>
            )}
          </DropdownMenuItem>

          {/* Delete Message - Only for own messages */}
          {isOwnMessage && (
            <>
              <DropdownMenuSeparator className="bg-neon-red/20" />
              <DropdownMenuItem
                onClick={() => setShowDeleteDialog(true)}
                className="cursor-pointer text-neon-red hover:bg-neon-red/10 hover:text-neon-red focus:bg-neon-red/10 focus:text-neon-red"
              >
                <Trash2 className="h-4 w-4 mr-2" />
                Delete Message
              </DropdownMenuItem>
            </>
          )}
        </DropdownMenuContent>
      </DropdownMenu>

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
        <AlertDialogContent className="bg-bg-900 border-neon-red/30">
          <AlertDialogHeader>
            <AlertDialogTitle className="text-neon-red">
              Delete this message?
            </AlertDialogTitle>
            <AlertDialogDescription className="text-text-secondary">
              This action cannot be undone. The message will be permanently
              deleted.
              {message.mediaUrl && (
                <span className="block mt-2 text-neon-gold">
                  ⚠️ Any attached media will also be deleted.
                </span>
              )}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel className="border-text-tertiary/50">
              Cancel
            </AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDeleteMessage}
              disabled={isDeleting}
              className="bg-neon-red/20 hover:bg-neon-red/30 border border-neon-red/50 text-neon-red"
            >
              {isDeleting ? "Deleting..." : "Delete"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
