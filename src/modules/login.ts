import Socket, { incomingPayload, module } from '../Socket'

export type user = {
	id: string
	uname: string
	discr: string
}

const login: module = {
	label: 'login',
	socket: {} as Socket,

	jwt: localStorage['jwt'] ?? '',
	udata: {},
	logedin: false,

	welcome() {
		if (this.jwt.length < 1) return false
		return {
			flag: 'reauth',
			jwt: this.jwt,
		}
	},

	send(auth: any) {
		this.socket.send({ type: 'login', code: auth.code })
	},

	receive({ success, jwt, udata }: incomingPayload) {
		if (success) {
			localStorage['jwt'] = jwt
			this.jwt = jwt
			this.udata = udata
			this.logedin = true
			this.socket.triggerEvent(['onLogedIn'], udata)
		}
	},
}

export default login
