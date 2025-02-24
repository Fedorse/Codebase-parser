import { ListFiles } from '../components/ListFiles';

const SavedFiles = ({ savedFiles, handleFileClick, handleFileRemove, currentFile }) => {
	return (
		<div className="flex flex-col items-center justify-center">
			<ListFiles
				savedFiles={savedFiles}
				handleFileClick={handleFileClick}
				handleFileRemove={handleFileRemove}
				currentFile={currentFile}
			/>
		</div>
	);
};
export default SavedFiles;
