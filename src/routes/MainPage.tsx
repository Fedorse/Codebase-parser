import DragAndDrop from '../components/DragAndDrop';

export const MainPage = ({ handleFolderSelect, handleFileSelect, parseFiles }) => {
	return (
		<main className="h-screen flex flex-col items-center justify-center ">
			<DragAndDrop
				parseFiles={parseFiles}
				handleFileSelect={handleFileSelect}
				handleFolderSelect={handleFolderSelect}
			/>
		</main>
	);
};
export default MainPage;
