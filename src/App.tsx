import './App.css';
import { useState } from 'react';
import { useFileTree } from './hooks/useFileTree';

import SideBar from './components/SideBar';
import Button from './components/Button';
import PressetsModal from './components/PressetsModal';
import PreviewModal from './components/PreviewModal';

import { SettingIcon } from './icons/SettingIcon';
import { ToggleIcon } from './icons/ToggleIcon';
import FileInput from './components/FileInput';

function App() {
	const [isSideBarOpen, setIsSideBarOpen] = useState(true);
	const [isModalOpen, setIsModalOpen] = useState(false);
	const [previewCode, setPreviewCode] = useState(null);
	const [isPreviewOpen, setIsPreviewOpen] = useState(false);
	const [showFileStructure, setShowFileStructure] = useState(false);

	const { fileStructure, selectedPaths, handleFolderSelect, toggleNodeCheck, parseSelected } =
		useFileTree();

	const modalClose = () => setIsModalOpen(false);

	const toggleSideBar = () => setIsSideBarOpen(!isSideBarOpen);

	const closePreview = () => {
		setPreviewCode(null);
		setIsPreviewOpen(false);
	};
	const openPreview = (code) => {
		setPreviewCode(code);
		setIsPreviewOpen(true);
	};

	const onFolderSelected = (e) => {
		handleFolderSelect(e);
		setShowFileStructure(true);
	};

	const toggleParse = () => {
		parseSelected();
		setShowFileStructure(false);
	};

	return (
		<main className="flex h-screen bg-gradient-to-r from-gray-950 to-black  ">
			<SideBar
				isOpen={isSideBarOpen}
				onToggle={toggleSideBar}
				onPreview={openPreview}
				fileStructure={fileStructure}
				showFileStructure={showFileStructure}
				toggleNodeCheck={toggleNodeCheck}
				selectedPaths={selectedPaths}
			/>

			<section className=" flex-1 gap-4  flex flex-col w-full h-full ">
				<div className="text-center pt-16">
					{/* <h1 className="font-medium leading-none text-white  text-5xl">AI Prompt Parser</h1> */}
				</div>

				<div className="flex flex-1 items-center justify-center flex-col gap-4">
					{!showFileStructure ? (
						<div className="flex rounded-2xl w-[450px] h-[290px] bg-gray-900 p-6 border border-gray-800">
							<div className="flex bg-black flex-col items-center justify-center w-full h-full border-2 border-gray-800 border-dashed rounded-2xl">
								<FileInput onFolderSelected={onFolderSelected} />
							</div>
						</div>
					) : (
						<Button
							className="border-none px-6 py-2 text-sm text-white rounded-full tracking-tight outline-none bg-blue-600 hover:bg-blue-800 transition-all"
							onClick={toggleParse}
						>
							Parse your files
						</Button>
					)}
				</div>
			</section>

			<div className="absolute top-0 left-0 text-white">
				<Button className="p-4" onClick={toggleSideBar}>
					<ToggleIcon />
				</Button>
			</div>

			<div className="absolute top-0 right-0">
				<Button
					className="p-4 text-white flex items-center gap-2"
					onClick={() => setIsModalOpen(true)}
				>
					<SettingIcon />
					Presets
				</Button>
			</div>

			<PressetsModal isOpen={isModalOpen} onClose={modalClose} />
			<PreviewModal code={previewCode} onClose={closePreview} isOpen={isPreviewOpen} />
		</main>
	);
}

export default App;
