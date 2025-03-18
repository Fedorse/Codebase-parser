const HARDCODED_PRESETS = [
	{
		name: 'Git',
		ignore_patterns: ['.git', '.gitignore', '.github']
	},
	{
		name: 'Node.js',
		ignore_patterns: ['node_modules', 'package-lock.json', 'yarn.lock', 'dist', 'build']
	},
	{
		name: 'Python',
		ignore_patterns: ['__pycache__', 'venv', '.pytest_cache', '*.pyc', '*.pyo', '.coverage']
	},
	{
		name: 'Rust',
		ignore_patterns: ['target', 'Cargo.lock', '*.rs.bk']
	},
	{
		name: 'Java',
		ignore_patterns: ['*.class', 'target', '.mvn', '*.jar', '.gradle']
	},
	{
		name: 'VS Code',
		ignore_patterns: ['.vscode', '.vs', '*.code-workspace']
	},
	{
		name: 'Docs & Temp',
		ignore_patterns: ['*.md', 'README*', 'LICENSE', '*.tmp', '*.temp', '*.log']
	}
];
export const Preset = ({}) => {
	return (
		<div className="absolute top-full left-0 z-50 mt-1 w-full bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-700 rounded-lg shadow-lg max-h-60 overflow-y-auto">
			<span className="text-white/30 pl-10">ignore patterns</span>
			{HARDCODED_PRESETS.map((preset) => (
				<div
					key={preset.name}
					className="flex items-center w-full text-left px-4 py-2 text-black/70 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
				>
					<label className="flex items-center cursor-pointer w-full">
						<input
							type="checkbox"
							// checked={isPresetSelected(preset.name)}
							// onChange={() => handlePresetToggle(preset)}
							className="w-4 h-4 rounded mr-3 text-blue-600 bg-gray-100 border-gray-300 dark:bg-gray-700 dark:border-gray-600 focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-600"
						/>
						<div className="flex flex-col">
							<span className="font-medium">{preset.name}</span>
							<span className="text-xs text-gray-500 dark:text-gray-400 mt-1">
								{preset.ignore_patterns.slice(0, 3).join(', ')}
							</span>
						</div>
					</label>
				</div>
			))}
		</div>
	);
};
