const mongoose = require('mongoose')

const taskSchema = new mongoose.Schema({
    title : {
        type : String,
        trim : true
    },
    description : {
        type : String,
        required : true,
        trim : true
    },
    completed : {
        type : Boolean,
        default : false
    },
    owner : {
        type : mongoose.Schema.Types.ObjectId,
        required : true,
        ref : 'user'
    }
}, {
    timestamps : true
})

const Task = new mongoose.model('Task', taskSchema)

module.exports = Task