import Socket, { incomingPayload, module } from '../Socket'

const count: module = {
	label: 'count',
	socket: {} as Socket,

	send(visible: boolean) {
		this.socket.send(
			{
				visible,
			},
			'count'
		)
	},

	receive(chunk: incomingPayload) {
		this.socket.triggerEvent(['onCount'], {
			count: chunk.count,
			invisible: chunk.invisible,
		})
	},
}

export default count
