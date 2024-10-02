import { useEffect } from 'react';

export const useEventListener = <T extends HTMLElement>(eventType: string, callback: EventListenerOrEventListenerObject, element: T) => {
  useEffect(() => {
    element.addEventListener(eventType, callback);

    return () => {
      element.removeEventListener(eventType, callback);
    };
  }, [eventType, callback, element]);
}

export default useEventListener;