'use strict'

Object.defineProperty(exports, '__esModule', { value: true })

var react = require('react')
var jotai = require('jotai')

function useAtomDevtools(anAtom, name) {
  var extension

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

  var _useAtom = jotai.useAtom(anAtom),
    value = _useAtom[0],
    setValue = _useAtom[1]

  var lastValue = react.useRef(value)
  var isTimeTraveling = react.useRef(false)
  var devtools = react.useRef()
  var atomName = name || anAtom.debugLabel || anAtom.toString()
  react.useEffect(
    function () {
      if (extension) {
        devtools.current = extension.connect({
          name: atomName,
        })
        var unsubscribe = devtools.current.subscribe(function (message) {
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
    },
    [anAtom, extension, atomName, setValue]
  )
  react.useEffect(
    function () {
      if (devtools.current) {
        lastValue.current = value

        if (devtools.current.shouldInit) {
          devtools.current.init(value)
          devtools.current.shouldInit = false
        } else if (isTimeTraveling.current) {
          isTimeTraveling.current = false
        } else {
          devtools.current.send(
            atomName + ' - ' + new Date().toLocaleString(),
            value
          )
        }
      }
    },
    [anAtom, extension, atomName, value]
  )
}

exports.useAtomDevtools = useAtomDevtools
