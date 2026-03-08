import { ChatRoom } from "@/components/ChatRoom";
import { useParams } from "react-router-dom";
import { useEffect } from "react";

const RoomPage = () => {
  const { roomId } = useParams<{ roomId: string }>();

  // Prevent body scroll on chat room pages
  useEffect(() => {
    document.body.style.overflow = "hidden";
    document.documentElement.style.overflow = "hidden";

    return () => {
      document.body.style.overflow = "";
      document.documentElement.style.overflow = "";
    };
  }, []);

  if (!roomId) {
    return (
      <div className="flex items-center justify-center h-screen overflow-hidden">
        Room not found
      </div>
    );
  }

  return <ChatRoom roomId={roomId} />;
};

export default RoomPage;
