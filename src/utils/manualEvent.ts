type PageNameType =
  | 'plan-list-page'
  | 'check-page'
  | 'reading-list-page'
  | 'days-add-page'
  | 'days-list-page'

type EventNameType =
  | ''
  | 'update plan list'
  | 'update check list'
  | 'update plan tab list'
  | 'update reading list'
  | 'update days category'
  | 'update days list'

class Events {
  constructor() {
    this.queue = new Map()
  }

  on(event: string, fn: (params?: Params) => void) {
    if (!this.queue.has(event)) {
      this.queue.set(event, [])
    }
    this.queue.get(event)!.push(fn)
  }

  off(event: string) {
    if (this.queue.has(event)) {
      this.queue.delete(event)
    }
  }

  trigger(event: string, params?: Params) {
    if (this.queue.has(event)) {
      this.queue.get(event)!.forEach(fn => fn(params))
    }
  }
}

class IndividualEvent {
  constructor() {
    this.isOnce = new Map()
    this.events = new Events()
    this.eventList = new Set()
  }

  on(event: EventNameType, fn: (params?: Params) => void) {
    this.isOnce.set(event, false)
    this.events.on(event, fn)
    this.eventList.add(event)
    return this
  }

  once(event: string, fn: (params?: Params) => void) {
    this.isOnce.set(event, true)
    this.events.on(event, fn)
    this.eventList.add(event)
    return this
  }

  off() {
    for (const event in this.eventList.values()) {
      this.events.off(event)
    }
    this.isOnce.clear()
    this.eventList.clear()
  }

  run(event: string, params?: Params) {
    this.events.trigger(event, params)
    if (this.isOnce.get(event)) {
      this.events.off(event)
      this.eventList.delete(event)
    }
  }
}

class ManualEvent {
  constructor() {
    this.flag = new Map()
    this.individuals = new Map()
  }

  register(id: PageNameType) {
    const ie = new IndividualEvent()
    /**
     * 要设置成数据啊,case
     * a -> b -> c
     * 在 c change(a,'event1')
     * 在 b change(a,'event2')
     * 不设置成数组的话，b event2 会冲掉 event1
     */
    this.flag.set(id, [])
    this.individuals.set(id, ie)
    return ie
  }

  clear(id: PageNameType) {
    this.flag.set(id, [])
  }

  reset(id: PageNameType) {
    this.flag.set(id, [])
    this.individuals.has(id) && this.individuals.get(id)!.off()
  }

  destroy() {
    this.flag.clear()
    this.individuals.clear()
  }

  change(id: PageNameType, event: EventNameType, params?: Params) {
    if (event) {
      const p = this.flag.get(id) || []
      this.flag.set(id, [
        ...p,
        {
          event,
          params
        }
      ])
    }
  }

  run(id: PageNameType) {
    const ie = this.individuals.get(id)
    if (this.individuals.has(id) && ie) {
      const flag = this.flag.get(id) || []
      for (let f of flag) {
        ie.run(f.event, f.params)
      }
    }
  }
}

export default new ManualEvent()

type Params = undefined | number | string | boolean | null | Record<string, any>

interface Events {
  queue: Map<string, Array<(params?) => void>>
}
interface IndividualEvent {
  isOnce: Map<string, boolean>
  events: Events
  eventList: Set<string>
}

interface ManualEvent {
  flag: Map<
    string,
    {
      event: string
      params: Params
    }[]
  >
  individuals: Map<string, IndividualEvent>
}
