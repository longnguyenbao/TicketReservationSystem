import React, { memo, useContext, useEffect, useRef, useState } from "react"
import { Button, Form } from "react-bootstrap"
import Rating from "react-rating"
import { UserContext } from "../App"
import Api, { authAxios, endpoints } from "../configs/Api"

const FeedbackForm = (props) => {
    const [user] = useContext(UserContext)
    const [state, setState] = useState()
    const rate = useRef(3)
    const content = useRef('')

    useEffect(() => {
        const loadFeedbacks = async () => {
            const res = await Api.get(endpoints['bus-feedbacks'](props.busId))
            props.setFeedbacks(res.data)
        }
        loadFeedbacks()  
    }, [state])
    
    const addFeedback = async (event) => {
        event.preventDefault()

        const res = await authAxios().post(endpoints['feedbacks'], {
            'rate': rate.current,
            'content': content.current, 
            'bus': props.busId,
            'user': user.id
        })

        props.setFeedbacks([...props.feedbacks, res.data])
        setState([])
    }

    const updateFeedback = async (event) => {
        event.preventDefault()

        if (props.myFeedback !== null) {
            await authAxios().put(endpoints['feedback-action'](props.myFeedback.id), {
                'rate': rate.current,
                'content': content.current, 
                'bus': props.busId,
                'user': user.id
            })

            setState([])
        }
    }

    const deleteFeedback = async (event) => {
        event.preventDefault()

        if (props.myFeedback !== null) {
            await authAxios().delete(endpoints['feedback-action'](props.myFeedback.id))
            props.setMyFeedback(null)
        }

        setState([])
    }
    
    return (
        <Form onSubmit={props.myFeedback===null?addFeedback:updateFeedback}>
            
            <Rating initialRating={props.myFeedback===null?rate.current:props.myFeedback.rate} onChange={(r) => rate.current=r} emptySymbol="fa fa-star-o fa-2x text-danger" fullSymbol="fa fa-star fa-2x text-danger" />
            
            <Form.Group className="mb-3" controlId="formContent">
                <Form.Control as="textarea" defaultValue={props.myFeedback===null?content.current:props.myFeedback.content} onChange={(evt) => content.current=evt.target.value} placeholder="Content..." />
            </Form.Group>
        
            <Button variant="primary" type="submit">
                {props.myFeedback===null?'Send feedback':'Update feedback'}
            </Button>
            
            {props.myFeedback !== null && <Button variant="danger" onClick={deleteFeedback}>
                Delete my feedback
            </Button>}
        </Form>
    )
}

export default memo(FeedbackForm)