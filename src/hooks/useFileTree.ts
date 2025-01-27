import { useCallback, useState } from 'react';
import { createFileTree } from '../utils/fileTree';

export const useFileTree = () => {
	const [fileStructure, setFileStructure] = useState([]);
	const [selectedPaths, setSelectedPaths] = useState([]);

	const handleFolderSelect = (e) => {
		const files = e.target.files;
		if (!files) return;

		const fileArray = Array.from(files);
		const treeStructure = createFileTree(fileArray);
		setFileStructure(treeStructure);
	};

	const toggleNodeCheck = (nodePath) => {
		setSelectedPaths((prev) => {
			if (prev.includes(nodePath)) {
				return prev.filter((path) => path !== nodePath);
			} else {
				return [...prev, nodePath];
			}
		});
	};
	const parseSelected = useCallback(() => {
		console.log(selectedPaths);
	}, [selectedPaths]);
	return {
		fileStructure,
		selectedPaths,
		handleFolderSelect,
		toggleNodeCheck,
        parseSelected
	};
};
