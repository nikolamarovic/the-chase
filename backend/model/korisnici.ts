import mongoose from 'mongoose';
import { UserDb } from '../data/UserDb';
const bcrypt = require('bcrypt');

const { isEmail } = require('validator');
const Schema = mongoose.Schema;
let korisnici = new Schema({
    _id:{
        type:Object,
    },
    kor_ime:{
        type:String,
        required: [true, 'Korisničko ime je obavezno polje.'],
        unique:[true,"Uneto korisničko ime već postoji. Pokušajte ponovo"],
    },
    mejl:{
        type:String,
        required: [true, 'Mejl je obavezno polje.'],
        unique: true,
        validate: [isEmail,"Pogrešan format za mejl."]
    },
    lozinka:{
        type:String,
        required: [true, 'Lozinka je obavezno polje.'],
        minlength: [6,'Lozinka mora imati bar šest karaktera.']
    },
    socket_id:{
        type:String
    },
    cookie_id:{
        type:String
    }
})

// *** MONGO HOOKS ***

korisnici.pre('save', async function(next){
    const salt = await bcrypt.genSalt();
    (<UserDb><unknown>this).lozinka = await bcrypt.hash((<UserDb><unknown>this).lozinka, salt); 
    next();
})


export default mongoose.model('Korisnici', korisnici, 'korisnici');