'use strict'

Object.defineProperty(exports, '__esModule', { value: true })

var xstate = require('xstate')
var jotai = require('jotai')

function _createForOfIteratorHelperLoose(o, allowArrayLike) {
  var it
  if (typeof Symbol === 'undefined' || o[Symbol.iterator] == null) {
    if (
      Array.isArray(o) ||
      (it = _unsupportedIterableToArray(o)) ||
      (allowArrayLike && o && typeof o.length === 'number')
    ) {
      if (it) o = it
      var i = 0
      return function () {
        if (i >= o.length) return { done: true }
        return { done: false, value: o[i++] }
      }
    }
    throw new TypeError(
      'Invalid attempt to iterate non-iterable instance.\nIn order to be iterable, non-array objects must have a [Symbol.iterator]() method.'
    )
  }
  it = o[Symbol.iterator]()
  return it.next.bind(it)
}

function _unsupportedIterableToArray(o, minLen) {
  if (!o) return
  if (typeof o === 'string') return _arrayLikeToArray(o, minLen)
  var n = Object.prototype.toString.call(o).slice(8, -1)
  if (n === 'Object' && o.constructor) n = o.constructor.name
  if (n === 'Map' || n === 'Set') return Array.from(o)
  if (n === 'Arguments' || /^(?:Ui|I)nt(?:8|16|32)(?:Clamped)?Array$/.test(n))
    return _arrayLikeToArray(o, minLen)
}

function _arrayLikeToArray(arr, len) {
  if (len == null || len > arr.length) len = arr.length
  for (var i = 0, arr2 = new Array(len); i < len; i++) {
    arr2[i] = arr[i]
  }
  return arr2
}

var __hasOwnProp = Object.prototype.hasOwnProperty
var __getOwnPropSymbols = Object.getOwnPropertySymbols
var __propIsEnum = Object.prototype.propertyIsEnumerable

var __rest = function __rest(source, exclude) {
  var target = {}

  for (var prop in source) {
    if (__hasOwnProp.call(source, prop) && exclude.indexOf(prop) < 0)
      target[prop] = source[prop]
  }

  if (source != null && __getOwnPropSymbols) {
    for (
      var _iterator = _createForOfIteratorHelperLoose(
          __getOwnPropSymbols(source)
        ),
        _step;
      !(_step = _iterator()).done;

    ) {
      var prop = _step.value
      if (exclude.indexOf(prop) < 0 && __propIsEnum.call(source, prop))
        target[prop] = source[prop]
    }
  }

  return target
}
function atomWithMachine(getMachine, options) {
  if (options === void 0) {
    options = {}
  }

  var _options = options,
    guards = _options.guards,
    actions = _options.actions,
    activities = _options.activities,
    services = _options.services,
    delays = _options.delays,
    interpreterOptions = __rest(options, [
      'guards',
      'actions',
      'activities',
      'services',
      'delays',
    ])

  var machineConfig = {
    guards: guards,
    actions: actions,
    activities: activities,
    services: services,
    delays: delays,
  }
  var cachedMachineAtom = jotai.atom(null)
  var machineAtom = jotai.atom(
    function (get) {
      var cachedMachine = get(cachedMachineAtom)

      if (cachedMachine) {
        return cachedMachine
      }

      var initializing = true
      var machine =
        typeof getMachine === 'function'
          ? getMachine(function (a) {
              if (initializing) {
                return get(a)
              }

              throw new Error('get not allowed after initialization')
            })
          : getMachine
      initializing = false
      var machineWithConfig = machine.withConfig(machineConfig, machine.context)
      var service = xstate.interpret(machineWithConfig, interpreterOptions)
      return {
        machine: machineWithConfig,
        service: service,
      }
    },
    function (get, set, _arg) {
      set(cachedMachineAtom, get(machineAtom))
    }
  )

  machineAtom.onMount = function (commit) {
    commit()
  }

  var cachedMachineStateAtom = jotai.atom(null)
  var machineStateAtom = jotai.atom(
    function (get) {
      var _a

      return (_a = get(cachedMachineStateAtom)) != null
        ? _a
        : get(machineAtom).machine.initialState
    },
    function (get, set, registerCleanup) {
      var _get = get(machineAtom),
        service = _get.service

      service.onTransition(function (nextState) {
        set(cachedMachineStateAtom, nextState)
      })
      service.start()
      registerCleanup(function () {
        service.stop()
      })
    }
  )

  machineStateAtom.onMount = function (initialize) {
    var unsub
    initialize(function (cleanup) {
      if (unsub === false) {
        cleanup()
      } else {
        unsub = cleanup
      }
    })
    return function () {
      if (unsub) {
        unsub()
      }

      unsub = false
    }
  }

  var machineStateWithServiceAtom = jotai.atom(
    function (get) {
      return get(machineStateAtom)
    },
    function (get, _set, event) {
      var _get2 = get(machineAtom),
        service = _get2.service

      service.send(event)
    }
  )
  return machineStateWithServiceAtom
}

exports.atomWithMachine = atomWithMachine
