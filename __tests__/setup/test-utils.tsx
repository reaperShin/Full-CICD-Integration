import React from "react"
import { render as rtlRender, type RenderOptions, type RenderResult } from "@testing-library/react"
import type { ReactElement } from "react"

const AllTheProviders = ({ children }: { children: React.ReactNode }) => {
  return React.createElement(React.Fragment, null, children)
}

const customRender = (ui: ReactElement, options?: Omit<RenderOptions, "wrapper">): RenderResult =>
  rtlRender(ui, { wrapper: AllTheProviders, ...options })

// Re-export everything from RTL
export * from "@testing-library/react"
export { customRender as render }

// Utility to wait for loading states
export const waitForLoadingToFinish = async (): Promise<void> => {
  return new Promise((resolve) => {
    setTimeout(resolve, 100)
  })
}


export const createMockResponse = (data: unknown, options: { status?: number; ok?: boolean } = {}): Response => {
  const status = options.status ?? 200
  return {
    ok: options.ok ?? status < 400,
    status,
    statusText: status < 400 ? "OK" : "Error",
    json: async () => data,
    text: async () => JSON.stringify(data),
    blob: async () => new Blob([JSON.stringify(data)]),
    arrayBuffer: async () => new ArrayBuffer(0),
    formData: async () => new FormData(),
    clone: function () {
      return this
    },
    headers: new Headers(),
    redirected: false,
    type: "basic" as const,
    url: "",
    body: null,
    bodyUsed: false,
  } as Response
}
