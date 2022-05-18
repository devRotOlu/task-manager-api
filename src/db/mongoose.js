
const mongoose= require('mongoose')

mongoose.connect(process.env.MONGODB_URL,{
    useNewUrlParser:true,
    useCreateIndex: true, /// ensures our indexes are created when mongoose works with mongodb allowing us to quickly access the data we need to access
    useFindAndModify:false,
})



