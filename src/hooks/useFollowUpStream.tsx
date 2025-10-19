import { useEffect, useRef } from 'react';
import { useStore } from 'zustand';
import { StreamingParser } from '@/lib/parser';
import { useProjectStore } from '@/store/projectStore';

// Get the actions once, outside the hook. They are stable.
const { addMessage, addOrUpdateFile, deleteFile, renameFile, clearState } = useProjectStore.getState();

export function useAgentStream(prompt: string | null, projectId: string | undefined) {
  const parserRef = useRef<StreamingParser | null>(null);

  useEffect(() => {
    // The effect will not run if either the prompt or projectId is missing.
    // It will automatically re-run when they become available.
    if (!prompt || !projectId) {
      return;
    }

    clearState();
    
    // Pass the stable actions and the now-available projectId to the parser.
    parserRef.current = new StreamingParser({ addMessage, addOrUpdateFile, deleteFile, renameFile }, projectId);

    const controller = new AbortController();
    const startStream = async () => {
      try {
        const response = await fetch('http://localhost:3002/api/generate', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ prompt, projectId }),
          signal: controller.signal,
        });
        if (!response.body) throw new Error('Response body is null.');
        const reader = response.body.getReader();
        const decoder = new TextDecoder();
        let partialLine = '';
        while (true) {
          const { done, value } = await reader.read();
          if (done) break;
          const decodedChunk = partialLine + decoder.decode(value);
          const lines = decodedChunk.split('\n\n');
          partialLine = lines.pop() || '';
          for (const line of lines) {
            if (line.startsWith('data: ')) {
              const dataString = line.substring(6).trim();
              if (dataString === '[DONE]') {
                partialLine = '';
                return;
              }
              try {
                const parsedData = JSON.parse(dataString);
                if (parsedData.text) {
                  parserRef.current?.parse(parsedData.text);
                }
              } catch (e) {
                console.log("Stream error >> ", e)
              }
            }
          }
        }
      } catch (err) {
        if ((err as Error).name !== 'AbortError') {
          console.error("Error fetching or processing stream:", err);
        }
      }
    };
    
    startStream();

    return () => { controller.abort(); };
    
  // The hook now correctly depends on both prompt and projectId.
  // It will fire as soon as both are defined.
  }, [prompt, projectId]);
}

export function useFollowUpStream() {
  const parserRef = useRef<StreamingParser | null>(null);

  const sendFollowUp = async (prompt: string, projectId: string) => {
    if (!projectId) {
      console.error("Project ID is required for follow-up prompts");
      return;
    }

    // Add the user's message to the store
    useProjectStore.getState().addMessage({
      type: 'narrative',
      content: `**User:** ${prompt}`
    });

    // Create a new parser for this follow-up
    parserRef.current = new StreamingParser(
      { 
        addMessage: useProjectStore.getState().addMessage,
        addOrUpdateFile: useProjectStore.getState().addOrUpdateFile,
        deleteFile: useProjectStore.getState().deleteFile,
        renameFile: useProjectStore.getState().renameFile
      }, 
      projectId
    );

    try {
      const response = await fetch('http://localhost:3002/api/follow-up', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ prompt, projectId }),
      });
      
      if (!response.body) throw new Error('Response body is null.');
      
      const reader = response.body.getReader();
      const decoder = new TextDecoder();
      let partialLine = '';
      
      while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        const decodedChunk = partialLine + decoder.decode(value);
        const lines = decodedChunk.split('\n\n');
        partialLine = lines.pop() || '';
        for (const line of lines) {
          if (line.startsWith('data: ')) {
            const dataString = line.substring(6).trim();
            if (dataString === '[DONE]') {
              partialLine = '';
              return;
            }
            try {
              const parsedData = JSON.parse(dataString);
              if (parsedData.text) {
                parserRef.current?.parse(parsedData.text);
              }
            } catch (e) {
              console.log("Follow-up stream error >> ", e);
            }
          }
        }
      }
    } catch (err) {
      console.error("Error fetching or processing follow-up stream:", err);
      useProjectStore.getState().addMessage({
        type: 'narrative',
        content: `**Error:** ${(err as Error).message}`
      });
    }
  };

  return { sendFollowUp };
}