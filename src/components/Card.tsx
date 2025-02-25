// Card.jsx
import { useState } from 'react';
import { DeleteIcon } from '../icons/DeleteIcon';
import PreviewModal from './PreviewModal';

const Card = ({
	fileName,
	handleFileClick,
	handleFileRemove,
	currentFileContent,
	currentFile,
	saveCurrentFile
}) => {
	const [isOpen, setIsOpen] = useState(false);

	const handleClose = () => {
		setIsOpen(false);
	};

	const handleOpen = async () => {
		// Загружаем содержимое файла при открытии
		await handleFileClick(fileName);
		setIsOpen(true);
	};

	return (
		<>
			<div
				onClick={handleOpen}
				className="border-[1px] w-80 h-40 bg-neutral-950 border-gray-600 rounded-lg mb-4 flex flex-col cursor-pointer hover:border-blue-500 transition-colors"
			>
				<div className="p-4 flex-grow flex items-center justify-center">
					<h3 className="text-white text-lg font-medium truncate max-w-full text-center">
						{fileName}
					</h3>
				</div>

				<div className="p-3 flex justify-end items-center border-t border-gray-700">
					<button
						className="text-red-500 hover:text-red-400 transition-colors"
						onClick={(e) => {
							e.stopPropagation();
							handleFileRemove(fileName);
						}}
					>
						<DeleteIcon />
					</button>
				</div>
			</div>

			<PreviewModal
				isOpen={isOpen}
				onClose={handleClose}
				content={currentFileContent}
				fileName={fileName}
				saveCurrentFile={saveCurrentFile}
			/>
		</>
	);
};

export default Card;
