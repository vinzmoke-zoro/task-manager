const express = require('express')
const auth = require('../middleware/auth')
const Task = require('../models/task')
const router = new express.Router()

// GET all tasks
router.get('/tasks', auth, async(req,res) => {
    const match = {}
    const sort = {}

    if(req.query.completed){
        match.completed = req.query.completed === 'true'
    }
    if(req.query.sortBy){
        const parts = req.query.sortBy.split(':')
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
        res.send(req.user.tasks)
    }catch(e){
        res.status(500).send()
    }
})

//GET specific task by id
router.get('/tasks/:id', auth, async(req, res) => {
    const _id = req.params.id
    try{
        const Tasks = await Task.findOne({_id, owner : req.user._id})
        if(!Tasks){
        return res.status(404).send()
    }
    res.send(Tasks)
    }catch(e){
        res.status(500).send()
    }
})
//POST a new task
router.post('/tasks', auth, async(req, res) => {
    const Tasks = new Task({
        ...req.body,
        owner : req.user._id
    })
    try{
       await Tasks.save()
       res.status(201).send(Tasks)
    }catch(e){
        res.status(400).send(e)
    }
})
//PATCH an existing task
router.patch('/tasks/:id', auth, async(req, res) => {
    const updates = Object.keys(req.body)
    const allowedUpdates = ['title', 'description', 'completed']
    const isValidOp = updates.every((update) => allowedUpdates.includes(update))
    if(!isValidOp){
        return res.status(400).send({Error : 'Invalid updates!'})
    }
    try{
        const Tasks = await Task.findOne({_id : req.params.id, owner : req.user._id})
        if(!Tasks){
            return res.status(404).send()
        }
        updates.forEach((update) => Tasks[update] = req.body[update])
        await Tasks.save()
        res.send(Tasks)
    }catch(e){
        res.status(400).send()
    }
})
//DELETE a specific task by id
router.delete('/tasks/:id', auth, async(req, res) => {
    try{
        const Tasks = await Task.findOneAndDelete({_id : req.params.id, owner : req.user._id})
        if(!Tasks){
          return res.status(404).send()
        }
        res.send(Tasks)
    }catch(e){
        res.status(500).send()
    }
})

module.exports = router