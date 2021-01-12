const mongoose = require('mongoose')
const validator = require('validator')
const bcrypt = require('bcryptjs')
const jwt = require('jsonwebtoken')
const Tasks = require('./tasks')

const userSchema = new mongoose.Schema({
    name:{
        type:String,
        required: true,
        trim:true

    },
    email:{
        type:String,
        unique:true,
        required:true,
        lowercase:true,
        trim:true,
        validate(value){
            if(!validator.isEmail(value)){
                throw new Error('Email not valid !')
            }
        }
    },
    password:{
        type:String,
        trim:true,
        required:true,
        validate(value){
            if(!validator.isStrongPassword(value)){
                throw new Error('password not storng enough !')
            }
        }
    },
    age:{
        type:Number
    },
    tokens : [
        {
            token:{
                type:String,
                required:true
            }
        } 
    ],
    avatar:{
        type:Buffer
    }
},{
    timestamps:true
})

userSchema.virtual('tasks',{
    ref:'Tasks',
    localField:'_id',
    foreignField:'owner'
})

userSchema.methods.toJSON = function(){
    const user = this 
    const userObject = user.toObject()

    delete userObject.password
    delete userObject.tokens
    delete userObject.avatar

    return userObject
}

userSchema.methods.generateAuthToken = async function(){
    const user = this
    const token = jwt.sign({_id:user._id.toString()},process.env.SECRET_KEY)

    user.tokens = user.tokens.concat({token})
    await user.save()
    return token

}


userSchema.statics.findByEmail = async(email,password)=>{
    const user = await User.findOne({email})
    if(!user){
        throw new Error('Unable to Login!')
    }
    // console.log(user.password)
    const isMatch = await bcrypt.compare(password,user.password)
    if(!isMatch){
        throw new Error('Unable to Login !')
    }

    return user
}

userSchema.pre('save',async function(next){
    const user = this
    
    user.password = await bcrypt.hash(user.password,8)
    
    // console.log( user.password)
    next()
})

userSchema.pre('remove',async function(next){
    const user = this

    await Tasks.deleteMany({owner:user._id})
    next()
})



const User= mongoose.model('User',userSchema)

module.exports = User