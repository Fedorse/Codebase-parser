export const Tooltip = ({ children, text }) => {
	return (
		<div className="relative inline-block group">
			{children}
			<span
				className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2
			opacity-0 group-hover:opacity-100 transition-opacity duration-200
			text-xs bg-black text-white px-2 py-1 rounded whitespace-nowrap z-50"
			>
				{text}
			</span>
		</div>
	);
};
