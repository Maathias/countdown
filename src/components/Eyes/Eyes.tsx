import { joinClassNames } from '../..'
import './style.css'

type eyesProps = {
	count: number
	invisible: number
	show: boolean
}

function Eyes({ count = 0, invisible = 0, show = false }: eyesProps) {
	return (
		<div
			className={joinClassNames(['eyes', !show || (count < 1 && 'low')])}
			// className={joinClassNames(['eyes', show || count < 1 ? '' : 'low'])}
			data-count={count}
			data-testid="eyes"
			title={`${count} osób, ${(
				100 -
				(invisible / count) * 100
			).toFixed()}% aktywne`}
		></div>
	)
}

export default Eyes
