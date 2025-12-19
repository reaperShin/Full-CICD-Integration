import { describe, it, expect, beforeEach, afterEach, jest } from "@jest/globals"
import * as connectionManager from "@/lib/connection-manager"

describe("ConnectionManager", () => {
  beforeEach(() => {
    connectionManager.connections.clear()
    connectionManager.pendingMessages.clear()
  })

  afterEach(() => {
    connectionManager.connections.clear()
    connectionManager.pendingMessages.clear()
  })

  describe("broadcastToMeeting - Correct Input Tests", () => {
    it("should broadcast message to all meeting connections", () => {
      // Mock controller
      const mockController = {
        enqueue: jest.fn(),
        close: jest.fn(),
      }

      const connectionKey = "meeting-123-peer-1"
      connectionManager.connections.set(connectionKey, {
        controller: mockController as any,
        peerId: "peer-1",
        isHost: true,
        lastSeen: Date.now(),
      })

      const message = { type: "user-joined", userId: "user-1" }
      const delivered = connectionManager.broadcastToMeeting("meeting-123", message)

      expect(delivered).toBe(1)
      expect(mockController.enqueue).toHaveBeenCalled()
    })

    it("should exclude specified peer from broadcast", () => {
      const mockController1 = { enqueue: jest.fn(), close: jest.fn() }
      const mockController2 = { enqueue: jest.fn(), close: jest.fn() }

      connectionManager.connections.set("meeting-123-peer-1", {
        controller: mockController1 as any,
        peerId: "peer-1",
        isHost: true,
        lastSeen: Date.now(),
      })

      connectionManager.connections.set("meeting-123-peer-2", {
        controller: mockController2 as any,
        peerId: "peer-2",
        isHost: false,
        lastSeen: Date.now(),
      })

      const message = { type: "message", content: "hello" }
      const delivered = connectionManager.broadcastToMeeting("meeting-123", message, "peer-1")

      expect(delivered).toBe(1)
      expect(mockController1.enqueue).not.toHaveBeenCalled()
      expect(mockController2.enqueue).toHaveBeenCalled()
    })

    it("should broadcast to multiple connections", () => {
      const mockControllers = [
        { enqueue: jest.fn(), close: jest.fn() },
        { enqueue: jest.fn(), close: jest.fn() },
        { enqueue: jest.fn(), close: jest.fn() },
      ]

      mockControllers.forEach((controller, i) => {
        connectionManager.connections.set(`meeting-123-peer-${i}`, {
          controller: controller as any,
          peerId: `peer-${i}`,
          isHost: i === 0,
          lastSeen: Date.now(),
        })
      })

      const message = { type: "broadcast-test" }
      const delivered = connectionManager.broadcastToMeeting("meeting-123", message)

      expect(delivered).toBe(3)
      mockControllers.forEach((controller) => {
        expect(controller.enqueue).toHaveBeenCalled()
      })
    })
  })
})
