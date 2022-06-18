import Socket, { incomingPayload, sync as Tsync } from '../Socket'

const sync = {
	label: 'sync',
	socket: {} as Socket,

	sync: {} as Tsync,

	receive(chunk: incomingPayload) {
		let { flag } = chunk

		// init
		if (flag === 'begin') {
			this.sync.begin = performance.now()
			this.socket.send({
				type: 'sync',
				flag: 'received',
				heartbeat: chunk.heartbeat ?? false,
			})
		}

		// calculate
		if (flag === 'end') {
			this.sync.end = performance.now()
			this.sync.rtt = this.sync.end - this.sync.begin
			this.sync.ping = this.sync.rtt / 2
			this.sync.diff = Date.now() - new Date(chunk.time).getTime()
			this.sync.offset = this.sync.diff - this.sync.ping

			this.socket.triggerEvent(['onSync'], this.sync)

			console.info(
				`Time synced${
					chunk.heartbeat ? ' ❤️' : ''
				}, offset: ${this.sync.offset.toFixed(
					1
				)}ms, ping: ${this.sync.ping.toFixed(1)}`
			)
		}
	},
}

export default sync
