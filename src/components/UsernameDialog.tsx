import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useAnonymousUser } from "@/lib/user-service";

export function UsernameDialog() {
  const [isOpen, setIsOpen] = useState(false);
  const [tempUsername, setTempUsername] = useState("");
  const { user, updateUsername, markDialogSeen, isValidUsername } =
    useAnonymousUser();

  useEffect(() => {
    // Show dialog if user hasn't seen it before and still has a generated username
    if (
      user &&
      !user.hasSeenUsernameDialog &&
      user.username.match(
        /^(Neon|Cyber|Digital|Quantum|Matrix|Binary|Virtual|Electric|Plasma|Chrome|Steel|Carbon|Titanium|Nova|Pulse|Volt)(Rider|Ghost|Phantom|Runner|Walker|Hacker|Agent|Guardian|Scout|Hunter|Sentinel|Wanderer|Seeker|Drifter|Rebel|Nomad)\d+$/
      )
    ) {
      setIsOpen(true);
      setTempUsername(user.username);
    }
  }, [user]);

  const handleSave = () => {
    if (isValidUsername(tempUsername)) {
      updateUsername(tempUsername);
      setIsOpen(false);
    }
  };

  const handleSkip = () => {
    markDialogSeen();
    setIsOpen(false);
  };

  if (!isOpen || !user) return null;

  return (
    <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-bg-800 border border-neon-cyan/30 rounded-lg p-6 w-full max-w-md">
        <div className="text-center mb-6">
          <h2 className="text-2xl font-orbitron font-bold text-neon-cyan mb-2">
            Welcome to NeonGrid
          </h2>
          <p className="text-text-secondary">
            Choose your username for this session
          </p>
        </div>

        <div className="space-y-4">
          <div>
            <label
              htmlFor="username"
              className="block text-sm font-medium text-text-secondary mb-2"
            >
              Username
            </label>
            <Input
              id="username"
              value={tempUsername}
              onChange={(e) => setTempUsername(e.target.value)}
              placeholder="Enter your username..."
              className="bg-bg-700 border-bg-600 focus:border-neon-cyan text-white"
              maxLength={20}
            />
            <p className="text-xs text-text-tertiary mt-1">
              3-20 characters, letters, numbers, - and _ only
            </p>
          </div>

          <div className="flex gap-3 pt-4">
            <Button variant="outline" onClick={handleSkip} className="flex-1">
              Skip (keep {user.username})
            </Button>
            <Button
              onClick={handleSave}
              disabled={!isValidUsername(tempUsername)}
              className="flex-1 bg-neon-cyan text-bg-900 hover:bg-neon-cyan/80 font-bold"
            >
              Set Username
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
