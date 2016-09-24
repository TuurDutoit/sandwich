export function attachEvents(obj, events) {
  let keys = Object.keys(events);
  for(let i = 0, len = keys.length; i < len; i++) {
    let event = keys[i];
    let listeners = events[event];

    if(typeof listeners === "function") {
      obj.on(event, listeners);
    }
    else {
      listeners.forEach(listener => obj.on(event, listener));
    }
  }

  return obj;
}
