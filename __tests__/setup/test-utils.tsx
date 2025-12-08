import React, { type ReactElement } from "react"
import { render as rtlRender, type RenderOptions, type RenderResult } from "@testing-library/react"

// 1. PROVIDER WRAPPER
// Add your Context Providers here (Theme, Redux, Router, etc.)
const AllTheProviders = ({ children }: { children: React.ReactNode }) => {
  return React.createElement(React.Fragment, null, children)
}

// 2. CUSTOM RENDERER
const customRender = (
  ui: ReactElement,
  options?: Omit<RenderOptions, "wrapper">
): RenderResult => {
  return rtlRender(ui, { wrapper: AllTheProviders, ...options })
}

// 3. RE-EXPORTS
// Re-export everything from RTL so you can import from this file directly
export * from "@testing-library/react"
export { customRender as render }

// 4. UTILITIES

// Helper to wait for loading states (Using 100ms as the default)
export const waitForLoadingToFinish = async (): Promise<void> => {
  return new Promise((resolve) => {
    setTimeout(resolve, 100)
  })
}

// Mock Response helper for fetch/API testing
export const createMockResponse = (
  data: unknown,
  options: { status?: number; ok?: boolean } = {}
): Response => {
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