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

// The Header component remains unchanged.
const Header = () => (
  <header className="absolute top-0 left-0 right-0 p-4">
    <div className="container mx-auto flex justify-start items-center">
      <div className="flex items-center gap-2">
        <span className="text-xl font-bold">Open Lovable</span>
      </div>
    </div>
  </header>
);

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
    <div className="min-h-screen flex flex-col items-center w-full px-4 relative overflow-hidden">
      <Header />
      <main className="flex-grow flex flex-col items-center text-center w-full pt-20">
        <h1 className="text-5xl md-text-7xl font-bold tracking-tight mb-6 text-center">
          <div className="mt-2">
            Build something{' '}
            <span className="bg-gradient-to-br from-primary to-secondary bg-clip-text text-transparent">
              OpenLovable
            </span>
          </div>
        </h1>
        <p className="text-lg md-text-xl text-muted-foreground mb-12 max-w-2xl">
          Create applications and websites by describing them to an AI agent.
        </p>
        
        {/* Pass the `refreshProjects` function to the PromptInput component. */}
        <PromptInput onProjectCreate={refreshProjects} />
        
        <div className="mt-24 w-full max-w-4xl">
          <h2 className="text-2xl font-semibold mb-4 text-left">My Projects</h2>
          {loading ? (
            <div className="p-8 text-center">
              <Loader2 className="w-6 h-6 animate-spin mx-auto mb-2" />
              <p className="text-muted-foreground">Loading projects...</p>
            </div>
          ) : sortedProjects.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {sortedProjects.map((project) => (
                <Card key={project.id} className="text-left flex flex-col">
                  <CardHeader>
                    <CardTitle className="truncate text-lg" title={project.id}>
                      Project {project.id.slice(0, 8)}...
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="flex-grow">
                    <p className="text-sm text-muted-foreground">
                      Project ID: {project.id}
                    </p>
                  </CardContent>
                  <CardFooter className="flex justify-between items-center">
                    <div className="flex gap-2">
                      {/* Link to re-open the project editor */}
                      <Link to={`/project/${project.id}`}>
                        <Button variant="outline" size="sm">Open</Button>
                      </Link>
                      {/* Button to preview the project */}
                      <Button 
                        variant="outline" 
                        size="sm"
                        onClick={() => {
                          // Start preview and open in new tab
                          fetch(`http://localhost:3002/api/start-preview`, {
                            method: 'POST',
                            headers: { 'Content-Type': 'application/json' },
                            body: JSON.stringify({ projectId: project.id })
                          })
                          .then(res => res.json())
                          .then(data => {
                            if (data.success && data.port) {
                              setTimeout(() => {
                                window.open(`http://localhost:${data.port}`, '_blank');
                              }, 2000);
                            }
                          })
                          .catch(console.error);
                        }}
                      >
                        <Eye className="w-4 h-4 mr-1"/>Preview
                      </Button>
                    </div>
                    {/* Button to delete the project */}
                    <Button 
                      variant="destructive" 
                      size="icon"
                      className="w-8 h-8"
                      onClick={() => deleteProject(project.id)}
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </CardFooter>
                </Card>
              ))}
            </div>
          ) : (
            <div className="p-8 text-center border-2 border-dashed rounded-lg">
              <p className="text-muted-foreground">Your created projects will appear here.</p>
            </div>
          )}
        </div>
      </main>
      <footer className="w-full py-8 text-center">
        <p className="text-muted-foreground text-sm">Open Source · MIT License</p>
      </footer>
    </div>
  );
};

export default IndexPage;
