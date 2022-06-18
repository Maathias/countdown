import availableModules from './modules'

const { REACT_APP_WS_SERVER } = process.env

export type listener = (chunk: any) => void

export type listeners = {
	[key: string]: listener[]
}

export type sync = {
	begin: number
	end: number
	rtt: number
	ping: number
	diff: number // time difference
	offset: number // corrected time difference
}

export interface outload {
	type?: string
	flag?: string
	[key: string]: any
}

export interface incomingPayload {
	type: string
	time: number
	id: string
	flag?: string
	[key: string]: any
}

export type module = {
	label: string
	socket: Socket
	receive: (chunk: incomingPayload) => void
	send?: (...any: any) => void
	welcome?: () => outload | boolean
	[prop: string]: any
}

type modules = { [label: string]: module }

class Socket {
	ws!: WebSocket
	pending: outload[]
	subscribed: { [keys: string]: number }
	retries: number // reconnect attempts
	events: listeners

	id: string | null // connection id

	modules: modules

	ready: boolean

	constructor(listeners?: listeners) {
		this.ready = false

		this.pending = []

		this.subscribed = {
			chat: 0,
		}

		this.retries = 0

		this.id = null

		// this.modules = {
		// 	sync: sync
		// }

		this.modules = availableModules.reduce((mods: modules, mod: module) => {
			mod.socket = this
			mods[mod.label] = mod
			return mods
		}, {})

		this.events = {}

		for (let name in listeners)
			for (let listener of listeners[name]) this.addListener([name], listener)

		// this.addListener(['info'], ({ version, id }) => {
		// 	this.id = id

		// 	console.info(id)
		// })

		this.open()
	}

	addListener(names: string[], callback: listener): [string, number][] {
		let ids: [string, number][] = []

		for (let name of names) {
			if (!Array.isArray(this.events[name])) this.events[name] = []

			ids.push([name, this.events[name].push(callback) - 1])
		}

		return ids
	}

	removeListener(ids: [string, number][]) {
		for (let [name, i] of ids) {
			this.events[name].splice(i, 1)
		}
	}

	triggerEvent(names: string[], payload: any) {
		let count = 0
		for (let name of names) {
			if (typeof this.events[name] !== 'undefined')
				for (let callback of this.events[name]) {
					callback(payload)
					count++
				}
		}
		return count
	}

	open() {
		if (typeof REACT_APP_WS_SERVER != 'string')
			return console.error(
				`Invalid REACT_APP_WS_SERVER, cannot connect, aborting socket`
			)

		this.ws = new WebSocket(REACT_APP_WS_SERVER)

		this.ws.onopen = () => {
			console.info(`Socket connected`)

			for (let payload of this.pending) {
				this.send(payload)
			}

			Object.keys(this.modules)
				.map((label) => this.modules[label].welcome && label)
				.filter((label) => label)
				.map((label) => [label!, this.modules[label!].welcome!()])
				.filter(([, payload]) => payload)
				.forEach(([label, payload]) =>
					this.send(payload as outload, label as string)
				)

			if (this.retries > 0) {
				this.retries = 0
				this.triggerEvent(['onChatReceive'], {
					nick: 'local',
					role: 'root',
					content: 'Połączono ✔️',
				})
			}

			this.modules.count.send!(window.document.visibilityState === 'visible')
		}

		this.ws.onclose = ({ code, reason }) => {
			console.info(`Socket disconnected`, code, reason)

			this.triggerEvent(['onSocketDisconnect'], this.ws.readyState)
			this.triggerEvent(['onChatReceive'], {
				nick: 'local',
				role: 'root',
				content: `Rozłączono ❌ ${reason}`,
			})

			this.modules.sync.sync.ping = -1

			if (code !== 4003) this.reopen()
		}

		this.ws.onmessage = (e) => {
			let data: incomingPayload[] = JSON.parse(e.data)

			// wrap in an array anyways
			if (!Array.isArray(data)) data = [data]

			console.debug(
				`Receiving`,
				`[${data.map(({ type }) => type).join(' ')}]`,
				data
			)

			for (let chunk of data) {
				let { type } = chunk

				let module = this.modules[type]

				if (module) module.receive(chunk)
				this.triggerEvent([type], chunk)
			}
		}

		this.ready = true
	}

	reopen() {
		if (this.ws.readyState === WebSocket.OPEN) return

		if (this.retries > 5) {
			console.info(`Socket stopped, too many reconnect attempts`)
		} else
			setTimeout(() => {
				console.info(`Socket attempting reconnect, #${this.retries + 1}`)
				this.retries++
				this.open()
			}, 4e3)
	}

	send(object: outload, type?: string) {
		if (!this.ready) return console.error(`ws not ready, aborting send`)

		type && (object.type = type)

		// add to queue if disconnected
		if (this.ws.readyState !== WebSocket.OPEN) {
			console.debug('Pending', object)
			return this.pending.push(object)
		}

		this.ws.send(JSON.stringify(object))
		console.debug(`Sending`, object)
	}

	subscribe(type: string) {
		// set to default if undefined
		if (typeof this.subscribed[type] == 'undefined') this.subscribed[type] = 0

		// subscribe if its the first listener
		if (this.subscribed[type] < 1)
			this.send(
				{
					subscribe: true,
				},
				type
			)

		// increase nr of listeners
		this.subscribed[type]++
	}

	unsubscribe(type: string) {
		// set to default if undefined
		if (typeof this.subscribed[type] == 'undefined')
			return (this.subscribed[type] = 0)

		// decrease if possible
		if (this.subscribed[type] > 0) this.subscribed[type]--

		// unsub on none listeners
		if (this.subscribed[type] < 1)
			this.send(
				{
					subscribe: false,
				},
				type
			)
	}
}

export default Socket
