import { useContext, useState } from "react"
import { UserContext } from "../context/UserContext"
import { Navigate, useParams } from "react-router-dom";
import axios from "axios";
import PlacesPage from "./PlacesPage";
import AccountNavigation from "../components/AccountNavigation";


export default function ProfilePage() {

    const [redirect, setRedirect] = useState(null);
    const { ready, user, setUser } = useContext(UserContext);

    // const { subpage } = useParams();
    // console.log(subpage);
    let { subpage } = useParams();
    if (subpage === undefined) {
        subpage = 'profile';
    }


    async function logout() {
        await axios.post('/logout');
        alert('you logged out');
        setUser(null);
        setRedirect(true);
    }

    if (!ready) {
        return 'Loading';
    }

    if (ready && !user && !redirect) {
        return <Navigate to={'/login'} />
    }




    if (redirect) {
        return <Navigate to={redirect} />
    }


    return (
        // <div>Account page for {user?.name}</div>
        <div>
            <AccountNavigation />
            {subpage === 'profile' && (
                <div className="text-center max-w-lg mx-auto">
                    Logged in as {user.name} {user.email} <br />
                    <button onClick={logout} className="primary nax-w-sm mt-4">Logout</button>
                </div>
            )}

            {subpage === 'places' && (
                <PlacesPage />
            )}
        </div>
    )
}
