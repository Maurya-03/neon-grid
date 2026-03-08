import { useState } from "react";
import { Room, roomService } from "@/lib/room-service";
import { useAdmin } from "@/lib/admin-service";
import { Button } from "@/components/ui/button";
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
import { Trash2, AlertTriangle } from "lucide-react";
import { useNavigate } from "react-router-dom";

interface RoomSettingsProps {
  room: Room;
}

export function RoomSettings({ room }: RoomSettingsProps) {
  const { session } = useAdmin();
  const navigate = useNavigate();
  const [isUpdating, setIsUpdating] = useState(false);
  const [showClearDialog, setShowClearDialog] = useState(false);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);

  // If not admin, don't render anything
  if (!session?.isAuthenticated) {
    return null;
  }

  const handleClearMessages = async () => {
    if (!room.id) return;

    setIsUpdating(true);
    try {
      await roomService.clearRoomMessages(room.id);
      setShowClearDialog(false);
      console.log("✅ All messages cleared");
    } catch (error) {
      console.error("❌ Failed to clear messages:", error);
      alert(`Failed to clear messages: ${error}`);
    } finally {
      setIsUpdating(false);
    }
  };

  const handleDeleteRoom = async () => {
    if (!room.id) return;

    setIsUpdating(true);
    try {
      await roomService.deleteRoom(room.id);
      setShowDeleteDialog(false);
      console.log("✅ Room deleted");
      // Redirect to home after deletion
      navigate("/");
    } catch (error) {
      console.error("❌ Failed to delete room:", error);
      alert(`Failed to delete room: ${error}`);
      setIsUpdating(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Danger Zone */}
      <div className="border-2 border-neon-red/30 rounded-lg p-4 bg-neon-red/5">
        <div className="flex items-center gap-2 mb-4">
          <AlertTriangle className="h-5 w-5 text-neon-red" />
          <h3 className="text-sm font-orbitron font-bold text-neon-red uppercase tracking-wider">
            Danger Zone
          </h3>
        </div>

        <div className="space-y-3">
          {/* Clear Messages Button */}
          <Button
            onClick={() => setShowClearDialog(true)}
            disabled={isUpdating}
            variant="outline"
            className="w-full bg-neon-gold/10 hover:bg-neon-gold/20 border-neon-gold/50 hover:border-neon-gold text-neon-gold"
          >
            <Trash2 className="h-4 w-4 mr-2" />
            Clear All Messages
          </Button>

          {/* Delete Room Button */}
          <Button
            onClick={() => setShowDeleteDialog(true)}
            disabled={isUpdating}
            variant="outline"
            className="w-full bg-neon-red/10 hover:bg-neon-red/20 border-neon-red/50 hover:border-neon-red text-neon-red"
          >
            <Trash2 className="h-4 w-4 mr-2" />
            Delete Room
          </Button>
        </div>
      </div>

      {/* Clear Messages Confirmation Dialog */}
      <AlertDialog open={showClearDialog} onOpenChange={setShowClearDialog}>
        <AlertDialogContent className="bg-bg-900 border-neon-gold/30">
          <AlertDialogHeader>
            <AlertDialogTitle className="text-neon-gold">
              Clear All Messages?
            </AlertDialogTitle>
            <AlertDialogDescription className="text-text-secondary">
              This will permanently delete all messages in this room. This
              action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel className="border-text-tertiary/50">
              Cancel
            </AlertDialogCancel>
            <AlertDialogAction
              onClick={handleClearMessages}
              disabled={isUpdating}
              className="bg-neon-gold/20 hover:bg-neon-gold/30 border border-neon-gold/50 text-neon-gold"
            >
              {isUpdating ? "Clearing..." : "Clear Messages"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Delete Room Confirmation Dialog */}
      <AlertDialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
        <AlertDialogContent className="bg-bg-900 border-neon-red/30">
          <AlertDialogHeader>
            <AlertDialogTitle className="text-neon-red">
              Delete Room?
            </AlertDialogTitle>
            <AlertDialogDescription className="text-text-secondary">
              This will permanently delete the room "{room.name}" and all its
              messages. This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel className="border-text-tertiary/50">
              Cancel
            </AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDeleteRoom}
              disabled={isUpdating}
              className="bg-neon-red/20 hover:bg-neon-red/30 border border-neon-red/50 text-neon-red"
            >
              {isUpdating ? "Deleting..." : "Delete Room"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
