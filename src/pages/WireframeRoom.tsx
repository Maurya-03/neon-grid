import { useState } from "react"
import { useParams } from "react-router-dom"
import { Send, Paperclip, Smile, Users, Image, MoreVertical, MessageSquare, FileText, Video } from "lucide-react"

// Wireframe mock data with message types
const wireframeMessages = [
  {
    id: 1,
    username: "User123",
    type: "text",
    content: "Text message content placeholder",
    timestamp: "2:30 PM",
    isOwn: false,
  },
  {
    id: 2,
    username: "User456", 
    type: "image",
    content: "image-file.jpg",
    timestamp: "2:32 PM",
    isOwn: false,
  },
  {
    id: 3,
    username: "You",
    type: "text", 
    content: "Own message text placeholder",
    timestamp: "2:35 PM",
    isOwn: true,
  },
  {
    id: 4,
    username: "User789",
    type: "video",
    content: "video-file.mp4",
    timestamp: "2:36 PM", 
    isOwn: false,
  },
  {
    id: 5,
    username: "User123",
    type: "file",
    content: "document.pdf",
    timestamp: "2:38 PM",
    isOwn: false,
  },
]

const WireframeRoom = () => {
  const { id } = useParams()
  const [showUsers, setShowUsers] = useState(false)
  const [showMediaGallery, setShowMediaGallery] = useState(false)

  const roomName = `Room ${id}`

  const renderMessageContent = (msg: any) => {
    switch (msg.type) {
      case "image":
        return (
          <div className="border border-neon-cyan/30 rounded p-4 bg-bg-800/20">
            <Image className="h-8 w-8 mx-auto mb-2 text-neon-cyan/60" />
            <div className="text-center text-xs text-neon-cyan/60">IMAGE PREVIEW</div>
            <div className="text-center text-xs mt-1 text-text-tertiary">{msg.content}</div>
          </div>
        )
      case "video":
        return (
          <div className="border border-neon-magenta/30 rounded p-4 bg-bg-800/20">
            <Video className="h-8 w-8 mx-auto mb-2 text-neon-magenta/60" />
            <div className="text-center text-xs text-neon-magenta/60">VIDEO PREVIEW</div>
            <div className="text-center text-xs mt-1 text-text-tertiary">{msg.content}</div>
          </div>
        )
      case "file":
        return (
          <div className="border border-neon-blue/30 rounded p-4 bg-bg-800/20">
            <FileText className="h-8 w-8 mx-auto mb-2 text-neon-blue/60" />
            <div className="text-center text-xs text-neon-blue/60">FILE ATTACHMENT</div>
            <div className="text-center text-xs mt-1 text-text-tertiary">{msg.content}</div>
          </div>
        )
      default:
        return (
          <div className="border border-text-secondary/30 rounded p-3 bg-bg-800/10">
            <div className="text-xs text-text-secondary/60 mb-1">TEXT MESSAGE</div>
            <div className="text-text-primary/80">{msg.content}</div>
          </div>
        )
    }
  }

  return (
    <div className="min-h-screen bg-[#050407] text-text-primary font-mono">
      {/* Wireframe Labels */}
      <div className="fixed top-2 left-2 z-50 text-xs text-neon-cyan/60 bg-bg-900/80 p-2 rounded border border-neon-cyan/20">
        WIREFRAME VIEW - STRUCTURAL LAYOUT
      </div>

      {/* Header Bar Container */}
      <div className="border-b border-text-secondary/20 bg-bg-900/50 relative">
        <div className="absolute -top-4 left-4 text-xs text-neon-cyan/60">HEADER BAR</div>
        <div className="container-responsive py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              {/* Room Info Block */}
              <div className="border border-text-secondary/30 rounded p-2 relative">
                <div className="absolute -top-4 left-0 text-xs text-neon-cyan/60">ROOM INFO</div>
                <div className="flex items-center space-x-2">
                  <div className="h-3 w-3 rounded-full border border-neon-green/50 relative">
                    <div className="absolute -top-4 left-0 text-xs text-neon-green/60">STATUS</div>
                  </div>
                  <h1 className="text-lg font-medium border-b border-text-secondary/20 pb-1">
                    {roomName}
                  </h1>
                </div>
                <div className="text-xs text-text-secondary/60 mt-1 border border-text-secondary/20 rounded p-1">
                  ROOM DESCRIPTION BLOCK
                </div>
              </div>
              
              {/* Member Count Block */}
              <div className="border border-text-secondary/30 rounded px-3 py-1 relative">
                <div className="absolute -top-4 left-0 text-xs text-neon-cyan/60">MEMBER COUNT</div>
                <div className="text-xs text-text-secondary">24 ONLINE</div>
              </div>
            </div>
            
            {/* Action Buttons Container */}
            <div className="flex items-center space-x-2 border border-text-secondary/30 rounded p-2 relative">
              <div className="absolute -top-4 right-0 text-xs text-neon-cyan/60">ACTION BUTTONS</div>
              <button 
                className="border border-text-secondary/30 rounded p-2 hover:border-neon-cyan/50"
                onClick={() => setShowUsers(!showUsers)}
              >
                <Users className="h-4 w-4" />
              </button>
              <button 
                className="border border-text-secondary/30 rounded p-2 hover:border-neon-magenta/50"
                onClick={() => setShowMediaGallery(!showMediaGallery)}
              >
                <Image className="h-4 w-4" />
              </button>
              <button className="border border-text-secondary/30 rounded p-2">
                <MoreVertical className="h-4 w-4" />
              </button>
            </div>
          </div>
        </div>
      </div>

      <div className="flex">
        {/* Left Sidebar - Rooms/Channels */}
        <div className="w-64 border-r border-text-secondary/20 bg-bg-900/30 relative">
          <div className="absolute -top-4 left-4 text-xs text-neon-cyan/60">LEFT SIDEBAR - ROOMS/CHANNELS</div>
          <div className="p-4 space-y-2">
            {[1, 2, 3, 4, 5].map((room) => (
              <div
                key={room}
                className={`border rounded p-3 cursor-pointer transition-colors relative ${
                  room === 2 
                    ? 'border-neon-cyan/50 bg-neon-cyan/5' 
                    : 'border-text-secondary/30 hover:border-text-secondary/50'
                }`}
              >
                {room === 2 && (
                  <div className="absolute -left-6 top-0 text-xs text-neon-cyan/60">ACTIVE</div>
                )}
                <div className="flex items-center space-x-2">
                  <div className="h-6 w-6 border border-text-secondary/30 rounded"></div>
                  <div className="text-sm">Room {room}</div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Main Chat Area */}
        <div className="flex-1 flex flex-col relative">
          <div className="absolute -top-4 left-4 text-xs text-neon-cyan/60">MAIN CHAT AREA</div>
          
          {/* Messages Container */}
          <div className="flex-1 p-4 space-y-4 min-h-[calc(100vh-200px)] overflow-y-auto relative border border-text-secondary/10">
            <div className="absolute top-2 right-2 text-xs text-neon-cyan/60">SCROLL CONTAINER</div>
            
            {wireframeMessages.map((msg) => (
              <div
                key={msg.id}
                className={`flex ${msg.isOwn ? 'justify-end' : 'justify-start'} relative`}
              >
                {/* Spacing Guide */}
                <div className="absolute left-0 top-0 w-full h-px bg-text-secondary/10"></div>
                
                <div className={`max-w-md border rounded-lg p-3 relative ${
                  msg.isOwn 
                    ? 'border-neon-blue/30 bg-neon-blue/5' 
                    : 'border-text-secondary/30 bg-bg-800/20'
                }`}>
                  <div className="absolute -top-4 left-0 text-xs text-neon-cyan/60">
                    {msg.isOwn ? 'OWN MESSAGE' : 'OTHER MESSAGE'}
                  </div>
                  
                  {/* Username Block */}
                  {!msg.isOwn && (
                    <div className="border-b border-text-secondary/20 pb-1 mb-2 relative">
                      <div className="absolute -top-4 left-0 text-xs text-neon-cyan/60">USERNAME</div>
                      <div className="text-sm font-medium text-neon-cyan/80">{msg.username}</div>
                    </div>
                  )}
                  
                  {/* Message Content - Different types */}
                  <div className="mb-2 relative">
                    <div className="absolute -top-4 right-0 text-xs text-neon-cyan/60">
                      {msg.type.toUpperCase()} CONTENT
                    </div>
                    {renderMessageContent(msg)}
                  </div>
                  
                  {/* Timestamp Block */}
                  <div className="border-t border-text-secondary/20 pt-1 relative">
                    <div className="absolute -bottom-4 right-0 text-xs text-neon-cyan/60">TIMESTAMP</div>
                    <div className="text-xs text-text-tertiary text-right">{msg.timestamp}</div>
                  </div>
                </div>
              </div>
            ))}
            
            {/* Typing Indicator Block */}
            <div className="border border-neon-green/30 rounded p-2 bg-neon-green/5 relative">
              <div className="absolute -top-4 left-0 text-xs text-neon-green/60">TYPING INDICATOR</div>
              <div className="text-xs text-neon-green/80">User is typing...</div>
            </div>
          </div>

          {/* Message Composer Container */}
          <div className="p-4 border-t border-text-secondary/20 relative">
            <div className="absolute -top-4 left-4 text-xs text-neon-cyan/60">MESSAGE COMPOSER</div>
            
            <div className="border border-text-secondary/30 rounded-lg p-4 bg-bg-800/20">
              <div className="flex items-end space-x-3">
                {/* Attachment Buttons */}
                <div className="flex space-x-2 relative">
                  <div className="absolute -top-4 left-0 text-xs text-neon-cyan/60">ATTACHMENTS</div>
                  <button className="border border-text-secondary/30 rounded p-2">
                    <Paperclip className="h-4 w-4" />
                  </button>
                  <button className="border border-text-secondary/30 rounded p-2">
                    <Smile className="h-4 w-4" />
                  </button>
                </div>
                
                {/* Input Field */}
                <div className="flex-1 relative">
                  <div className="absolute -top-4 left-0 text-xs text-neon-cyan/60">TEXT INPUT</div>
                  <div className="border border-text-secondary/30 rounded p-3 bg-bg-900/50 min-h-[40px]">
                    <div className="text-text-secondary/60 text-sm">Message input placeholder...</div>
                  </div>
                </div>
                
                {/* Send Button */}
                <div className="relative">
                  <div className="absolute -top-4 right-0 text-xs text-neon-cyan/60">SEND</div>
                  <button className="border border-neon-cyan/50 rounded p-2 bg-neon-cyan/10">
                    <Send className="h-4 w-4" />
                  </button>
                </div>
              </div>
              
              {/* Attached Media Preview */}
              <div className="mt-3 border-t border-text-secondary/20 pt-3 relative">
                <div className="absolute -top-6 left-0 text-xs text-neon-cyan/60">ATTACHED MEDIA PREVIEW</div>
                <div className="flex space-x-2">
                  <div className="border border-neon-blue/30 rounded p-2 bg-neon-blue/5 text-xs">
                    IMAGE THUMB
                  </div>
                  <div className="border border-neon-magenta/30 rounded p-2 bg-neon-magenta/5 text-xs">
                    VIDEO THUMB
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Right Sidebar - Users List */}
        {showUsers && (
          <div className="w-80 border-l border-text-secondary/20 bg-bg-900/30 relative">
            <div className="absolute -top-4 right-4 text-xs text-neon-cyan/60">USERS SIDEBAR</div>
            <div className="p-4">
              <div className="border-b border-text-secondary/20 pb-2 mb-4 relative">
                <div className="absolute -top-4 left-0 text-xs text-neon-cyan/60">SECTION HEADER</div>
                <h3 className="text-lg font-medium">Online Users</h3>
              </div>
              <div className="space-y-2 relative">
                <div className="absolute -top-4 left-0 text-xs text-neon-cyan/60">USER LIST</div>
                {[1, 2, 3, 4].map((user) => (
                  <div key={user} className="border border-text-secondary/30 rounded p-3 flex items-center space-x-3">
                    <div className="relative">
                      <div className="h-8 w-8 border border-text-secondary/30 rounded-full relative">
                        <div className="absolute -top-4 left-0 text-xs text-neon-cyan/60">AVATAR</div>
                      </div>
                      <div className="absolute -bottom-1 -right-1 h-3 w-3 border border-neon-green/50 rounded-full bg-neon-green/20" />
                    </div>
                    <div className="flex-1">
                      <div className="text-sm border-b border-text-secondary/20 pb-1">User{user}</div>
                      <div className="text-xs text-text-tertiary">online</div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* Media Gallery Sidebar */}
        {showMediaGallery && (
          <div className="w-80 border-l border-text-secondary/20 bg-bg-900/30 relative">
            <div className="absolute -top-4 right-4 text-xs text-neon-cyan/60">MEDIA GALLERY</div>
            <div className="p-4">
              <div className="border-b border-text-secondary/20 pb-2 mb-4">
                <h3 className="text-lg font-medium">Media Gallery</h3>
              </div>
              
              {/* Filter Tabs */}
              <div className="flex space-x-2 mb-4 relative">
                <div className="absolute -top-4 left-0 text-xs text-neon-cyan/60">FILTER TABS</div>
                <button className="border border-neon-cyan/50 rounded px-3 py-1 text-xs bg-neon-cyan/10">ALL</button>
                <button className="border border-text-secondary/30 rounded px-3 py-1 text-xs">IMAGES</button>
                <button className="border border-text-secondary/30 rounded px-3 py-1 text-xs">VIDEOS</button>
              </div>
              
              {/* Media Grid */}
              <div className="grid grid-cols-2 gap-2 relative">
                <div className="absolute -top-4 left-0 text-xs text-neon-cyan/60">MEDIA GRID</div>
                <div className="border border-neon-cyan/30 rounded p-4 bg-neon-cyan/5 text-center">
                  <Image className="h-6 w-6 mx-auto mb-1" />
                  <div className="text-xs">IMG</div>
                </div>
                <div className="border border-neon-magenta/30 rounded p-4 bg-neon-magenta/5 text-center">
                  <Video className="h-6 w-6 mx-auto mb-1" />
                  <div className="text-xs">VID</div>
                </div>
                <div className="border border-neon-blue/30 rounded p-4 bg-neon-blue/5 text-center">
                  <FileText className="h-6 w-6 mx-auto mb-1" />
                  <div className="text-xs">DOC</div>
                </div>
                <div className="border border-neon-cyan/30 rounded p-4 bg-neon-cyan/5 text-center">
                  <Image className="h-6 w-6 mx-auto mb-1" />
                  <div className="text-xs">IMG</div>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Spacing Guide Overlay */}
      <div className="fixed bottom-4 right-4 text-xs text-neon-cyan/60 bg-bg-900/80 p-3 rounded border border-neon-cyan/20">
        <div className="font-semibold mb-2">SPACING GUIDE</div>
        <div>Container Padding: 16px</div>
        <div>Element Margin: 8-16px</div>
        <div>Message Spacing: 16px</div>
        <div>Component Gap: 12px</div>
      </div>
    </div>
  )
}

export default WireframeRoom