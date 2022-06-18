import {
	memo,
	useContext,
	useEffect,
	useReducer,
	useRef,
	useState,
} from 'react'

import SocketContext from '../../contexts/Socket.ctx'

import { ReactComponent as Send } from './send.svg'

import { incomingPayload } from '../../Socket'

import './index.css'
import './roles.css'
import { joinClassNames } from '../..'

const Message = memo(
	({
		id,
		time: timestamp,
		nick = 'local',
		role = '',
		self = false,
		content = '',
	}: incomingPayload & { self: boolean }) => {
		const time = new Date(timestamp)

		return (
			<div className="message" data-self={self}>
				<span className={joinClassNames(['nick', role])} data-id={id}>
					{nick}
				</span>

				<span className="content">{content}</span>
				<span className="time" title={time.toString()}>
					{time.getHours().toString().padStart(2, '0') +
						':' +
						time.getMinutes().toString().padStart(2, '0') +
						':' +
						time.getSeconds().toString().padStart(2, '0')}
				</span>
			</div>
		)
	}
)

const release = 3e3,
	maxBurst = 6

function Chat({
	show = true,
	messageLimit = 100,
}: {
	show?: boolean
	messageLimit?: number
}) {
	const socket = useContext(SocketContext)

	const [messages, setMessages] = useState(socket.modules.chat.latest),
		[throttled, setThrottled] = useState(false),
		[, addBurst] = useReducer(
			(state) => {
				let now = performance.now()

				if (now - state.lastSend < release) state.count += 1
				else state.count = 1

				state.lastSend = now

				if (state.count >= maxBurst) {
					setThrottled(true)
					setTimeout(() => setThrottled(false), release + 1e2)
				}

				return state
			},
			{ count: 0, lastSend: 0 }
		)

	const list = useRef<HTMLDivElement>(null),
		last = useRef<HTMLDivElement>(null),
		input = useRef<HTMLInputElement>(null)

	function send() {
		if (throttled) return

		let content = (input && input.current && input.current.value) ?? ''

		if (content.length < 1) return

		socket.send({
			type: 'chat',
			content,
		})

		addBurst()

		input && input.current && (input.current.value = '')
		// scroll(true)
	}

	useEffect(() => {
		let listener = socket.addListener(['onChatReceive'], () => {
			setMessages(socket.modules.chat.latest.slice(-messageLimit))

			// newMessage = true
			// scroll()
		})

		socket.subscribe('chat')

		return () => {
			socket.unsubscribe('chat')
			socket.removeListener(listener)
		}
	}, []) // eslint-disable-line

	useEffect(() => {
		last.current?.scrollIntoView({
			// behavior: 'smooth',
			block: 'end',
			inline: 'nearest',
		})
	}, [messages])

	return (
		<div className={joinClassNames(['chat', !show && 'hidden'])}>
			<div className="messages" ref={list} data-testid="messages">
				{messages.map((message: incomingPayload) => (
					<Message
						key={message.id}
						self={message.uid === socket.id}
						{...message}
					/>
				))}
				<div ref={last} className="last"></div>
			</div>

			<div className={joinClassNames(['input', throttled && 'cooldown'])}>
				<input
					type="text"
					ref={input}
					maxLength={120}
					autoComplete="off"
					placeholder="czat"
					onKeyDown={(e) => {
						if (!e.shiftKey) if (e.key === 'Enter') send()
					}}
				/>

				<button
					className="send"
					onClick={() => {
						send()
					}}
				>
					<Send />
				</button>
			</div>
		</div>
	)
}

export default Chat
