import './App.css';
import { InputIcon } from './icons/InputIcon';
import { useState } from 'react';
import SideBar from './components/SideBar';
import { ToggleIcon } from './icons/ToggleIcon';
import Button from './components/Button';
import Modal from './components/Modal';
import { SettingIcon } from './icons/SettingIcon';

function App() {
	const [isSideBarOpen, setIsSideBarOpen] = useState(true);
	const [isModalOpen, setIsModalOpen] = useState(false);
	const modalOpen = () => {
		setIsModalOpen(true);
	};
	const modalClose = () => {
		setIsModalOpen(false);
	};

	const toggleSideBar = () => {
		setIsSideBarOpen(!isSideBarOpen);
	};
	return (
		<main className="flex h-screen w-screen">
			<SideBar isOpen={isSideBarOpen} onToggle={toggleSideBar} />
			<div className="z-5 relative gap-4 bg-white  flex flex-col items-center justify-center text-black  w-full h-full text-xl  ">
				<input
					id="file-input"
					type="file"
					multiple
					className=" absolute inset-0 w-full h-full opacity-0"
				/>
				<InputIcon />
				<label htmlFor="file-input">Add files for Prompt</label>
			</div>
			<div className="absolute top-0 left-0">
				<Button className="p-4" onClick={toggleSideBar}>
					<ToggleIcon />
				</Button>
			</div>
			<div className="absolute top-0 right-0">
				<Button className="p-4 flex items-center gap-2" onClick={modalOpen}>
					<SettingIcon />
					Presets
				</Button>
			</div>
			<Modal isOpen={isModalOpen} onClose={modalClose} />
		</main>
	);
}

export default App;
