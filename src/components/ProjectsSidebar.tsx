import { Button } from "@/components/ui/button";
import { Sidebar, SidebarContent, SidebarFooter, SidebarGroup, SidebarGroupContent, SidebarGroupLabel, SidebarHeader, SidebarMenu, SidebarMenuButton, SidebarMenuItem } from "@/components/ui/sidebar";
import { Card, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Trash2 } from "lucide-react";
import { Link } from "react-router-dom";
import { useProjects, Project } from "@/hooks/useProjects";

export const ProjectsSidebar = () => {
  const { projects, loading, deleteProject, refreshProjects } = useProjects();
  
  // Sort projects to display the most recently created ones first.
  const sortedProjects = projects.sort((a, b) => a.id.localeCompare(b.id));

  return (
    <Sidebar collapsible="icon" className="border-r">
      <SidebarHeader className="p-4">
        <h2 className="text-lg font-semibold">My Projects</h2>
      </SidebarHeader>
      
      <SidebarContent className="p-4">
        {/* Projects List */}
        <SidebarGroup>
          <SidebarGroupLabel>Your Projects</SidebarGroupLabel>
          <SidebarGroupContent>
            {loading ? (
              <div className="p-2 text-center">
                <div className="h-4 w-4 animate-spin rounded-full border border-primary/30 border-t-primary mx-auto"></div>
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