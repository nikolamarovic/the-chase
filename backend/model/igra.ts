import mongoose from 'mongoose';
const Schema = mongoose.Schema;

let igra = new Schema({
    _id:{
        type:Object,
    },
    u1:{
        type:String
    },
    u2:{
        type:String
    },
    room:{
        type:String
    },
    sum:{
        type:Number
    }
})

export default mongoose.model('Igra', igra, 'igra');