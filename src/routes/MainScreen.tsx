import DragAndDrop from '../components/DragAndDrop';
import ButtonUploads from '../components/ButtonUploads';
import { invoke } from '@tauri-apps/api/core';
import { usePreset } from '../hooks/usePresset';

export const MainScreen = () => {
	const { presets, selected } = usePreset();

	const parse = async (selectedPaths: string[]) => {
		await invoke('parse', {
			paths: selectedPaths,
			ignorePatterns: selected ? presets[selected] : []
		});
	};

	return (
		<main className="h-full flex flex-col w-full items-center justify-center overflow-hidden">
			<DragAndDrop parse={parse} />
			<ButtonUploads parse={parse} />
		</main>
	);
};
export default MainScreen;
