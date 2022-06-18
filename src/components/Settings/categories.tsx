import Login from './Login/Login'

export type labelType = {
	id: string
	type: 'toggle' | 'text' | 'link' | 'link-external' | 'field' | 'component'
	caption: string
	desc: string

	default?: boolean | undefined
	href?: string
	content?: any
	external?: boolean
	[key: string]: any
}

export type sectionType = {
	id: string
	header: string
	labels: labelType[]
}

export type categoryType = {
	id: string
	header: string
	sections: sectionType[]
}
//

var categories: categoryType[] = [
	{
		id: 'visuals',
		header: 'Appearance',
		sections: [
			{
				id: 'home',
				header: 'Homepage',
				labels: [
					{
						id: 'dark',
						type: 'toggle',
						caption: 'Dark Mode 🌙',
						default: true,
						desc: 'Dark/Light mode',
					},
					{
						id: 'clock',
						type: 'toggle',
						caption: 'Clock ⏰',
						default: true,
						desc: 'Toggle Clock',
					},
					{
						id: 'display',
						type: 'toggle',
						caption: 'Timer ⏳',
						default: true,
						desc: 'Toggle Timer',
					},
					{
						id: 'chat',
						type: 'toggle',
						caption: 'Chat 💬',
						default: true,
						desc: 'Toggle chat on the homepage',
					},
					{
						id: 'eyes',
						type: 'toggle',
						caption: 'Counter 👁️',
						default: true,
						desc: 'Toggle viewer count',
					},
				],
			},
			{
				id: 'event',
				header: '⏳',
				labels: [
					{
						id: 'music',
						type: 'toggle',
						caption: 'Music 🎶',
						default: true,
						desc: 'Toggle music autoplay',
					},
					{
						id: 'rainbow',
						type: 'toggle',
						caption: 'Rainbow 🌈',
						default: true,
						desc: 'Toggle rainbow animation',
					},
				],
			},
		],
	},
	{
		id: 'about',
		header: 'Info',
		sections: [
			{
				id: 'app',
				header: 'App',
				labels: [
					{
						id: 'version',
						type: 'text',
						caption: 'Commit',
						desc: process.env.GITHUB_SHA ?? '???????',
					},
					{
						id: 'author',
						type: 'link-external',
						caption: 'Github',
						desc: `github/maathias`,
						href: 'https://github.com/maathias/countdown',
					},
				],
			},
			{
				id: 'server',
				header: 'Server',
				labels: [
					{
						id: 'status',
						type: 'text',
						caption: 'Status',
						desc: '',
					},
					{
						id: 'ping',
						type: 'text',
						caption: 'Ping',
						desc: '',
					},
					{
						id: 'offset',
						type: 'text',
						caption: 'Delay',
						desc: '',
					},
				],
			},
			{
				id: 'contact',
				header: 'Kontact',
				labels: [],
			},
			{
				id: 'rules',
				header: 'Rules',
				labels: [],
			},
		],
	},
	{
		id: 'account',
		header: 'Account',
		sections: [
			{
				id: 'status',
				header: 'Status',
				labels: [
					{
						id: 'login',
						type: 'component',
						caption: 'Log in',
						desc: 'login prompt',
						content: Login,
					},
				],
			},
		],
	},
]

export default categories
