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
  it('renders AR Drone Controller heading', () => {
    render(<App />)
    expect(screen.getByText('AR Drone Controller')).toBeDefined()
  })

  it('renders connection status', () => {
    render(<App />)
    expect(screen.getByText('Backend')).toBeDefined()
    expect(screen.getByText('Drone')).toBeDefined()
    expect(screen.getByText('Video')).toBeDefined()
  })

  it('renders telemetry section', () => {
    render(<App />)
    expect(screen.getByText('Telemetry Data')).toBeDefined()
    expect(screen.getByText('No telemetry data available')).toBeDefined()
  })

  it('has correct styling classes', () => {
    render(<App />)
    const header = screen.getByText('AR Drone Controller').closest('header')
    expect(header?.className).toContain('bg-gray-800')
  })
})