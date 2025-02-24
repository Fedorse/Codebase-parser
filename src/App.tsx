import './App.css';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import RootLoyaout from './layouts/RootLoyaout';
import FileUploader from './routes/FileUploader';
import SavedFiles from './routes/SavedFiles';
import { useEffect, useState } from 'react';
import { invoke } from '@tauri-apps/api/core';
import { open } from '@tauri-apps/plugin-dialog';

export default function App() {
	const [savedFiles, setSavedFiles] = useState<string[]>([]);
	const [currentFile, setCurrentFile] = useState<string>('');

	const reloadFiles = async () => {
		const res = await invoke('get_files');

		setSavedFiles(res);
	};

	const handleFileClick = async (path: string) => {
		const content = await invoke('get_file_content', { filePath: path });
		setCurrentFile(content);
	};

	const handleFileRemove = async (path) => {
		await invoke('remove_file', { filePath: path });
		await reloadFiles();
	};

	const parseFiles = async (files) => {
		await invoke('parse_files', {
			filePaths: files,
			title: 'Test'
		});

		await reloadFiles();
	};

	const handleFileSelect = async () => {
		const selected = await open({
			multiple: true,
			filters: [{ name: 'Text', extensions: ['txt', 'log', 'md'] }]
		});

		let files;

		if (Array.isArray(selected)) {
			files = selected;
		} else if (selected) {
			files = selected;
		}

		await parseFiles(files);
	};
	const handleFolderSelect = async () => {
		const selected = await open({
			multiple: true,
			directory: true,
			filters: [{ name: 'Text', extensions: ['txt', 'log', 'md'] }]
		});
		let files;

		if (Array.isArray(selected)) {
			files = selected;
		} else if (selected) {
			files = selected;
		}

		await parseFiles(files);
	};

	useEffect(() => {
		reloadFiles();
	}, []);

	const fileProps = {
		savedFiles,
		handleFileClick,
		handleFileRemove,
		currentFile,
		handleFolderSelect,
		handleFileSelect
	};
	return (
		<BrowserRouter>
			<Routes>
				<Route element={<RootLoyaout />}>
					<Route path="/" element={<FileUploader {...fileProps} />}></Route>
					<Route path="/saved-files" element={<SavedFiles {...fileProps} />}></Route>
				</Route>
			</Routes>
		</BrowserRouter>
	);
}
