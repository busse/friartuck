var robinhood = require('robinhood');
var commandLineArgs = require('command-line-args'); // https://www.npmjs.com/package/command-line-args

function login () {
  return new Promise((resolve, reject) => {
    //prompt.message = prompt.delimeter = ''
    //prompt.start()
    // prompt.get({
    //   properties: {
    //     username: { default: process.env.ROBINHOOD_USERNAME, required: true },
    //     password: { default: process.env.ROBINHOOD_PASSWORD, required: true, hidden: true }
    //   }
    // }, (err, res) => {
    //   if (err) {
    //     reject(err)
    //   } else {
    //     R = robinhood({ username: res.username, password: res.password }, resolve)
    	   R = robinhood({ username: options['username'], password: options['password'] }, resolve)
    //   }
    // })

	console.log(options['action']);
  })
}

function getOrders () {
  return new Promise((resolve, reject) =>
    R.orders((err, res, body) => {
      if (err) {
        reject(err)
      } else {
      	console.log(body.results);
        resolve(body.results)
      }
    })
  )
}

function getAccounts () {
  return new Promise((resolve, reject) =>
    R.accounts((err, res, body) => {
      if (err) {
        reject(err)
      } else {
      	console.log(body.results);
        resolve(body.results)
      }
    })
  )
}

function getBuyingPower () {
  return new Promise((resolve, reject) =>
    R.accounts((err, res, body) => {
      if (err) {
        reject(err)
      } else {
      	console.log(body.results[0]['buying_power']);
        resolve(body.results[0]['buying_power'])
      }
    })
  )
}

console.log("friartuck wakes up");

var cli = commandLineArgs([
  { name: 'username', alias: 'u', type: String },
  { name: 'password', alias: 'p', type: String },	
  { name: 'action', alias: 'a', type: String },
  { name: 'passout', type: String },
  { name: 'symbol', alias: 's', type: String },
  { name: 'stop-loss-percent', alias: 'l', type: Number },
  { name: 'limit-percent', alias: 'h', type: Number }
])

var options = cli.parse();

//console.log(cli.getUsage());
login()
.then(getBuyingPower)
.catch(err => { console.error(err); process.exit(1) })
//console.log(options['action']);


