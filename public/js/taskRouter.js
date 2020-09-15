const express = require('express')
const auth = require('../../src/middleware/auth')
const bodyParser = require('body-parser')
const Task = require('../../src/models/task')
const path = require('path')
const router = new express.Router()
const app = express()

const urlencodedParser = bodyParser.urlencoded({extended : false})


const viewspath = path.join(__dirname, './templates/views')

app.set('view engine', 'hbs')
app.set('views', viewspath)

// GET all tasks

router.get('/tasks/read', auth, async(req,res) => {
    const match = {}
    const sort = {}
    if(req.query.completed){
        match.completed = req.query.completed === 'true'
    }
    if(req.query.sortBy){
        const parts = req.query.sortBy.split('=')
        sort[parts[0]] = parts[1] === 'desc' ? -1 : 1 
    }
    try{
        await req.user.populate({
            path : 'tasks',
            match,
            options : {
                limit : parseInt(req.query.limit),
                skip : parseInt(req.query.skip),
                sort 
            }
        }).execPopulate()
        const taskArr = []
        req.user.tasks.forEach((task) => {
            const tsk =  {
                title : task.title,
                description : task.description,
                completed : task.completed,
                id : task.id
                }
                taskArr.push(tsk)
        })

res.render('taskRead', {taskArr})   

    }catch(e){
        res.render('500')
    }
})

//GET specific task by id
router.get('/tasks/:id', auth, async(req, res) => {
    const _id = req.params.id
    try{
        const Tasks = await Task.findOne({_id, owner : req.user._id})
        if(!Tasks){
        return res.render('404', {
            error : 'Task not found'
        })
    }
    res.send(Tasks)
    }catch(e){
        res.render('500')
    }
})
//POST a new task
router.post('/tasks/post', urlencodedParser, auth, async(req, res) => {
    const Tasks = new Task({
        ...req.body,
        owner : req.user._id
    })
    try{
       await Tasks.save()
       res.redirect('/tasks/read')
    }catch(e){
        res.render('400', {
            error : 'Bad request'
        })
    }
})
//PATCH an existing task

router.patch('/tasks/update/:id', urlencodedParser, auth, async(req, res) => {
    const updates = Object.keys(req.body)
    const allowedUpdates = ['title', 'description', 'completed']
    const isValidOp = updates.every((update) => allowedUpdates.includes(update))
    if(!isValidOp){
        return res.render('400', {
            error : 'Invalid updates'
        })
    }
    try{
        const Tasks = await Task.findOne({_id : req.params.id, owner : req.user._id})
        if(!Tasks){
            return res.status(404).send()
        }
        updates.forEach((update) => Tasks[update] = req.body[update])
        await Tasks.save()
    }catch(e){
        res.render('400', {
            error : 'Bad request'
        })
    }
})
//DELETE a specific task by id
router.delete('/tasks/delete/:id', auth, async(req, res) => {
    try{
        const Tasks = await Task.findOneAndDelete({_id : req.params.id, owner : req.user._id})
        if(!Tasks){
          return res.render('404', {
              error : 'Task not found'
          })
        }
        res.send(Tasks)
    }catch(e){
        res.render('500')
    }
})
module.exports = {
    router,
}
