import korisnici from "../model/korisnici";
import { ObjectId } from "mongodb";
import { UserDb } from '../data/UserDb';

const bcrypt = require('bcrypt');
const cookieParser = require('cookie-parser');
const jwt = require('jsonwebtoken');
const maxAge = 24 * 30 * 60 * 60;
const characters ='ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';

function generateRandomString(length:any) {
    let result = ' ';
    const charactersLength = characters.length;
    for ( let i = 0; i < length; i++ ) {
        result += characters.charAt(Math.floor(Math.random() * charactersLength));
    }
    return result;
}

const handleErrors = (err:any)=>{
    let errors:any = { kor_ime:"", lozinka:"", mejl:"", _id:""};

    // *** PROVERA ZA JEDINSTVENI KORISNICKO IME ***
    if(err.code === 11000 && err.message.includes('kor_ime')){
        errors.kor_ime = "Ovo korisničko ime već postoji.";
        return errors;
    }

    // *** PROVERA ZA JEDINSTVENI MEJL ***
    if(err.code === 11000 && err.message.includes('mejl')){
        errors.mejl = "Ovaj mejl već postoji.";
        return errors;
    }

    // *** PROVERA ZA OSTALO ***
    if(err.message.includes('validation failed')){
        (<any>Object).values(err.errors).forEach(({properties}:any)=>{
            errors[properties.path] = properties.message;
        })
    }

    return errors;
}

const createToken = (id:any) => {
    return jwt.sign({ id }, 'nidzoni makaroni', {
        expiresIn: maxAge
    });
}

module.exports.prijava_get= (req:any, res:any)=>{
    res.json('radi prijava_get');
}

module.exports.prijava_post = (req:any, res:any)=>{
    console.log(req.body.kor_ime);
    korisnici.findOne({'kor_ime':req.body.kor_ime},async (err, k)=>{
        let response:any;
        if(k){
            const auth = await bcrypt.compare(req.body.lozinka, (<UserDb><unknown>k).lozinka);
            if(auth){
                const token = createToken(k._id);
                const cookie_key = generateRandomString(15);
                let tmp = new ObjectId(k._id);
                korisnici.collection.updateOne({'_id':tmp},{$set:{cookie_id:cookie_key}});
                response = {greska:"", _id:k._id, cookie_id:cookie_key, token:token};
            } 
            else response = {greska:"Pogrešna lozinka.", _id:""};
        }else response = {greska:"Pogrešno korisničko ime.", _id:""};
        res.json({response});
    })
    
}

module.exports.registracija_get= (req:any, res:any)=>{
    res.json('radi registacija_get');
}

module.exports.registracija_post = (req:any, res:any)=>{
    
    let novi_korisnik = new korisnici({
        _id: new ObjectId(),
        kor_ime:req.body.kor_ime,
        lozinka:req.body.lozinka,
        mejl:req.body.mejl,
        socket_id:"",
        cookie_id:""
    });
    novi_korisnik.save().then((kor:any)=>{
        let response:any = { kor_ime:"", lozinka:"", mejl:""};
        res.json({response});
    }).catch((err: any)=>{
       const response = handleErrors(err);
       res.json({response});
    })
}

module.exports.provera = (req:any, res:any)=>{
    const token = req.body.token;
    if(token){
        jwt.verify(token, 'nidzoni makaroni',(err:any, decodedToken:any)=>{
            if(err){
                let response = {poruka:'ne',id:''};  
                res.json({response});
            } 
            else{
                let response = {poruka:'', id:decodedToken.id};
                res.json({response});
            }
        })
    }else{
        let response = {poruka:'ne'};
        res.json({response});
    } 
}

module.exports.odjava = (req:any, res:any)=>{
    korisnici.collection.updateOne({'kor_ime':req.body.kor_ime},{$set:{"cookie_id":"",'socket_id':""}});
    res.json();
}
