import DragAndDrop from '../components/DragAndDrop';
import ButtonUploads from '../components/ButtonUploads';
import { invoke } from '@tauri-apps/api/core';
import { useToast } from '../hooks/useToast';
import { Preset } from '../components/Preset';
import { useState, useEffect } from 'react';
import { DeleteIcon } from '../icons';

// type PresetMap = Record<string, string[]>;
type PresetMap = {
	[key: string]: string[];
};

export const MainScreen = () => {
	const [showPresets, setShowPresets] = useState(false);
	const [selectedPreset, setSelectedPreset] = useState<string | null>('');
	const [presets, setPresets] = useState<PresetMap>({});
	const [newPresetName, setNewPresetName] = useState('');
	const [newPatterns, setNewPatterns] = useState('');
	const [showForm, setShowForm] = useState(false);
	const { success, error } = useToast();

	const fecthPresets = async () => {
		const res = await invoke<string>('get_presets');
		const parsed = JSON.parse(res);
		setPresets(parsed);
	};

	const parse = async (selected) => {
		await invoke('parse', {
			paths: selected,
			ignorePatterns: selectedPreset ? presets[selectedPreset] : []
		});
	};

	const handleNewPreset = async () => {
		const ignorePatterns = newPatterns.split(',').map((str) => str.trim());
		await handleUpdatePreset(newPresetName, ignorePatterns);
		setPresets((prev) => ({ ...prev, [newPresetName]: ignorePatterns }));
		setNewPresetName('');
		setNewPatterns('');
		setShowForm(false);
	};

	const handleDeletePreset = async (preset: string) => {
		await invoke('delete_preset', { name: preset });
		setPresets(
			(prev) => {
				const copy = { ...prev };
				delete copy[preset];
				return copy;
			}
			// Object.fromEntries(Object.entries(prev).filter(([key]) => key !== preset))
		);
	};

	const handleUpdatePreset = async (name, ignorePatterns: string[]) => {
		await invoke('update_preset', {
			name,
			ignorePatterns
		});
	};

	useEffect(() => {
		fecthPresets();
	}, []);

	return (
		<main className="h-full flex flex-col w-full overflow-hidden  items-center pt-40">
			<DragAndDrop parse={parse} />
			<ButtonUploads
				setShowPresets={setShowPresets}
				showPresets={showPresets}
				parse={parse}
				selectedPreset={selectedPreset}
			/>

			{showPresets && (
				<div
					className={`text-white/80 right-[400px] bottom-[370px] absolute z-50 w-full max-w-[400px] p-4 
						borded border-[1px] bg-gray-950 border-slate-600 rounded-md 
						`}
				>
					<div
						className={`text-sm gap-3 flex  border-b border-slate-600 w-full ${
							!showForm ? '' : 'justify-between text-white'
						}`}
						onClick={() => setShowForm(!showForm)}
					>
						<span className="text-base cursor-pointer hover:text-white">Add new preset</span>
						{showForm ? (
							<button
								onClick={() => handleNewPreset()}
								className="text-black/80 bg-white text-sm mb-3 px-3 flex  py-1 border border-slate-600 rounded-md"
							>
								Saved
							</button>
						) : (
							<span className="mb-4 bg-gray-800 w-5 h-5 rounded-full flex items-center justify-center text-white">
								+
							</span>
						)}
					</div>
					{showForm && (
						<div className="flex flex-col gap-2 mt-2">
							<label htmlFor="preset-name" className="text-xs">
								Preset name
							</label>
							<input
								id="preset-name"
								type="text"
								value={newPresetName}
								onChange={(e) => setNewPresetName(e.target.value)}
								onKeyDown={(e) => {
									if (e.key === 'Enter') {
										handleNewPreset();
									}
								}}
								placeholder="Enter preset name"
								className="bg-slate-800 px-2 py-1 rounded text-white text-sm placeholder-transparent focus:placeholder-white/50 transition-colors"
							/>

							<label htmlFor="preset-patterns" className="text-xs ">
								Files to exclude, comma separated
							</label>
							<textarea
								id="preset-patterns"
								value={newPatterns}
								onKeyDown={(e) => {
									if (e.key === 'Enter') {
										handleNewPreset();
									}
								}}
								placeholder="Comma-separated patterns (e.g. node_modules, .git)"
								onChange={(e) => setNewPatterns(e.target.value)}
								className="bg-slate-800 px-2 py-1 rounded text-white placeholder-transparent text-sm focus:placeholder-white/50 transition-colors   mb-4"
							></textarea>
						</div>
					)}

					{Object.entries(presets).map(([name, ignorePatterns]) => (
						<div
							key={name}
							onClick={(e) => {
								e.stopPropagation();
								setSelectedPreset((prev) => (prev === name ? null : name));
							}}
							className="flex justify-between "
						>
							<div className="flex flex-col mt-2 cursor-pointer group transition-colors">
								<span
									className={` ${
										selectedPreset === name ? 'text-blue-600' : 'group-hover:text-blue-600'
									}`}
								>
									{name}
								</span>
								<span
									className={`text-xs  truncate max-w-[350px] ${
										selectedPreset === name ? 'text-white' : 'text-white/50 group-hover:text-white'
									} `}
								>
									{ignorePatterns.join(', ')}
								</span>
							</div>

							{selectedPreset === name ? (
								<span className="text-blue-500 flex self-end">✓</span>
							) : (
								<button
									className="text-red-400 flex self-end "
									onClick={() => handleDeletePreset(name)}
								>
									<DeleteIcon className="w-4 h-4" />
								</button>
							)}
						</div>
					))}
				</div>
			)}
		</main>
	);
};
export default MainScreen;
