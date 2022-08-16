import React, { useContext } from 'react';
import { Navbar, Nav } from 'react-bootstrap';
import { Link, useNavigate } from 'react-router-dom';
import { MyTicketsContext, UserContext } from '../App';
import SearchForm from './SearchForm';
import cookies from 'react-cookies';

const Header = () => {
    const nav = useNavigate()
    const [user, userDispatch] = useContext(UserContext)
    const [myTickets, myTicketsDispatch] = useContext(MyTicketsContext)
        
    const logout = (event) => {
        event.preventDefault()
        cookies.remove('access_token')
	    cookies.remove('current_user')
        cookies.remove('current_tickets')
        myTicketsDispatch({'type': 'deleteAll'})
        userDispatch({"type": "logout"})
        nav("/login")
    }

    let btn = <>
        <Link to="/login" className="nav-link text-success">Login</Link>
        <Link to="/register" className="nav-link text-info">Register</Link>
    </>
    if (user != null) {
        btn = <>
            {user.role===4 && <Link to="/tickets" className="nav-link">Manage ticket</Link>}
            <Link to="/my-ticket" className="nav-link text-success">My ticket({myTickets.count})</Link>
            <Link to="/" className="nav-link text-success">Welcome {user.username}!</Link>
            <a href="/login" onClick={logout} className="nav-link text-danger">Logout</a>
        </>
    }

    return (
 	    <Navbar collapseOnSelect expand="lg" bg="dark" variant="dark">
            
            <Navbar.Brand >Reservation-System</Navbar.Brand>
            <Navbar.Toggle aria-controls="responsive-navbar-nav" />
            <Navbar.Collapse id="responsive-navbar-nav">
                <Nav className="me-auto">
                    <Link to="/" className="nav-link">Home</Link>

                    <Link to="/schedules" className="nav-link">Schedule</Link>

                    {btn}
                </Nav>

                <SearchForm />
            </Navbar.Collapse>
            
        </Navbar>
    )
}

export default Header