import Socket, { incomingPayload, module } from '../Socket'

const chat: module = {
	label: 'chat',
	socket: {} as Socket,
	latest: [],

	onChatReceive(chunk: incomingPayload) {
		this.latest.push(chunk)
		if (this.latest.length > 150) this.latest.shift()

		this.socket.triggerEvent(['onChatReceive'], chunk)
	},

	receive(chunk: incomingPayload) {
		const messages = chunk.flag === 'messages' ? chunk.messages : [chunk]

		for (let message of messages) {
			// dont push duplicates if parsing messages backlog
			if (chunk.flag === 'messages')
				if (this.latest.find(({ id }: incomingPayload) => id === message.id))
					return

			this.onChatReceive(message)
		}
	},
}

export default chat
