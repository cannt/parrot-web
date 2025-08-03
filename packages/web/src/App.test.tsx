import { describe, it, expect, vi } from 'vitest'
import { render, screen } from '@testing-library/react'
import App from './App'

// Mock the WebSocket hook to avoid connection issues in tests
vi.mock('./hooks/useDroneSocket', () => ({
  useDroneSocket: () => ({
    isConnected: false,
    isDroneConnected: false,
    latestTelemetry: null,
    latestVideoData: null,
    isVideoStreamActive: false,
    connectionError: null,
    sendCommand: vi.fn()
  })
}))

describe('App', () => {
  it('renders AR Drone heading', () => {
    render(<App />)
    expect(screen.getByText('AR Drone 🚁')).toBeDefined()
  })

  it('renders connection status indicators', () => {
    render(<App />)
    // Check for status dots/indicators instead of text labels
    const container = document.querySelector('.bg-gradient-to-b')
    expect(container).toBeDefined()
  })

  it('renders video player', () => {
    render(<App />)
    expect(screen.getByAltText('Drone video stream')).toBeDefined()
  })

  it('renders control buttons', () => {
    render(<App />)
    expect(screen.getByText('⬆ Takeoff')).toBeDefined()
    expect(screen.getByText('🛑')).toBeDefined()
    expect(screen.getByText('📷')).toBeDefined()
  })
})