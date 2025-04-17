import { invoke } from '@tauri-apps/api/core';
import { DeleteIcon, CopyIcon, OpenDocument } from '../icons';
import { FilePreview } from '../routes/SavedFilesScreen';
import { formatFileSize } from '../utils/formatFileSize.ts';
import { useState } from 'react';

const THIRTY_MB_SIZE = 30 * 1024 * 1024;

const Card = ({ name, size, path, onOpen, onCopy, isCopied, preview, onDelete, onRename }) => {
	const [newName, setNewName] = useState<string>('');
	const [renamingFile, setRenamingFile] = useState<string | null>(null);
	const handleDeleteClick = async (path: string) => {
		try {
			await invoke('delete_file', { path: path });
			onDelete(path);
		} catch (err) {
			console.error('Failed to delete file:', err);
		}
	};

	const handleRenameClick = () => {
		if (newName && newName !== name) {
			onRename(path, newName);
		}
		setRenamingFile(null);
	};

	const handleCopyClick = async (e) => {
		e.stopPropagation();
		onCopy(path);
	};

	const handleOpenDir = async (path: string) => {
		try {
			await invoke('open_in_folder', { filePath: path });
		} catch (err) {
			console.error('Failed to open file:', err);
		}
	};

	const openInEditor = async (path: string) => {
		try {
			await invoke('open_in_default_editor', { filePath: path });
		} catch (err) {
			console.error('Failed to open file in editor:', err);
		}
	};

	return (
		<>
			<div
				onDoubleClick={() => {
					if (size > THIRTY_MB_SIZE) {
						openInEditor(path);
					} else {
						onOpen();
					}
				}}
				className="border-[1px] bg-[#121212] w-72 h-96  border-gray-600 rounded-t-2xl rounded-bl-2xl rounded-br-sm  flex flex-col cursor-pointer hover:border-blue-600 transition-colors motion-preset-rebound-right"
			>
				<div className="p-2 border-b border-gray-800/60 flex flex-col items-center">
					<h3 className="text-white text-base font-light max-w-full mb-1">
						{renamingFile === path ? (
							<input
								className="bg-[#121212] text-white px-2  border border-gray-600 rounded focus:outline-none focus:ring-1 focus:ring-blue-600 transition"
								autoFocus
								type="text"
								value={newName}
								onChange={(e) => setNewName(e.target.value)}
								onBlur={() => handleRenameClick()}
								onKeyDown={(e) => {
									e.stopPropagation();
									if (e.key === 'Enter') {
										handleRenameClick();
									}
								}}
							/>
						) : (
							<div
								onClick={(e) => {
									e.stopPropagation();
									setNewName(name);
									setRenamingFile(path);
								}}
							>
								{name}
							</div>
						)}
					</h3>
					<span className="text-white/50 text-xs">Last edited 14 minutes ago</span>
				</div>

				<div className="p-3 flex-grow overflow-hidden">
					<div className="text-white/70 text-xs font-mono line-clamp-[15] overflow-hidden">
						{preview}
					</div>
				</div>

				<div className="p-3 flex w-full justify-between items-center border-t border-gray-800">
					<div className="flex gap-4 items-center">
						<button
							className={`text-white/70 hover:text-white transition-colors flex items-center gap-1 ${
								isCopied ? 'text-green-500' : ''
							}`}
							onClick={handleCopyClick}
							title="Copy content"
						>
							{isCopied ? (
								<span className="text-xs text-green-500">Copied!</span>
							) : (
								<>
									<CopyIcon />
									<span className="text-xs">Copy</span>
								</>
							)}
						</button>
					</div>

					<div className="flex gap-3 items-center">
						<span className="text-white/70 text-xs">{formatFileSize(size)}</span>

						<button
							className="text-sm text-white"
							onClick={(e) => {
								e.stopPropagation();
								handleOpenDir(path);
							}}
						>
							<OpenDocument />
						</button>
						<button
							className="text-red-500/90 flex self-end hover:text-red-400 transition-colors"
							onClick={(e) => {
								e.stopPropagation();
								handleDeleteClick(path);
							}}
						>
							<DeleteIcon />
						</button>
					</div>
				</div>
			</div>
		</>
	);
};

export default Card;
