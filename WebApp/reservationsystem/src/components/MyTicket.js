import React, { useContext, useEffect, useState } from "react"
import { Button, Container, Spinner, Table, Alert } from "react-bootstrap"
import { MyTicketsContext, UserContext } from "../App"
import { authAxios, endpoints } from "../configs/Api"
import cookies from 'react-cookies'

const MyTicket = () => {
    const [user] = useContext(UserContext)
    const [myTickets, myTicketsDispatch] = useContext(MyTicketsContext)
    const [bookedTickets, setBookedTickets] = useState([])
    const [errMsg, setErrMsg] = useState(false)
    const [sucMsg1, setSucMsg1] = useState(false)
    const [sucMsg2, setSucMsg2] = useState(false)
    const [state, setState] = useState()

    useEffect(() => {
        const loadBookedTickets = async () => {
            const res = await authAxios().get(endpoints['my-tickets'])
            setBookedTickets(res.data)
        }
        loadBookedTickets()

        cookies.remove('current_tickets')
        cookies.save('current_tickets', myTickets)

    }, [myTickets, state])

    const deleteTicket = (scheduleId) => {
        myTicketsDispatch({
            'type': 'deleteTicket',
            'payload': {
                'count': myTickets.count,
                'scheduleId': scheduleId
            }
        })
    }

    const bookTickets = (event) => {
        event.preventDefault()

        let res
        myTickets.schedules.forEach(async (s) => {
            try {
                res = await authAxios().post(`${endpoints['book-ticket'](s.id)}`, {
                    'schedule': s.id,
                    'user': user.id, 
                    'quantity': s.quantity,
                    'paid': 0.0
                })
                if (res.status === 201) { 
                    myTicketsDispatch({
                        'type': 'deleteTicket',
                        'payload': {
                            'count': myTickets.count,
                            'scheduleId': s.id
                        }
                    })
                    setSucMsg1(true)
                }
            }
            catch (err) {
                console.info(err)
                setErrMsg(true)
            }
        })
    }

    const deleteBookedTicket = async (ticketId) => {
        try {
            if (ticketId !== null) {
                await authAxios().delete(endpoints['my-tickets-action'](ticketId))
                setSucMsg2(true)
                setState([])
            }
        }
        catch (err){
            console.info(err)
            setSucMsg2(false)
        }
    }

    if(user === null )
        return <Spinner animation='grow' />
    
    return (
        <Container>
            <h1 className="text-center text-info">DANH SACH VE</h1>
            {sucMsg1 !== false && <Alert key='success' variant='success'>
                Đặt vé thành công
            </Alert>}
            
            {errMsg !== false && <Alert key='danger' variant='danger'>
                Đặt vé thất bại hãy kiểm tra lại số lượng chỗ ngồi và số lượng vé cho phép
            </Alert>}
            <Table striped bordered hover>
                <thead>
                    <tr>
                        <th>Schedule id</th>
                        <th>Bus name</th>
                        <th>Departure time</th>
                        <th>Departure location</th>
                        <th>Arrival location</th>
                        <th>Quantity</th>
                        <th>Price</th>
                        <th></th>
                    </tr>
                </thead>
                <tbody>
                    {myTickets.schedules.map(s => <tr>
                        <td>{s.id}</td>
                        <td>{s.busName}</td>
                        <td>{s.departureTime.slice(11, 16)} {s.departureTime.slice(0, 10)}</td>
                        <td>{s.departureStation}</td>
                        <td>{s.arrivalStation}</td>
                        <td>{s.quantity}</td>
                        <td>{(s.quantity * (s.price + s.price * s.surcharge)).toString().replace(/\B(?=(\d{3})+(?!\d))/g, ',')} VND</td>
                        <td><Button variant="danger" onClick={() => deleteTicket(s.id)}>Delete</Button></td>
                    </tr>)}
                </tbody>
            </Table>
            {myTickets.count !== 0 && <Button variant="info" onClick={bookTickets}>Confirm book ticket</Button>}
            <br/><br/>
            
            {sucMsg2 !== false && <Alert key='warning' variant='warning'>
                Xóa vé thành công
            </Alert>}
            {bookTickets.length > 0 && <Table striped bordered hover>
                <thead>
                    <tr>
                        <th>Schedule id</th>
                        <th>Bus name</th>
                        <th>Booked date</th>
                        <th>Departure time</th>
                        <th>Departure location</th>
                        <th>Arrival location</th>
                        <th>Quantity</th>
                        <th>Price</th>
                        <th></th>
                    </tr>
                </thead>
                <tbody>
                    {bookedTickets.map(t => <tr>
                        <td>{t.schedule.id}</td>
                        <td>{t.schedule.bus.name}</td>
                        <td>{t.created_date.slice(0, 10)}</td>
                        <td>{t.schedule.departure_time.slice(11, 16)} {t.schedule.departure_time.slice(0, 10)}</td>
                        <td>{t.schedule.departure_station.name}</td>
                        <td>{t.schedule.arrival_station.name}</td>
                        <td>{t.quantity}</td>
                        <td>{(t.quantity * (t.schedule.price + t.schedule.price * t.schedule.type.surcharge)).toString().replace(/\B(?=(\d{3})+(?!\d))/g, ',')} VND</td>
                        <td><Button variant="danger" onClick={() => deleteBookedTicket(t.id)} >Delete</Button></td>
                    </tr>)}
                </tbody>
            </Table>}
        </Container>
    
    )
}

export default MyTicket