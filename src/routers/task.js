
const express= require('express');
const Tasks=require('../models/task');
const auth= require('../middleware/auth');

const router= new express.Router()

// to post a task

router.post('/tasks',auth,async (req,resp)=> {

    const task=new Tasks({
        ...req.body,owner:req.user._id
    })

    try {

        const taskSaved= await task.save()

        resp.status(201).send(taskSaved)
        
    } catch (error) {

        resp.status(400).send()
        
    }

})

// to get all tasks created

router.get('/tasks',auth,async (req,resp)=>{

    const match={};
    const sort={}

    if (req.query.completed) {

        match.completed= req.query.completed==='true'  
    }

    if (req.query.sortBy) {

        const parts= req.query.sortBy.split('_');

        sort[parts[0]]= parts[1]==='desc'?-1:1;
        
    }

    try {

        await req.user.populate({
            path:'tasks',
            match,
            options:{
                limit:parseInt(req.query.limit), 
                skip:parseInt(req.query.skip),
                sort,
            }
        }).execPopulate()
        resp.send(req.user.tasks)
        
    } catch (error) {

        resp.status(500)
            .send();
        
    }
})


// to get a specific task

router.get('/tasks/:id',auth,async (req,resp)=>{

    const _id= req.params.id

    try {

        const task= await Tasks.findOne({_id,owner:req.user._id})

        if (!task) {

            return resp.status(404).send();
             
        }
 
        resp.send(task)        
        
    } catch (error) {

        resp.status(500).send();
        
    }

})


// to update a task

router.patch('/tasks/:id',auth,async (req,resp)=>{

    const allowedUpdates=['description','completed']
    const updates= Object.keys(req.body)
    const isValidOperation= updates.every(update=>allowedUpdates.includes(update))

    if (!isValidOperation) {

        return resp.status(400).send({error:'Invalid updates'})
         
    }

    try {

        const task= await Tasks.findOne({_id:req.params.id,owner:req.user._id})

        if (!task) {

            return resp.status(404).send()
            
        }

        updates.forEach(update=>task[update]=req.body[update])

        await task.save()

        resp.send(task)
        
    } catch (error) {

        resp.status(400).send()
    }
})


// to delete a task

router.delete('/tasks/:id', auth,async (req,resp)=>{

    try {

        const task= await Tasks.findOneAndDelete({_id:req.params.id,owner:req.user._id})

        if (!task) {

            return resp.status(404).send()
            
        }

        resp.send(task)

    } catch (error) {
        
        resp.status(500).send()
    }
})

module.exports=router