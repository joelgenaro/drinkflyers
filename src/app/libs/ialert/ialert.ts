export interface IAlert {
    id: string
    title: string
    type: string
    message: string
    status: boolean
    interval: number
}

export const defaultOptions = {
    id: '',
    type: 'i-alert success',
    title: '',
    message: '',
    status: true,
    interval: 4000
}
