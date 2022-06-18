import { createRoot } from 'react-dom/client'

import Main from './Main'

import './index.css'

// declare global {
// 	namespace NodeJS {
// 		interface ProcessEnv {
// 			REACT_APP_WS_SERVER: string
// 			REACT_APP_DOMAIN: string
// 			REACT_APP_NAME: string

// 			REACT_APP_CAPTCHA_KEY: string
// 			REACT_APP_ID_GA: string
// 		}
// 	}
// }

createRoot(document.getElementById('root')!).render(<Main />)

export function joinClassNames(classNames: any[]) {
	return classNames
		.filter((className) => className)
		.map((className) => className?.toString())
		.join(' ')
}
