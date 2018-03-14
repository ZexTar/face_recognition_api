const express = require ('express');
const bodyParser = require ('body-parser');
const bcrypt = require('bcrypt-nodejs');
const cors = require('cors');
const knex = require('knex');

const db = knex({
  client: 'pg',
  connection: {
    host : '127.0.0.1',
    user : 'postgres',
    password : '1',
    database : 'smart-brain'
  }
});

db.select('*').from ('users').then (data => {
	console.log(data);
})

const app = express();
app.use(bodyParser.json());
app.use(cors()); 

app.get('/users/:id', (req,res) => {
    const {id} = req.params;
    db.select('*').from('users').where({id})
    .then (user => {
    	if (user.length){
    		res.json(user[0])
    	}
    	else {res.status(400).json('not found')}
    	})
})

app.put('/picture', (req,res) => {
    const {id} = req.body;
    db('users').where('id', '=', id)
    .increment('enteries', 1)
    .returning('enteries')
    .then(enteries => {
        res.json(enteries[0]);
    })
    .catch(err => res.status(400).json('invalid request'));
 })

app.get('/', (req,res)=>
    res.send(database.users));

app.post('/signin', (req,res)=>{

	db.select('email', 'hash').from('login')
	.where('email', '=', req.body.email)
	.then(data =>{
		console.log(data);
		const isValid = bcrypt.compareSync(req.body.password, data[0].hash);
		if (isValid){
			console.log(isValid);
			db.select('*')
        	.from('users')
        	.where('email', '=', req.body.email)
        .then(user=>{
            res.json(user[0])
        })
            .catch(err=> res.status(400).json('cannot find user'))
		}
		else
			res.status(400).json('purgeru')
	})
	.catch(err => res.status(400).json('invalid request'));
	})

app.post('/register', (req,res)=> {
	const {email, password, name} = req.body;
	const hash = bcrypt.hashSync(password);
	db.transaction(trx => {
		trx.insert(
		{
			email:email,
			hash:hash
		})
	 .into('login')
	 .returning('email')
	 .then(loginEmail=>{
	 	return trx('users')
	 	.returning('*')
	 	.insert({
	 		email:loginEmail[0],
	 		name:name,
    		joined:new Date()
	 	})
	 	})
	.then (user => {
    	res.json(user[0]);
	})
	.then(trx.commit)
	.catch(trx.rollback)
}
)})
    
app.listen (3000,()=>{
    console.log ('server is running on port 3000')
})