
import { Route, Routes } from 'react-router-dom'
import './App.css'
import IndexPage from './pages/IndexPage'
import LoginPage from './pages/LoginPage'
import Layout from './components/Layout'
import RegisterPage from './pages/RegisterPage'
import axios from 'axios'
import { UserContextProvider } from './context/UserContext'
// import AccountPage from './pages/AccountPage'
import ProfilePage from './pages/ProfilePage'
import PlacesPage from './pages/PlacesPage'
import PlacesFormPage from './pages/PlacesFormPage'
import PlacePage from './pages/PlacePage'
import BookingsPage from './pages/BookingsPage'
import BookingPage from './pages/BookingPage'

// axios.defaults.baseURL = import.meta.env.VITE_API_BASE_URL;
axios.defaults.baseURL = "https://denizsarikas-booking-app.vercel.app/api";
axios.defaults.withCredentials = true;


function App() {



  return (
    <UserContextProvider>

      <Routes>
        <Route path="/" element={<Layout />}>

          <Route index element={<IndexPage />} />
          <Route path="/login" element={<LoginPage />} />
          <Route path="/register" element={<RegisterPage />} />
          {/* <Route path="/account/:subpage?" element={<AccountPage />} /> */}
          {/* <Route path="/account/:subpage/:action" element={<AccountPage />} /> */}
          <Route path="/account" element={<ProfilePage />} />
          <Route path="/account/places" element={<PlacesPage />} />
          <Route path="/account/places/new" element={<PlacesFormPage />} />
          <Route path="/account/places/:id" element={<PlacesFormPage />} />
          <Route path="/place/:id" element={<PlacePage />} />
          <Route path="/account/bookings" element={<BookingsPage />} />
          <Route path="/account/bookings/:id" element={<BookingPage />} />


        </Route>
      </Routes>
    </UserContextProvider>

  )
}

export default App
