import { useAuth } from "@/_core/hooks/useAuth";
import { useLocation, useRoute } from "wouter";
import { trpc } from "@/lib/trpc";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Users, MessageSquare, Zap, ArrowLeft, Send } from "lucide-react";
import { useState } from "react";
import { Textarea } from "@/components/ui/textarea";

export default function GuildDetail() {
  const { user, isAuthenticated } = useAuth();
  const [, setLocation] = useLocation();
  const [, params] = useRoute("/guild/:id");
  const guildId = params?.id ? parseInt(params.id) : 0;

  const [messageContent, setMessageContent] = useState("");

  // Fetch guild details
  const { data: guild } = trpc.guilds.getById.useQuery({ id: guildId });

  // Fetch guild members
  const { data: members } = trpc.guilds.getMembers.useQuery({ guildId });

  // Fetch guild messages
  const { data: messages } = trpc.guildChat.getMessages.useQuery({
    guildId,
    limit: 50,
  });

  // Fetch guild tasks
  const { data: tasks } = trpc.tasks.getGuildTasks.useQuery({ guildId });

  // Send message mutation
  const sendMessageMutation = trpc.guildChat.sendMessage.useMutation({
    onSuccess: () => {
      setMessageContent("");
    },
  });

  const handleSendMessage = async () => {
    if (!messageContent.trim()) return;
    await sendMessageMutation.mutateAsync({
      guildId,
      content: messageContent,
    });
  };

  if (!guild) {
    return (
      <div className="min-h-screen bg-background text-foreground flex items-center justify-center">
        <div className="cyber-card box-glow-cyan">
          <p className="neon-glow-cyan">Loading guild...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background text-foreground grid-bg">
      <div className="scan-lines" />

      {/* Header */}
      <header className="border-b-2 border-accent bg-card/50 backdrop-blur-sm sticky top-0 z-40">
        <div className="container flex items-center gap-4 py-4">
          <Button
            onClick={() => setLocation("/dashboard")}
            variant="ghost"
            className="btn-cyan"
          >
            <ArrowLeft className="w-4 h-4" />
          </Button>
          <div>
            <h1 className="text-2xl font-bold neon-glow-pink">{guild.name}</h1>
            <p className="text-sm text-muted-foreground">Level {guild.level}</p>
          </div>
          <div className="ml-auto flex items-center gap-4">
            <div className="text-right">
              <p className="text-xs text-muted-foreground">MEMBERS</p>
              <p className="text-lg font-bold neon-glow-cyan">{guild.memberCount}</p>
            </div>
            <div className="text-right">
              <p className="text-xs text-muted-foreground">POINTS</p>
              <p className="text-lg font-bold neon-glow-purple">{guild.totalPoints}</p>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="container py-8">
        {guild.description && (
          <div className="cyber-card box-glow-cyan mb-8">
            <p className="text-foreground/80">{guild.description}</p>
          </div>
        )}

        <Tabs defaultValue="chat" className="space-y-6">
          <TabsList className="bg-card border-2 border-accent">
            <TabsTrigger value="chat">
              <MessageSquare className="w-4 h-4 mr-2" />
              Chat
            </TabsTrigger>
            <TabsTrigger value="members">
              <Users className="w-4 h-4 mr-2" />
              Members
            </TabsTrigger>
            <TabsTrigger value="tasks">
              <Zap className="w-4 h-4 mr-2" />
              Tasks
            </TabsTrigger>
          </TabsList>

          {/* Chat Tab */}
          <TabsContent value="chat" className="space-y-4">
            <div className="cyber-card box-glow-purple p-6 h-96 flex flex-col">
              {/* Messages */}
              <div className="flex-1 overflow-y-auto space-y-4 mb-4">
                {messages && messages.length > 0 ? (
                  messages.map((msg) => (
                    <div
                      key={msg.id}
                      className={`p-3 rounded-sm ${
                        msg.userId === user?.id
                          ? "bg-accent/20 ml-auto max-w-xs"
                          : "bg-card/50 max-w-xs"
                      }`}
                    >
                      <p className="text-xs text-muted-foreground mb-1">
                        User #{msg.userId}
                      </p>
                      <p className="text-sm text-foreground">{msg.content}</p>
                    </div>
                  ))
                ) : (
                  <p className="text-center text-muted-foreground py-8">
                    No messages yet. Start the conversation!
                  </p>
                )}
              </div>

              {/* Input */}
              {isAuthenticated && (
                <div className="flex gap-2 pt-4 border-t border-accent">
                  <Textarea
                    placeholder="Type your message..."
                    value={messageContent}
                    onChange={(e) => setMessageContent(e.target.value)}
                    className="flex-1 bg-input border-accent text-foreground placeholder:text-muted-foreground resize-none h-12"
                    onKeyDown={(e) => {
                      if (e.key === "Enter" && !e.shiftKey) {
                        e.preventDefault();
                        handleSendMessage();
                      }
                    }}
                  />
                  <Button
                    onClick={handleSendMessage}
                    disabled={!messageContent.trim()}
                    className="btn-neon px-4"
                  >
                    <Send className="w-4 h-4" />
                  </Button>
                </div>
              )}
            </div>
          </TabsContent>

          {/* Members Tab */}
          <TabsContent value="members" className="space-y-4">
            {members && members.length > 0 ? (
              <div className="space-y-2">
                {members.map((member) => (
                  <div
                    key={member.id}
                    className="cyber-card box-glow-cyan flex items-center justify-between p-4"
                  >
                    <div>
                      <p className="font-bold neon-glow-pink">User #{member.userId}</p>
                      <p className="text-sm text-muted-foreground capitalize">
                        {member.role}
                      </p>
                    </div>
                    <span className="text-xs bg-accent/20 px-3 py-1 rounded-sm neon-glow-cyan">
                      Joined {new Date(member.joinedAt).toLocaleDateString()}
                    </span>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-foreground/70">No members found</p>
            )}
          </TabsContent>

          {/* Tasks Tab */}
          <TabsContent value="tasks" className="space-y-4">
            {tasks && tasks.length > 0 ? (
              <div className="space-y-4">
                {tasks.map((task) => (
                  <div
                    key={task.id}
                    className="cyber-card box-glow-purple p-6"
                  >
                    <div className="flex items-start justify-between mb-3">
                      <div>
                        <h3 className="text-lg font-bold neon-glow-pink">
                          {task.title}
                        </h3>
                        <p className="text-sm text-muted-foreground">
                          {task.description}
                        </p>
                      </div>
                      <span className="text-xs bg-accent/20 px-3 py-1 rounded-sm neon-glow-cyan">
                        {task.difficulty}
                      </span>
                    </div>
                    <div className="flex items-center justify-between pt-4 border-t border-accent">
                      <span className="text-sm neon-glow-purple">
                        +{task.rewardPoints} points
                      </span>
                      <Button className="btn-neon text-xs py-1">
                        View Details
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="cyber-card box-glow-cyan text-center py-12">
                <Zap className="w-12 h-12 mx-auto mb-4 opacity-50" />
                <p className="text-foreground/70">No tasks available</p>
              </div>
            )}
          </TabsContent>
        </Tabs>
      </main>
    </div>
  );
}
