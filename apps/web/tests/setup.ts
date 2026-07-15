import { afterEach } from "vitest";
import { cleanup } from "@testing-library/react";
import "@testing-library/jest-dom/vitest";

// RTL normally auto-registers cleanup via a global `afterEach`, but this project keeps
// `test.globals: false` (explicit imports everywhere) rather than polluting the global
// namespace, so we wire it up by hand instead — otherwise DOM from one test leaks into
// the next test in the same file.
afterEach(() => cleanup());
