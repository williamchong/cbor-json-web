export const useAnalytics = () => {
  const trackEvent = (eventName: string, params?: Record<string, unknown>) => {
    useTrackEvent(eventName, params)
  }

  return {
    trackEvent
  }
}
