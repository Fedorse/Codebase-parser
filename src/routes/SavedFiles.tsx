import { ListFiles } from '../components/ListFiles';

const SavedFiles = (props) => {
	return (
		<div className="flex flex-col items-center justify-center">
			<ListFiles {...props} />
		</div>
	);
};
export default SavedFiles;
