

const mongoose= require('mongoose')

const validator= require('validator')

const bCrypt= require('bcryptjs')

const jwt =require('jsonwebtoken')

const Tasks= require('./task')
 
/// defining user model

const userSchema= new mongoose.Schema({

    name:{
        type: String,
        required: true,
        trim:true
    },

    email:{
        type:String,
        required:true,
        trim:true,
        unique:true,
        lowercase:true,
        validate(value){
            if (!validator.isEmail(value)) {

                console.log('Email is invalid')

            }
        }
    },

    password:{

        trim:true,
        type: String,
        required:true,
        validate(value){

            if (value.length<6 || value.toLowerCase().includes('password')){

                throw new Error(' Invalid password! password must have at least 6 characters and not include the word "password" ') 
                
            }
        }
    },

    age:{
        type:Number,
        default:false,
        validate(value){
            if (value<0) {

                throw new Error('Age must be a positive number')
                
            }
        }
    },

    tokens:[{
        token: {
            type:String,
            required:true
        }        
    }],

    avatar:{
        type:Buffer
    }

},{
    timestamps:true
})  

// schema method for generating tokens

userSchema.methods.generateAuthToken= async function(){

    const user= this

    const token=jwt.sign({_id:user._id.toString()},process.env.JWT_SECRET)

    user.tokens=[...user.tokens,{token}]

    await user.save()

    return token

}

// schema methods are assigned to instances of the model. this is used to modify the user 

userSchema.methods.toJSON=function () {

   const user= this;

   const userObject= user.toObject() 

   delete userObject.password;
   delete userObject.tokens;
   delete userObject.avatar;

   return userObject

}

// schema statics are assigned to the user model

userSchema.statics.findByCredentials= async (email,password)=>{

    const user= await User.findOne({email})

    if (!user) {

        throw new Error('Unable to login')
        
    }

    const isMatch= await bCrypt.compare(password, user.password)

    if (!isMatch) {

        throw new Error('Unable to login')
        
    }

    return user

} 

// creates a relationship between the user and the task model

userSchema.virtual('tasks',{
    ref:'tasks',
    localField:'_id', 
    foreignField:'owner',
})

// this method is used before the save event

userSchema.pre('save',async function (next) {

    const user= this

    if (user.isModified('password')) { 

        user.password= await bCrypt.hash(user.password,8)
        
    }

    next()
    
})  

// the method is used before the remove event

userSchema.pre('remove', async function (next) {
    
    const user= this;
    await Tasks.deleteMany({owner:user._id})
    next()
})

const User= mongoose.model('User',userSchema)

module.exports= User