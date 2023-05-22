import { useState } from "react";
import Perks from "../components/Perks";
import PhotosUploader from "../components/PhotosUploader";
import axios from "axios";
import AccountNavigation from "../components/AccountNavigation";
import { Navigate } from "react-router-dom";

export default function PlacesFormPage() {

    const [title, setTitle] = useState('');
    const [address, setAddress] = useState('');
    const [addedPhotos, setAddedPhotos] = useState([]);
    // const [photoLink, setPhotoLink] = useState('');
    const [description, setDescription] = useState('');
    const [perks, setPerks] = useState([]);
    const [extraInfo, setExtraInfo] = useState('');
    const [checkIn, setCheckIn] = useState('');
    const [checkOut, setCheckOut] = useState('');
    const [maxGuests, setMaxGuests] = useState(1);
    const [redirect, setRedirect] = useState(false);

    function inputHeader(text) {
        return (
            <h2 className="text-2xl mt-4">{text}</h2>
        );
    }

    function inputDescription(text) {
        return (
            <p className="text-gray-500 text-sm">{text}</p>
        );
    }

    function preInput(header, description) {
        return (
            <>
                {inputHeader(header)}
                {inputDescription(description)}
            </>
        )
    }

    async function addNewPlace(ev) {
        ev.preventDefault();
        await axios.post('/places', {
            title,
            address,
            addedPhotos,
            description,
            perks,
            extraInfo,
            checkIn,
            checkOut,
            maxGuests
        });
        setRedirect(true);
    }

    if (redirect) {
        return <Navigate to={'/account/places'} />
    }

    return (

        <div>
            <AccountNavigation />
            <form onSubmit={addNewPlace}>
                {preInput('Title', 'Title for your place. Should be short and catchy!')}
                <input value={title}
                    onChange={ev => setTitle(ev.target.value)}
                    type="text" placeholder="title, for example: My lovely apart"
                />
                {preInput('Address', 'Address for your place')}
                <input value={address}
                    onChange={ev => setAddress(ev.target.value)}
                    type="text" placeholder="address"
                />
                {preInput('Photos', 'MORE = BETTER')}
                <PhotosUploader addedPhotos={addedPhotos} onChange={setAddedPhotos} />
                {preInput('Description', 'Description of the place')}
                <textarea
                    value={description}
                    onChange={ev => setDescription(ev.target.value)}
                />
                {preInput('Perks', 'Select all the perks of your place')}
                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-2 mt-2">
                    <Perks
                        selected={perks}
                        onChange={setPerks}
                    />
                </div>
                {preInput('Extra info', 'House rules, etc')}
                <textarea
                    value={extraInfo}
                    onChange={ev => setExtraInfo(ev.target.value)}
                />
                {preInput('Check in&out times', 'Add check in and out times, remember to have some time window for cleaning the room between guests')}
                <div className="gap-2 grid sm:grid-cols-3">
                    <div>
                        <h3 className="mt-2 -mb-1">Check in time</h3>
                        <input
                            type="number"
                            value={checkIn}
                            onChange={ev => setCheckIn(ev.target.value)}
                            placeholder="14"
                        />
                    </div>
                    <div>
                        <h3 className="mt-2 -mb-1">Check out time</h3>
                        <input
                            type="number"
                            value={checkOut}
                            onChange={ev => setCheckOut(ev.target.value)}
                            placeholder="23" />
                    </div>
                    <div>
                        <h3 className="mt-2 -mb-1">Max number of guests</h3>
                        <input
                            type="number"
                            value={maxGuests}
                            onChange={ev => setMaxGuests(ev.target.value)}
                        />
                    </div>
                </div>
                <button className="my-4 primary">Save</button>
            </form>
        </div>
    )
}
