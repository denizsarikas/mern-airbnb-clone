import { useState } from "react";
import { Link } from "react-router-dom";
import axios from "axios";

export default function RegisterPage() {

    const [name, setName] = useState('');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');

    async function registerUser(ev) {
        ev.preventDefault();
        try {
            await axios.post('/register', {
                name,
                email,
                password
            });
            alert('Registration succesful. Now you can log in');
        } catch (e) {
            alert('Registration failed. PLease try again later')
        }

    }
    return (
        <div className="mt-4 grow  flex items-center justify-around ">

            <div className="mb-64">

                <h1 className="text-4xl text-center mb-4">Create your account</h1>


                <form className="max-w-md mx-auto" onSubmit={registerUser}>
                    <input
                        type="text"
                        placeholder="John Doe"
                        onChange={ev => setName(ev.target.value)}
                        value={name}
                    />
                    <input
                        type="email"
                        placeholder="your@email.com"
                        onChange={ev => setEmail(ev.target.value)}
                        value={email}
                    />
                    <input
                        type="password"
                        placeholder="password here"
                        onChange={ev => setPassword(ev.target.value)}
                        value={password}
                    />
                    <button className="primary">Register</button>
                    <div className="text-center py-2 text-gray-500">
                        Already a member?
                        <Link className="underline text-black" to={'/login'}>Login here</Link>
                    </div>
                </form>

            </div>

        </div>
    )
}
