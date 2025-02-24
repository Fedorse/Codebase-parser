import { Link, useLocation } from 'react-router-dom';

export const Navbar = () => {
	return (
		<nav className="bg-neutral-950 w-full h-[80px] border-b-2 border-gray-800 ">
			<div className="flex justify-between">
				<Link
					to="/"
					className={`text-xl ${location.pathname === '/' ? 'text-blue-400' : 'text-white'}`}
				>
					Home
				</Link>
				<Link
					to="/saved-files"
					className={`text-xl ${
						location.pathname === '/saved-files' ? 'text-blue-400' : 'text-white'
					}`}
				>
					Saved Files
				</Link>
			</div>
		</nav>
	);
};
export default Navbar;
