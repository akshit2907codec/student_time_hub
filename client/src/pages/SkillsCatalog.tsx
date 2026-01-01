import { useAuth } from "@/_core/hooks/useAuth";
import { useLocation } from "wouter";
import { trpc } from "@/lib/trpc";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { BookOpen, ArrowLeft, Zap } from "lucide-react";
import { useState } from "react";

const SKILL_CATEGORIES = [
  "AI/ML",
  "Web Development",
  "Data Science",
  "Design",
  "Mobile Development",
  "Cloud Computing",
];

export default function SkillsCatalog() {
  const { isAuthenticated } = useAuth();
  const [, setLocation] = useLocation();
  const [selectedCategory, setSelectedCategory] = useState("AI/ML");

  // Fetch all skills
  const { data: allSkills } = trpc.skills.getAll.useQuery();

  // Fetch skills by category
  const { data: categorySkills } = trpc.skills.getByCategory.useQuery({
    category: selectedCategory,
  });

  // Fetch user skills
  const { data: userSkills } = trpc.skills.getUserSkills.useQuery(undefined, {
    enabled: isAuthenticated,
  });

  // Enroll mutation
  const enrollMutation = trpc.skills.enrollSkill.useMutation({
    onSuccess: () => {
      // Refetch user skills
    },
  });

  const isEnrolled = (skillId: number) => {
    return userSkills?.some((s) => s.skillId === skillId);
  };

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
            <h1 className="text-2xl font-bold neon-glow-pink">Skill Catalog</h1>
            <p className="text-sm text-muted-foreground">
              Explore trending skills and courses
            </p>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="container py-8">
        {/* Overview */}
        <div className="cyber-card box-glow-cyan mb-8">
          <div className="grid md:grid-cols-3 gap-6">
            <div>
              <p className="text-xs text-muted-foreground mb-1">TOTAL SKILLS</p>
              <p className="text-3xl font-bold neon-glow-pink">{allSkills?.length || 0}</p>
            </div>
            <div>
              <p className="text-xs text-muted-foreground mb-1">YOUR SKILLS</p>
              <p className="text-3xl font-bold neon-glow-cyan">{userSkills?.length || 0}</p>
            </div>
            <div>
              <p className="text-xs text-muted-foreground mb-1">CATEGORIES</p>
              <p className="text-3xl font-bold neon-glow-purple">
                {SKILL_CATEGORIES.length}
              </p>
            </div>
          </div>
        </div>

        {/* Category Tabs */}
        <Tabs value={selectedCategory} onValueChange={setSelectedCategory}>
          <TabsList className="bg-card border-2 border-accent w-full justify-start overflow-x-auto">
            {SKILL_CATEGORIES.map((category) => (
              <TabsTrigger
                key={category}
                value={category}
                className="data-[state=active]:neon-glow-pink"
              >
                {category}
              </TabsTrigger>
            ))}
          </TabsList>

          {SKILL_CATEGORIES.map((category) => (
            <TabsContent key={category} value={category} className="space-y-6 mt-6">
              <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                {categorySkills && categorySkills.length > 0 ? (
                  categorySkills.map((skill) => (
                    <div
                      key={skill.id}
                      className="cyber-card box-glow-purple hover:scale-105 transition-transform"
                    >
                      <div className="flex items-start justify-between mb-4">
                        <div>
                          <h3 className="text-lg font-bold neon-glow-pink">
                            {skill.name}
                          </h3>
                          <p className="text-xs text-muted-foreground">
                            {skill.category}
                          </p>
                        </div>
                        {isEnrolled(skill.id) && (
                          <span className="text-xs bg-green-500/20 px-2 py-1 rounded-sm text-green-400">
                            Enrolled
                          </span>
                        )}
                      </div>

                      {skill.description && (
                        <p className="text-sm text-foreground/70 mb-4">
                          {skill.description}
                        </p>
                      )}

                      <div className="flex items-center justify-between pt-4 border-t border-accent">
                        <span className="text-xs bg-accent/20 px-2 py-1 rounded-sm neon-glow-cyan">
                          {skill.difficulty}
                        </span>
                        <Button
                          onClick={() =>
                            enrollMutation.mutateAsync({ skillId: skill.id })
                          }
                          disabled={isEnrolled(skill.id)}
                          className={
                            isEnrolled(skill.id) ? "btn-cyan opacity-50" : "btn-neon"
                          }
                        >
                          {isEnrolled(skill.id) ? "Enrolled" : "Enroll"}
                        </Button>
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="col-span-full cyber-card box-glow-cyan text-center py-12">
                    <BookOpen className="w-12 h-12 mx-auto mb-4 opacity-50" />
                    <p className="text-foreground/70">
                      No skills available in this category yet
                    </p>
                  </div>
                )}
              </div>
            </TabsContent>
          ))}
        </Tabs>

        {/* Your Skills Section */}
        {isAuthenticated && userSkills && userSkills.length > 0 && (
          <div className="mt-12 pt-12 border-t-2 border-accent">
            <h2 className="text-2xl font-bold neon-glow-cyan mb-6">Your Skills</h2>
            <div className="grid md:grid-cols-3 gap-4">
              {userSkills.map((userSkill) => (
                <div
                  key={userSkill.id}
                  className="cyber-card box-glow-cyan"
                >
                  <div className="flex items-center justify-between mb-4">
                    <p className="font-bold neon-glow-pink">Skill #{userSkill.skillId}</p>
                    <span className="text-xs bg-accent/20 px-2 py-1 rounded-sm neon-glow-purple">
                      {userSkill.proficiency}
                    </span>
                  </div>
                  <div className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span className="text-muted-foreground">Progress</span>
                      <span className="neon-glow-cyan">{userSkill.progress}%</span>
                    </div>
                    <div className="w-full bg-card rounded-sm h-2 border border-accent">
                      <div
                        className="h-full bg-gradient-to-r from-pink-500 to-cyan-400 rounded-sm"
                        style={{ width: `${userSkill.progress}%` }}
                      />
                    </div>
                  </div>
                  <p className="text-xs text-muted-foreground mt-4">
                    Enrolled {new Date(userSkill.enrolledAt).toLocaleDateString()}
                  </p>
                </div>
              ))}
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
