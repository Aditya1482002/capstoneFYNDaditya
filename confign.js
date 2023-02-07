const {MongoClient}=require('mongodb');
const url="mongodb+srv://root:root@cluster0.yymzz0u.mongodb.net/?retryWrites=true&w=majority";
const database='tender_db';
const client=new MongoClient(url);

async function dbconnect(){
    let res=await client.connect();
    db=res.db(database);
    return db;
}

module.exports=dbconnect;