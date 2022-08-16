import React, { useEffect, useState } from 'react';
import { Container, Row, Spinner } from 'react-bootstrap';
import { useNavigate, useSearchParams } from 'react-router-dom';
import Api, { endpoints } from '../configs/Api';
import Item from '../layout/Item';
import Paginator from '../layout/Paginator';

const Home = () => {
    const [routes, setRoutes] = useState([])
    const [pageSize, setPageSize] = useState(3)
    const [totalSize, setTotalSize] = useState()
    const [q] = useSearchParams()
    const nav = useNavigate()

    useEffect(() => {
        const loadRoutes = async () => {
            let query = ''

            const page = q.get('page')
            if(page != null)
                query += `&page=${page}`
            
            const res = await Api.get(`${endpoints['routes']}?${query}`) //`${endpoints['routes']}?${query}`
            if (res.status === 200) {
                setTotalSize(res.data.count)
                setRoutes(res.data.results)
            }
        }
        loadRoutes()
    }, [q])

    const paginate = (page) => nav(`/?page=${page}`)
    
    return (
        <Container>
            <h1 className="text-center text-danger">DANH MUC CAC TUYEN XE</h1>
            
            {routes.length === 0 && <Spinner animation='grow' />}

            <Row>
                {routes.map(r => <Item key={r.id} obj={r} isRoute={true} />)}
            </Row>

            <Paginator pageSize={pageSize} totalSize={totalSize} paginate={paginate} />
        </Container>
    )
}

export default Home