import { useAuth } from "@/_core/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { useLocation } from "wouter";
import { getLoginUrl } from "@/const";
import { Zap, Users, Trophy, BookOpen, MessageSquare, Headphones } from "lucide-react";

export default function Home() {
  const { user, isAuthenticated } = useAuth();
  const [, setLocation] = useLocation();

  return (
    <div className="min-h-screen bg-background text-foreground grid-bg overflow-hidden">
      {/* Scan lines effect */}
      <div className="scan-lines" />

      {/* Navigation */}
      <nav className="border-b-2 border-accent bg-card/50 backdrop-blur-sm sticky top-0 z-40">
        <div className="container flex items-center justify-between py-4">
          <div className="flex items-center gap-2">
            <Zap className="w-8 h-8 neon-glow-pink" />
            <h1 className="text-2xl font-bold neon-glow-pink">StudentTimeHub</h1>
          </div>
          <div className="flex gap-4">
            {isAuthenticated ? (
              <>
                <Button
                  onClick={() => setLocation("/dashboard")}
                  className="btn-neon"
                >
                  Dashboard
                </Button>
                <div className="flex items-center gap-2 px-4 py-2 border-2 border-accent rounded-sm">
                  <span className="text-sm neon-glow-cyan">{user?.name}</span>
                </div>
              </>
            ) : (
              <a href={getLoginUrl()}>
                <Button className="btn-cyan">Login</Button>
              </a>
            )}
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="container py-20 md:py-32">
        <div className="grid md:grid-cols-2 gap-12 items-center">
          <div className="space-y-6">
            <h2 className="text-5xl md:text-6xl font-bold leading-tight">
              <span className="neon-glow-pink">Transform</span>
              <br />
              Your <span className="neon-glow-cyan">Learning</span>
              <br />
              <span className="neon-glow-purple">Journey</span>
            </h2>
            <p className="text-lg text-foreground/80 leading-relaxed">
              Join guilds, master trending skills, complete challenges, and earn rewards. Turn your downtime into opportunities for growth, collaboration, and achievement in a futuristic learning environment.
            </p>
            <div className="flex gap-4 pt-4">
              {isAuthenticated ? (
                <Button
                  onClick={() => setLocation("/dashboard")}
                  className="btn-neon text-lg"
                >
                  Enter Platform
                </Button>
              ) : (
                <a href={getLoginUrl()}>
                  <Button className="btn-neon text-lg">Get Started Now</Button>
                </a>
              )}
              <Button className="btn-cyan text-lg">Learn More</Button>
            </div>
          </div>

          {/* Animated HUD Box */}
          <div className="cyber-card box-glow-pink pulse-glow">
            <div className="space-y-4">
              <div className="flex items-center gap-3">
                <Trophy className="w-6 h-6 neon-glow-cyan" />
                <div>
                  <p className="text-sm text-muted-foreground">YOUR STATS</p>
                  <p className="text-2xl font-bold neon-glow-pink">Level 1</p>
                </div>
              </div>
              <div className="border-t border-accent pt-4 space-y-2">
                <div className="flex justify-between">
                  <span className="text-sm">Experience</span>
                  <span className="neon-glow-cyan">0 / 100 XP</span>
                </div>
                <div className="w-full bg-card rounded-sm h-2 border border-accent">
                  <div className="h-full bg-gradient-to-r from-pink-500 to-cyan-400 rounded-sm" style={{ width: "0%" }} />
                </div>
              </div>
              <div className="border-t border-accent pt-4">
                <p className="text-xs text-muted-foreground mb-2">ACTIVE GUILDS</p>
                <p className="text-lg neon-glow-purple">0 Guilds</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="container py-20 border-t-2 border-accent">
        <h2 className="text-4xl md:text-5xl font-bold text-center mb-16 neon-glow-cyan">
          Platform Features
        </h2>

        <div className="grid md:grid-cols-3 gap-8">
          {/* Feature 1 */}
          <div className="cyber-card box-glow-cyan hover:scale-105 transition-transform">
            <Users className="w-12 h-12 neon-glow-pink mb-4" />
            <h3 className="text-xl font-bold mb-3 neon-glow-pink">Guild System</h3>
            <p className="text-foreground/80">
              Form study groups with fellow students, collaborate on projects, and build a community around shared learning goals.
            </p>
          </div>

          {/* Feature 2 */}
          <div className="cyber-card box-glow-purple hover:scale-105 transition-transform">
            <BookOpen className="w-12 h-12 neon-glow-cyan mb-4" />
            <h3 className="text-xl font-bold mb-3 neon-glow-cyan">Skill Courses</h3>
            <p className="text-foreground/80">
              Explore trending fields like AI/ML, Web Development, Data Science, and Design with curated courses and learning paths.
            </p>
          </div>

          {/* Feature 3 */}
          <div className="cyber-card box-glow-pink hover:scale-105 transition-transform">
            <Trophy className="w-12 h-12 neon-glow-purple mb-4" />
            <h3 className="text-xl font-bold mb-3 neon-glow-purple">Gamification</h3>
            <p className="text-foreground/80">
              Earn points, unlock achievements, climb leaderboards, and compete with other students in a rewarding system.
            </p>
          </div>

          {/* Feature 4 */}
          <div className="cyber-card box-glow-cyan hover:scale-105 transition-transform">
            <MessageSquare className="w-12 h-12 neon-glow-pink mb-4" />
            <h3 className="text-xl font-bold mb-3 neon-glow-pink">Guild Chat</h3>
            <p className="text-foreground/80">
              Real-time collaboration with guild members through discussion boards, chat channels, and peer learning support.
            </p>
          </div>

          {/* Feature 5 */}
          <div className="cyber-card box-glow-purple hover:scale-105 transition-transform">
            <Zap className="w-12 h-12 neon-glow-cyan mb-4" />
            <h3 className="text-xl font-bold mb-3 neon-glow-cyan">AI Chatbot</h3>
            <p className="text-foreground/80">
              Get personalized study tips, practice questions, and learning resources powered by intelligent AI assistance.
            </p>
          </div>

          {/* Feature 6 */}
          <div className="cyber-card box-glow-pink hover:scale-105 transition-transform">
            <Headphones className="w-12 h-12 neon-glow-purple mb-4" />
            <h3 className="text-xl font-bold mb-3 neon-glow-purple">Audio Recording</h3>
            <p className="text-foreground/80">
              Record study sessions and lectures with automatic transcription for easy review and note-taking.
            </p>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="container py-20 border-t-2 border-accent">
        <div className="cyber-card box-glow-cyan text-center space-y-6">
          <h2 className="text-4xl font-bold neon-glow-pink">Ready to Level Up?</h2>
          <p className="text-lg text-foreground/80 max-w-2xl mx-auto">
            Join thousands of students transforming their learning experience. Start your journey today and unlock your full potential.
          </p>
          {isAuthenticated ? (
            <Button
              onClick={() => setLocation("/dashboard")}
              className="btn-neon text-lg"
            >
              Go to Dashboard
            </Button>
          ) : (
            <a href={getLoginUrl()}>
              <Button className="btn-neon text-lg">Sign Up Now</Button>
            </a>
          )}
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t-2 border-accent mt-20 py-8 bg-card/30">
        <div className="container text-center text-foreground/60">
          <p>© 2025 StudentTimeHub. Transform your learning journey.</p>
          <p className="text-sm mt-2">Powered by cutting-edge technology and community-driven learning.</p>
        </div>
      </footer>
    </div>
  );
}
