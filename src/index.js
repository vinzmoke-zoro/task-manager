const express = require('express')
const hbs = require('hbs')
const path = require('path')
require('./db/mongoose')
const auth = require('./middleware/auth')
const userRouter = require('./routers/userRouter')
const taskRouter = require('../public/js/taskRouter').router

const app = express()
const port = process.env.PORT


const publicdir = path.join(__dirname, '../public')
const viewspath = path.join(__dirname, './templates/views')
const partials = path.join(__dirname, './templates/partials')

app.set('view engine', 'hbs')
app.set('views', viewspath)
hbs.registerPartials(partials)

app.use(express.static(publicdir))

app.get('', (req, res) => {
try{
    res.render('index')
}catch(e){
    res.render('404', {
        error : 'Page not found'
    })
}
})

app.get('/users', (req, res) => {
    try{
        res.render('signup')
    }catch(e){
        res.render('404', {
            error : 'Page not found'
        })
    }
})
app.get('/users/login', (req, res) => {
    try{
        res.render('login')
    }catch(e){
        res.render('404', {
            error : 'Page not found'
        })
    }
})
app.get('/tasks', (req, res) => {
    try{
        res.render('task')
    }catch(e){
        res.render('404', {
            error : 'Page not found'
        })
    }
})
app.get('/tasks/update/:id', async(req, res) => {   
    try{    
        res.render('taskUpdate')
    }catch(e){
        res.render('400', {
            error : 'Bad request'
        })
    }
})


app.use(express.json())
app.use(userRouter)
app.use(taskRouter)

app.listen(port, () => {
    console.log('Server is up and running in port ' + port)
})