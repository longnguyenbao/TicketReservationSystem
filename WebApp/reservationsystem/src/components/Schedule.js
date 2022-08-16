import React, { useEffect, useState } from 'react';
import { Row, Spinner, Container } from 'react-bootstrap';
import { useNavigate, useParams, useSearchParams } from 'react-router-dom';
import Api, { endpoints } from '../configs/Api';
import Item from '../layout/Item';
import Paginator from '../layout/Paginator';

const Schedule = () => {
    const [schedules, setSchedules] = useState([])
    const [pageSize, setPageSize] = useState(3)
    const [totalSize, setTotalSize] = useState(0)
    const [q] = useSearchParams()
    const {routeId} = useParams()
    const nav = useNavigate()

    useEffect(() => {
        const loadSchedules = async () => {
            let query = ''

            const page = q.get('page')
            if(page != null)
                query += `&page=${page}`
            
            const res = await Api.get(`${endpoints['schedules-1'](routeId)}?${query}`)
            if (res.status === 200) {
                setTotalSize(res.data.count)
                setSchedules(res.data.results)
            }
        }

        loadSchedules()
    }, [q, routeId])

    // const lastIndex = currentPage * pageSize
    // const firstIndex = lastIndex - pageSize
    // const currentSchedules = schedules.slice(firstIndex, lastIndex)

    const paginate = page => nav(`/routes/${routeId}/schedules/?page=${page}`)

    return (
        <Container>
            <h1 className="text-center text-danger">DANH MUC CAC CHUYEN XE</h1>
            
            {schedules.length === 0 && <Spinner animation='grow' />}

            <Row>
                {schedules.map(s => <Item key={s.id} obj={s} isSchedule={true} />)}
            </Row>

            <Paginator pageSize={pageSize} totalSize={totalSize} paginate={paginate} />
        </Container>
    )
}

export default Schedule