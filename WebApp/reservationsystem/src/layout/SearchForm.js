import React, { memo, useEffect, useState } from "react";
import { Button, Form } from "react-bootstrap";
import { useNavigate } from "react-router-dom";
import Api, { endpoints } from "../configs/Api";

const SearchForm = () => {
    const [provinces, setProvinces] = useState([])
    const [organizations, setOrganizations] = useState([])
    const [org, setOrg] = useState('')
    const [fp, setFp] = useState('')
    const [tp, setTp] = useState('')
    const [time, setTime] = useState('')
    const nav = useNavigate()

    useEffect(() => {
        const loadProvinces = async () => {
            const res = await Api.get(endpoints['provinces'])
            setProvinces(res.data)
        }

        loadProvinces()
    }, [])

    useEffect(() => {
        const loadOrganizations = async () => {
            const res = await Api.get(endpoints['organizations'])
            setOrganizations(res.data)
        }

        loadOrganizations()
    }, [])
    
    const search = (event) => {
        event.preventDefault()

        nav(`/schedules/?org=${org}&fp=${fp}&tp=${tp}&time=${time}`)
    }
    
    return (
        <Form onSubmit={search} className="d-flex ml-auto">
            <select className="form-control" onChange={evt => setOrg(evt.target.value)}>
                <option value=''>Organization...</option>
                {organizations.map(o => <option key={o.id} value={o.name}>{o.name}</option>)}    
            </select>
            
            <select className="form-control" onChange={evt => setFp(evt.target.value)}>
                <option value=''>Start at...</option>
                {provinces.map(p => <option key={p.id} value={p.name}>{p.name}</option>)}    
            </select>

            <select className="form-control" onChange={evt => setTp(evt.target.value)}>
                <option value=''>End at...</option>
                {provinces.map(p => <option key={p.id} value={p.name}>{p.name}</option>)}    
            </select>
            
            <input className="form-control" type="date" onChange={evt => setTime(evt.target.value)} />

            <Button type="submit" variant="outline-success">Search</Button>
        </Form>
    )
}

export default memo(SearchForm)