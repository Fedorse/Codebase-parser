export const ListFiles = ({ savedFiles, handleFileClick, handleFileRemove, currentFile }) => {
	return (
		<div className="p-2 border-[1px] border-gray-800 w-[600px] rounded-lg">
			<div className="flex flex-col items-center justify-center ">
				{savedFiles.map((filePath, index) => (
					<div
						onClick={() => handleFileClick(filePath)}
						className={`mt-4 text-md text-gray-400 cursor-pointer gap-10 w-full flex justify-center items-center ${
							index !== savedFiles.length - 1 ? 'border-b-[1px] border-gray-800' : ''
						}`}
						key={filePath}
					>
						<span className="text-ellipsis ">{filePath}</span>
						<span
							className="text-red-600 text-lg"
							onClick={(e) => {
								e.stopPropagation();
								handleFileRemove(filePath);
							}}
						>
							delete
						</span>
					</div>
				))}

				{currentFile && (
					<div className="mt-4 text-sm text-white gap-10">
						<span>{currentFile}</span>
					</div>
				)}
			</div>
		</div>
	);
};
export default ListFiles;
