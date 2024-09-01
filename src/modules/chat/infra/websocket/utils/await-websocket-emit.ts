import { Socket } from 'socket.io-client'

export interface WebSocketResponse<T = unknown> {
  status: 'success' | 'error'
  data?: T
}

export function asyncWebsocketEmit<Request, Response = WebSocketResponse>(
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
