import { useContext, useEffect, useReducer, useState } from 'react'

import { Label, LabelLink, Field, Toggle } from './Labels'

import SettingsContext from '../../contexts/Settings.ctx'
import socketContext from '../../contexts/Socket.ctx'

import categories, { sectionType, categoryType } from './categories'

import './style.css'
import './labels.css'
import { useLocation } from 'react-router-dom'
import { joinClassNames } from '../..'

type TabProps = {
	id: string
	header: string
	active: boolean
	onClick: (id: string) => unknown
}
//

function Tab({ id, header, active, onClick }: TabProps) {
	return (
		<div
			className={joinClassNames(['tab', id, active && 'active'])}
			onClick={() => {
				onClick(id)
			}}
		>
			{header}
		</div>
	)
}

function Category({ id, header, sections }: categoryType) {
	return (
		<div className="category">
			<h2>{header}</h2>

			{sections.map((section) => {
				return (
					<Section
						key={section.id}
						id={section.id}
						header={section.header}
						labels={section.labels}
					/>
				)
			})}
		</div>
	)
}

function Section({ id, header, labels }: sectionType) {
	let { settings, updateSettings } = useContext(SettingsContext)

	return (
		<div className="section" key={header}>
			<div className="header">{header}</div>

			{labels.map((label) => {
				switch (label.type) {
					default:
					case 'text':
						return <Label key={label.id} {...label} />

					case 'link-external':
					case 'link':
						return (
							<LabelLink
								key={label.id}
								external={label.type === 'link-external'}
								{...label}
							/>
						)

					case 'field':
						return <Field key={label.id} {...label} />

					case 'toggle':
						return (
							<Toggle
								key={label.id}
								{...label}
								def={settings[label.id]}
								onClick={updateSettings}
							/>
						)

					case 'component':
						return <label.content key={label.id} />
				}
			})}
		</div>
	)
}

function updateLabel(
	categoryId: string,
	sectionId: string,
	lookups: any,
	active?: string
) {
	if (active) if (active !== categoryId) return false
	categories
		.find((category) => category.id === categoryId)
		?.sections.find((section) => section.id === sectionId)
		?.labels.map((label) => {
			let lookup = lookups[label.id]
			for (let key in lookup) {
				label[key] = lookup[key]
			}
			return lookup
		})
	return true
}

function Settings() {
	const { hash } = useLocation(),
		start = categories // default opened tab
			.map(({ id }) => id) // filter all tab ids
			.filter((id) => id.includes(hash.slice(1))) // get tabs matching location hash
			.concat([categories[0].id])[0] // add default id, get first matching

	const [active, setActive] = useState(start),
		socket = useContext(socketContext),
		[, triggerRender] = useReducer(
			(x: number, action: string) => (action === active ? x + 1 : x),
			0
		)

	useEffect(() => {
		document.location.hash = '#' + active
	}, [active])

	useEffect(() => {
		let onSync = socket.addListener(['onSync'], () => triggerRender('about'))

		return () => socket.removeListener(onSync)
	}, []) // eslint-disable-line

	updateLabel('about', 'server', {
		status: {
			desc:
				socket.modules.sync.sync.ping > 0 ? 'Połączono ✅' : 'Rozłączono ❌',
		},
		ping: { desc: `${Math.floor(socket.modules.sync.sync.ping)}ms` },
		offset: { desc: `${Math.floor(socket.modules.sync.sync.offset)}ms` },
	})

	const current = categories.find(({ id }) => id === active)!

	return (
		<>
			<h1>Ustawienia 🔧</h1>
			<div className="content">
				<div className="categories">
					{categories.map((category) => {
						return (
							<Tab
								key={category.id}
								id={category.id}
								header={category.header}
								active={active === category.id}
								onClick={setActive}
							/>
						)
					})}
				</div>
				<Category
					key={current.id}
					id={current.id}
					header={current.header}
					sections={current.sections}
				/>
			</div>
		</>
	)
}

export { categories, Settings }
