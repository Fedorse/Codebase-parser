import './App.css';
import { InputIcon } from './InputIcon';

function App() {
	return (
		<main className="flex h-screen w-screen items-center justify-center">
			<div className="relative gap-4 bg-input flex flex-col items-center justify-center text-white  w-full h-full text-xl ">
				<input
					id="file-input"
					type="file"
					multiple
					className=" absolute inset-0 w-full h-full opacity-0"
				/>
				<label htmlFor="file-input">Chose file for parse</label>
				<InputIcon />
			</div>
		</main>
	);
}

export default App;
