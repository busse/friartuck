var robinhood = require('robinhood');
var commandLineArgs = require('command-line-args'); // https://www.npmjs.com/package/command-line-args

//command-line variables
var cli = commandLineArgs([
  { name: 'username', alias: 'u', type: String },
  { name: 'password', alias: 'p', type: String },	
  { name: 'action', alias: 'a', type: String },
  { name: 'maxbudget', alias: 'm', type: Number },
  { name: 'symbol', alias: 's', type: String },
  { name: 'stop-loss-percent', alias: 'l', type: Number },
  { name: 'limit-percent', alias: 'h', type: Number }
])

var cli_options = cli.parse();

//variables

var R
var FT = {
      buying_power : null,
      instrument : {
      	symbol : null,
      	url : null,
      },
      buy_quantity : null,
      buy_price : null
    }

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
      	var tmp_buying_power = body.results[0]['buying_power']
      	if (cli_options['maxbudget'] < tmp_buying_power) {
      		var tmp_buying_power = cli_options['maxbudget']
      	}
      	FT.buying_power = tmp_buying_power
        resolve(FT)
      }
    })
  )
}

function getInstrument () {
  return new Promise((resolve, reject) =>
    R.instruments(cli_options['symbol'], (err, res, body) => {
      if (err) {
        reject(err)
      } else {
      	FT.instrument.url = body.results[0].url
      	FT.instrument.symbol = cli_options['symbol']
        console.log(FT.instrument.url + ' ' + FT.instrument.symbol)
        resolve(FT)
      }
    })
  )
}

function getDrinkSize (FT) {
  return new Promise((resolve, reject) =>
    R.quote_data(cli_options['symbol'], (err, res, body) => {
      if (err) {
        reject(err)
      } else {
        FT.buy_price = parseFloat(body.results[0]['last_trade_price'])
        var stb = FT.buying_power / FT.buy_price
        FT.buy_quantity = Math.floor(stb)
        console.log('Math.floor(' + FT.buying_power + '/' + body.results[0]['last_trade_price'] + '=' + stb + ')=' + FT.buy_quantity)
        resolve(FT)
      }
    })
  )
}

function prepBuyOrder(FT) {
	var buy_options = {
	    bid_price: FT.buy_price,
	    quantity: FT.buy_quantity,
	    instrument: {
	        url: FT.instrument.url,
	        symbol: FT.instrument.symbol
	     }
	    // },
	    // // Optional:
	    // 'trigger': String, // Defaults to "gfd" (Good For Day)
	    // 'time': String,    // Defaults to "immediate"
	    // 'type': String     // Defaults to "market"
	}
	return buy_options
}

function prepStopLossOrder(FT) {
	var tmp_stop_price = (FT.buy_price - (FT.buy_price * (cli_options['stop-loss-percent']*0.01)))
	var sell_options = {
	    stop_price: tmp_stop_price,
	    quantity: FT.buy_quantity,
	    trigger: 'stop',
	    time: 'gtc',
	    instrument: {
	        url: FT.instrument.url,
	        symbol: FT.instrument.symbol
	     }
	    // },
	    // // Optional:
	    // 'trigger': String, // Defaults to "gfd" (Good For Day)
	    // 'time': String,    // Defaults to "immediate"
	    // 'type': String     // Defaults to "market"
	}
	return sell_options
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

function postSellOrder (sell_options) {
  return new Promise((resolve, reject) =>
    R.place_sell_order(sell_options, (err, res, body) => {
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


//console.log(cli.getUsage());
// login()
// .then(getBuyingPower)
// .catch(err => { console.error(err); process.exit(1) })
//console.log(cli_options['action']);



// login()
// .then(getInstrument)
// .then(getBuyingPower)
// .then(getDrinkSize)
// //.then(prepBuyOrder)
// .then(prepStopLossOrder)
// .then(postSellOrder)
// //.then(postBuyOrder)
// .then(showFinalResults)
login()
.then(getOrders)


