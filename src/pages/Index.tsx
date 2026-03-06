import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import {
  ArrowRight,
  MessageSquare,
  Users,
  Shield,
  Sparkles,
  Plus,
  Globe,
  Activity,
} from "lucide-react";
import { NeonButton } from "@/components/ui/neon-button";
import { GlassCard } from "@/components/ui/glass-card";
import { Badge } from "@/components/ui/badge";
import heroBackground from "@/assets/hero-bg.jpg";
import chatIcon from "@/assets/chat-icon.png";
import adminIcon from "@/assets/admin-icon.png";
import { CreateRoomDialog } from "@/components/rooms/CreateRoomDialog";
import { roomService, Room } from "@/lib/room-service";
import { useAnonymousUser } from "@/lib/user-service";

const features = [
  {
    icon: MessageSquare,
    title: "Real-time Chat",
    description: "Lightning-fast messaging with neon-powered delivery",
    color: "neon-cyan",
  },
  {
    icon: Users,
    title: "Community Rooms",
    description: "Create persistent spaces that glow with conversation",
    color: "neon-blue",
  },
  {
    icon: Shield,
    title: "Admin Control",
    description: "Powerful moderation tools with cyberpunk aesthetics",
    color: "neon-violet",
  },
];

const Index = () => {
  const [rooms, setRooms] = useState<Room[]>([]);
  const [loading, setLoading] = useState(true);
  const { user } = useAnonymousUser();

  useEffect(() => {
    const loadRooms = async () => {
      try {
        console.log("🏠 Starting to load rooms from Index page...");

        // Test connection first
        const connectionOk = await roomService.testConnection();
        if (!connectionOk) {
          console.error("❌ Connection test failed on Index page");
          return;
        }

        console.log("✅ Connection OK, fetching rooms...");
        const fetchedRooms = await roomService.getRooms();
        console.log("📦 Fetched rooms:", fetchedRooms);
        setRooms(fetchedRooms);
      } catch (error) {
        console.error("❌ Failed to load rooms:", error);
        console.error("🔍 Error details:", error);
      } finally {
        setLoading(false);
      }
    };

    loadRooms();
  }, []);

  const handleRoomCreated = (roomId: string) => {
    // Refresh rooms list after creating a new room
    roomService.getRooms().then(setRooms).catch(console.error);
  };

  return (
    <div className="min-h-screen">
      {/* Hero Section */}
      <section className="relative min-h-screen flex items-center justify-center overflow-hidden">
        {/* Animated Grid Background */}
        <div className="absolute inset-0 grid-bg opacity-60" />

        {/* Subtle gradient overlay */}
        <div className="absolute inset-0 bg-gradient-to-br from-bg-dark/50 via-bg/80 to-bg-darker/50" />

        {/* Hero Content */}
        <div className="relative z-10 container-responsive text-center px-4">
          <div className="animate-fade-in-glow">
            <h1 className="text-6xl md:text-8xl font-orbitron font-bold text-neon-cyan mb-6 uppercase tracking-wider">
              Join conversations <br />
              <span className="text-neon-violet">that glow</span>
            </h1>
            <p className="text-lg md:text-xl text-text-secondary mb-8 max-w-2xl mx-auto leading-relaxed font-exo">
              Experience the future of chat with our Tron-inspired interface.
              Connect, create, and communicate in spaces that pulse with digital
              energy.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
              {rooms.length > 0 && (
                <Link to={`/rooms/${rooms[0].id}`}>
                  <NeonButton variant="hero" size="xl" className="group">
                    Enter Active Room
                    <ArrowRight className="ml-2 h-5 w-5 group-hover:translate-x-1 transition-transform" />
                  </NeonButton>
                </Link>
              )}
              <CreateRoomDialog onRoomCreated={handleRoomCreated} />
            </div>

            {user && (
              <div className="mt-6 text-sm text-text-secondary">
                Welcome back,{" "}
                <span className="text-neon-cyan font-medium">
                  {user.username}
                </span>
              </div>
            )}
          </div>
        </div>

        {/* Floating Elements */}
        <div className="absolute top-20 left-10 animate-pulse">
          <div className="w-2 h-2 bg-neon-cyan rounded-full shadow-glow-cyan" />
        </div>
        <div className="absolute top-40 right-20 animate-pulse delay-500">
          <div className="w-1 h-1 bg-neon-magenta rounded-full shadow-glow-magenta" />
        </div>
        <div className="absolute bottom-32 left-1/4 animate-pulse delay-1000">
          <div className="w-1.5 h-1.5 bg-neon-blue rounded-full shadow-glow-blue" />
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20 relative">
        <div className="container-responsive">
          <div className="text-center mb-16">
            <h2 className="text-display font-orbitron font-bold text-neon-blue mb-4">
              Features that <span className="text-neon-cyan">illuminate</span>
            </h2>
            <p className="text-lg text-text-secondary max-w-2xl mx-auto">
              Powered by cutting-edge technology and wrapped in cyberpunk
              aesthetics
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            {features.map((feature, index) => (
              <GlassCard
                key={index}
                variant="strong"
                hoverable
                className="p-8 text-center group animate-slide-up"
                style={{ animationDelay: `${index * 200}ms` }}
              >
                <div
                  className={`inline-flex p-4 rounded-2xl bg-${feature.color}/10 mb-6 group-hover:scale-110 transition-transform`}
                >
                  <feature.icon className={`h-8 w-8 text-${feature.color}`} />
                </div>
                <h3 className="text-xl font-orbitron font-semibold text-text-primary mb-4">
                  {feature.title}
                </h3>
                <p className="text-text-secondary leading-relaxed">
                  {feature.description}
                </p>
              </GlassCard>
            ))}
          </div>
        </div>
      </section>

      {/* Rooms Section */}
      <section className="py-20 bg-gradient-to-br from-bg-900/50 to-bg-800/50">
        <div className="container-responsive">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-12">
            <div>
              <h2 className="text-display font-orbitron font-bold text-neon-cyan mb-4">
                Active Rooms
              </h2>
              <p className="text-text-secondary">
                Jump into conversations happening right now
              </p>
            </div>
            <CreateRoomDialog onRoomCreated={handleRoomCreated} />
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-2 gap-6">
            {loading ? (
              <div className="col-span-2 text-center py-12">
                <div className="animate-pulse text-neon-cyan">
                  Loading rooms...
                </div>
              </div>
            ) : rooms.length === 0 ? (
              <div className="col-span-2 text-center py-12 text-text-secondary">
                <MessageSquare className="h-12 w-12 mx-auto mb-4 text-neon-cyan/50" />
                <p className="text-lg mb-4">No rooms available yet</p>
                <p>Be the first to create a room!</p>
              </div>
            ) : (
              rooms.slice(0, 4).map((room, index) => (
                <Link key={room.id} to={`/rooms/${room.id}`}>
                  <GlassCard
                    variant={!room.locked ? "neon" : "default"}
                    hoverable
                    className="p-6 h-full animate-fade-in"
                    style={{ animationDelay: `${index * 150}ms` }}
                  >
                    <div className="flex items-start justify-between mb-4">
                      <div className="flex items-center space-x-2">
                        {!room.locked && (
                          <div className="h-3 w-3 bg-neon-green rounded-full animate-pulse" />
                        )}
                        <Badge
                          variant="secondary"
                          className={
                            !room.locked
                              ? "bg-neon-green/20 text-neon-green"
                              : "bg-red-500/20 text-red-400"
                          }
                        >
                          {room.locked ? "Locked" : "Open"}
                        </Badge>
                      </div>
                      <Activity className="h-5 w-5 text-neon-cyan" />
                    </div>

                    <h3 className="text-xl font-orbitron font-semibold text-neon-cyan mb-3">
                      {room.name}
                    </h3>
                    <p className="text-text-secondary mb-4 leading-relaxed">
                      {room.description}
                    </p>

                    <div className="flex items-center justify-between text-sm">
                      <div className="flex items-center space-x-4">
                        <div className="flex items-center space-x-1">
                          <Users className="h-4 w-4 text-neon-blue" />
                          <span className="text-text-tertiary">
                            {room.locked ? "Locked" : "Active"}
                          </span>
                        </div>
                        <div className="flex items-center space-x-1">
                          <MessageSquare className="h-4 w-4 text-neon-violet" />
                          <span className="text-text-tertiary">
                            {room.activeUsers?.length || 0} users
                          </span>
                        </div>
                      </div>
                      <ArrowRight className="h-4 w-4 text-neon-cyan group-hover:translate-x-1 transition-transform" />
                    </div>
                  </GlassCard>
                </Link>
              ))
            )}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-r from-neon-cyan/5 to-neon-magenta/5" />
        <div className="container-responsive text-center relative z-10">
          <div className="max-w-3xl mx-auto">
            <h2 className="text-display font-orbitron font-bold text-neon-cyan mb-6">
              Ready to enter the{" "}
              <span className="text-neon-magenta">digital realm?</span>
            </h2>
            <p className="text-lg text-text-secondary mb-8">
              Join thousands of users in conversations that pulse with neon
              energy. Create your space, build your community, and watch it
              glow.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link to="/admin">
                <NeonButton variant="hero" size="xl">
                  <img src={adminIcon} alt="Admin" className="mr-2 h-5 w-5" />
                  Admin Dashboard
                </NeonButton>
              </Link>
              {rooms.length > 0 && (
                <NeonButton variant="outline" size="xl">
                  <Globe className="mr-2 h-5 w-5" />
                  Explore {rooms.length} Room{rooms.length !== 1 ? "s" : ""}
                </NeonButton>
              )}
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};

export default Index;
