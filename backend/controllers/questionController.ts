import { ObjectId } from "mongodb";
import igra from "../model/igra";
import pitanja from '../model/pitanja';

module.exports.dohvatiPitanjaPoTezini = (req:any, res:any)=>{
    let tezina = req.body.tezina;
    pitanja.find({'tezina':tezina},(err:any, p:any)=>{
        if(err) console.log(err);
        else res.json(p);
    })
}

module.exports.dohvatiPitanjaPoKategoriji = (req:any, res:any)=>{
    let kategorija = req.body.kategorija;
    pitanja.find({'kategorija':kategorija},(err:any, p:any)=>{
        if(err) console.log(err);
        else res.json(p);
    })
}

module.exports.dohvatiIgre = (req:any, res:any)=>{
    igra.find({},(err:any, p:any)=>{
        if(err) console.log(err);
        else res.json(p);
    })
}


