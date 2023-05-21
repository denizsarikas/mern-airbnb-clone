import { useContext } from "react"
import { UserContext } from "../context/UserContext"
import { Link, Navigate } from "react-router-dom";


export default function AccountPage() {

    const { ready, user } = useContext(UserContext);

    if (!ready) {
        return 'Loading';
    }

    if (ready && !user) {
        return <Navigate to={'/login'} />
    }
    return (
        // <div>Account page for {user?.name}</div>
        <div>
            <nav className="w-full flex">
                <Link to={'/account/bookings'}>My bookings</Link>
                <Link to={'/account/places'}>My accommodations</Link>
            </nav>
        </div>
    )
}
