import { useState } from "react";
import { Plus, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { roomService } from "@/lib/room-service";
import { useAnonymousUser } from "@/lib/user-service";

interface CreateRoomDialogProps {
  onRoomCreated?: (roomId: string) => void;
}

export function CreateRoomDialog({ onRoomCreated }: CreateRoomDialogProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");

  const { user } = useAnonymousUser();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!name.trim() || !description.trim()) {
      setError("Please fill in all fields");
      return;
    }

    if (!user) {
      setError("User not initialized");
      return;
    }

    setIsLoading(true);
    setError("");

    try {
      console.log("Creating room with data:", {
        name: name.trim(),
        description: description.trim(),
        createdBy: user.username,
      });

      const roomId = await roomService.createRoom({
        name: name.trim(),
        description: description.trim(),
        createdBy: user.username,
      });

      console.log("Room created successfully with ID:", roomId);

      // Reset form
      setName("");
      setDescription("");
      setIsOpen(false);

      // Notify parent component
      onRoomCreated?.(roomId);
    } catch (err) {
      console.error("Detailed room creation error:", err);

      // More specific error handling
      let errorMessage = "Failed to create room. Please try again.";
      if (err instanceof Error) {
        if (err.message.includes("permission")) {
          errorMessage = "Permission denied. Check Firebase configuration.";
        } else if (err.message.includes("network")) {
          errorMessage = "Network error. Please check your connection.";
        } else if (err.message.includes("quota")) {
          errorMessage = "Service quota exceeded. Please try again later.";
        } else {
          errorMessage = `Error: ${err.message}`;
        }
      }

      setError(errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  if (!isOpen) {
    return (
      <Button
        onClick={() => setIsOpen(true)}
        className="group bg-transparent border border-neon-cyan text-neon-cyan hover:text-white hover:shadow-glow-cyan hover:bg-neon-cyan/5 font-orbitron font-medium uppercase tracking-wider transition-all duration-200 rounded-md"
      >
        <Plus className="h-4 w-4 mr-2" />
        Create Room
      </Button>
    );
  }

  return (
    <div className="fixed inset-0 bg-bg/90 backdrop-blur-lg z-50 flex items-center justify-center p-4">
      <div className="bg-bg-800/40 border border-neon-cyan/50 rounded-md p-6 w-full max-w-md backdrop-blur-sm shadow-glow-cyan">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-2xl font-orbitron font-bold text-neon-cyan uppercase tracking-wider text-shadow-glow-cyan">
            Create New Room
          </h2>
          <Button
            variant="ghost"
            size="icon"
            onClick={() => setIsOpen(false)}
            className="text-text-secondary hover:text-neon-cyan"
          >
            <X className="h-4 w-4" />
          </Button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label
              htmlFor="room-name"
              className="block text-sm font-medium text-text-secondary mb-2"
            >
              Room Name
            </label>
            <Input
              id="room-name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Enter room name..."
              className="bg-bg-700 border-bg-600 focus:border-neon-cyan text-white"
              disabled={isLoading}
              maxLength={50}
            />
          </div>

          <div>
            <label
              htmlFor="room-description"
              className="block text-sm font-medium text-text-secondary mb-2"
            >
              Description
            </label>
            <Textarea
              id="room-description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="What will you discuss in this room?"
              className="bg-bg-700 border-bg-600 focus:border-neon-cyan text-white min-h-[100px]"
              disabled={isLoading}
              maxLength={200}
            />
          </div>

          {error && (
            <div className="text-red-400 text-sm bg-red-400/10 border border-red-400/20 rounded p-2">
              {error}
            </div>
          )}

          <div className="flex gap-3 pt-4">
            <Button
              type="button"
              variant="outline"
              onClick={() => setIsOpen(false)}
              disabled={isLoading}
              className="flex-1"
            >
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={isLoading}
              className="flex-1 bg-neon-cyan text-bg-900 hover:bg-neon-cyan/80 font-bold"
            >
              {isLoading ? "Creating..." : "Create Room"}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}
