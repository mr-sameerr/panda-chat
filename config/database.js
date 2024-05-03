const mongoose = require('mongoose')

const DB_URL = process.env.DATABASE_URL

mongoose.connect(
    DB_URL
).then((result) => {
    if (result) {
        console.log("DB Connection established.")
    } else {
        console.log('DB Connection intrrupted.')
    }
}). catch((error) => {
    console.error('Error connecting to MongoDB', error)
})

module.exports = mongoose