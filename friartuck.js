var robinhood = require('robinhood');
var commandLineArgs = require('command-line-args'); // https://www.npmjs.com/package/command-line-args


//variables

var R
var BP
var LTP
var INSTRUMENT
var prep_options

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
    	   R = robinhood({ username: cli_options['username'], password: cli_options['password'] }, resolve)
    //   }
    // })

	console.log(cli_options['action']);
  })
}

function getOrders () {
  return new Promise((resolve, reject) =>
    R.orders((err, res, body) => {
      if (err) {
        reject(err)
      } else {
      	console.log(body);
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
      	//console.log(body.results)
      	BP = body.results[0]['buying_power']
        resolve(body.results[0]['buying_power'])
      }
    })
  )
}

function getInstrumentURI () {
  return new Promise((resolve, reject) =>
    R.instruments(cli_options['symbol'], (err, res, body) => {
      if (err) {
        reject(err)
      } else {
      	INSTRUMENT = body.results[0].url
        console.log(body.results[0].url)
        resolve(body.results[0].url)
      }
    })
  )
}

function getDrinkSize (buying_power) {
  return new Promise((resolve, reject) =>
    R.quote_data(cli_options['symbol'], (err, res, body) => {
      if (err) {
        reject(err)
      } else {
      	//console.log(body.results[0]['buying_power'])
        //resolve(body.results[0]['buying_power'])
        LTP = parseFloat(body.results[0]['last_trade_price'])
        var stb = buying_power / LTP
        var wholestb = Math.floor(stb)
        console.log('Math.floor(' + buying_power + '/' + body.results[0]['last_trade_price'] + '=' + stb + ')=' + wholestb)
        resolve(wholestb)
      }
    })
  )
}

function prepBuyOrder(drink_size) {
	var buy_options = {
	    bid_price: LTP,
	    quantity: drink_size,
	    instrument: {
	        url: INSTRUMENT,
	        symbol: cli_options['symbol']
	     }
	    // },
	    // // Optional:
	    // 'trigger': String, // Defaults to "gfd" (Good For Day)
	    // 'time': String,    // Defaults to "immediate"
	    // 'type': String     // Defaults to "market"
	}
	return buy_options
}

function postBuyOrder (buy_options) {
  return new Promise((resolve, reject) =>
    R.place_buy_order(buy_options, (err, res, body) => {
      if (err) {
        reject(err)
      } else {
        console.log(body.results)
        resolve(body.results)
      }
    })
  )
}

function showFinalResults (buy_options) {
  console.log(buy_options)
}


console.log("friartuck wakes up");

var cli = commandLineArgs([
  { name: 'username', alias: 'u', type: String },
  { name: 'password', alias: 'p', type: String },	
  { name: 'action', alias: 'a', type: String },
  { name: 'symbol', alias: 's', type: String },
  { name: 'stop-loss-percent', alias: 'l', type: Number },
  { name: 'limit-percent', alias: 'h', type: Number }
])

var cli_options = cli.parse();

//console.log(cli.getUsage());
// login()
// .then(getBuyingPower)
// .then(console.log("There's this much ale to drink: " + BP))
// .catch(err => { console.error(err); process.exit(1) })
//console.log(cli_options['action']);



// login()
// .then(getInstrumentURI)
// .then(getBuyingPower)
// .then(getDrinkSize)
// .then(prepBuyOrder)
// //.then(postBuyOrder)
// .then(showFinalResults)
login()
.then(getOrders)
//.then(console.log("There's this much ale to drink: " + BP))


