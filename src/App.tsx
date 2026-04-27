import LowcodeEditor from "./editor/HybridLowcodeEditor";
import GlobalDragPreview from "./editor/components/GlobalDragPreview";
import AIDialog from "./editor/components/AIDialog";

export default function App() {
  return (
    <>
      <LowcodeEditor />
      <GlobalDragPreview />
      <AIDialog />
    </>
  );
}
