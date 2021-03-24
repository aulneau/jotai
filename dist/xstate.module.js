import { interpret } from 'xstate'
import { atom } from 'jotai'

function _objectWithoutPropertiesLoose(source, excluded) {
  if (source == null) return {}
  var target = {}
  var sourceKeys = Object.keys(source)
  var key, i

  for (i = 0; i < sourceKeys.length; i++) {
    key = sourceKeys[i]
    if (excluded.indexOf(key) >= 0) continue
    target[key] = source[key]
  }

  return target
}

function atomWithMachine(getMachine, options = {}) {
  const { guards, actions, activities, services, delays } = options,
    interpreterOptions = _objectWithoutPropertiesLoose(options, [
      'guards',
      'actions',
      'activities',
      'services',
      'delays',
    ])

  const machineConfig = {
    guards,
    actions,
    activities,
    services,
    delays,
  }
  const cachedMachineAtom = atom(null)
  const machineAtom = atom(
    (get) => {
      const cachedMachine = get(cachedMachineAtom)

      if (cachedMachine) {
        return cachedMachine
      }

      let initializing = true
      const machine =
        typeof getMachine === 'function'
          ? getMachine((a) => {
              if (initializing) {
                return get(a)
              }

              throw new Error('get not allowed after initialization')
            })
          : getMachine
      initializing = false
      const machineWithConfig = machine.withConfig(
        machineConfig,
        machine.context
      )
      const service = interpret(machineWithConfig, interpreterOptions)
      return {
        machine: machineWithConfig,
        service,
      }
    },
    (get, set, _arg) => {
      set(cachedMachineAtom, get(machineAtom))
    }
  )

  machineAtom.onMount = (commit) => {
    commit()
  }

  const cachedMachineStateAtom = atom(null)
  const machineStateAtom = atom(
    (get) => {
      var _get

      return (_get = get(cachedMachineStateAtom)) != null
        ? _get
        : get(machineAtom).machine.initialState
    },
    (get, set, registerCleanup) => {
      const { service } = get(machineAtom)
      service.onTransition((nextState) => {
        set(cachedMachineStateAtom, nextState)
      })
      service.start()
      registerCleanup(() => {
        service.stop()
      })
    }
  )

  machineStateAtom.onMount = (initialize) => {
    let unsub
    initialize((cleanup) => {
      if (unsub === false) {
        cleanup()
      } else {
        unsub = cleanup
      }
    })
    return () => {
      if (unsub) {
        unsub()
      }

      unsub = false
    }
  }

  const machineStateWithServiceAtom = atom(
    (get) => get(machineStateAtom),
    (get, _set, event) => {
      const { service } = get(machineAtom)
      service.send(event)
    }
  )
  return machineStateWithServiceAtom
}

export { atomWithMachine }
