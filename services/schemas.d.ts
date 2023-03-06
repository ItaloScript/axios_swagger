declare namespace API {

    export interface CreateTicketDto {
        name: string
    }

    export interface TicketEntity {
        id: string
        deleted_at: string
        created_at: string
        updated_at: string
        name: string
    }

    export interface UpdateTicketDto {
        name: string
    }

}

