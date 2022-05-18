
const express= require('express')
const Users= require ('../models/user')
const auth= require("../middleware/auth")
const sharp= require('sharp')

const multer= require('multer')

const {sendWelcomeEmail,sendCancellationEmail}= require('../emails/email')


//  for file uploads

const upload= multer({
    limits:{
        fileSize:1000000,
    },
    fileFilter(req,file,cb){

        if (!file.originalname.match(/\.(jpg|jpeg|png)$/)) {

            return cb(new Error('Please upload an image'))
            
        }

        cb(undefined,true)

    }
}) 

const router= new express.Router()

// to create user

router.post('/users',async (req,resp)=> {
    
    const user= new Users(req.body)

    try {

        await user.save()

        sendWelcomeEmail(user.email,user.name)

        const token= await user.generateAuthToken() 

        resp.status(201).send({user,token})
         
    } catch (error) {

        resp.status(400)
            .send()
        
    }

})

// to login user

router.post('/users/login', async(req,resp)=>{

    try {

        const user= await Users.findByCredentials(req.body.email,req.body.password)

        const token= await user.generateAuthToken() 

        resp.send({user,token})
        
    } catch (error) {

        resp.status(400).send()
        
    }
})


// to logout user

router.post('/users/logout', auth,async (req,resp)=>{

    try {
        
        req.user.tokens= req.user.tokens.filter(token=>{

            return token.token !== req.token
        })

        await req.user.save()

        resp.send()
        
    } catch (error) {

        resp.status(500).send()
        
    }

})


// to logout user out of all sessions
router.post('/users/logoutAll',auth,async (req,resp)=>{

    try {

        req.user.tokens=[];

        await req.user.save();

        resp.send('Sucessfully logged out of all sessions!')

        
    } catch (error) {

        resp.status(500).send()
        
    }
   
})

// for user to read his/her profile

router.get('/users/me',auth,async (req,resp)=>{


    resp.send(req.user)
})


// to update user's profile

router.patch('/users/me',auth,async (req,resp)=>{

    const allowedUpdates=['name','email','password','age']
    const updates= Object.keys(req.body)
    const isValidOperation= updates.every(update=>{

        return allowedUpdates.includes(update)

    })

    if (!isValidOperation) {

        return resp.status(400).send({error:'Invalid updates'})
         
    }

    try {

        updates.forEach(update=>req.user[update]=req.body[update])

        await req.user.save()

        resp.send(req.user)
        
    } catch (error) {

        resp.status(400).send()
    }
})

// to delete user's profile/account

router.delete('/users/me',auth, async (req,resp)=>{

    try {

        await req.user.remove()

        sendCancellationEmail(req.user.name,req.user.email)

        resp.send(req.user)

    } catch (error) {
        
        resp.status(500).send()
    }
})

// to upload user's avatar

router.post('/users/me/avatar',auth,upload.single('avatar'),async (req,resp)=>{ 
    
    const buffer= await sharp(req.file.buffer).resize({width:250,height:250}).png().toBuffer() 

    req.user.avatar= buffer 

    await req.user.save()

    resp.send()

},(error, req,resp,next)=>{

    resp.status(400).send({error:error.message})
})

// to delete user's avatar

router.delete('/users/me/avatar',auth, async (req,resp)=>{

    if (!req.user.avatar) {

       return  resp.status(404).send()
        
    }

    req.user.avatar= undefined;

    await req.user.save()
    resp.send()
})


// for fecthing user's avatar

router.get('users/:id/avatar',async (req,resp)=>{

    try {

        const user = await User.findById(req.params.id)

        if (!user || !user.avater) {

            throw new Error()
            
        }

        resp.set('Content-Type','image/png') 
        resp.send(user.avatar)
        
    } catch (error) {

        resp.status(404).send()
        
    }
})

module.exports= router