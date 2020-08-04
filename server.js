if(process.env.NODE_ENV !== 'production'){
    require('dontenv').config()
}

const express = require('express')
const app = express()
const expressLayouts = require('express-ejs-layouts')

const indexRouter = require('./routes/index')

app.set('view engine','ejs')
app.set('views',__dirname + '/views') //all of the different views for our server, will go here
app.set('layout', 'layouts/layout')
app.use(expressLayouts)
app.use(express.static('public'))

const mongoose = require('mongoose')
mongoose.connect(process.env.DATABASE_URL, {
    useNewUrlParser: true
})

const db = mongoose.connection

db.on('error',error => console.error(error))
db.once('error',() => console.log('connected to db'))



app.use('/', indexRouter)

app.listen(process.env.PORT || 3000)


