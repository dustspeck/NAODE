import React, { createContext, useContext } from 'react';
import { useEditor } from '../hooks/useEditor';
import { EditorContextType } from '../types';

const EditorContext = createContext<EditorContextType | undefined>(undefined);

export const EditorProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const editorState = useEditor();

  return (
    <EditorContext.Provider value={editorState}>
      {children}
    </EditorContext.Provider>
  );
};

export const useEditorContext = () => {
  const context = useContext(EditorContext);
  if (context === undefined) {
    throw new Error('useEditorContext must be used within an EditorProvider');
  }
  return context;
}; 