const express = require('express');
const bodyParser = require('body-parser');
const bcrypt = require('bcrypt');
const cors = require('cors');
const knex = require('knex');

const Clarifai = require('clarifai');

const cApp = new Clarifai.App({
  apiKey: '401eb0c6f5f34376b6ae24ca795ec2a7'
})



const saltRound = 10;

const database = knex({
  client: 'pg',
  connection: {
    host: 'localhost',
    user: 'kim',
    password: '',
    database: 'smart-brain'
  }
});

const app = express();

app.use(bodyParser.json());
app.use(cors());

app.get('/', (req, res) => {
  res.json(database.users);
}
)

app.post('/imageurl', (req, res) => {
  cApp.models.predict(Clarifai.FACE_DETECT_MODEL, req.body.input)
    .then(data => res.json(data))
    .catch(err => res.status(400).json('Unable to work with api'))
})

app.post('/signin', (req, res) => {
  const { email, password } = req.body;
  if (!email || !password) {
    return res.status(400).json('Incorrect form submission');
  }
  database.select('email', 'hash')
    .from('login')
    .where('email', '=', email)
    .then(data => {
      const isValid = bcrypt.compareSync(password, data[0].hash);
      if (isValid) {
        return database.select('*')
          .from('users')
          .where('email', '=', email)
          .then(user => {
            res.json(user[0]);
          })
          .catch(err => {
            res.status(400).json('Unable to get user');
          });
      } else {
        res.status(400).json('Wrong credentials')
      }
    })
    .catch(err => { res.status(400).json('Wrong credentials') })
}
)

app.post('/register', (req, res) => {
  const { name, email, password } = req.body;
  if (!name || !email || !password) {
    return res.status(400).json('Incorrect form submission');
  }

  const hash = bcrypt.hashSync(password, saltRound);
  database.transaction(trx => {
    trx.insert({
      hash: hash,
      email: email
    })
      .into('login')
      .returning('email')
      .then(loginEmail => {
        return trx('users')
          .returning('*')
          .insert({
            email: loginEmail[0],
            name: name,
            joined: new Date()
          })
          .then(response => {
            res.json(response);
          })
      })
      .then(trx.commit)
      .catch(trx.rollback);
  })
    .catch(err => {
      res.status(400).json('Unable to register');
    })
}
)

app.get('/profile/:id', (req, res) => {
  const { id } = req.params;
  database.select('*')
    .from('users')
    .where({ id: id })
    .then(user => {
      if (user.length) {
        res.json(user[0]);
      } else {
        res.status(400).json('User not found')
      }
    })
    .catch(err => res.status(400).json('Error getting user'))
}
)

app.put('/image', (req, res) => {
  const { id } = req.body;
  database('users').where('id', '=', id)
    .increment('entries', 1)
    .returning('entries')
    .then(entries => {
      res.json(entries[0]);
    })
    .catch(err => {
      res.status(400).json('Unable to get entries');
    })
});

app.listen(3000, () => {
  console.log('Server is started and is listing on port 3000');
}
)