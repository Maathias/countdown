import './style.css'

import { useContext, useEffect, useState } from 'react'
import socketContext from '../../../contexts/Socket.ctx'
import { user } from '../../../modules/login'

const { REACT_APP_DISCORD_APP_ID, REACT_APP_REDIRECT_URI } = process.env

function promptLogin() {
	console.info(`Prompting login`)
	return new Promise((resolve, reject) => {
		delete localStorage.code

		let popup = window.open(
			`https://discord.com/api/oauth2/authorize?client_id=${REACT_APP_DISCORD_APP_ID}&redirect_uri=${REACT_APP_REDIRECT_URI}&response_type=code&scope=identify&state=discord`,
			`login with platform`,
			[
				'scrollbars=no',
				'resizable=no',
				'status=no',
				'location=no',
				'toolbar=no',
				'menubar=no',
				`width=450`,
				`height=850`,
			].join(',')
		)!

		console.info(`Window open, waiting`)

		// periodically check if the login is complete
		let interval = setInterval(() => {
			// window manually closed, login failed
			if (popup.closed) {
				console.info(`Window closed, login failed`)
				clearInterval(interval)
				return reject('Failed to log in')
			}

			if (localStorage.code) {
				// parse and cleanup fetched code
				let code = JSON.parse(localStorage.code)
				delete localStorage.code

				console.info(`Code fetched`)

				// oauth state mismatch
				if (code.state !== 'discord') reject('Invalid state')
				// somehow there's no code
				else if (typeof code.code !== 'string') reject('Log in denied')
				// success
				else resolve(code)

				console.info(`Code valid, closing window`)

				// cleanup the timer and popup window
				clearInterval(interval)
				popup.close()
			}
		}, 5e2)
	})
}

function Login() {
	const socket = useContext(socketContext),
		[user, setUser] = useState(socket.modules.login.udata)

	function login() {
		promptLogin().then((data) => {
			socket.modules.login.send!(data)
		})
	}

	useEffect(() => {
		let lstnr = socket.addListener(['onLogedIn'], (udata) => {
			setUser(udata as user)
		})

		return () => socket.removeListener(lstnr)
	}, []) // eslint-disable-line

	return (
		<div className="login">
			{socket.modules.login.logedin ? (
				<div>
					Zalogowano jako <span className="dc-uname">{user.uname}</span>#
					<span className="dc-discr">{user.discr}</span>
				</div>
			) : (
				<div className="login-withdc" onClick={login}>
					Zaloguj się przez Discord
				</div>
			)}

			{socket.modules.login.logedin && <div>asd</div>}
		</div>
	)
}

export default Login
