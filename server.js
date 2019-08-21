const express = require('express');
const bodyParser = require('body-parser');
const bcrypt = require('bcrypt');
const cors = require('cors');
const app = express();

app.use(bodyParser.json());
app.use(cors());

const findUser = (key, value) => {
  return database.users.find(user => {
    if (user[key] === value) {
      return user;
    }
  });
}

const database = {
  users: [
    {
      id: '123',
      name: 'John',
      email: 'john@gmail.com',
      password: 'cookies',
      entries: 0,
      joined: new Date()
    },
    {
      id: '124',
      name: 'Sally',
      email: 'sally@gmail.com',
      password: 'bananas',
      entries: 0,
      joined: new Date()
    }
  ],
  login: [{
    id: '123',
    email: 'john@gmail.com',
    password: 'cookies'
  }, {
    id: '124',
    email: 'sally@gmail.com',
    password: 'bananas',
  }],
}



app.get('/', (req, res) => {
  res.json(database.users);
}
)

app.post('/signin', (req, res) => {

  const { email, password } = req.body;
  user = findUser("email", email);
  if (user && user.password === password) {
    res.json(user);
  } else {

    res.status(400).json('Error logging in');
  }
}
)

app.post('/register', (req, res) => {
  const { name, email, password } = req.body;
  database.users.push({
    id: '125',
    name: name,
    email: email,
    password: password,
    entries: 0,
    joined: new Date()
  });
  res.json(database.users[database.users.length - 1]);
}
)

app.get('/profile/:id', (req, res) => {
  const { id } = req.params;
  const found = findUser('id', id);

  if (!found) {
    res.status(404).json('User not found');
  } else {
    res.json(found);
  }
}
)

app.put('/image', (req, res) => {
  const { id } = req.body;
  const found = findUser('id', id);
  if (!found) {
    res.status(404).json('User not found');
  } else {
    found.entries++;
    return res.json(found.entries);
  }
});

app.listen(3000, () => {
  console.log('Server is started and is listing on port 3000');
}
)