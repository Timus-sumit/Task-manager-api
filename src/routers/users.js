const express = require('express')
const router = new express.Router()
const User = require('../models/users')
const auth = require('../middleware/auth')
const multer = require('multer')
const sharp = require('sharp')


router.post('/users',async (req,res)=>{
    const user = new User(req.body)
    //
    try {
        await user.save()
        const token = await user.generateAuthToken()
        res.status(201).send({user,token})
    } catch (error) {
        res.status(400).send(error)
    }

    
})

router.post('/users/login',async (req,res)=>{
    try {
        const user = await User.findByEmail(req.body.email,req.body.password)
        const token = await user.generateAuthToken()
        res.send({user,token})
    } catch (error) {
        res.status(400).send()
    }
})

router.post('/users/logout',auth,  async(req,res)=>{
    try{
        req.user.tokens = req.user.tokens.filter((token)=>{
            return token.token!==req.token
        })

        await req.user.save()

        res.send()
    }
    catch(e){
        res.status(500).send()
    }})


router.get('/users/me', auth ,async (req,res)=>{

    res.send(req.user)
   

})

router.get('/users/:id',async (req,res)=>{
  
    try {
        const user = await User.findById(req.params.id)
        if(!user){
            res.status(404).send()
        }else{
            res.send(user)
        }
    } catch (error) {
        res.status(500).send()
    }

})
router.patch('/users/me',auth,async (req,res)=>{
      const updates = Object.keys(req.body)
    try {
        const updates = Object.keys(req.body)
        // const user = await User.findById(req.user._id)
        updates.forEach((update)=>{
            req.user[update] = req.body[update]
        })

        await req.user.save()
        //const user = await User.findByIdAndUpdate(req.params.id,req.body,{new:true, runValidators:true})
        // if(!user){
        //     return res.status(404).send()
        // }
        res.send(req.user)
    } catch (error) {
        res.status(500).send()
    }
})

router.delete('/users/me',auth, async (req,res)=>{
    try {
        // const user = await User.findByIdAndDelete(req.params.id)
        // if(user===undefined){
        //     return res.status(404).send('Invalid user')
        // }
        await req.user.remove()
        res.send(req.user)
    } catch (error) {
        res.status(500).send()
    }
})
const upload = multer({
    
    limit:{
        fileSize : 1000000
    },
    fileFilter(req,file,cb){
        if(!file.originalname.match(/\.(jpg|jpeg|png)/)){
            cb(new Error('Please upload an Image'))
        }
        cb(undefined,true)
    }
})  
router.post('/users/me/avatar',auth,upload.single('avatar'),async (req,res)=>{
    const buffer = await sharp(req.file.buffer).resize({width:250,height:250}).png().toBuffer()
    req.user.avatar = buffer
    await req.user.save()
    res.send()
},(error,req,res,next)=>{
    res.status(400).send({
        error:error.message
    })
})

router.get('users/:id/avatar',async(req,res)=>{
    try {
        const user = await User.findById(req.params.id)
        if(!user || !user.avatar){
            throw new Error()
        }

        res.set('Content-type','image/png')
        res.send(user.avatar)
    } catch (error) {
        
    }
})

router.delete('/users/me/avatar',auth,async(req,res)=>{
    req.user.avatar = undefined
    await req.user.save()
    res.send()
})


module.exports = router