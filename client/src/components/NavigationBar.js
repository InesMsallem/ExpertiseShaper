import React from 'react';
import { Container, Navbar } from 'react-bootstrap';
import { NavLink } from 'react-router-dom';

function NavigationBar() {
    return (

        <Navbar bg="light">
            <Container>
                <Navbar.Brand>MyStore</Navbar.Brand>
                <NavLink to="/forgot-password" style={({ isActive }) => ({
                    textDecoration: isActive ? "none" :
                        "underline",
                })}
                >
                    reset password
                </NavLink>
            </Container>
        </Navbar>
    )
}

export default NavigationBar