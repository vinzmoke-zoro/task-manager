const express = require('express')
const user = require('../models/user')
const auth = require('../middleware/auth')
const multer = require('multer')
const sharp = require('sharp')
const {sendWelcomeEmail, sendCancelEmail} = require('../emails/account.js')
const router = new express.Router()

//Read Profile
router.get('/users/me', auth, async(req, res) => {
    res.send(req.user)
})
//add avatar
const upload = multer({
    limits : {
        fileSize : 1000000
    },
    fileFilter(req, file, cb){
        if(!file.originalname.match(/\.(png|jpg|jpeg)$/)){
           const x = file.originalname.split('.')
            return cb(new Error(x[1].toUpperCase() + ' files are not supported!'+'Only PNG, JPG and JPEG Image formats can be inserted!'))
        }
        cb(undefined, true)
    }
})
router.post('/users/me/avatar', auth, upload.single('avatar'), async(req, res) => {
    const buffer = await sharp(req.file.buffer).resize({width : 250, height : 250}).png().toBuffer()
   req.user.avatar = buffer
    await req.user.save()
    res.send('Uploaded Successfully!')
}, (error, req, res, next) => {
    res.status(400).send({error : error.message})
})
//Delete Avatar
router.delete('/users/me/avatar', auth, async(req, res) => {
    try{
        if(!req.user.avatar){
            return res.status(404).send()
        }
        req.user.avatar = undefined
        await req.user.save()
        res.send('Avatar removed successfully!')
    }catch(e){
        res.status(500).send()
    }
})
//GET Avatar
router.get('/users/:id/avatar', async(req, res) => {
    try{
        const User = await user.findById(req.params.id)
        if(!User || !User.avatar){
            throw new Error()
        }
        res.set('Content-Type', 'image/png')
        res.send(User.avatar)
    }catch(e){
        res.status(404).send()
    }
})
//Create Account
router.post('/users', async(req, res) => {
    const User = new user(req.body)
    try{
        await User.save()
        sendWelcomeEmail(User.email, User.name)
        const token = await User.generateAuthToken()
        res.status(201).send({User, token})
    } catch(e) {
        res.status(400).send(e)
    }
})
//Log in
router.post('/users/login', async(req, res) => {
    try{
        const User = await user.findByCredentials(req.body.email, req.body.password) 
        const token = await User.generateAuthToken()
        res.send({User, token})
    }catch(e){
        res.status(400).send()
    }
})
//Log Out
router.post('/users/logout', auth, async(req, res) => {
    try{
        req.user.tokens = req.user.tokens.filter((token) => {
            return token.token !== req.token
        })
        await req.user.save()
        res.send()
    }catch(e){
        res.status(500).send()
    }
})
//Log out from all devices
router.post('/users/logoutAll', auth, async(req, res) => {
    try{
        req.user.tokens = []
        await req.user.save()
        res.send()
    }catch(e){
        res.status(500).send()
    }
})
//Update profile
router.patch('/users/me', auth, async(req, res) => {
    const updates = Object.keys(req.body)
    const allowedUpdates = ['name', 'password', 'age']
    const isValidOp = updates.every((update) => allowedUpdates.includes(update))

    if(!isValidOp){
        return res.status(400).send({Error : 'Invalid Updates!'})
    }
    try{
        updates.forEach((update) => req.user[update] = req.body[update])
        await req.user.save() 
        res.send(req.user)
    }catch(e){
        res.status(400).send(e)
    }
})
//Delete Account
router.delete('/users/me', auth, async(req, res) => {
    try{
        const name = req.user.name
        const email = req.user.email
        await req.user.remove()
        res.send(req.user)
        sendCancelEmail(email, name)
    }catch(e){
        res.status(500).send()
    }
})

module.exports = router