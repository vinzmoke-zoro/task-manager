const express = require('express')
const user = require('../models/user')
const auth = require('../middleware/auth')
const multer = require('multer')
const bodyParser = require('body-parser')
const sharp = require('sharp')
const cookieParser = require('cookie-parser')
const {sendWelcomeEmail, sendCancelEmail} = require('../emails/account.js')
const router = new express.Router()

const urlencodedParser = bodyParser.urlencoded({extended : false})

router.use(cookieParser())
//Read Profile
router.get('/users/me', auth, async(req, res) => {
    const User = req.user
    if(!User){
        return res.render('404', {
            error : 'User not found'
        })
    }
    res.render('profile', {
        User,
        image : User.avatar ? User.avatar.toString('base64') : undefined
    })
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
router.post('/users/me/avatar',urlencodedParser, auth, upload.single('avatar'), async(req, res) => {
    const buffer = await sharp(req.file.buffer).resize({width : 250, height : 250}).png().toBuffer()
   req.user.avatar = buffer
    await req.user.save()
    res.redirect('/users/me/update')
}, (error, req, res, next) => {
    res.render('400',{
        error : error.message
    })
})
router.get('/users/me/avatar', auth, async(req, res) => {
   res.render('avatarup', {
    image : req.user.avatar ? req.user.avatar.toString('base64') : undefined
   })
}, (error, req, res, next) => {
    res.render('400',{
        error : error.message
    })
})

//Delete Avatar
router.delete('/users/me/avatar', auth, async(req, res) => {
    try{
        if(!req.user.avatar){
            return res.render('404', {
                error : 'avatar not found!'
            })
        }
        req.user.avatar = undefined
        await req.user.save()
        res.send('Avatar removed successfully!')
    }catch(e){
        res.render('500')
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
        res.render('404', {
            error : 'Avatar not found'
        })
    }
})
//Create Account
router.post('/users', urlencodedParser, async(req, res) => {
     const User = new user(req.body)
     try{
         await User.save()
         sendWelcomeEmail(User.email, User.name)
        await User.generateAuthToken()
         res.redirect('/users/login')
     } catch(e) {
         res.render('400', {
             error : 'Bad request'
         })
     }
})
//Log in
router.post('/users/login', urlencodedParser, async(req, res) => {
    try{
        console.log(req.body)
        const User = await user.findByCredentials(req.body.email, req.body.password) 
         const token = await User.generateAuthToken()
         const options = {
            path : "/",
            sameSite : true,
            maxAge : 1000 * 60 * 60 * 24,
            httpOnly : true
        }
        res.cookie('x-access-token', token, options)
        res.redirect('/tasks/read')
        //res.send({User, token})
    }catch(e){
        res.render('400', {
            error : 'Invalid Email or password'
        })
    }
})
//Log Out
router.get('/users/logout', auth, async(req, res) => {
    try{
        res.render('logout')
    }catch(e){
        res.render('500')
    }
})
router.post('/users/logout', auth, async(req, res) => {
    try{
        req.user.tokens = req.user.tokens.filter((token) => {
            return token.token !== req.token
        })
        await req.user.save()
        res.redirect('/users/login')
    }catch(e){
        res.render('500')
    }
})
//Log out from all devices
router.post('/users/logoutAll', auth, async(req, res) => {
    try{
        req.user.tokens = []
        await req.user.save()
        res.redirect('/users/login')
    }catch(e){
        res.render('500')
    }
})
//Update profile
router.get('/users/me/update',auth, async(req, res) => {
    try{
        res.render('userupdate', {
            name : req.user.name,
            email : req.user.email,
            age : req.user.age,
            image : req.user.avatar ? req.user.avatar.toString('base64') : undefined
        })
        
    }catch(e){
        res.render('500')
    }
})
router.patch('/users/me/update', auth, async(req, res) => {
    const updates = Object.keys(req.body)
    const allowedUpdates = ['name', 'password', 'age']
    const isValidOp = updates.every((update) => allowedUpdates.includes(update))

    if(!isValidOp){
        return res.render('400', {
            error : 'Invalid updates'
        })
    }
    try{
        updates.forEach((update) => req.user[update] = req.body[update])
        await req.user.save() 
    }catch(e){
        res.render('400', {
            error : 'Bad request'
        })
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
        res.render('500')
    }
})

module.exports = router