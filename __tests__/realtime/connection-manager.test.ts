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

  describe("broadcastToMeeting - Wrong Input Tests", () => {
    it("should return 0 when meeting has no connections", () => {
      const message = { type: "test" }
      const delivered = connectionManager.broadcastToMeeting("non-existent-meeting", message)

      expect(delivered).toBe(0)
    })

    it("should handle message delivery failure gracefully", () => {
      const mockController = {
        enqueue: jest.fn(() => {
          throw new Error("Connection closed")
        }),
        close: jest.fn(),
      }

      connectionManager.connections.set("meeting-123-peer-1", {
        controller: mockController as any,
        peerId: "peer-1",
        isHost: true,
        lastSeen: Date.now(),
      })

      const message = { type: "test" }
      const delivered = connectionManager.broadcastToMeeting("meeting-123", message)

      expect(delivered).toBe(0) // Connection should be removed after error
      expect(connectionManager.connections.size).toBe(0)
    })

    it("should handle null message gracefully", () => {
      const mockController = { enqueue: jest.fn(), close: jest.fn() }

      connectionManager.connections.set("meeting-123-peer-1", {
        controller: mockController as any,
        peerId: "peer-1",
        isHost: true,
        lastSeen: Date.now(),
      })

      const delivered = connectionManager.broadcastToMeeting("meeting-123", null)

      expect(typeof delivered).toBe("number")
    })

    it("should handle empty meeting ID", () => {
      const mockController = { enqueue: jest.fn(), close: jest.fn() }

      connectionManager.connections.set("-peer-1", {
        controller: mockController as any,
        peerId: "peer-1",
        isHost: true,
        lastSeen: Date.now(),
      })

      const message = { type: "test" }
      const delivered = connectionManager.broadcastToMeeting("", message)

      expect(delivered).toBeGreaterThanOrEqual(0)
    })
  })

  describe("Connection Management", () => {
    it("should store connection data correctly", () => {
      const mockController = { enqueue: jest.fn(), close: jest.fn() }
      const connectionKey = "meeting-123-peer-1"

      connectionManager.connections.set(connectionKey, {
        controller: mockController as any,
        peerId: "peer-1",
        isHost: true,
        lastSeen: Date.now(),
      })

      const connection = connectionManager.connections.get(connectionKey)

      expect(connection).toBeDefined()
      expect(connection?.peerId).toBe("peer-1")
      expect(connection?.isHost).toBe(true)
    })

    it("should update lastSeen timestamp on message delivery", () => {
      const mockController = { enqueue: jest.fn(), close: jest.fn() }
      const oldTime = Date.now() - 60000

      connectionManager.connections.set("meeting-123-peer-1", {
        controller: mockController as any,
        peerId: "peer-1",
        isHost: true,
        lastSeen: oldTime,
      })

      const message = { type: "test" }
      connectionManager.broadcastToMeeting("meeting-123", message)

      const connection = connectionManager.connections.get("meeting-123-peer-1")
      expect(connection?.lastSeen).toBeGreaterThan(oldTime)
    })
  })
})
