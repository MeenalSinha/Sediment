import { describe, expect, it, vi } from "vitest";
import { csrfHeaderCheck } from "../src/middleware/csrf";
import { HttpError } from "../src/middleware/errorHandler";
import type { Request, Response } from "express";

function makeReq(method: string, header?: string): Request {
  return {
    method,
    get: (name: string) => (name.toLowerCase() === "x-sediment-client" ? header : undefined),
  } as unknown as Request;
}

describe("csrfHeaderCheck", () => {
  it("allows safe methods through regardless of headers", () => {
    const next = vi.fn();
    csrfHeaderCheck(makeReq("GET"), {} as Response, next);
    expect(next).toHaveBeenCalledWith();
  });

  it("allows a POST with the correct client header", () => {
    const next = vi.fn();
    csrfHeaderCheck(makeReq("POST", "web"), {} as Response, next);
    expect(next).toHaveBeenCalledWith();
  });

  it("rejects a POST missing the client header (likely cross-site)", () => {
    const next = vi.fn();
    csrfHeaderCheck(makeReq("POST"), {} as Response, next);
    expect(next).toHaveBeenCalledTimes(1);
    const err = next.mock.calls[0][0];
    expect(err).toBeInstanceOf(HttpError);
    expect((err as HttpError).status).toBe(403);
  });

  it("rejects a POST with an incorrect client header value", () => {
    const next = vi.fn();
    csrfHeaderCheck(makeReq("POST", "not-web"), {} as Response, next);
    const err = next.mock.calls[0][0];
    expect((err as HttpError).status).toBe(403);
  });

  it("rejects DELETE and PATCH without the header too", () => {
    for (const method of ["DELETE", "PATCH", "PUT"]) {
      const next = vi.fn();
      csrfHeaderCheck(makeReq(method), {} as Response, next);
      expect((next.mock.calls[0][0] as HttpError).status).toBe(403);
    }
  });
});
