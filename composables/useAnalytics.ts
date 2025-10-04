export const useAnalytics = () => {
  const { proxy } = useScriptClarity()

  const trackEvent = (eventName: string, params?: Record<string, unknown>) => {
    useTrackEvent(eventName, params)
    proxy.clarity('event', eventName)
  }

  return {
    trackEvent
  }
}
