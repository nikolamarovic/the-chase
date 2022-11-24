import korisnici from "../model/korisnici";
import { ObjectId } from "mongodb";

module.exports.dohvKorisnikaPoIdu = (req:any, res:any)=>{
    let objId = new ObjectId(req.body._id);
    korisnici.findOne({'_id':objId}, (err, k)=>{
        if(err) console.log(err);
        else res.json(k);
    })
}

module.exports.dohvKorisnikaPoKorImenu = (req:any, res:any)=>{
    korisnici.findOne({'kor_ime':req.body.kor_ime}, (err, k)=>{
        if(err) console.log(err);
        else res.json(k);
    })
}