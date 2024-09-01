import { Socket } from 'socket.io-client'

export interface DefaultResponse {
  status: 'success' | 'error'
  message?: object
}

export function asyncWebsocketEmit<Request, Response = DefaultResponse>(
  socket: Socket,
  event: string,
  data: Request,
  timeout = 5000,
): Promise<Response> {
  return new Promise((resolve, reject) => {
    const timeoutId = setTimeout(() => {
      reject(new Error(`Timeout of ${timeout}ms exceeded`))
    }, timeout)

    socket.emit(event, data, (response: Response) => {
      clearTimeout(timeoutId)
      resolve(response)
    })
  })
}
