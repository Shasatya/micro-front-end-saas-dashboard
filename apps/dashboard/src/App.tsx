import { UploaderView } from "./components/UploaderView";

function App() {
  return (
    <div className="min-h-screen bg-bg-secondary p-8 font-sans">
      <h1 className="text-3xl font-bold mb-8 text-text-primary">
        Uploader Dashboard
      </h1>
      <UploaderView />
    </div>
  );
}

export default App;
