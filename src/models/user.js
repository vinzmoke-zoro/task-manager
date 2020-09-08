const mongoose = require('mongoose')
const validator = require('validator')
const bcrypt = require('bcryptjs')
const jwt = require('jsonwebtoken')
const Task = require('./task')

const userSchema = new mongoose.Schema({
    name : {
        type : String,
        required : true,
        trim : true
    },
    email : {
        type : String,
        unique : true,
        required : true,
        trim : true,
        lowercase : true,
        validate(value){
            if(!validator.isEmail(value)){
                throw new Error('Email is invalid!')
            }
        }
    },
    password : {
        type : String,
        required : true,
        trim : true,
        minlength : 7,
        validate(value){
            if(value.toLowerCase().includes('password')){
                throw new Error('Password cannot contain the word "password"')
            }
        }
    },
    age : {
        type : Number,
        default : 0,
        validate(value){
            if(value < 0){
                throw new Error('Age must be a positive number!')
            }
        }
    },
    tokens : [{
        token : {
            type : String,
            required : true,
        }
    }],
    avatar : {
        type : Buffer
    }

}, {
    timestamps : true
})
userSchema.virtual('tasks', {
    ref : 'Task',
    localField : '_id',
    foreignField : 'owner'
})
userSchema.methods.toJSON = function(){
    const User = this
    const userObject = User.toObject()
    delete userObject.tokens
    delete userObject.password
    delete userObject.avatar
    return userObject
}
userSchema.methods.generateAuthToken = async function(){
    const User = this
    const token = jwt.sign({_id : User.id.toString()}, process.env.JWT_SECRET)
    User.tokens = User.tokens.concat({token})
    await User.save()
    return token
}
userSchema.statics.findByCredentials = async(email, password) => {
    const User = await user.findOne({email})

    if(!User){
        throw new Error('Unable to Login!')
    }
    const isMatch = await bcrypt.compare(password, User.password)
    if(!isMatch){
        throw new Error('Unable to Login!')
    }
    return User
}

//Hashes the PTP before save
userSchema.pre('save', async function(next){
    const user = this

    if(user.isModified('password')){
        user.password = await bcrypt.hash(user.password, 8)
    }

    next()
})
userSchema.pre('remove', async function(next){
    const user = this
    await Task.deleteMany({owner : user._id})
    next()
})

const user = new mongoose.model('User', userSchema)

module.exports = user