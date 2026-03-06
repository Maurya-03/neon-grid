import { useState, useEffect } from 'react';

// Anonymous user management with localStorage persistence

export interface AnonymousUser {
  id: string;
  username: string;
  joinedAt: Date;
  hasSeenUsernameDialog?: boolean;
}

const USER_STORAGE_KEY = 'neon_grid_user';

export const userService = {
  // Generate a random user ID
  generateUserId(): string {
    return 'user_' + Math.random().toString(36).substr(2, 9) + '_' + Date.now().toString(36);
  },

  // Generate random usernames
  generateUsername(): string {
    const adjectives = [
      'Neon', 'Cyber', 'Digital', 'Quantum', 'Matrix', 'Binary', 'Virtual', 'Electric',
      'Plasma', 'Chrome', 'Steel', 'Carbon', 'Titanium', 'Nova', 'Pulse', 'Volt'
    ];
    
    const nouns = [
      'Rider', 'Ghost', 'Phantom', 'Runner', 'Walker', 'Hacker', 'Agent', 'Guardian',
      'Scout', 'Hunter', 'Sentinel', 'Wanderer', 'Seeker', 'Drifter', 'Rebel', 'Nomad'
    ];

    const adjective = adjectives[Math.floor(Math.random() * adjectives.length)];
    const noun = nouns[Math.floor(Math.random() * nouns.length)];
    const number = Math.floor(Math.random() * 999) + 1;

    return `${adjective}${noun}${number}`;
  },

  // Get current user from localStorage or create new one
  getCurrentUser(): AnonymousUser {
    const stored = localStorage.getItem(USER_STORAGE_KEY);
    
    if (stored) {
      try {
        const user = JSON.parse(stored);
        return {
          ...user,
          joinedAt: new Date(user.joinedAt)
        };
      } catch (error) {
        console.error('Error parsing stored user:', error);
        // Fall through to create new user
      }
    }

    // Create new anonymous user
    const newUser: AnonymousUser = {
      id: this.generateUserId(),
      username: this.generateUsername(),
      joinedAt: new Date()
    };

    this.saveUser(newUser);
    return newUser;
  },

  // Save user to localStorage
  saveUser(user: AnonymousUser): void {
    localStorage.setItem(USER_STORAGE_KEY, JSON.stringify(user));
  },

  // Update username
  updateUsername(newUsername: string): AnonymousUser {
    const user = this.getCurrentUser();
    const updatedUser = {
      ...user,
      username: newUsername,
      hasSeenUsernameDialog: true
    };
    this.saveUser(updatedUser);
    return updatedUser;
  },

  // Mark that user has seen the username dialog
  markUsernameDialogSeen(): AnonymousUser {
    const user = this.getCurrentUser();
    const updatedUser = {
      ...user,
      hasSeenUsernameDialog: true
    };
    this.saveUser(updatedUser);
    return updatedUser;
  },

  // Clear current user (for testing or reset)
  clearUser(): void {
    localStorage.removeItem(USER_STORAGE_KEY);
  },

  // Reset username dialog (for testing)
  resetUsernameDialog(): void {
    const user = this.getCurrentUser();
    const updatedUser = {
      ...user,
      hasSeenUsernameDialog: false
    };
    this.saveUser(updatedUser);
  },

  // Validate username (basic validation)
  isValidUsername(username: string): boolean {
    return username.trim().length >= 3 && 
           username.trim().length <= 20 && 
           /^[a-zA-Z0-9_-]+$/.test(username.trim());
  }
};

// Hook for React components
export const useAnonymousUser = () => {
  const [user, setUser] = useState<AnonymousUser | null>(null);

  useEffect(() => {
    const currentUser = userService.getCurrentUser();
    setUser(currentUser);
  }, []);

  const updateUsername = (newUsername: string) => {
    if (userService.isValidUsername(newUsername)) {
      const updatedUser = userService.updateUsername(newUsername);
      setUser(updatedUser);
      return true;
    }
    return false;
  };

  const markDialogSeen = () => {
    const updatedUser = userService.markUsernameDialogSeen();
    setUser(updatedUser);
  };

  return {
    user,
    updateUsername,
    markDialogSeen,
    isValidUsername: userService.isValidUsername
  };
};

// Expose userService for console debugging
if (typeof window !== 'undefined') {
  (window as any).userService = userService;
}
