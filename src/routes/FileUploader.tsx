import DragAndDrop from '../components/DragAndDrop';

export const FileUploader = ({ handleFolderSelect, handleFileSelect }) => {
	return (
		<>
			<main className="bg-black h-screen w-screen flex flex-col items-center justify-center gap-5">
				<DragAndDrop handleFileSelect={handleFileSelect} handleFolderSelect={handleFolderSelect} />
			</main>
		</>
	);
};
export default FileUploader;
