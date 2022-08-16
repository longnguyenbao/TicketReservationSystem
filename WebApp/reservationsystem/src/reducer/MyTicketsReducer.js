const myTicketsReducer = (myTickets, action) => {
    switch (action.type) {
        case 'bookTicket':
            let array1 = [...myTickets.schedules], flag=false
            let obj = {
                'id': action.payload.schedule.id,
                'busName': action.payload.schedule.bus.name,
                'departureTime': action.payload.schedule.departure_time,
                'departureStation': action.payload.schedule.departure_station.name,
                'arrivalStation': action.payload.schedule.arrival_station.name,
                'quantity': 1,
                'price': parseFloat(action.payload.schedule.price),
                'surcharge': parseFloat(action.payload.schedule.type.surcharge)
            }
            
            for (let i = 0; i < array1.length; i++) {
                if (array1[i].id === obj.id) {
                    array1[i].quantity++
                    flag=true
                }
            }
            
            if (flag === false) array1.push(obj)
            
            return {
                ...myTickets,
                'count': action.payload.count + 1,
                'schedules': array1
            }
        case 'deleteTicket':
            let array2 = [...myTickets.schedules]
            let count = action.payload.count
            
            for (let i = 0; i < array2.length; i++) {
                if (array2[i].id === action.payload.scheduleId) {
                    count = count - array2[i].quantity
                    array2.splice(i, 1)
                }
            }

            return {
                ...myTickets,
                'count': count,
                'schedules': array2
            }
        case 'deleteAll':
            return {count: 0, schedules: []}
        default:
            return myTickets
    }
}

export default myTicketsReducer