import { SocketOptions } from 'dgram'
import mongoose from 'mongoose'
import { ManagerOptions, Socket, connect } from 'socket.io-client'

export class SocketTest {
  public static socket: Socket

  connect(url: string, options: Partial<ManagerOptions & SocketOptions>) {
    SocketTest.socket = connect(url, options)
  }

  close() {
    SocketTest.socket.close()
  }
}

beforeAll(async () => {
  if (!process.env.MONGO_URI_TEST) {
    throw new Error('Please provide MONGO_URI_TEST in .env file')
  }

  process.env.NODE_ENV = 'test'

  const mongooseConnection = await mongoose.connect(process.env.MONGO_URI_TEST)

  if (!mongooseConnection.connection.db) {
    throw new Error('Error connecting to database')
  }

  const collections = await mongooseConnection.connection.db
    .listCollections()
    .toArray()

  const clearCollectionPromises = collections.map(async (collection) => {
    await mongooseConnection.connection
      .collection(collection.name)
      .deleteMany({})
  })

  await Promise.all(clearCollectionPromises)
})

afterAll(async () => {
  await mongoose.disconnect()
  await mongoose.connection.close()
})
