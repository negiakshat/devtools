import { afterEach, describe, expect, it, vi } from "vitest";
import worker from "../../../worker/index";

const assets = {
  fetch: vi.fn(async () => new Response("asset")),
};

afterEach(() => {
  vi.unstubAllGlobals();
  vi.clearAllMocks();
});

describe("Worker backend proxy", () => {
  it("forwards same-origin API requests to the configured HTTPS Render origin", async () => {
    const upstreamFetch = vi.fn(async () => new Response("proxied"));
    vi.stubGlobal("fetch", upstreamFetch);

    const response = await worker.fetch(
      new Request("https://devtools.work.gd/api/oauth/callback?code=example"),
      {
        ASSETS: assets,
        RENDER_ORIGIN: "https://backend.example.test",
      }
    );

    expect(response.status).toBe(200);
    expect(await response.text()).toBe("proxied");
    expect(upstreamFetch).toHaveBeenCalledTimes(1);
    expect((upstreamFetch.mock.calls[0][0] as Request).url).toBe(
      "https://backend.example.test/api/oauth/callback?code=example"
    );
  });

  it("returns a safe service-unavailable response until the origin is configured", async () => {
    const response = await worker.fetch(
      new Request("https://devtools.work.gd/api/oauth/callback"),
      { ASSETS: assets }
    );

    expect(response.status).toBe(503);
    expect(await response.text()).toBe("Backend service is unavailable.");
  });
});
