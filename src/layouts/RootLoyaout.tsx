import { Outlet } from 'react-router-dom';
import Navbar from '../components/Navbar';

export default function RootLoyaout() {
	return (
		<div className="min-h-screen bg-black">
			<Navbar />
			<Outlet />
		</div>
	);
}
