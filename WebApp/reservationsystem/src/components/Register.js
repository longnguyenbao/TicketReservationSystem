import React, { useRef, useState } from "react"
import { Container, Form, Button, Alert } from "react-bootstrap"
import { useNavigate } from "react-router-dom"
import Api, { endpoints } from "../configs/Api"

const Register = () => {
    const [newUser, setNewUser] = useState({
        'first_name': '',
        'last_name': '',
        'email': '',
        'username': '',
        'password': ''
    })
    const [errMsg, setErrMsg] = useState(null)
    const avatar = useRef()
    const nav = useNavigate()

    const change = (obj) => {
        setNewUser({
            ...newUser, 
            ...obj
        })
    }

    const register = async (event) => {
        event.preventDefault()

        let data = new FormData()
        data.append('first_name', newUser.first_name)
        data.append('last_name', newUser.last_name)
        data.append('email', newUser.email)
        data.append('username', newUser.username)
        data.append('password', newUser.password)
        data.append('avatar', avatar.current.files[0])

        try {
            const res = await Api.post(endpoints['users'], data, {
                headers: {
                    'Content-Type': 'multipart/form-data'
                }
            })
            
            if (res.status === 201) {
                nav("/login")
            }
        } 
        catch (err) {
            console.error(err)
            setErrMsg('Some error occurred please check username and password again')
        }        
    }

    return (
        <Container>
            <h1 className="text-center text-danger">DANG KY</h1>

            {errMsg !== null && <Alert key='danger' variant='danger'>
                {errMsg}
            </Alert>}

            <Form onSubmit={register}>
                <Form.Group className="mb-3" controlId="formBasic1">
                    <Form.Label>First Name</Form.Label>
                    <Form.Control required type="text" value={newUser.first_name} onChange={(evt) => change({'first_name': evt.target.value.replace(/[^\w\s]/gi, "")})} placeholder="first name..." />
                </Form.Group>

                <Form.Group className="mb-3" controlId="formBasic2">
                    <Form.Label>Last Name</Form.Label>
                    <Form.Control required type="text" value={newUser.last_name} onChange={(evt) => change({'last_name': evt.target.value.replace(/[^\w\s]/gi, "")})} placeholder="last name..." />
                </Form.Group>

                <Form.Group className="mb-3" controlId="formBasic3">
                    <Form.Label>Email</Form.Label>
                    <Form.Control required type="email" value={newUser.email} onChange={(evt) => change({'email': evt.target.value})} placeholder="email..." />
                </Form.Group>

                <Form.Group className="mb-3" controlId="formBasic4">
                    <Form.Label>Username</Form.Label>
                    <Form.Control required type="text" 
                    value={newUser.username} 
                    onChange={(evt) => change({'username': evt.target.value.replace(/[^\w\s]/gi, "")})} placeholder="username..." />
                </Form.Group>

                <Form.Group className="mb-3" controlId="formBasic5">
                    <Form.Label>Password</Form.Label>
                    <Form.Control required type="password" value={newUser.password} onChange={(evt) => change({'password': evt.target.value})} placeholder="password..." />
                </Form.Group>

                <Form.Group className="mb-3" controlId="formBasic6">
                    <Form.Label>avatar</Form.Label>
                    <Form.Control required type="file" ref={avatar} />
                </Form.Group>

                <Button variant="primary" type="submit">
                    Register
                </Button>
            </Form>
        </Container>
    )
}

export default Register