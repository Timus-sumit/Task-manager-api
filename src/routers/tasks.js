const express = require('express')
const router = new express.Router()
const Tasks = require('../models/tasks')
const auth = require('../middleware/auth')




router.post('/tasks',auth,async (req,res)=>{
    const task = new Tasks({
        ...req.body,
        owner:req.user._id
    })
    try {
        await task.save()
        res.send(task)
    } catch (error) {
        res.status(400).send(error)
    }


})



router.get('/tasks',auth, async (req,res)=>{
     const match = {}
     const sort = {}
    if(req.query.completed){
        match.completed = req.query.completed==="true"
    }
    if(req.query.sortBy){
        const parts = req.query.sortBy.split('_')
        sort[parts[0]]= parts[1]==='desc'?-1:1
    }
    try {
        // const task = await Tasks.find({owner:req.user._id})
        // res.send(task)
        await req.user.populate({
            path:'tasks',
            match,
            options:{
                sort,
                limit:parseInt(req.query.limit),
                skip:parseInt(req.query.skip)
            }
        }).execPopulate()
        res.send(req.user.tasks)
    } catch (error) {
        res.status(500).send()
    }

})

router.get('/tasks/:id',auth,async (req,res)=>{
    
    try {
        const task = await Tasks.findOne({_id:req.params.id, owner:req.user._id})
        if(!task){
           return res.status(404).send()
         }
        res.send(task)
    } catch (error) {
        res.status(500).send()
    }

})



router.patch('/tasks/:id',auth,async (req,res)=>{
    try {
        const task = await Tasks.findOneAndUpdate({_id:req.params.id, owner:req.user._id},req.body,{new:true, runValidators:true})
        if(!task){
            return res.status(404).send()
        }
        res.send(task)
    } catch (error) {
        res.status(500).send()
    }
})

router.delete('/tasks/:id',auth, async (req,res)=>{
    try {
        const user = await Tasks.findOneAndDelete({_id:req.params.id, owner:req.user._id})
        res.send(user)
    } catch (error) {
        res.status(500).send()
    }
})



module.exports = router