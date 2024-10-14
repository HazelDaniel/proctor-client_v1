import { ResizeEvent } from "node_modules/react-resizable-panels/dist/declarations/src/types";
import React from "react";

export interface EventHandlerFuncType<T extends Event> {
  (
    event: T | null,
    cb: (event: T | null, arg1?: any, arg2?: any, arg3?: any) => void,
  ): EventListenerOrEventListenerObject;
}

export const handleResize: EventHandlerFuncType<ResizeEvent> =
  (event, cb) => () => {
    return cb(event, window.innerWidth);
  };

export const handleKeyPress: EventHandlerFuncType<KeyboardEvent> =
  (event, cb: Function) => (event) => {
    if (!event) return;
    cb(event);
  };
