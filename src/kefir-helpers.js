import Kefir from 'kefir'

// function createEventStream(eventName, emitter) {
//   return _(eventName, emitter, message => [eventName, message, emitter])
// }
//
// export function multiEventStream(eventNames, emitter) {
//   const eventStreams = eventNames.map(n => createEventStream(n, emitter))
//   return _(eventStreams).merge()
// }

export function multiEventStream(emitter, eventNames) {
  return Kefir.merge(
    eventNames.map(eventName =>
      Kefir.fromEvents(emitter, eventName, value => [
        eventName,
        value,
        emitter,
      ]),
    ),
  )
}
