import { ListFiles } from '../components/ListFiles';
import PreviewModal from '../components/PreviewModal';
import { useEffect, useState } from 'react';
import { invoke } from '@tauri-apps/api/core';
const SavedFilesPage = () => {
	const [savedFiles, setSavedFiles] = useState<string[]>([]);
	const [savedAllData, setSavedAllDatа] = useState({});
	const [isLoading, setIsLoading] = useState(false);

	const [modal, setModal] = useState({
		isOpen: false,
		content: '',
		fileName: ''
	});

	const [isModalOpen, setIsModalOpen] = useState(false);
	const [currentFile, setCurrentFile] = useState('');
	const [currentContent, setCurrentContent] = useState('');
	const [isCopied, setIsCopied] = useState(false);

	const loadAllFiles = async () => {
		const filesNames = await invoke('get_files');
		setSavedFiles(filesNames);

		const allData = {};

		for (const fileName of filesNames) {
			const content = await invoke('get_file_content', { fileName });
			allData[fileName] = content;
		}
		setSavedAllDatа(allData);
	};

	const handleModalOpen = (fileName, content) => {
		setCurrentFile(fileName);
		setCurrentContent(content);
		setIsModalOpen(true);
	};
	const handleCopy = async (content) => {
		await navigator.clipboard.writeText(content);
		setIsCopied(true);
		setTimeout(() => setIsCopied(false), 2000);
	};
	const handleSave = async ({ newContent }) => {
		await invoke('update_file', {
			fileName: currentFile,
			content: newContent
		});
		setSavedAllDatа((prev) => ({
			...prev,
			[currentFile]: newContent
		}));
		setCurrentContent(newContent);
		setIsModalOpen(false);
	};

	useEffect(() => {
		loadAllFiles();
	}, []);

	return (
		<div className="flex flex-col items-center justify-center ">
			<ListFiles
				savedFiles={savedFiles}
				reloadFiles={loadAllFiles}
				handleModalOpen={handleModalOpen}
				onCopy={handleCopy}
				isCopied={isCopied}
				data={savedAllData}
			/>
			<PreviewModal
				isOpen={isModalOpen}
				isCopied={isCopied}
				onClose={() => setIsModalOpen(false)}
				content={currentContent}
				fileName={currentFile}
				handleCopy={() => handleCopy(currentContent)}
				saveCurrentFile={handleSave}
			/>
		</div>
	);
};
export default SavedFilesPage;
