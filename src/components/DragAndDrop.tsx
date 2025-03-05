import { FolderIcon, FileIcon, UploadIcon } from '../icons';

const GridPattern = () => {
	const columns = 41;
	const rows = 11;
	return (
		<div className="flex bg-gray-900 dark:bg-neutral-900 flex-shrink-0 flex-wrap justify-center items-center gap-x-px gap-y-px scale-105">
			{Array.from({ length: rows }).map((_, row) =>
				Array.from({ length: columns }).map((_, col) => {
					const index = row * columns + col;
					return (
						<div
							key={`${col}-${row}`}
							className={`w-10 h-10 flex flex-shrink-0 rounded-[2px] ${
								index % 2 === 0
									? 'bg-gray-800/60 dark:bg-neutral-950'
									: 'bg-gray-800/60 dark:bg-neutral-950 shadow-[0px_0px_1px_3px_rgba(31,31,31,1)_inset] dark:shadow-[0px_0px_1px_3px_rgba(0,0,0,1)_inset]'
							}`}
						/>
					);
				})
			)}
		</div>
	);
};

export const DragAndDrop = ({ handleFileSelect, handleFolderSelect }) => {
	return (
		<div className="w-1/2">
			<div className="w-full h-full py-8 text-white flex items-center justify-center border-dashed border-[1px]  border-white/40 hover:border-white/20 rounded-lg relative overflow-hidden group">
				<div className="absolute inset-0 [mask-image:radial-gradient(ellipse_at_center,white,transparent)]">
					<GridPattern />
				</div>
				<div className="relative">
					<div className="text-center">
						<h2 className="text-xl text-white font-medium mb-2">Upload Your Files</h2>
						<p className="text-gray-400 text-sm mb-4">Upload files or folders to start parsing</p>
					</div>

					<div className="relative">
						<div className="relative bg-black/50 mt-10 z-40 flex items-center justify-center h-32 w-full max-w-[8rem] mx-auto rounded-md  transition-all duration-300 ease-out group-hover:scale-75">
							<div className="transition-opacity duration-300 ease-in-out">
								<UploadIcon />
								<div className="absolute inset-0 rounded-md border-[1px] border-dashed border-blue-600  opacity-0 group-hover:opacity-100 transition-opacity duration-300 scale-110 group-hover:scale-125"></div>
							</div>
						</div>
					</div>

					<div className="inline-flex items-center gap-2 flex-row rounded-lg overflow-hidden border border-gray-700 mt-12 ">
						<button
							onClick={handleFileSelect}
							className="bg-transparent items-center flex gap-2 rounded-lg hover:bg-gray-800  text-gray-200 px-4 py-3 text-sm font-medium transition-colors"
						>
							<FileIcon />
							<span>Select Files</span>
						</button>

						<div className="flex items-center rounded-lg px-4 py-1 text-gray-600 bg-gray-800/60">
							<span className="text-sm font-medium">/</span>
						</div>

						<button
							onClick={handleFolderSelect}
							className="min-w-36 bg-transparent rounded-lg items-center flex gap-2 hover:bg-gray-800 text-gray-200 px-4 py-3 text-sm font-medium transition-colors"
						>
							<FolderIcon />
							<span>Select Folder</span>
						</button>
					</div>
				</div>
			</div>
		</div>
	);
};

export default DragAndDrop;
