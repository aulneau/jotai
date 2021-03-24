import { useRef, useEffect } from 'react'
import { useAtom } from 'jotai'

function useAtomDevtools(anAtom, name) {
  let extension

  try {
    extension = window.__REDUX_DEVTOOLS_EXTENSION__
  } catch (_unused) {}

  if (!extension) {
    if (
      typeof process === 'object' &&
      process.env.NODE_ENV === 'development' &&
      typeof window !== 'undefined'
    ) {
      console.warn('Please install/enable Redux devtools extension')
    }
  }

  const [value, setValue] = useAtom(anAtom)
  const lastValue = useRef(value)
  const isTimeTraveling = useRef(false)
  const devtools = useRef()
  const atomName = name || anAtom.debugLabel || anAtom.toString()
  useEffect(() => {
    if (extension) {
      devtools.current = extension.connect({
        name: atomName,
      })
      const unsubscribe = devtools.current.subscribe((message) => {
        var _message$payload3

        if (message.type === 'DISPATCH' && message.state) {
          var _message$payload, _message$payload2

          if (
            ((_message$payload = message.payload) == null
              ? void 0
              : _message$payload.type) === 'JUMP_TO_ACTION' ||
            ((_message$payload2 = message.payload) == null
              ? void 0
              : _message$payload2.type) === 'JUMP_TO_STATE'
          ) {
            isTimeTraveling.current = true
          }

          setValue(JSON.parse(message.state))
        } else if (
          message.type === 'DISPATCH' &&
          ((_message$payload3 = message.payload) == null
            ? void 0
            : _message$payload3.type) === 'COMMIT'
        ) {
          var _devtools$current

          ;(_devtools$current = devtools.current) == null
            ? void 0
            : _devtools$current.init(lastValue.current)
        }
      })
      devtools.current.shouldInit = true
      return unsubscribe
    }
  }, [anAtom, extension, atomName, setValue])
  useEffect(() => {
    if (devtools.current) {
      lastValue.current = value

      if (devtools.current.shouldInit) {
        devtools.current.init(value)
        devtools.current.shouldInit = false
      } else if (isTimeTraveling.current) {
        isTimeTraveling.current = false
      } else {
        devtools.current.send(
          `${atomName} - ${new Date().toLocaleString()}`,
          value
        )
      }
    }
  }, [anAtom, extension, atomName, value])
}

export { useAtomDevtools }
