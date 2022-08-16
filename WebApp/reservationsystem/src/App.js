import React, { createContext, useReducer } from 'react';
import 'bootstrap/dist/css/bootstrap.min.css';
import 'font-awesome/css/font-awesome.min.css';
import { BrowserRouter, Route, Routes } from 'react-router-dom';
import Header from './layout/Header';
import Footer from './layout/Footer';
import Home from './components/Home';
import Schedule from './components/Schedule';
import Login from './components/Login';
import userReducer from './reducer/UserReducer';
import ScheduleDetail from './components/ScheduleDetail';
import Schedules from './components/Schedules';
import cookies from 'react-cookies'
import Register from './components/Register';
import myTicketsReducer from './reducer/MyTicketsReducer';
import MyTicket from './components/MyTicket';
import ManageTicket from './components/ManageTicket';

export const UserContext = createContext()
export const MyTicketsContext = createContext()

const App = () => {
  const [user, userDispatch] = useReducer(userReducer, cookies.load('current_user'))
  const [myTickets, myTicketsDispatch] = useReducer(myTicketsReducer, cookies.load('current_tickets')?cookies.load('current_tickets'):{count: 0, schedules: []})
  //
  return (
    <BrowserRouter>
      <UserContext.Provider value={[user, userDispatch]}>
        <MyTicketsContext.Provider value={[myTickets, myTicketsDispatch]}>
          <Header />
          
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/routes/:routeId/schedules" element={<Schedule />} />
            <Route path="/login" element={<Login/>} />
            <Route path="/schedules/" element={<Schedules />} />
            <Route path="/schedules/:scheduleId" element={<ScheduleDetail />} />
            <Route path="/register" element={<Register />} />
            <Route path="/my-ticket" element={<MyTicket />} />
            <Route path="/tickets" element={<ManageTicket />} />
          </Routes>

          <Footer />
        </MyTicketsContext.Provider>
      </UserContext.Provider>
    </BrowserRouter>
  )
}

export default App;
