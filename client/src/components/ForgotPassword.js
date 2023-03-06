import React, { useState } from "react";
import axios from "axios";

const ForgotPassword = () => {

    const [email, setEmail] = useState('');
    const [message, setMessage] = useState('');

    const handleEmailChange = (e) => {
        setEmail(e.target.value);
    };


    const handleFormSubmit = async (e) => {
        e.preventDefault();
        try {
            const response = await axios.post("http://localhost:8080/user/forgot-password", { email });
            setMessage(response.data.message);
        } catch (error) {
            setMessage(error.response.data.message);
        }
    };

    return (
        <div>
            <h1>Forgot Password</h1>
            <form onSubmit={handleFormSubmit}>
                <div>
                    <label htmlFor="email">Email:</label>
                    <input
                        type="email"
                        id="email"
                        value={email}
                        onChange={handleEmailChange}
                        required
                    />
                </div>
                <button type="submit">Reset Password</button>
            </form>
            <p>{JSON.stringify(message)}</p>
        </div>
    );
};

export default ForgotPassword;
