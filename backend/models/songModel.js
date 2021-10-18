import mongoose from 'mongoose'
const userSchema= mongoose.Schema({
    name:{
        type:String,
        required:true,
    }
})


const songSchema= mongoose.Schema({
    name:{
        type:String,
        required:true
    },
    artist:{
        type:String,
        required:true
    },  
    album:{
        type:String,
        required:true
    },
    _id:{
        type:String,
        required:true
    },
    date:{
        type:String,
        required:true
    },
    users:[{type:String, required:true,}],

})

const Song=mongoose.model('Song', songSchema)

export default Song


