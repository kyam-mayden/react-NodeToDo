const express = require('express')
const app = express()
const MongoClient = require('mongodb').MongoClient
const ObjectID = require('mongodb').ObjectID;
app.use(express.json());
app.use(express.urlencoded());

const url = 'mongodb://localhost:27017/toDoList'
let db

let sanitizeString = (string) => { return string.replace(/[|&;$%@"<>()+,]/g, "")}

MongoClient.connect(url, function(err, client){
    db = client.db('toDoList')
    console.log('Connected to mongoDb, lol')
})

app.get('/', (req, res) => {
    db.collection('toDo').find().toArray(function(err, docs){
        res.json(docs)
    })
})

app.get('/completed', (req, res) =>{
    db.collection('toDo').find({'completed' : 'true'}).toArray(function(err, docs) {
        res.json(docs)
    })
})

app.get('/todo', (req, res) =>{
    db.collection('toDo').find({'completed' : 'false'}).toArray(function(err, docs) {
        res.json(docs)
    })
})

let isValidDate = (str) => {
    // STRING FORMAT yyyy-mm-dd
    if(str=="" || str==null){return false;}

    // m[1] is year 'YYYY' * m[2] is month 'MM' * m[3] is day 'DD'
    var m = str.match(/(\d{4})-(\d{2})-(\d{2})/);

    // STR IS NOT FIT m IS NOT OBJECT
    if( m === null || typeof m !== 'object'){return false;}

    // CHECK m TYPE
    if (typeof m !== 'object' && m !== null && m.size!==3){return false;}

    var ret = true; //RETURN VALUE
    var thisYear = new Date().getFullYear(); //YEAR NOW
    var minYear = 1999; //MIN YEAR

    // YEAR CHECK
    if( (m[1].length < 4) || m[1] < minYear || m[1] > thisYear){ret = false;}
    // MONTH CHECK
    if( (m[2].length < 2) || m[2] < 1 || m[2] > 12){ret = false;}
    // DAY CHECK
    if( (m[3].length < 2) || m[3] < 1 || m[3] > 31){ret = false;}

    return ret;
}

app.post('/new', (req, res) =>{
    let date = req.body.date
    let todo = req.body.todo
    if(isValidDate(req.body.date) && req.body.date!=null && req.body.date!=undefined) {
        if(todo!=null && todo!= undefined && todo!="") {
            todo = sanitizeString(req.body.todo)
            data = {'todo' : todo, 'date': date, 'completed' : false}
            db.collection('toDo').insertOne(data, (err, result) => {
                res.json(result)
            })
        } else {
            res.json({'error': 'todo is not valid'})
        }
    } else {
        res.json({'error':'date is not valid'})
    }
})

app.put('/complete/:id', (req, res) =>{
    let id = req.params['id']
    if(typeof id === 'string') {
        id = sanitizeString(req.params['id'])
        db.collection('toDo').updateOne({'_id':ObjectID(id)},
        {$set : {'completed' : 'true'}},
            (err,results)=> res.json(results)
        )
    } else res.json({'error' : 'type error'})
})

app.put('/delete/:id', (req, res) =>{
    let id = req.params['id']
    if(typeof id === 'string') {
        id = sanitizeString(req.params['id'])
        db.collection('toDo').deleteOne({ '_id':ObjectID(id)},
            (err,results)=> res.json({results})
        )
    } else res.json({'error' : 'type error'})
})

app.listen(3000, () => console.log('Mongo app listening on port 3000'))