// Simple debug utility for NeonGrid
export const debug = {
  log: (message: string, ...args: any[]) => {
    console.log(`🔧 [NeonGrid Debug] ${message}`, ...args);
  },
  
  error: (message: string, error: any) => {
    console.error(`❌ [NeonGrid Error] ${message}`, error);
  },
  
  success: (message: string, ...args: any[]) => {
    console.log(`✅ [NeonGrid Success] ${message}`, ...args);
  },
  
  info: (message: string, ...args: any[]) => {
    console.info(`ℹ️ [NeonGrid Info] ${message}`, ...args);
  }
};

// Test Firebase connection on app load
export const testFirebaseConnection = async () => {
  debug.log('Testing Firebase connection on app load...');
  
  try {
    // Check environment variables
    const envVars = {
      apiKey: !!import.meta.env.VITE_FIREBASE_API_KEY,
      authDomain: !!import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
      projectId: !!import.meta.env.VITE_FIREBASE_PROJECT_ID,
    };
    
    debug.info('Environment variables check:', envVars);
    
    const allPresent = Object.values(envVars).every(Boolean);
    if (!allPresent) {
      debug.error('Missing Firebase environment variables!', envVars);
      return false;
    }
    
    debug.success('All Firebase environment variables are present');
    return true;
    
  } catch (error) {
    debug.error('Firebase connection test failed', error);
    return false;
  }
};

// Quick debug function for console testing
export const quickTest = {
  // Test everything at once
  async runAll() {
    debug.log('Running complete system test...');
    
    try {
      // Use the direct Firebase test
      const directTest = (window as any).directFirebaseTest;
      if (directTest) {
        await directTest.runFullTest();
      } else {
        debug.error('Direct Firebase test not available', 'Check if directFirebaseTest is loaded');
      }
    } catch (error) {
      debug.error('Quick test failed', error);
    }
  }
};

// Expose for console access
(window as any).quickTest = quickTest;
(window as any).debug = debug;