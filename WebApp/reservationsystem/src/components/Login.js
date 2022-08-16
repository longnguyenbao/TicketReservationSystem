import React, { useContext, useState } from 'react'
import { Container, Form, Button, Alert } from 'react-bootstrap'
import { UserContext } from '../App'
import { Navigate } from 'react-router-dom'
import Api, { authAxios, endpoints } from '../configs/Api'
import cookies from 'react-cookies'

const Login = () => {
    const [username, setUsername] = useState()
    const [password, setPassword] = useState()
    const [errMsg, setErrMsg] = useState(null)
    const [user, userDispatch] = useContext(UserContext)

    const login = async (event) => {
        event.preventDefault()

        try { 
            const res = await Api.post(endpoints['login'], {
                'client_id': 'TV3WER5P181xFizMzWKRXOp1mNiJIFyr7zA8fYHA',
                //'client_secret': '8TAGfN7J847PdpVbs4MMSITdkguyqeviEu5TIzfmDrjAqhPzG2uur0dFglQGKyyQzQFP8Lb2QTzc1fxuRLPA2mAAlPqazgHBUdUf9T66jzjS8HYrGlgIEpBlfAdTtaHj',
                'username': username,
                'password': password,
                'grant_type': 'password'
            })

            if (res.status === 200) {
                cookies.save('access_token', res.data.access_token)
                const user = await authAxios().get(endpoints['current_user'])
                cookies.save('current_user', user.data)

                userDispatch({
                    "type": "login",
                    "payload": user.data
                })
            }
        }
        catch (err) {
            console.info(err)
            setErrMsg('Username or password is incorrect')
        }
    }

    if (user != null)
        return <Navigate to="/" />

    return (
        <Container>
            <h1 className="text-center text-danger">DANG NHAP</h1>

            {errMsg !== null && <Alert key='danger' variant='danger'>
                {errMsg}
            </Alert>}

            <Form onSubmit={login}>
            <Form.Group className="mb-3" controlId="formBasicEmail">
                <Form.Label>Username</Form.Label>
                <Form.Control required type="test" value={username} onChange={evt => setUsername(evt.target.value.replace(/[^\w\s]/gi, ""))} placeholder="username..." />
            </Form.Group>

            <Form.Group className="mb-3" controlId="formBasicPassword">
                <Form.Label>Password</Form.Label>
                <Form.Control required type="password" value={password} onChange={evt => setPassword(evt.target.value)} placeholder="password..." />
            </Form.Group>
            <Button variant="primary" type="submit">
                Login
            </Button>
            </Form>

            <br/><br/>
        </Container>
    )
}

export default Login