import Socket, { incomingPayload, module } from '../Socket'

const { REACT_APP_CAPTCHA_KEY } = process.env

async function getCaptcha(action: string): Promise<string> {
	console.info('Requesting captcha token')

	// @ts-ignore
	await window.waitForCaptcha

	return window.grecaptcha
		.execute(REACT_APP_CAPTCHA_KEY, { action })
		.then((token: string) => {
			console.info('Received captcha')
			return token
		})
}

const captcha: module = {
	label: 'captcha',
	socket: {} as Socket,

	receive(chunk: incomingPayload) {
		getCaptcha(chunk.action ?? 'general').then((token) => {
			this.socket.send({
				type: 'captcha',
				token,
			})
		})
	},
}

export default captcha
