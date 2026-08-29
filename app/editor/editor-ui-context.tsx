'use client';

import { createContext, useContext, type ReactNode } from 'react';
import { editorUi, getEditorUi, type EditorUiCopy } from '@/lib/editor-ui-i18n';

const EditorUiContext = createContext<EditorUiCopy>(editorUi.es);

export function EditorUiProvider({ locale, children }: { locale?: string; children: ReactNode }) {
  return <EditorUiContext.Provider value={getEditorUi(locale)}>{children}</EditorUiContext.Provider>;
}

export function useEditorUi(): EditorUiCopy {
  return useContext(EditorUiContext);
}
