import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Sidebar, SidebarContent, SidebarFooter, SidebarGroup, SidebarGroupContent, SidebarGroupLabel, SidebarHeader, SidebarMenu, SidebarMenuButton, SidebarMenuItem } from "@/components/ui/sidebar";
import { Card, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Loader2, Plus, Trash2 } from "lucide-react";
import { useNavigate, Link } from "react-router-dom";
import { v4 as uuidv4 } from 'uuid';
import axios, { isAxiosError } from 'axios';
import { useProjects, Project } from "@/hooks/useProjects";

export const ProjectsSidebar = () => {
  const { projects, loading, deleteProject, refreshProjects } = useProjects();
  const navigate = useNavigate();
  const [newProjectPrompt, setNewProjectPrompt] = useState('');
  const [model, setModel] = useState('gemini-2.0-flash');
  const [isLoading, setIsLoading] = useState(false);
  
  // Sort projects to display the most recently created ones first.
  const sortedProjects = projects.sort((a, b) => a.id.localeCompare(b.id));

  const handleCreateNewProject = async () => {
    if (!newProjectPrompt.trim() || isLoading) return;
    setIsLoading(true);
    
    try {
      // First, ask the AI to generate a project name based on the prompt
      const nameResponse = await axios.post('http://localhost:3002/api/generate-project-name', {
        prompt: newProjectPrompt
      });
      
      let projectName = nameResponse.data.name || 'project';
      // Sanitize the project name to be URL-friendly
      projectName = projectName
        .toLowerCase()
        .replace(/[^a-z0-9\s-]/g, '')  // Remove special characters
        .replace(/\s+/g, '-')          // Replace spaces with hyphens
        .replace(/-+/g, '-')           // Replace multiple hyphens with single
        .trim('-');                    // Remove leading/trailing hyphens
      
      // Generate a unique project ID
      const projectId = `${projectName}-${uuidv4().split('-')[0]}`;

      await axios.post('http://localhost:3002/api/create-project', {
        projectId,
        prompt: newProjectPrompt,
        model,
      });
      
      setNewProjectPrompt('');
      refreshProjects(); // Refresh the projects list
      navigate(`/project/${projectId}`, { state: { prompt: newProjectPrompt, model } });

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
    <Sidebar collapsible="icon" className="border-r">
      <SidebarHeader className="p-4">
        <h2 className="text-lg font-semibold">My Projects</h2>
      </SidebarHeader>
      
      <SidebarContent className="p-4">
        {/* New Project Creation Section */}
        <SidebarGroup>
          <SidebarGroupLabel>Create New Project</SidebarGroupLabel>
          <SidebarGroupContent>
            <div className="space-y-3">
              <Textarea
                placeholder="Describe the application you want to build..."
                className="w-full text-sm resize-none"
                rows={3}
                value={newProjectPrompt}
                onChange={(e) => setNewProjectPrompt(e.target.value)}
              />
              <Select value={model} onValueChange={setModel}>
                <SelectTrigger className="w-full">
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
              <Button 
                className="w-full" 
                onClick={handleCreateNewProject} 
                disabled={isLoading || !newProjectPrompt.trim()}
              >
                {isLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Plus className="w-4 h-4 mr-2" />}
                {isLoading ? "Creating..." : "Create Project"}
              </Button>
            </div>
          </SidebarGroupContent>
        </SidebarGroup>

        {/* Projects List */}
        <SidebarGroup>
          <SidebarGroupLabel>Your Projects</SidebarGroupLabel>
          <SidebarGroupContent>
            {loading ? (
              <div className="p-2 text-center">
                <Loader2 className="w-4 h-4 animate-spin mx-auto" />
              </div>
            ) : sortedProjects.length > 0 ? (
              <SidebarMenu className="gap-2">
                {sortedProjects.map((project) => (
                  <SidebarMenuItem key={project.id}>
                    <Card className="w-full">
                      <CardHeader className="p-3">
                        <CardTitle className="text-sm truncate" title={project.id}>
                          {project.id.includes('-') 
                            ? project.id.split('-').slice(0, -1).join('-') 
                            : project.id.slice(0, 12) + '...'}
                        </CardTitle>
                      </CardHeader>
                      <CardFooter className="p-3 pt-0 flex justify-between">
                        <Link to={`/project/${project.id}`}>
                          <Button variant="outline" size="sm">Open</Button>
                        </Link>
                        <Button 
                          variant="destructive" 
                          size="icon"
                          className="w-7 h-7"
                          onClick={() => deleteProject(project.id)}
                        >
                          <Trash2 className="w-3 h-3" />
                        </Button>
                      </CardFooter>
                    </Card>
                  </SidebarMenuItem>
                ))}
              </SidebarMenu>
            ) : (
              <div className="p-2 text-center text-sm text-muted-foreground">
                No projects yet
              </div>
            )}
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>
      
      <SidebarFooter className="p-4" />
    </Sidebar>
  );
};