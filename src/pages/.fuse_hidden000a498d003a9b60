import { useLocation, useParams } from "react-router-dom";
import { useAgentStream } from "@/hooks/useAgentStream";
import { useProjectStore, AgentMessage } from "@/store/projectStore";
import {
  ResizablePanel,
  ResizablePanelGroup,
  ResizableHandle,
} from "@/components/ui/resizable";
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@/components/ui/tabs";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { Code, Eye, AlertTriangle, MessageSquare, Cog } from "lucide-react";
import ReactMarkdown from 'react-markdown';
import rehypeRaw from 'rehype-raw';
import { LivePreview } from "@/components/LivePreview";

// This component is correct and has no issues.
const MissingPromptNotice = () => (
  <div className="flex flex-col items-center justify-center h-screen text-center p-4">
    <AlertTriangle className="w-12 h-12 text-yellow-500 mb-4" />
    <h2 className="text-xl font-semibold mb-2">No Initial Prompt Found</h2>
    <p className="text-muted-foreground max-w-md">
      This project space is ready, but the AI agent needs an initial prompt to start building.
    </p>
    <p className="text-muted-foreground max-w-md mt-2">
      Please start from the homepage to create a new project with a prompt.
    </p>
  </div>
);

// This component is correct and has no issues.
const AgentMessageBlock = ({ message }: { message: AgentMessage }) => {
  const isThinking = message.type === 'thinking';
  return (
    <div className={`p-3 bg-background rounded-md border text-sm ${isThinking ? 'border-blue-500/50' : ''}`}>
      <div className="flex items-center gap-2 mb-2 font-semibold text-foreground">
        {isThinking ? <Cog className="w-4 h-4 text-blue-500 animate-spin" /> : <MessageSquare className="w-4 h-4" />}
        <span>{isThinking ? "Thinking..." : "Agent"}</span>
      </div>
      <div className="prose prose-sm dark:prose-invert max-w-none text-muted-foreground">
        <ReactMarkdown rehypePlugins={[rehypeRaw]}>{message.content}</ReactMarkdown>
      </div>
    </div>
  );
};

const EditorPage = () => {
  // Get the projectId from the URL. This is reliable.
  const { projectId } = useParams();
  const location = useLocation();
  // Get the prompt passed via in-memory state. This is less reliable (gone on refresh).
  const initialPrompt = location.state?.prompt || null;

  // Subscribe to the state from our Zustand store. This part is correct.
  const messages = useProjectStore((state) => state.messages);
  const filesMap = useProjectStore((state) => state.files);
  const files = Array.from(filesMap.values());

  // Pass BOTH the initialPrompt and the projectId to the hook.
  // The hook will now have everything it needs to start the stream.
  useAgentStream(initialPrompt, projectId);

  if (!initialPrompt) {
    return <MissingPromptNotice />;
  }

  return (
    <div className="flex flex-col h-screen bg-secondary/40">
      <header className="p-3 border-b flex justify-between items-center bg-background shrink-0">
        <div className="flex items-center gap-2">
          <div className="w-6 h-6 bg-gradient-to-br from-primary to-secondary rounded-md"></div>
          <span className="font-semibold">OpenLovable / {projectId}</span>
        </div>
      </header>

      <ResizablePanelGroup direction="horizontal" className="flex-grow">
        <ResizablePanel defaultSize={40} minSize={25}>
          <div className="h-full p-4 overflow-y-auto">
            {messages.length > 0 ? (
              <div className="space-y-4">
                {messages.map((msg, index) => (
                  <AgentMessageBlock message={msg} key={index} />
                ))}
              </div>
            ) : (
              <p className="text-muted-foreground text-sm animate-pulse">Waiting for agent to respond...</p>
            )}
          </div>
        </ResizablePanel>

        <ResizableHandle withHandle />

        <ResizablePanel defaultSize={60} minSize={30}>
          <div className="h-full p-4">
            <Tabs defaultValue="code" className="h-full flex flex-col">
              <TabsList className="grid w-full grid-cols-2 shrink-0">
                <TabsTrigger value="code"><Code className="w-4 h-4 mr-2"/>Code</TabsTrigger>
                <TabsTrigger value="preview"><Eye className="w-4 h-4 mr-2"/>Preview</TabsTrigger>
              </TabsList>
              <TabsContent value="code" className="flex-grow mt-4 overflow-y-auto">
                 <Accordion type="multiple" className="w-full">
                    {files.map((file) => (
                      <AccordionItem value={file.path} key={file.path}>
                        <AccordionTrigger>{file.path}</AccordionTrigger>
                        <AccordionContent>
                          <pre className="p-2 bg-secondary rounded-md text-xs overflow-x-auto">
                            <code>{file.content}</code>
                          </pre>
                        </AccordionContent>
                      </AccordionItem>
                    ))}
                 </Accordion>
              </TabsContent>
              <TabsContent value="preview" className="flex-grow mt-4">
                 <div className="w-full h-full bg-background rounded-md border overflow-hidden">
                    <LivePreview />
                 </div>
              </TabsContent>
            </Tabs>
          </div>
        </ResizablePanel>
      </ResizablePanelGroup>
    </div>
  );
};

export default EditorPage;
