import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { ArrowUp, Loader2, Trash2, Eye } from "lucide-react";
import { useNavigate, Link } from "react-router-dom";
import { v4 as uuidv4 } from 'uuid';
import axios, { isAxiosError } from 'axios';
import { useProjects, Project } from "@/hooks/useProjects";
import { formatDistanceToNow } from 'date-fns';
import { SidebarProvider, SidebarInset, SidebarTrigger } from "@/components/ui/sidebar";
import { ProjectsSidebar } from "@/components/ProjectsSidebar";



// The PromptInput component is updated to refresh projects after creation.
const PromptInput = ({ onProjectCreate }: { onProjectCreate: () => void }) => {
  const [prompt, setPrompt] = useState('');
  const [model, setModel] = useState('gemini-2.0-flash');
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();

  const handleSubmit = async () => {
    if (!prompt.trim() || isLoading) return;
    setIsLoading(true);
    const projectId = uuidv4();

    try {
      await axios.post('http://localhost:3002/api/create-project', {
        projectId,
        prompt,
        model,
      });
      
      onProjectCreate(); // Refresh the projects list
      navigate(`/project/${projectId}`, { state: { prompt, model } });

    } catch (error) {
      console.error("Project creation failed:", error);
      let errorMessage = 'An unknown error occurred.';
      if (isAxiosError(error)) {
        errorMessage = error.response?.data?.message || error.message;
      } else if (error instanceof Error) {
        errorMessage = error.message;
      }
      alert(`Project Setup Failed: ${errorMessage}`);
      setIsLoading(false);
    }
  };

  return (
    <div className="w-full max-w-2xl mx-auto">
      <div className="relative rounded-2xl bg-secondary/50 backdrop-blur-md border border-border/30 p-4 shadow-2xl">
        <Textarea
          placeholder="Describe the application you want to build..."
          className="w-full bg-transparent border-none text-md resize-none p-0 pr-12"
          rows={1}
          value={prompt}
          onChange={(e) => setPrompt(e.target.value)}
          onKeyDown={(e) => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); handleSubmit(); } }}
        />
        <div className="flex items-center justify-between mt-3">
          <Select value={model} onValueChange={setModel}>
            <SelectTrigger className="w-48">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="gemini-2.0-flash">
                <div className="flex items-center gap-2">
                  Gemini 2.0 Flash
                </div>
              </SelectItem>
              <SelectItem value="gemini-2.5-flash">
                <div className="flex items-center gap-2">
                  Gemini 2.5 Flash
                </div>
              </SelectItem>
              <SelectItem value="gemini-2.5-pro">Gemini 2.5 Pro</SelectItem>
            </SelectContent>
          </Select>
          <Button size="icon" className="w-9 h-9" onClick={handleSubmit} disabled={isLoading}>
            {isLoading ? <Loader2 className="w-5 h-5 animate-spin" /> : <ArrowUp className="w-5 h-5" />}
          </Button>
        </div>
      </div>
    </div>
  );
};

const IndexPage = () => {
  // Use our custom hook to get the list of projects and the functions to manage them.
  const { projects, loading, deleteProject, refreshProjects } = useProjects();
  
  // Sort projects to display the most recently created ones first.
  const sortedProjects = projects.sort((a, b) => a.id.localeCompare(b.id));

  return (
    <SidebarProvider>
      <ProjectsSidebar />
      <SidebarInset>
        <div className="min-h-screen w-full overflow-hidden">
          <header className="sticky top-0 z-10 flex h-16 items-center gap-4 border-b bg-background px-4">
            <SidebarTrigger />
            <div className="flex items-center gap-2">
              <span className="text-xl font-bold">Dira-Tak-Builder</span>
            </div>
          </header>
          <main className="flex flex-1 flex-col gap-4 p-4 items-center">
            <div className="text-center mb-8">
              <h1 className="text-5xl md-text-7xl font-bold tracking-tight">
                <div className="mt-2">
                  Build something{' '}
                  <span className="bg-gradient-to-br from-primary to-secondary bg-clip-text text-transparent">
                    Dira-Tak-Builder
                  </span>
                </div>
              </h1>
              <p className="text-lg md-text-xl text-muted-foreground mt-4 max-w-2xl">
                Create applications and websites by describing them to an AI agent.
              </p>
            </div>
            
            {/* Pass the `refreshProjects` function to the PromptInput component. */}
            <PromptInput onProjectCreate={refreshProjects} />
          </main>
          <footer className="w-full py-8 text-center">
          </footer>
        </div>
      </SidebarInset>
    </SidebarProvider>
  );
};

export default IndexPage;
