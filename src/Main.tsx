import { useState } from 'react'
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom'
import ga from 'react-ga4'

import Socket from './Socket'

import Nav from './components/Nav'
import Home from './components/Home/Home'
import Chat from './components/Chat/Chat'
import Page from './components/Page/Page'
import { Settings, categories } from './components/Settings/Settings'

import GaContext from './contexts/Ga.ctx'
import SettingsContext from './contexts/Settings.ctx'
import SocketContext from './contexts/Socket.ctx'
import { joinClassNames } from '.'

const { REACT_APP_ID_GA } = process.env

// Google Analytics
if (!REACT_APP_ID_GA)
	console.error(`Invalid REACT_APP_ID_GA, cannot initialize Analytics`)
else ga.initialize(REACT_APP_ID_GA)

// default settings
const defSettings: { [key: string]: any } = {}

categories
	.map((o) => o.sections)
	.flat()
	.map((o) => o.labels)
	.flat()
	.map((o) => ({ id: o.id, default: o.default }))
	.forEach((o) => {
		let json = null

		try {
			json = JSON.parse(localStorage[o.id])
		} catch (err) {
			delete localStorage[o.id]
		}

		const def = json ?? null ?? o.default ?? null

		if (def !== null) defSettings[o.id] = def
	})

Object.keys(localStorage).forEach((name) => {
	try {
		defSettings[name] = JSON.parse(localStorage[name])
	} catch (err) {
		defSettings[name] = null
	}
})

var socket = new Socket()

;(document as Document & { socket: Socket }).socket = socket

function Main() {
	const [settings, setSettings] = useState(defSettings),
		[count, setCount] = useState(0),
		[invisible, setInvisible] = useState(0),
		[sync, setSync] = useState(socket.modules.sync.sync)

	function updateSettings(id: string, value: any) {
		setSettings((prevSettings) => ({ ...prevSettings, [id]: value }))
		localStorage[id] = JSON.stringify(value)
	}

	socket.addListener(['onCount'], ({ count, invisible }) => {
		setCount(count)
		setInvisible(invisible)
	})

	socket.addListener(['onSync'], (data) => {
		setSync(data as any)
		// ga.timing({
		// 	category: 'Socket',
		// 	variable: 'ping',
		// 	value: data.ping,
		// })
		// ga.timing({
		// 	category: 'Socket',
		// 	variable: 'offset',
		// 	value: data.offset,
		// })
	})

	let Content = (
		<div className={joinClassNames(['wrapper', settings.dark && 'dark'])}>
			<Nav
				links={[
					{ to: '/', header: 'Home' },
					{ to: '/czat', header: 'Czat' },
					{ to: '/ustawienia', header: 'Ustawienia' },
				]}
			/>

			<Routes>
				<Route path="/" element={<></>} />

				<Route
					path="/czat"
					element={<Page id="chat" children={<Chat show={true} />} />}
				/>

				<Route
					path="/ustawienia"
					element={<Page id="settings" children={<Settings />} />}
				/>
			</Routes>

			<Page
				id="home"
				children={<Home count={count} invisible={invisible} sync={sync} />}
			/>
		</div>
	)

	return (
		<SettingsContext.Provider value={{ settings, updateSettings }}>
			<SocketContext.Provider value={socket}>
				<GaContext.Provider value={ga}>
					<Router>{Content}</Router>
				</GaContext.Provider>
			</SocketContext.Provider>
		</SettingsContext.Provider>
	)
}

export default Main
