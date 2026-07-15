import React from "react";
import ReactDOM from "react-dom/client";
import App from "./App";
import "./styles/index.css";

class ErrorBoundary extends React.Component<{children: React.ReactNode}, {hasError: boolean, error: Error | null}> {
  constructor(props: {children: React.ReactNode}) {
    super(props);
    this.state = { hasError: false, error: null };
  }
  static getDerivedStateFromError(error: Error) {
    return { hasError: true, error };
  }
  render() {
    if (this.state.hasError) {
      return (
        <div style={{ color: "red", padding: "20px", background: "black", whiteSpace: "pre-wrap", wordBreak: "break-all" }}>
          <h2>React Crashed</h2>
          {this.state.error?.toString()}
          <br />
          {this.state.error?.stack}
        </div>
      );
    }
    return this.props.children;
  }
}

try {
  const bootScreen = document.getElementById("boot-screen");
  if (bootScreen) {
    bootScreen.style.display = "none";
  }

  ReactDOM.createRoot(document.getElementById("root")!).render(
    <React.StrictMode>
      <ErrorBoundary>
        <App />
      </ErrorBoundary>
    </React.StrictMode>,
  );
} catch (e: any) {
  const bootScreen = document.getElementById("boot-screen");
  if (bootScreen) bootScreen.style.display = "flex";
  const errBox = document.getElementById("error-box");
  if (errBox) {
    errBox.style.display = "block";
    errBox.textContent = "Boot error: " + (e?.stack || e);
  }
}
