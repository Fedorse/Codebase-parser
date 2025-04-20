import { DeleteIcon } from '../icons';
type Props = {
	presets: { [key: string]: string[] };
	setSelected: (s: any) => void;
	selected: string | null;
	onDelete: (name: string) => void;
};
export const PresetList = ({ presets, setSelected, selected, onDelete }: Props) => {
	return (
		<div className="max-h-80 overflow-y-auto pr-1">
			{Object.entries(presets).map(([name, paterns]) => {
				const isActive = selected === name;
				return (
					<div
						key={name}
						onClick={(e) => {
							e.stopPropagation();
							setSelected(isActive ? null : name);
						}}
						className="flex justify-between "
					>
						<div className="flex flex-col mt-2 cursor-pointer group transition-colors max-w-full">
							<span className={` ${isActive ? 'text-blue-600' : 'group-hover:text-blue-600'}`}>
								{name}
							</span>
							<span
								className={`text-xs  truncate max-w-full ${
									isActive
										? 'dark:text-white text-black'
										: 'dark:text-white/50 text-black/50 group-hover:text-black dark:group-hover:text-white'
								} `}
							>
								{paterns.join(', ')}
							</span>
						</div>

						{isActive ? (
							<span className="text-blue-500 flex self-end">✓</span>
						) : (
							<button className="text-red-400 flex self-end " onClick={() => onDelete(name)}>
								<DeleteIcon className="w-4 h-4" />
							</button>
						)}
					</div>
				);
			})}
		</div>
	);
};
