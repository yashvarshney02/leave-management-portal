import { PulseLoader } from 'react-spinners';

export default function LoadingIndicator({color}) {
	return (
		<div>
			<PulseLoader size={10} color={color} loading={true} />
		</div>
	)
}