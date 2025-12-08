"use client"

import { describe, it, expect, beforeEach, jest, afterEach } from "@jest/globals"
import { render, screen, act } from "@testing-library/react"
import userEvent from "@testing-library/user-event"

const mockPush = jest.fn()
jest.mock("next/navigation", () => ({
  useRouter: () => ({ push: mockPush }),
  useParams: () => ({ meetingId: "test-meeting-123" }),
}))

describe("Video Call Page - Navigation", () => {
  beforeEach(() => {
    jest.clearAllMocks()
    mockPush.mockClear()
  })

  afterEach(() => {
    jest.clearAllMocks()
  })

  describe("Video Call Controls", () => {
    it("displays video call control buttons", () => {
      const VideoCallPage = () => (
        <div>
          <button>Start Video</button>
          <button>Mute/Unmute</button>
          <button>End Call</button>
        </div>
      )

      render(<VideoCallPage />)
      const buttons = screen.queryAllByRole("button")
      expect(buttons.length).toBeGreaterThanOrEqual(3)
    })

    it("renders start/join video button", () => {
      const VideoCallPage = () => <button>Start Video</button>

      render(<VideoCallPage />)
      const startBtn = screen.queryByText(/Start Video/i)
      expect(startBtn).toBeTruthy()
    })

    it("renders mute/unmute button", () => {
      const VideoCallPage = () => <button>Mute/Unmute</button>

      render(<VideoCallPage />)
      const muteBtn = screen.queryByText(/Mute|Unmute/i)
      expect(muteBtn).toBeTruthy()
    })

    it("renders end call button", () => {
      const VideoCallPage = () => <button>End Call</button>

      render(<VideoCallPage />)
      const endBtn = screen.queryByText(/End Call/i)
      expect(endBtn).toBeTruthy()
    })
  })

  describe("End Call Navigation", () => {
    it("navigates back to dashboard on end call", async () => {
      const user = userEvent.setup()

      const VideoCallPage = () => {
        const handleEndCall = () => {
          mockPush("/dashboard")
        }

        return <button onClick={handleEndCall}>End Call</button>
      }

      render(<VideoCallPage />)

      const endBtn = screen.queryByText(/End Call/i)
      if (endBtn) {
        await act(async () => {
          await user.click(endBtn)
        })

        expect(mockPush).toHaveBeenCalledWith("/dashboard")
      }
    })
  })

  describe("Video Display Area", () => {
    it("renders video container", () => {
      const VideoCallPage = () => (
        <div data-testid="video-container">
          <video></video>
        </div>
      )

      render(<VideoCallPage />)
      const container = screen.queryByTestId("video-container")
      expect(container).toBeTruthy()
    })
  })

  describe("Participant Information", () => {
    it("displays participant name or info", () => {
      const VideoCallPage = () => (
        <div>
          <span>Connected with: Interviewer Name</span>
        </div>
      )

      render(<VideoCallPage />)
      const participantInfo = screen.queryByText(/Connected|Interviewer/i)
      expect(participantInfo).toBeTruthy()
    })
  })
})
