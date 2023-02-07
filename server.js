const dbconnect=require('./confign');
const express=require("express");
const multer=require("multer");
var bodyParser = require('body-parser');            


const app=express();


app.use(bodyParser.json({limit:'50mb'})); 
app.use(bodyParser.urlencoded({extended:false, limit:'50mb'}));
app.use(function(req,res,next){
    res.setHeader('Access-Control-Allow-Origin','*');
    res.setHeader('Access-Control-Allow-Methods','GET,POST,OPTIONS,PUT,PATCH,DELETE');
    res.setHeader('Access-Control-Allow-Headers','X-Requested-With,content-type,Authorization');
    res.setHeader('Access-Control-Allow-Credentials',true);
    next();
})



const upload =multer({
    storage:multer.diskStorage({
        destination:function(req,file,cb)
        {
            cb(null,"../web/public/upload") 
        },
        filename:function(req,file,cb)
        {
            cb(null,file.originalname)
        }
    })
}).single("user_file");

app.use(express.static(__dirname+'/dist/'));
app.get('*',(req,res)=>{
    res.sendFile(__dirname+"/dist/index.html");
})




app.post('/login',async function(req,res){
    let db=await dbconnect();
    let username=req.body.uemail;
    let upass=req.body.upass;
    let type=req.body.type;
    console.log(req.body);
    let udata=await db.collection(type).findOne({'email':username});
    console.log(udata);
    if(udata==null){
        res.json({
            status:"error",
            message:"no user found"
        });
        return;
    }
    if(upass!=udata.password){
        res.json({
            status:"error",
            message:"no user found"
        })
        return;
    }
    res.json({
        status:"success",
        message:"Login Successfully",
        type:type
    });
    return;
})

app.post('/register',async function(req,res){
    //console.log(req.fields);
    let db=await dbconnect();
    let email=req.body.email;
    const type=req.body.type;
    let uemail=await db.collection(type).findOne({'email':email})
    if(uemail!=null){
        res.json({
            status:"error",
            message:"already present"
        });
        return;
    }
    let password=req.body.password;
    
    let phone=req.body.phone;
    let name=req.body.name;
    let address=req.body.address;
    let d=new Date();
    let id=d.getTime();
    await db.collection(type).insertOne({
        'id':id,
        'name':name,
        'email':email,
        'phone':phone,
        'address':address,
        'password':password
    });
    res.json({
        status:"success",
        message:"registered successfully"
    })
    return;        
})
app.post("/profile",async function(req,res){
    let db=await dbconnect();
    let email=req.body.email;
    const type=req.body.type;
    const udata=await db.collection(type).findOne({'email':email});
    console.log(udata);
    res.json(udata);
})
app.post("/edit",async function(req,res){
    let db=await dbconnect();
    let type=req.body.type;
    let email=req.body.email;
    let name=req.body.name;
    let phone=req.body.phone;
    let address=req.body.address;
    let pass=req.body.pass;
    let myquery={email:email};
    let newvalues={$set:{name:name,phone:phone,address:address,password:pass}};
    let r=await db.collection(type).updateOne(myquery,newvalues);
    //console.log(r);
    res.json({
        status:"success",
        message:"registered successfully"
    });
    return;
})
app.post("/upload",upload,async (req,res)=>{
    let db=await dbconnect();
    let tendername=req.body.tendername;
    let category=req.body.category;
    let amount=req.body.amount;
    let email=req.body.email;
    let fil=req.file.originalname;
    let date=new Date();
    let ids=date.getTime();
    console.log(req.body);
    console.log(req.file);
    await db.collection('tender').insertOne({
        'tid':ids,
        'tname':tendername,
        'category':category,
        'by':email,
        'amount':amount,
        'filename':fil,
        'date':date
    })
    res.json({
        status:"success",
        message:"registered successfully"
    });
    return;
    //res.send("File k sath jhingalala");
})

app.post("/oldtender",async (req,res)=>{
    let email=req.body.email;
    let db=await dbconnect();
    let dta=await db.collection('tender').find({'by':email}).toArray();
    res.send(dta);
})

app.get("/conapply",async function(req,res){
    let db=await dbconnect();
    let dta=await db.collection('tender').find().toArray();
    res.send(dta);
})

app.post("/applytender",async function(req,res){
    let db=await dbconnect();
    let frm=req.body.from;
    let tid=req.body.tid;
    let bidamt=req.body.bid;
    await db.collection('apply').insertOne({
        'tid':tid,
        'from':frm,
        'bidamt':bidamt
    })
    res.json({
        status:"success",
        message:"registered successfully"
    });
    return;
})

app.post('/checkapply',async (req,res)=>{
    let db=await dbconnect();
    let dta=await db.collection('apply').findOne({$and:[{'tid':req.body.tid},{'from':req.body.from}]});
    // res.send(dta);
    console.log(dta);
    if(dta==null)
    {
        res.json({
            status:"error"
        })
        return;
    }
    res.json({
        status:'success'
    })
})

app.post('/mytender',async (req,res)=>{
    let db=await dbconnect();
    let email=req.body.email;
    let dta=await db.collection('apply').find({'from':email}).toArray();
    res.send(dta);
})
app.post('/viewbidder',async (req,res)=>{
    let tid=req.body.tid;
    let db= await dbconnect();
    let dta=await db.collection('apply').find({'tid':tid}).toArray();
    res.send(dta);
})

app.post("/uploadresult",async (req,res)=>{
    let db=await dbconnect();
    let tid=req.body.tid;
    let to=req.body.to;
    await db.collection('result').insertOne({
        'tid':tid,
        'to':to
    })
    res.json({
        status:"success",
        message:"registered successfully"
    });
    return;
})

app.post('/checkresult',async (req,res)=>{
    let db=await dbconnect();
    let dta=await db.collection('result').findOne({'tid':req.body.tid});
    // res.send(dta);
    console.log(dta);
    if(dta==null)
    {
        res.json({
            status:"error"
        })
        return;
    }
    res.json({
        status:'success'
    })
})

app.post('/conresult',async (req,res)=>{
    let to=req.body.email;
    let db= await dbconnect();
    let dta=await db.collection('result').find({'to':to}).toArray();
    res.send(dta);
})

app.post("/getfilename",async (req,res)=>{
    let tid=parseInt(req.body.tid);
    let db=await dbconnect();
    const dta=await db.collection('tender').findOne({'tid':tid});
    console.warn(dta);
    res.send(dta);
})






app.listen(process.env.PORT || 3000,()=>{
    console.log("server started");
});