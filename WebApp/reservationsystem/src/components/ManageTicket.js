import React, { useContext, useEffect, useState } from "react"
import { Button, Container, Form, FormControl, Spinner, Table, Row, Col, Alert } from "react-bootstrap"
import { useNavigate, useSearchParams } from "react-router-dom"
import { UserContext } from "../App"
import Api, { authAxios, endpoints } from "../configs/Api"
import Paginator from "../layout/Paginator"

const ManageTicket = () => {
    const [user] = useContext(UserContext)
    const [bookedTickets, setBookedTickets] = useState([])
    const [stations, setStations] = useState([])
    const [username, setUsername] = useState('')
    const [dp, setDp] = useState('')
    const [dt, setDt] = useState('')
    const [queryState, setQueryState] = useState()
    const [state, setState] = useState()
    const [pageSize, setPageSize] = useState(10)
    const [totalSize, setTotalSize] = useState(0)
    const [sucMsg1, setSucMsg1] = useState(false)
    const [sucMsg2, setSucMsg2] = useState(false)
    const [q] = useSearchParams()
    const nav = useNavigate()

    useEffect(() => {
        const loadBookedTickets = async () => {
            let query = ''

            const username = q.get('username')
            if(username != null)
                query += `username=${username}`

            const departureStation = q.get('dp')
            if(departureStation != null)
                query += `&dp=${departureStation}`

            const departureTime = q.get('dt')
            if(departureTime != null)
                query += `&dt=${departureTime}`    

            setQueryState(query)
            
            const page = q.get('page')
            if(page != null)
                query += `&page=${page}`
            
            const res = await authAxios().get(`${endpoints['tickets']}?${query}`)
            if (res.status === 200) {
                setTotalSize(res.data.count)
                setBookedTickets(res.data.results)
            }
        }
        loadBookedTickets()
    }, [state, q])

    useEffect(() => {
        const loadStations = async () => {
            const res = await Api.get(endpoints['stations'])
            setStations(res.data)
        }
        loadStations()
    }, [])


    const deleteBookedTicket = async (ticketId) => {
        try {
            if (ticketId !== null) {
                await authAxios().delete(endpoints['tickets-action'](ticketId))
                setSucMsg2(true)
                setState([])
            }
        }
        catch (err) {
            console.info(err)
            setSucMsg2(false)
        }
    }

    const payBookedTicket = async (ticketId, price) => {
        try {
            if (ticketId !== null) {
                await authAxios().patch(endpoints['tickets-action'](ticketId), {
                    'paid': price
                })
                setSucMsg1(true)
                setState([])
            }
        }
        catch (err) {
            console.info(err)
            setSucMsg1(false)
        }
    }

    const search = (event) => {
        event.preventDefault()

        nav(`/tickets/?username=${username}&dp=${dp}&dt=${dt}`)
    }
    
    const paginate = (page) => nav(`/tickets/?${queryState}&page=${page}`)
    
    if (user.role !== 4)
        return <Spinner animation='grow' />

    return (
        <Container>
            <h1 className="text-center text-info">QUAN LY DAT VE</h1>
            
            {sucMsg2 !== false && <Alert key='warning' variant='warning'>
                Xóa vé thành công
            </Alert>}

            {sucMsg1 !== false && <Alert key='success' variant='success'>
                Trả tiền thành công
            </Alert>}

            <Row>
                <Col md={8} xs={12} >
                    <Form onSubmit={search} className="d-flex ml-auto">
                        <FormControl
                            type="search"
                            name="username"
                            value={username}
                            onChange={evt => setUsername(evt.target.value)}
                            placeholder="username..."
                            className="me-2"
                            aria-label="Search"
                        />

                        <select className="form-control" onChange={evt => setDp(evt.target.value)}>
                            <option value=''>Departure location...</option>
                            {stations.map(s => <option key={s.id} value={s.name}>{s.name}</option>)}    
                        </select>

                        <input className="form-control" type="date" onChange={evt => setDt(evt.target.value)} />

                        <Button type="submit" variant="outline-success">Search</Button>
                    </Form>
                    <br/>
                </Col>
            </Row>

            <Table striped bordered hover>
                <thead>
                    <tr>
                        <th>Schedule id</th>
                        <th>Bus name</th>
                        <th>Customer</th>
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
                    {bookedTickets.map(t => <tr key={t.id}>
                        <td>{t.schedule.id}</td>
                        <td>{t.schedule.bus.name}</td>
                        <td>{t.user.username}</td>
                        <td>{t.created_date.slice(0, 10)}</td>
                        <td>{t.schedule.departure_time.slice(11, 16)} {t.schedule.departure_time.slice(0, 10)}</td>
                        <td>{t.schedule.departure_station.name}</td>
                        <td>{t.schedule.arrival_station.name}</td>
                        <td>{t.quantity}</td>
                        <td>{(t.quantity * (t.schedule.price + t.schedule.price * t.schedule.type.surcharge)).toString().replace(/\B(?=(\d{3})+(?!\d))/g, ',')} VND</td>
                        <td><Button variant="danger" onClick={() => deleteBookedTicket(t.id)}>Delete</Button></td>
                        <td><Button variant="info" onClick={() => payBookedTicket(t.id, t.quantity * (t.schedule.price + t.schedule.price * t.schedule.type.surcharge))}>Pay</Button></td>
                    </tr>)}
                </tbody>
            </Table>
            
            <Paginator pageSize={pageSize} totalSize={totalSize} paginate={paginate} />
        </Container>
    )
}

export default ManageTicket