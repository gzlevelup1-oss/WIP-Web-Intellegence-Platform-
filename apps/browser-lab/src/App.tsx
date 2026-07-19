/*
 * Mission: M-009 Browser Laboratory Implementation
 * Owner: Execution
 */
import { SplitLayout } from './components/SplitLayout';
import { ChatPane } from './components/ChatPane';
import { FileViewer } from './components/FileViewer';
import { LabProvider } from './context/LabContext';
import './index.css';

export default function App() {
  return (
    <LabProvider>
      <div className="w-full h-screen bg-zinc-950 font-sans text-zinc-900 dark:text-zinc-100 antialiased selection:bg-blue-200 dark:selection:bg-blue-900">
        <SplitLayout
          leftPane={<ChatPane />}
          rightPane={<FileViewer />}
          defaultLeftWidth={360}
        />
      </div>
    </LabProvider>
  );
}
