import _ from 'highland'

function createEventStream(eventName, emitter) {
  return _(eventName, emitter, message => [eventName, message, emitter])
}

export function multiEventStream(eventNames, emitter) {
  const eventStreams = eventNames.map(n => createEventStream(n, emitter))
  return _(eventStreams).merge()
}
