type PageNameType = 'plan-list-page' | 'check-page' | 'reading-list-page'

type EventNameType =
  | ''
  | 'update plan list'
  | 'update check list'
  | 'update plan tab list'
  | 'update reading list'

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
    this.flag.set(id, { event: '', params: undefined })
    this.individuals.set(id, ie)
    return ie
  }

  clear(id: PageNameType) {
    this.change(id, '', undefined)
  }

  reset(id: PageNameType) {
    this.flag.set(id, { event: '', params: undefined })
    this.individuals.has(id) && this.individuals.get(id)!.off()
  }

  destroy() {
    this.flag.clear()
    this.individuals.clear()
  }

  change(id: PageNameType, event: EventNameType, params?: Params) {
    this.flag.set(id, {
      event,
      params
    })
  }

  run(id: PageNameType) {
    this.individuals.has(id) &&
      this.individuals
        .get(id)!
        .run(this.flag.get(id)!?.event, this.flag.get(id)!?.params)
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
    }
  >
  individuals: Map<string, IndividualEvent>
}
