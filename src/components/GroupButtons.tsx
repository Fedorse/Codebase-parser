import { FileIcon, FolderIcon } from '../icons';
import { open } from '@tauri-apps/plugin-dialog';
import { useEffect, useState, useRef } from 'react';
import { invoke } from '@tauri-apps/api/core';
import { Preset } from './Preset';

const GroupButtons = ({ parseFiles }) => {
	const [showPresets, setShowPresets] = useState(false);
	const [selectedPreset, setSelectedPreset] = useState(null);

	const handleFileSelect = async () => {
		const selected = await open({
			multiple: true
		});

		if (!selected) return;

		const files = Array.isArray(selected) ? selected : [selected];
		await parseFiles(files, selectedPreset ? selectedPreset.ignore_patterns : []);
	};

	const handleFolderSelect = async () => {
		const selected = await open({
			multiple: true,
			directory: true
		});

		if (!selected) return;

		const files = Array.isArray(selected) ? selected : [selected];
		await parseFiles(files, selectedPreset ? selectedPreset.ignore_patterns : []);
	};

	const handleSelectPreset = (preset) => {
		setSelectedPreset(preset);
		setShowPresets(false);
	};

	return (
		<section className="w-1/2">
			<div className="w-full relative flex px-20 justify-around items-center gap-2 flex-row rounded-b-lg border border-gray-300 dark:border-gray-700">
				<button
					onClick={handleFileSelect}
					className="bg-transparent items-center flex gap-2 rounded-lg hover:bg-gray-800 text-black/70 dark:text-gray-200 px-4 py-3 font-medium transition-colors"
				>
					<FileIcon />
					<span>Select Files</span>
				</button>

				<div className="flex flex-col ">
					<button
						onClick={() => setShowPresets(!showPresets)}
						className="w-full flex justify-between items-center bg-transparent rounded-lg px-4 py-2 text-black/70 dark:text-gray-200 hover:bg-gray-800 transition-colors"
					>
						<span>{selectedPreset ? selectedPreset.name : 'Select preset'}</span>
						<svg
							xmlns="http://www.w3.org/2000/svg"
							className={`h-5 w-5 transition-transform ${showPresets ? 'rotate-180' : ''}`}
							viewBox="0 0 20 20"
							fill="currentColor"
						>
							<path
								fillRule="evenodd"
								d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z"
								clipRule="evenodd"
							/>
						</svg>
					</button>
					{showPresets && <Preset />}
				</div>

				<button
					onClick={handleFolderSelect}
					className="min-w-36 bg-transparent rounded-lg items-center flex gap-2 hover:bg-gray-800 text-black/70 dark:text-gray-200 px-4 py-3 font-medium transition-colors"
				>
					<FolderIcon />
					<span>Select Folder</span>
				</button>
			</div>

			{/* Show selected preset details */}
			{selectedPreset && (
				<div className="mt-4 px-4 py-2 bg-white/10 dark:bg-gray-800/30 rounded-lg border border-gray-300 dark:border-gray-700 max-w-md">
					<div className="flex justify-between items-center">
						<h3 className="text-sm font-medium text-black/80 dark:text-white/80">
							Using preset:{' '}
							<span className="text-blue-600 dark:text-blue-400">{selectedPreset.name}</span>
						</h3>
						<button
							onClick={() => setSelectedPreset(null)}
							className="text-red-500 hover:text-red-600 text-sm"
						>
							✕
						</button>
					</div>
					{selectedPreset.ignore_patterns && selectedPreset.ignore_patterns.length > 0 && (
						<div className="mt-1">
							<p className="text-xs text-black/60 dark:text-white/60">Ignoring:</p>
							<div className="flex flex-wrap gap-1 mt-1">
								{selectedPreset.ignore_patterns.map((pattern, index) => (
									<span
										key={index}
										className="text-xs px-2 py-1 bg-gray-200 dark:bg-gray-700 rounded-full text-black/70 dark:text-white/70"
									>
										{pattern}
									</span>
								))}
							</div>
						</div>
					)}
				</div>
			)}
		</section>
	);
};

export default GroupButtons;
