
import axios from 'axios'


export const services = {
    Ticket: {

        create:
            async (body: API.CreateTicketDto): Promise<API.TicketEntity> => {
                return axios.post('/ticket', body)
            }
        ,
        findAll:
            async (): Promise<API.TicketEntity[]> => {
                return axios.get('/ticket')
            }
        ,
        custom:
            async (queryData: { teste: string }): Promise<any> => {
                return axios.get('/ticket/custom', { params: queryData })
            }
        ,
        findOne:
            async (id: string): Promise<API.TicketEntity> => {
                return axios.get(`/ticket/${id}`)
            }
        ,
        update:
            async (id: string, body: API.UpdateTicketDto): Promise<API.TicketEntity> => {
                return axios.patch(`/ticket/${id}`, body)
            }
        ,
        remove:
            async (id: string): Promise<API.TicketEntity> => {
                return axios.delete(`/ticket/${id}`)
            }


    }
}