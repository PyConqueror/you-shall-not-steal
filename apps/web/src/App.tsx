import { AppRouter } from "./router/AppRouter";
import { FlowStateProvider } from "./state/FlowStateContext";

export default function App() {
  return (
    <FlowStateProvider>
      <AppRouter />
    </FlowStateProvider>
  );
}
