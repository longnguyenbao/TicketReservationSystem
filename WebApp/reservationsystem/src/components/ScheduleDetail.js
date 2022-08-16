import React, { memo, useContext, useEffect, useState } from 'react';
import { Container, Spinner, Row, Col, Image, ListGroup, Badge, Button } from 'react-bootstrap';
import Moment from 'react-moment';
import Rating from 'react-rating';
import { useParams } from 'react-router-dom';
import { MyTicketsContext, UserContext } from '../App';
import Api, { authAxios, endpoints } from '../configs/Api';
import FeedbackForm from './FeedbackForm';
import cookies from 'react-cookies'

const ScheduleDetail = () => {
    const [schedule, setSchedule] = useState(null)
    const [busId, setBusId] = useState(null)
    const [feedbacks, setFeedbacks] = useState([])
    const [bookedTickets, setBookedTickets] = useState(null)
    const [myFeedback, setMyFeedback] = useState(null)
    const [state, setState] = useState()
    const { scheduleId } = useParams()
    const [user] = useContext(UserContext)
    const [myTickets, myTicketsDispatch] = useContext(MyTicketsContext)
    
    useEffect(() => {
        const loadSchedule = async () => {
            let res = null
            if (user != null) {
                res = await authAxios().get(endpoints['schedule-detail'](scheduleId))
            }
            else {
                res = await Api.get(endpoints['schedule-detail'](scheduleId))
            }
            setSchedule(res.data)
            setBusId(res.data.bus.id)
        }
        loadSchedule()
    }, [scheduleId, state, user])
    
    useEffect(() => {
        const loadFeedbacks = async () => {
            const res = await Api.get(endpoints['bus-feedbacks'](busId))
            setFeedbacks(res.data)
        }
        loadFeedbacks()  
    }, [busId])
    
    useEffect(() => {
        const checkFeedbacked = () => {
            if(user) {
                feedbacks.forEach(f => {
                    if(f.user.id === user.id) {
                        setMyFeedback(f)
                    }
                });
            }
        }
        checkFeedbacked()  
    }, [feedbacks, user])

    useEffect(() => {
        const countBookedTickets = () => {
            if(myTickets.schedules) {
                myTickets.schedules.forEach(s => {
                    if(s.id === parseInt(scheduleId)) {
                        setBookedTickets(s.quantity)
                    }
                    
                });
            }
        }
        countBookedTickets()
    }, [myTickets, scheduleId])

    const bookTicket = () => {
        const total_seats = parseInt(schedule.bus.total_seats)
        const unavailable_seats = parseInt(schedule.unavailable_seats.quantity__sum)?parseInt(schedule.unavailable_seats.quantity__sum):0.0

        if(total_seats - unavailable_seats > 0 && bookedTickets + unavailable_seats < total_seats ) {            
            myTicketsDispatch({
                'type': 'bookTicket',
                'payload': {
                    'count': myTickets.count,
                    'schedule': schedule
                }
            })
        }
    }

    const like = async () => {
        await authAxios().post(endpoints['bus-like'](busId))
        setState([])
    }
    
    cookies.remove('current_tickets')
    cookies.save('current_tickets', myTickets)

    if(schedule === null)
        return <Spinner animation='grow' />

    return (
        <Container>
            <h1 className="text-center text-info">CHI TIET CHUYEN XE ({scheduleId})</h1>
            <h2 className="text-center text-info">{schedule.route.departure_location.name} - {schedule.route.arrival_location.name}</h2>
            <Row>
                <Col md={4} xs={12} >
                    <Image src={schedule.bus.image} fluid />
                    <br/><br/>
                    <h3 className='text-danger font-weight-bold'>Price: {(parseFloat(schedule.price) + parseFloat(schedule.price * schedule.type.surcharge)).toString().replace(/\B(?=(\d{3})+(?!\d))/g, ',')} VND</h3>         
                    <h3 className='font-weight-bold'>
                        Available seat(s): 
                        {parseInt(schedule.unavailable_seats.quantity__sum)?parseInt(schedule.bus.total_seats)-parseInt(schedule.unavailable_seats.quantity__sum):parseInt(schedule.bus.total_seats)}
                        /{schedule.bus.total_seats}
                    </h3>
                    <p>Departure location: {schedule.departure_station.name}</p>
                    <p>Arrival location: {schedule.arrival_station.name}</p>
                    <p>Departure time: {schedule.departure_time.slice(11, 16)} {schedule.departure_time.slice(0, 10)}</p>
                    <p>Arrival time: {schedule.arrival_time.slice(11, 16)} - {schedule.arrival_time.slice(0, 10)}</p>
                </Col>
                <Col md={8} xs={12}>
                    <h1>{schedule.bus.name}</h1>
                    {schedule.bus.tags.map(t => <Badge key={t.id} bg="info">{t.name}</Badge>)}

                    <br/>
                    {user != null && <div>
                        <br/>
                        <Button style={{ marginRight: "1%" }} variant='success' onClick={bookTicket}>Book ticket</Button> 
                        <Button variant={schedule.bus.like===true?'primary':'outline-primary'} onClick={like}>Like</Button>
                        <br/>
                    </div>}

                    <h4>Driver: {schedule.user.first_name} {schedule.user.last_name}</h4>
                    <h4>Number plate: {schedule.bus.number_plate}</h4>
                    <h4>Decription:</h4>
                    <div dangerouslySetInnerHTML={{__html: schedule.bus.organization.description}}></div>
                    <div dangerouslySetInnerHTML={{__html: schedule.bus.description}}></div>
                </Col>
            </Row>
            <br/><br/>
            <Row>
                <Col>
                    {user != null && <FeedbackForm busId={busId} feedbacks={feedbacks} setFeedbacks={setFeedbacks} myFeedback={myFeedback} setMyFeedback={setMyFeedback} />}
                    <ListGroup>                        
                        {feedbacks.map(f => <div key={f.id}>
                            <br/>
                            <ListGroup.Item>
                                <Row>
                                    <Col md={1} xs={12} >
                                        <Image src={f.user.avatar_view} fluid width="100%" roundedCircle />         
                                    </Col>
                                    <Col md={11} xs={12}>
                                        {f.user.username} - <Moment fromNow>{f.created_date}</Moment>
                                        <br/>
                                        <Rating initialRating={f.rate} readonly emptySymbol="fa fa-star-o fa-2x text-warning" fullSymbol="fa fa-star fa-2x text-warning"/>
                                        <br/>
                                        <p>{f.content}</p>
                                    </Col>
                                </Row>
                            </ListGroup.Item>
                        </div>)}
                    </ListGroup>
                </Col>
            </Row>
        </Container>
    )
}

export default memo(ScheduleDetail)