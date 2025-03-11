import { useEffect } from 'react';

const Toast = ({ message, duration = 3000, onClose }) => {
	useEffect(() => {
		const timer = setTimeout(() => {
			onClose();
		}, duration);

		return () => {
			clearTimeout(timer);
		};
	}, [duration, onClose]);

	return (
		<div className="fixed bottom-4 right-4 rounded-lg bg-gray-600 shadow-lg text-white flex w-60 h-auto z-50 overflow-hidden animate-slideInUp">
			<div className="w-full h-1 bg-green-500"></div>

			<div className="flex p-4 items-center">
				<div className="mr-3 text-green-500">
					<svg
						xmlns="http://www.w3.org/2000/svg"
						className="h-6 w-6"
						fill="none"
						viewBox="0 0 24 24"
						stroke="currentColor"
					>
						<path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
					</svg>
				</div>

				{/* Текст сообщения */}
				<div className="flex-1">
					<p className="text-sm font-medium">{message}</p>
				</div>
			</div>
		</div>
	);
};

export default Toast;
