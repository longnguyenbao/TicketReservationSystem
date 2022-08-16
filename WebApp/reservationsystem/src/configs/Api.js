import axios from 'axios'
import cookies from 'react-cookies'

export const endpoints = {
    'routes': '/routes/',
    'schedules-1': (routeId) => `/routes/${routeId}/schedules/`,
    'schedules-2': '/schedules-list/',
    'schedule-detail': (scheduleId) => `/schedules/${scheduleId}/`,
    'book-ticket': (scheduleId) => `/schedules/${scheduleId}/ticket/`,
    'provinces': '/provinces/',
    'organizations': '/organizations/',
    'login': '/o/token/',
    'current_user': '/users/current-user/',
    'users': '/users/',
    'bus-feedbacks': (busId) => `/buses/${busId}/feedbacks/`,
    'bus-like': (busId) => `/buses/${busId}/like/`,
    'feedbacks': '/feedbacks/',
    'feedback-action': (feedbackId) => `/feedbacks/${feedbackId}/`,
    'my-tickets': '/my-tickets/',
    'my-tickets-action': (ticketId) => `/my-tickets/${ticketId}/`,
    'tickets': '/tickets/',
    'tickets-action': (ticketId) => `/tickets/${ticketId}/`,
    'stations': '/stations/',
}

export const authAxios = () => { 
    return axios.create({
        baseURL: 'http://127.0.0.1:8000/',
        headers: {
            'Access-Control-Allow-Origin': '*',
            'Authorization': `Bearer ${cookies.load('access_token')}`
        }
    })
}

export default axios.create({
    baseURL: 'http://127.0.0.1:8000/'
}) 