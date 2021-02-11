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

  on(event, fn: () => void) {
    if (!this.queue.has(event)) {
      this.queue.set(event, [])
    }
    //@ts-ignore
    this.queue.get(event).push(fn)
  }

  off(event) {
    if (this.queue.has(event)) {
      this.queue.delete(event)
    }
  }

  trigger(event) {
    if (this.queue.has(event)) {
      //@ts-ignore
      this.queue.get(event).forEach(fn => fn())
    }
  }
}

class IndividualEvent {
  constructor() {
    this.isOnce = new Map()
    this.events = new Events()
    this.eventList = new Set()
  }

  on(event: EventNameType, fn: () => void) {
    this.isOnce.set(event, false)
    this.events.on(event, fn)
    this.eventList.add(event)
    return this
  }

  once(event: string, fn: () => void) {
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

  run(event: string) {
    this.events.trigger(event)
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
    this.flag.set(id, '')
    this.individuals.set(id, ie)
    return ie
  }

  clear(id: PageNameType) {
    this.change(id, '')
  }

  reset(id: PageNameType) {
    this.flag.set(id, '')
    //@ts-ignore
    this.individuals.has(id) && this.individuals.get(id).off()
  }

  destroy() {
    this.flag.clear()
    this.individuals.clear()
  }

  change(id: PageNameType, event: EventNameType) {
    if (!this.flag.get(id)) {
      console.warn(`未注册 ${id}`)
    }
    this.flag.set(id, event)
  }

  run(id: PageNameType) {
    if (!this.flag.get(id)) {
      console.warn(`未注册 ${id}`)
      return
    }
    this.individuals.has(id) &&
      this.flag.get(id) &&
      //@ts-ignore
      this.individuals.get(id).run(this.flag.get(id))
  }
}

export default new ManualEvent()

interface IndividualEvent {
  isOnce: Map<string, boolean>
  events: Events
  eventList: Set<string>
}

interface ManualEvent {
  flag: Map<string, string>
  individuals: Map<string, IndividualEvent>
}

interface Events {
  queue: Map<string, Array<() => void>>
}
