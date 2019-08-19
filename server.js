const express = require('express');
const bodyParser = require('body-parser');

const app = express();

/*
/ --> res = this is working
/signin --> POST = success/fail
/register --> POST = user
/profile:userId --> GET = user
/image --> PUT --> user
 */

app.get('/', (req, res) => {
  res.send('this is working')
}
)

app.listen(3000, () => {
  console.log('Server is started and is listing on port 3000');
}
)