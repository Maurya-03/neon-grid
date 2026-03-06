import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";

export function DebugPanel() {
  const [isVisible, setIsVisible] = useState(false);
  const [logs, setLogs] = useState<string[]>([]);

  useEffect(() => {
    // Override console.log to capture logs
    const originalLog = console.log;
    const originalError = console.error;

    console.log = (...args) => {
      originalLog(...args);
      setLogs((prev) => [...prev.slice(-20), args.join(" ")]);
    };

    console.error = (...args) => {
      originalError(...args);
      setLogs((prev) => [...prev.slice(-20), "❌ " + args.join(" ")]);
    };

    return () => {
      console.log = originalLog;
      console.error = originalError;
    };
  }, []);

  const runBasicTest = async () => {
    console.log("🧪 Running basic Firebase test...");
    try {
      // @ts-ignore - window.simpleTest is added dynamically
      if (window.simpleTest) {
        // @ts-ignore
        const connected = await window.simpleTest.testConnection();
        console.log("Connection result:", connected);

        if (connected) {
          // @ts-ignore
          const roomId = await window.simpleTest.createTestRoom();
          if (roomId) {
            // @ts-ignore
            await window.simpleTest.sendTestMessage(roomId);
          }
        }
      }
    } catch (error) {
      console.error("Basic test failed:", error);
    }
  };

  if (!isVisible) {
    return (
      <div className="fixed bottom-4 right-4 z-50">
        <Button
          onClick={() => setIsVisible(true)}
          className="bg-yellow-600 hover:bg-yellow-700 text-white"
        >
          🐛 Debug
        </Button>
      </div>
    );
  }

  return (
    <div className="fixed bottom-4 right-4 w-96 h-64 bg-black/90 border border-yellow-500 rounded-lg p-4 z-50 flex flex-col">
      <div className="flex justify-between items-center mb-2">
        <h3 className="text-yellow-400 font-bold">Debug Panel</h3>
        <Button
          size="sm"
          variant="ghost"
          onClick={() => setIsVisible(false)}
          className="text-yellow-400 hover:bg-yellow-400/20"
        >
          ✕
        </Button>
      </div>

      <div className="flex gap-2 mb-2">
        <Button
          size="sm"
          onClick={runBasicTest}
          className="bg-green-600 hover:bg-green-700"
        >
          Test Firebase
        </Button>
        <Button size="sm" onClick={() => setLogs([])} variant="outline">
          Clear
        </Button>
      </div>

      <div className="flex-1 overflow-auto bg-black/50 p-2 rounded text-xs text-green-400 font-mono">
        {logs.map((log, i) => (
          <div key={i} className="mb-1">
            {log}
          </div>
        ))}
        {logs.length === 0 && (
          <div className="text-gray-500">Console logs will appear here...</div>
        )}
      </div>
    </div>
  );
}
