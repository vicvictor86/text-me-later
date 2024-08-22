import mongoose from 'mongoose'

beforeEach(async () => {
  if (!process.env.MONGO_URI_TEST) {
    throw new Error('Please provide MONGO_URI_TEST in .env file')
  }

  process.env.NODE_ENV = 'test'

  const mongooseConnection = await mongoose.connect(process.env.MONGO_URI_TEST)

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
