import { FileIcon, FolderIcon } from '../icons';
import { open } from '@tauri-apps/plugin-dialog';
import { invoke } from '@tauri-apps/api/core';
import { ArrowUp, ArrowDown } from '../icons';

const ButtonUploads = ({ setShowPresets, showPresets, parse, selectedPreset }) => {
	const handleOpenFile = async (directory: boolean) => {
		const selected = await open({
			multiple: true,
			directory
		});
		if (!selected) return;
		try {
			await parse(selected);
		} catch (err) {
			console.error('Parse failed:', err);
		}
	};

	return (
		<section className="w-1/2">
			<div className="w-full relative flex px-2 py-3  items-center gap-2 flex-row rounded-b-lg   border-b-[1px] border-l-[1px] border-r-[1px] bg-gray-950 border-gray-600/30 dark:border-gray-600/50">
				<div className="flex flex-1 justify-center ">
					<div className="inline-flex items-center border border-slate-700  text-white rounded-xl overflow-hidden shadow-sm">
						<div className="flex flex-col ml-auto ">
							<button
								onClick={() => setShowPresets(!showPresets)}
								className="w-full  flex flex-col bg-transparent rounded-lg px-4 py-2 text-black/70 dark:text-gray-200 hover:bg-gray-800 transition-colors"
							>
								<div className="flex items-center gap-2">
									Preset{' '}
									<span className="text-sm">{showPresets ? <ArrowUp /> : <ArrowDown />}</span>
								</div>
								<span className={`text-xs ${selectedPreset ? 'text-white' : 'text-white/50'}`}>
									{selectedPreset || 'No preset'}
								</span>
							</button>
						</div>
						<button
							onClick={() => handleOpenFile(false)}
							className="flex items-center gap-2 px-4 py-2 hover:bg-gray-800 transition-colors"
						>
							<FileIcon />
						</button>

						<div className=" py-2 text-sm font-medium  border-r border-slate-700 text-white/60"></div>

						<button
							onClick={() => handleOpenFile(true)}
							className="flex items-center gap-2 px-4 py-2 hover:bg-gray-800 transition-colors"
						>
							<FolderIcon />
						</button>
					</div>
				</div>
			</div>
		</section>
	);
};

export default ButtonUploads;
