import mongoose from 'mongoose';
const Schema = mongoose.Schema;

let pitanja = new Schema({
    _id:{
        type:Object,
    },
    tekst:{
        type:String
    },
    odgovori:{
        type:Array
    },
    tacan_odgovor:{
        type:String
    },
    kategorija:{
        type:String
    },
    tezina:{
        type:Number
    }
})

export default mongoose.model('pitanja', pitanja, 'pitanja');