import React, { memo } from 'react';
import { Card, Col } from 'react-bootstrap';
import { Link } from 'react-router-dom';

const Item = (props) => {
    let url, txt, name, image, departure_time, arrival_time, departure_station, arrival_station, price, surcharge
    
    if(props.isRoute === true) {
        url = `/routes/${props.obj.id}/schedules/`
        txt = 'Cac tuyen xe'
        name = `Tuyen ${props.obj.departure_location.name} - ${props.obj.arrival_location.name}`
        image = `${props.obj.image}`
    }

    if(props.isSchedule === true) {
        departure_time = `${props.obj.departure_time}`
        arrival_time = `${props.obj.arrival_time}`
        departure_station = `${props.obj.departure_station.name}`
        arrival_station = `${props.obj.arrival_station.name}`
        price = `${props.obj.price}`
        surcharge = `${props.obj.type.surcharge}`
        txt = 'Chi tiet'
        url = `/schedules/${props.obj.id}`
        name = `${props.obj.bus.name}`
        image = `${props.obj.bus.image}`
    }

    return (
        <Col md={4}>
            <Card style={props.isSchedule===true?{height: "500px"}:{height: "350px"}}>
                <Card.Img variant="top" fluid="true" src={image} style={{height: "200px"}}/>
                <Card.Body>
                    <Card.Text className='font-weight-bold'>{name}</Card.Text>
                    {props.isSchedule === true &&
                        <Card.Text style={{height: "150px"}}>
                            {departure_station} - {arrival_station}
                            <br></br>
                            Departure time: {departure_time.slice(11, 16)} {departure_time.slice(0, 10)}
                            <br></br>
                            Arrival time: {arrival_time.slice(11, 16)} - {arrival_time.slice(0, 10)}
                            <br></br>
                            <p className='text-danger font-weight-bold'>Price: {(parseFloat(price) + parseFloat(price * surcharge)).toString().replace(/\B(?=(\d{3})+(?!\d))/g, ',')} VND</p>
                        </Card.Text>
                    }
                    <Link to={url} className="btn btn-info">{txt}</Link>                   
                </Card.Body>
            </Card>
        </Col>
    )
}

export default memo(Item)