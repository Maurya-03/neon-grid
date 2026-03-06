import { ChatRoom } from "@/components/ChatRoom";
import { useParams } from "react-router-dom";

const RoomPage = () => {
  const { roomId } = useParams<{ roomId: string }>();

  if (!roomId) {
    return (
      <div className="flex items-center justify-center h-screen">
        Room not found
      </div>
    );
  }

  return <ChatRoom roomId={roomId} />;
};

export default RoomPage;
