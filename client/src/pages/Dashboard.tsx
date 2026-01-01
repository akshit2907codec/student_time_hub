import { useAuth } from "@/_core/hooks/useAuth";
import { useLocation } from "wouter";
import { trpc } from "@/lib/trpc";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Users, BookOpen, Trophy, Zap, Plus, LogOut } from "lucide-react";
import { useEffect } from "react";

export default function Dashboard() {
  const { user, isAuthenticated, logout } = useAuth();
  const [, setLocation] = useLocation();

  // Fetch user stats
  const { data: stats } = trpc.user.getStats.useQuery(undefined, {
    enabled: isAuthenticated,
  });

  // Fetch user guilds
  const { data: guilds } = trpc.guilds.getUserGuilds.useQuery(undefined, {
    enabled: isAuthenticated,
  });

  // Fetch public guilds
  const { data: publicGuilds } = trpc.guilds.getPublic.useQuery({ limit: 10 });

  // Fetch skills
  const { data: skills } = trpc.skills.getAll.useQuery();

  // Fetch leaderboard
  const { data: topUsers } = trpc.leaderboard.getTopUsers.useQuery({ limit: 10 });

  useEffect(() => {
    if (!isAuthenticated) {
      setLocation("/");
    }
  }, [isAuthenticated, setLocation]);

  if (!isAuthenticated) {
    return null;
  }

  return (
    <div className="min-h-screen bg-background text-foreground grid-bg">
      <div className="scan-lines" />

      {/* Header */}
      <header className="border-b-2 border-accent bg-card/50 backdrop-blur-sm sticky top-0 z-40">
        <div className="container flex items-center justify-between py-4">
          <div className="flex items-center gap-4">
            <Zap className="w-8 h-8 neon-glow-pink" />
            <div>
              <h1 className="text-2xl font-bold neon-glow-pink">StudentTimeHub</h1>
              <p className="text-sm text-muted-foreground">Welcome, {user?.name}</p>
            </div>
          </div>
          <Button
            onClick={async () => {
              await logout();
              setLocation("/");
            }}
            className="btn-cyan"
          >
            <LogOut className="w-4 h-4 mr-2" />
            Logout
          </Button>
        </div>
      </header>

      {/* Main Content */}
      <main className="container py-8">
        {/* Stats Overview */}
        <div className="grid md:grid-cols-4 gap-4 mb-8">
          {/* Level Card */}
          <div className="cyber-card box-glow-pink">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs text-muted-foreground mb-1">LEVEL</p>
                <p className="text-3xl font-bold neon-glow-pink">{stats?.user?.level || 1}</p>
              </div>
              <Trophy className="w-8 h-8 neon-glow-pink opacity-50" />
            </div>
          </div>

          {/* Points Card */}
          <div className="cyber-card box-glow-cyan">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs text-muted-foreground mb-1">TOTAL POINTS</p>
                <p className="text-3xl font-bold neon-glow-cyan">{stats?.user?.totalPoints || 0}</p>
              </div>
              <Zap className="w-8 h-8 neon-glow-cyan opacity-50" />
            </div>
          </div>

          {/* Skills Card */}
          <div className="cyber-card box-glow-purple">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs text-muted-foreground mb-1">SKILLS</p>
                <p className="text-3xl font-bold neon-glow-purple">{stats?.skillsCount || 0}</p>
              </div>
              <BookOpen className="w-8 h-8 neon-glow-purple opacity-50" />
            </div>
          </div>

          {/* Achievements Card */}
          <div className="cyber-card box-glow-cyan">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs text-muted-foreground mb-1">ACHIEVEMENTS</p>
                <p className="text-3xl font-bold neon-glow-cyan">{stats?.achievementsCount || 0}</p>
              </div>
              <Trophy className="w-8 h-8 neon-glow-cyan opacity-50" />
            </div>
          </div>
        </div>

        {/* Tabs Section */}
        <Tabs defaultValue="guilds" className="space-y-6">
          <TabsList className="bg-card border-2 border-accent">
            <TabsTrigger value="guilds" className="data-[state=active]:neon-glow-pink">
              <Users className="w-4 h-4 mr-2" />
              My Guilds
            </TabsTrigger>
            <TabsTrigger value="skills" className="data-[state=active]:neon-glow-cyan">
              <BookOpen className="w-4 h-4 mr-2" />
              Skills
            </TabsTrigger>
            <TabsTrigger value="leaderboard" className="data-[state=active]:neon-glow-purple">
              <Trophy className="w-4 h-4 mr-2" />
              Leaderboard
            </TabsTrigger>
          </TabsList>

          {/* Guilds Tab */}
          <TabsContent value="guilds" className="space-y-4">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-2xl font-bold neon-glow-pink">My Guilds</h2>
              <Button className="btn-neon">
                <Plus className="w-4 h-4 mr-2" />
                Create Guild
              </Button>
            </div>

            {guilds && guilds.length > 0 ? (
              <div className="grid md:grid-cols-2 gap-4">
                {guilds.map((guild) => (
                  <div key={guild.id} className="cyber-card box-glow-cyan hover:scale-105 transition-transform cursor-pointer">
                    <div className="flex items-start justify-between mb-4">
                      <div>
                        <h3 className="text-xl font-bold neon-glow-pink">{guild.name}</h3>
                        <p className="text-sm text-muted-foreground">{guild.memberCount} members</p>
                      </div>
                      <span className="text-xs bg-accent/20 px-3 py-1 rounded-sm neon-glow-cyan">
                        Level {guild.level}
                      </span>
                    </div>
                    {guild.description && (
                      <p className="text-sm text-foreground/70 mb-4">{guild.description}</p>
                    )}
                    <div className="flex justify-between items-center pt-4 border-t border-accent">
                      <span className="text-sm neon-glow-purple">{guild.totalPoints} points</span>
                      <Button className="btn-cyan text-xs py-1">View</Button>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="cyber-card box-glow-purple text-center py-12">
                <Users className="w-12 h-12 mx-auto mb-4 opacity-50" />
                <p className="text-foreground/70 mb-4">You haven't joined any guilds yet</p>
                <Button className="btn-neon">Browse Guilds</Button>
              </div>
            )}

            {/* Browse Public Guilds */}
            <div className="mt-12">
              <h3 className="text-2xl font-bold neon-glow-cyan mb-6">Discover Guilds</h3>
              {publicGuilds && publicGuilds.length > 0 ? (
                <div className="grid md:grid-cols-3 gap-4">
                  {publicGuilds.slice(0, 6).map((guild) => (
                    <div key={guild.id} className="cyber-card box-glow-pink hover:scale-105 transition-transform cursor-pointer">
                      <h4 className="text-lg font-bold neon-glow-pink mb-2">{guild.name}</h4>
                      <p className="text-sm text-muted-foreground mb-4">{guild.memberCount} members</p>
                      <Button className="btn-cyan w-full text-xs">Join Guild</Button>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-foreground/70">No public guilds available</p>
              )}
            </div>
          </TabsContent>

          {/* Skills Tab */}
          <TabsContent value="skills" className="space-y-4">
            <h2 className="text-2xl font-bold neon-glow-cyan mb-6">Available Skills</h2>
            {skills && skills.length > 0 ? (
              <div className="grid md:grid-cols-3 gap-4">
                {skills.map((skill) => (
                  <div key={skill.id} className="cyber-card box-glow-purple hover:scale-105 transition-transform cursor-pointer">
                    <h3 className="text-lg font-bold neon-glow-purple mb-2">{skill.name}</h3>
                    <p className="text-sm text-muted-foreground mb-3">{skill.category}</p>
                    <p className="text-xs text-foreground/70 mb-4">{skill.description}</p>
                    <div className="flex justify-between items-center">
                      <span className="text-xs bg-accent/20 px-2 py-1 rounded-sm neon-glow-cyan">
                        {skill.difficulty}
                      </span>
                      <Button className="btn-neon text-xs py-1">Enroll</Button>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-foreground/70">No skills available</p>
            )}
          </TabsContent>

          {/* Leaderboard Tab */}
          <TabsContent value="leaderboard" className="space-y-4">
            <h2 className="text-2xl font-bold neon-glow-purple mb-6">Top Contributors</h2>
            {topUsers && topUsers.length > 0 ? (
              <div className="space-y-2">
                {topUsers.map((entry, idx) => (
                  <div key={entry.id} className="cyber-card box-glow-cyan flex items-center justify-between p-4">
                    <div className="flex items-center gap-4">
                      <span className="text-2xl font-bold neon-glow-pink w-8">#{entry.rank}</span>
                      <div>
                        <p className="font-bold neon-glow-cyan">User #{entry.userId}</p>
                        <p className="text-sm text-muted-foreground">Level {entry.level}</p>
                      </div>
                    </div>
                    <span className="text-2xl font-bold neon-glow-purple">{entry.points}</span>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-foreground/70">No leaderboard data available</p>
            )}
          </TabsContent>
        </Tabs>
      </main>
    </div>
  );
}
