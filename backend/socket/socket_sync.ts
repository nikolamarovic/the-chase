import { RoomIntervalPair } from "./../data/RoomIntervalPair";
import { RoomIntervalQueue } from "./../data/RoomIntervalQueue";
import { TimerData } from "./../data/TimerData";
import { UserNewGame } from "./../data/UserNewGame";
import { UserQueue } from "./../data/UserQueue";
import { ObjectId } from "mongodb";
import igra from "./../model/igra";
import korisnici from "./../model/korisnici";
import { Question } from "./../data/QuestionDb";
import { Socket } from "socket.io";
import { RESERVED_EVENTS } from "socket.io/dist/socket";

var startGameQueue = new UserQueue();
var roomIntervalQueue = new RoomIntervalQueue();
var interVal:any;
var map:Object = new Map();
var tmpFlag:boolean;

// IF THE REQUEST WAS ALREADY SENT 
var alreadySent:boolean = false;

export default function establishConnection(server:any){

    const io = require('socket.io')(server,{
        allowEIO3: true, 
        cors: {
          origin: "http://192.168.0.104:4200",
          methods: ["GET", "POST"],
          credentials: true,
          allowedHeaders: ["my-custom-header"]
        }
    });

    io.on("connection", (socket: any) => {
        console.log("user connected.");
    
        socket.on('zapocni_trazenje', (data:TimerData, u:string)=>{
            let timerData = new TimerData(data.sec, data.hun);
            interVal = setInterval(tajmer_trazenje_saigraca, 1000, timerData, socket, 1, u);
            korisnici.collection.updateOne({'kor_ime':u},{$set:{'socket_id':socket.id}});
            startGameQueue.push(new UserNewGame(u, interVal, socket));
        })
    
        socket.on('prva_igra_odbrojavanje',(timerData:TimerData, room:string)=>{
            let roomIntPair = new RoomIntervalPair();
            roomIntPair.intervalId = setInterval(tajmer_prva_igra, 10, room, timerData, 1, interVal);
            roomIntPair.room = room;
            roomIntervalQueue.push(roomIntPair);
        })

        socket.on('pocinje_prva_igra_svi',(room:string, igrac_na_potezu:string)=>{
            io.to(room).emit('pocinje_prva_igra',{'igrac_na_potezu':igrac_na_potezu,'room':room});
        });

        socket.on('prikazi_saigraca',(kor_ime:string)=>{
            io.to(socket.id).emit('dohvatiSaigraca',kor_ime);
        })

        socket.on('pocinje_druga_igra_svi',(room:string, igrac_na_potezu:string, suma:number, broj:number,broj_runde:number, ukupna_suma:number)=>{
            console.log(broj);
            io.to(room).emit('pocinje_druga_igra',{'igrac_na_potezu':igrac_na_potezu,'room':room, 'suma':suma,'broj_aktivnih':broj,'broj_runde':broj_runde,'ukupna_suma':ukupna_suma});
        });

        socket.on('is_typing',(socket_id:string)=>{
            io.to(socket_id).emit('saigrac_kuca');
        })

        socket.on('is_not_typing',(socket_id:string)=>{
            io.to(socket_id).emit('saigrac_ne_kuca');
        })

        socket.on('is_typing2',(socket_id:string)=>{
            io.to(socket_id).emit('saigrac_kuca2');
        })

        socket.on('pitaj_saigraca_server',(socket_id:string)=>{
            io.to(socket_id).emit('saigrac_suma_pitanje');
        })

        socket.on('odgovor_saigrac_server',(socket_id:string, odgovor:string)=>{
            io.to(socket_id).emit('saigrac_suma_odgovor', odgovor);
        })

        socket.on('izabrana_suma_server', (socket_id:string, suma:string, tragac:number, igrac:number)=>{
            io.to(socket_id).emit('izabrana_suma_od_strane_saigraca',suma,tragac,igrac);
        })

        socket.on('zapocni_tajmer_druga_igra_priprema',(room:string)=>{
            let timerData = new TimerData(3,0);
            let roomIntPair = new RoomIntervalPair();
            roomIntPair.intervalId = setInterval(tajmer_pred_pocetak_druge_igre, 1000, room, timerData, 1, interVal);
            roomIntPair.room = room;
            roomIntervalQueue.push(roomIntPair);
        })

        socket.on('postavi_event_listener_server',(socket_id:string)=>{
            io.to(socket_id).emit('postavi_event_listener');
        })

        socket.on('odgovor_prva_igra_server',(odgovor:string,room:string,pitanje:Question)=>{
            // console.log("Moj odgovor: " + odgovor);
            // console.log("Tacan odgovor:" + pitanje.tacan_odgovor);
            let poruka = "";
            if(pitanje.tacan_odgovor === odgovor) poruka = "ok";
            else poruka = pitanje.tacan_odgovor;
            
            io.to(room).emit('odgovor_prva_igra',poruka);
        })

        socket.on('odgovor_treca_igra_server',(odgovor:string,room:string,pitanje:Question)=>{
            // console.log("Moj odgovor: " + odgovor);
            // console.log("Tacan odgovor:" + pitanje.tacan_odgovor);
            let poruka = "";
            if(pitanje.tacan_odgovor === odgovor) poruka = "ok";
            else poruka = pitanje.tacan_odgovor;
            
            io.to(room).emit('odgovor_treca_igra',poruka);
        })

        socket.on('dalje_prva_igra_server',(room:string)=>{
            io.to(room).emit('dalje_prva_igra');
        })

        socket.on('dalje_treca_igra_server',(room:string)=>{
            io.to(room).emit('dalje_treca_igra');
        })

        socket.on('potvrdi_odgovor_server',(id:string,room:string)=>{
            io.to(room).emit('potvrdi_odgovor',id);
        })

        socket.on('proveri_odgovor_igrac_druga_igra_server',(odgovor:string,pitanje:Question, room:string)=>{
            if(!alreadySent){
                alreadySent = true;
                let flag:boolean = false;
                odgovor = odgovor.toLocaleLowerCase();
                let tmp = pitanje.tacan_odgovor.toLocaleLowerCase();
                if(odgovor === tmp) flag = true;
                
                let timerData = new TimerData(2,0);
                let roomIntPair = new RoomIntervalPair();
                
                roomIntPair.intervalId = setInterval(tajmer_provera_odgovora_igraca, 1000, room, timerData, flag,'rezultat_odgovora_igrac_druga_igra', odgovor);
                roomIntPair.room = room;
                roomIntervalQueue.push(roomIntPair);
            }
        })

        socket.on('proveri_odgovor_tragac_druga_igra_server',(odgovor:string,pitanje:Question, room:string)=>{
            if(!alreadySent){
                alreadySent = true;
                let flag:boolean = true;

               //izracunaj odgovor tragaca
                let odg_tragac = 'HAHA';

                let timerData = new TimerData(2,0);
                let roomIntPair = new RoomIntervalPair();
                
                roomIntPair.intervalId = setInterval(tajmer_provera_odgovora_igraca, 1000, room, timerData, flag,'rezultat_odgovora_tragac_druga_igra', odg_tragac);
                roomIntPair.room = room;
                roomIntervalQueue.push(roomIntPair);
            }
        })

        socket.on('tajmer_izmedju_pitanja_druga_igra',(room:string)=>{
            if(!alreadySent){
                alreadySent = true;
                let timerData = new TimerData(2,0);
                let roomIntPair = new RoomIntervalPair();
                roomIntPair.intervalId = setInterval(tajmer_izmedju_odgovora_druga_igra, 1000, room, timerData, 'sledece_pitanje_druga_igra');
                roomIntPair.room = room;
                roomIntervalQueue.push(roomIntPair);
            }
        })

        socket.on('sustigao_tragac',(room:string, broj_aktivnih:number)=>{
            io.to(room).emit('druga_igra_zavrsena',1,broj_aktivnih)
        })

        socket.on('pobegao_od_tragaca',(room:string)=>{
            io.to(room).emit('druga_igra_zavrsena',2)
        })

        socket.on('pocinje_prva_igra_saigrac',(room:string, suma:number)=>{
            io.to(room).emit('pocinje_prva_igra_ponovo',suma);
        })

        socket.on('napusti_igru_tajmer',(room:string)=>{
            console.log('napusta igru')
            let timerData = new TimerData(3,0);
            let roomIntPair = new RoomIntervalPair();
            socket.leave(room);
            roomIntPair.intervalId = setInterval(izbaciKorisnika, 1000, room, timerData, socket.id);
            roomIntPair.room = socket.id;
            roomIntervalQueue.push(roomIntPair);
        })

        socket.on('tajmer_pocetak_trece_igre',(room:string)=>{    
            let timerData = new TimerData(2,0);
            let roomIntPair = new RoomIntervalPair();
            roomIntPair.intervalId = setInterval(tajmer_pred_pocetak_trece_igre, 1000, room, timerData, 1, interVal);
            roomIntPair.room = room;
            roomIntervalQueue.push(roomIntPair);
        })

        socket.on('treca_igra_server',(room:string, suma:string)=>{
            alreadySent = false;
            if(!alreadySent){
                alreadySent = true;
                io.to(room).emit('pocinje_treca_igra',{'room':room, 'suma':suma});
                let timerData = new TimerData(14,99);
                let roomIntPair = new RoomIntervalPair();
                roomIntPair.intervalId = setInterval(tajmer_treca_igra, 10, room, timerData, 1);
                roomIntPair.room = room;
                roomIntervalQueue.push(roomIntPair);
            }
        })

        socket.on('javi_se_treca_igra',(saigrac_id:string)=>{
            io.to(socket.id).emit('omoguci_odgovor');
            io.to(saigrac_id).emit('saigrac_se_prvi_javio');
        })

        socket.on('tragac_treca_igra_odgovori',(room:string, broj_pitanja:number, broj_tacnih:number, pitanja:Array<Question>)=>{
            
            if(!tmpFlag){
                tmpFlag = true;

                let tragac = 0.6;
                let broj_tacnih_odg_tragac = 0;
                let flag:boolean = false;
                for(let i=0;i<broj_pitanja;i++){
                    let trenutno_pitanje = pitanja[i];
                    let kategorija = trenutno_pitanje.kategorija;
                    console.log(trenutno_pitanje.tekst);
                    // dohvati znanje iz kategorije ... 
                    let rnd = Math.random();
                    console.log("Random: " + rnd);
                    if(rnd < tragac) broj_tacnih_odg_tragac++;
                }
                
                console.log("Broj tacnih odgovora tragaca: " + broj_tacnih_odg_tragac);
                
                if(broj_tacnih_odg_tragac >= broj_tacnih) flag = true;
                else flag = false;

                let timerData = new TimerData(3,0);
                let roomIntPair = new RoomIntervalPair();
                roomIntPair.intervalId = setInterval(tragac_odgovori, 1000, timerData, room, broj_tacnih_odg_tragac, flag);
                roomIntPair.room = room;
                roomIntervalQueue.push(roomIntPair);

                console.log("Room " + room);
                console.log("Flag " + flag);
                console.log("Broj tacnih odg " + broj_tacnih_odg_tragac);
                console.log("Timer data " + timerData);
            }
        })

        socket.on("disconnect",(socket:any)=>{
        })
    });

    function tragac_odgovori(timerData:TimerData, room:string, broj_odg:number, flag:boolean){
        console.log("tajmer");
        timerData.sec--;
        if(timerData.sec == -1){
            clearInterval(roomIntervalQueue.findIntervalId(room));
            io.to(room).emit('tragac_rezultat_odgovora',{flag:flag, broj_odg:broj_odg});
            roomIntervalQueue.remove(room);
        }
    }

    function tajmer_treca_igra(room:string, timerData:TimerData, flag:number){
        timerData.hun--;
        if(timerData.hun == -1){
            timerData.hun = 99;
            timerData.sec--;
            if(timerData.sec == -1){
                timerData.hun = 0;
                clearInterval(roomIntervalQueue.findIntervalId(room));
                io.to(room).emit('treca_igra_isteklo_vreme');
                roomIntervalQueue.remove(room);
                alreadySent = false;
                flag = 0;
            }
        }
        if(flag == 1){
            io.to(room).emit('treca_igra_tajmer',{'sec':timerData.sec,'hun':timerData.hun});
        }
    }

    function izbaciKorisnika(room:string, timerData:TimerData, s_id:string){
        timerData.sec--;
        if(timerData.sec == -1){
            clearInterval(roomIntervalQueue.findIntervalId(s_id));
            io.to(s_id).emit('napusti_igru');
            roomIntervalQueue.remove(s_id);
        }
    }

    function tajmer_izmedju_odgovora_druga_igra(room:string, timerData:TimerData, channel:string){
        timerData.sec--;
        if(timerData.sec == -1){
            clearInterval(roomIntervalQueue.findIntervalId(room));
            io.to(room).emit(channel);
            roomIntervalQueue.remove(room);
            alreadySent = false;
        }
    }

    function tajmer_pred_pocetak_trece_igre(room:string, timerData:TimerData, flag:number){
        timerData.sec--;
        if(timerData.sec == -1){
            timerData.hun = 0;
            clearInterval(roomIntervalQueue.findIntervalId(room));
            io.to(room).emit('tajmer_pred_pocetak_trece_igre_pocinje');
            roomIntervalQueue.remove(room);
            flag = 0;
        }
        if(flag == 1){
            io.to(room).emit('tajmer_pred_pocetak_trece_igre',{'sec':timerData.sec,'hun':timerData.hun});
        }
    }  

    function tajmer_provera_odgovora_igraca(room:string, timerData:TimerData, flag:boolean, channelToRespond:string, odgovor:string){
        timerData.sec--;
        if(timerData.sec == -1){
            clearInterval(roomIntervalQueue.findIntervalId(room));
            io.to(room).emit(channelToRespond, flag, odgovor);
            roomIntervalQueue.remove(room);
            alreadySent = false;
        }
    }
    
    function tajmer_pred_pocetak_druge_igre(room:string, timerData:TimerData, flag:number, interVal:any){
            timerData.sec--;
            if(timerData.sec == -1){
                timerData.hun = 0;
                clearInterval(roomIntervalQueue.findIntervalId(room));
                io.to(room).emit('tajmer_pred_pocetak_druge_igre_pocinje');
                roomIntervalQueue.remove(room);
                flag = 0;
            }
            if(flag == 1){
                io.to(room).emit('tajmer_pred_pocetak_druge_igre',{'sec':timerData.sec,'hun':timerData.hun});
            }
    }
    
    function tajmer_prva_igra(room:string, timerData:TimerData, flag:number, interVal:any){
        timerData.hun--;
        if(timerData.hun == -1){
            timerData.hun = 99;
            timerData.sec--;
            if(timerData.sec == -1){
                timerData.hun = 0;
                clearInterval(roomIntervalQueue.findIntervalId(room));
                io.to(room).emit('prva_igra_isteklo_vreme');
                roomIntervalQueue.remove(room);
                flag = 0;
            }
        }
        if(flag == 1){
            io.to(room).emit('prva_igra_tajmer',{'sec':timerData.sec,'hun':timerData.hun});
        }
    }
    
    function tajmer_trazenje_saigraca(timerData:TimerData, socket:any, flag:number, u:string){
        if(!startGameQueue.isAnybodyHere()){
            let u1 = startGameQueue.pop();
            let u2 = startGameQueue.pop();
            let room = "" + u1.socket.id.substring(1,4) + u2.socket.id.substring(1,4);
            io.to(u1.socket.id).emit('pronadjen_saigrac', { saigrac:u2.username, na_potezu:u1.username, room:room });
            io.to(u2.socket.id).emit('pronadjen_saigrac', { saigrac:u1.username, na_potezu:u1.username, room:room });

            u1.socket.join(room);
            u2.socket.join(room);
    
            clearInterval(u1.intervalId);
            clearInterval(u2.intervalId);
    
            let i = new igra({
                _id:new ObjectId(),
                u1:u1.username,
                u2:u2.username,
                room:room,
                sum:0
            })
            i.save().then(()=>{}).catch((err:any)=>{
                console.log(err);
            })
        }else{
            timerData.sec--;
            if(timerData.sec == 0){
                timerData.hun = 0;
                clearInterval(startGameQueue.find(u).intervalId);
                io.to(socket.id).emit('isteklo_vreme_trazenje_saigraca');
                startGameQueue.remove(u);
                flag = 0;
            }
            if(flag == 1){
                io.to(socket.id).emit('timer_trazenje_saigraca',{'sec':timerData.sec,'hun':timerData.hun});
            } 
        }
    }
}
