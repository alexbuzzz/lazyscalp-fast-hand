require('dotenv').config()

const JSONdb = require('simple-json-db')

const Binance = require('node-binance-api')

const binance = new Binance().options({
  APIKEY: process.env.PUBLIC_API,
  APISECRET: process.env.SECRET_API,
})

let positions = {}
let orders = []

// Get positions
const getPos = async () => {
  const positionsData = await binance.futuresPositionRisk()

  let msg = ''
  let status = ''

  if (positionsData.code) {
    msg += `⚠️ ${positionsData.msg}\n`
    status = 'error'
  } else {
    positionsData.forEach((element) => {
      if (element.positionAmt != 0) {
        positions[element.symbol] = {
          ticker: element.symbol,
          amount: element.positionAmt,
        }

        msg += `${element.symbol} ${Number(element.unRealizedProfit).toFixed(
          2
        )}$\n`
      }
    })

    if (Object.keys(positions).length === 0) {
      status = 'empty'
    }
  }

  return { status, msg }
}

// Get orders
const getOrd = async () => {
  const ordersObj = await binance.futuresOpenOrders()

  let msg = ''
  let status = ''

  if (ordersObj.code) {
    msg += `⚠️ ${ordersObj.msg}\n`
    status = 'error'
  } else if (ordersObj.length > 0) {
    ordersObj.forEach((element) => {
      msg += `${element.symbol} ${element.price}\n`
      orders.push(element.symbol)
    })
  } else {
    status = 'empty'
  }

  return { status, msg }
}

// Close positions
const closePos = async () => {
  let errMsg = ''
  let errorsCount = 0

  for (element in positions) {
    const ticker = positions[element].ticker
    const amount = positions[element].amount

    if (amount > 0) {
      const res = await binance.futuresMarketSell(ticker, Math.abs(amount))
      if (res.code) {
        errMsg += `⚠️ ${ticker} ${res.msg}\n`
        errorsCount++
      }
    }
    if (amount < 0) {
      const res = await binance.futuresMarketBuy(ticker, Math.abs(amount))
      if (res.code) {
        errMsg += `⚠️ ${ticker} ${res.msg}\n`
        errorsCount++
      }
    }
  }
  positions = {}

  if (errorsCount > 0) {
    return errMsg
  } else {
    return '✅ All positions are closed'
  }
}

// Cancel orders
const cancelOrd = async () => {
  let errMsg = ''
  let errorsCount = 0

  await orders.forEach(async (element) => {
    const res = await binance.futuresCancelAll(element)

    if (res.code !== 200) {
      errMsg += `⚠️ ${element} ${res.msg}\n`
      errorsCount++
    }
  })
  orders = []

  if (errorsCount > 0) {
    return errMsg
  } else {
    return '✅ All orders were canceled '
  }
}

// Set leverage
const setLeverage = async (lever) => {
  futurePairs = await binance.futuresMarkPrice()

  const allTickers = []

  if (futurePairs.code) {
    return `⚠️ ${futurePairs.msg}\n`
  }

  await futurePairs.forEach((element) => {
    allTickers.push(element.symbol)
  })

  const brackets = await binance.futuresLeverageBracket()

  if (brackets.code) {
    return `⚠️ ${brackets.msg}\n`
  }

  brackets.forEach(async (element) => {
    const maxLever = element.brackets[0].initialLeverage

    if (lever == 'max') {
      const res = await binance.futuresLeverage(element.symbol, maxLever)
    } else if (maxLever < lever) {
      const res = await binance.futuresLeverage(element.symbol, maxLever)
    } else {
      const res = await binance.futuresLeverage(element.symbol, lever)
    }
  })

  return `✅ ${lever
    .toString()
    .replace('x', '')
    .toUpperCase()}X successfully set`
}

// Get balances
const getBalances = async () => {
  let msg = ''

  const fut = await binance.futuresBalance()

  if (fut.code) {
    msg += `⚠️ ${fut.msg}\n`
  } else {
    msg = 'FUT:\n'
    await fut.forEach((element) => {
      if (element.balance > 0) {
        msg += `${element.asset} ${Number(element.balance).toFixed(2)}$\n`
      }
    })
    msg += '\nSPOT:\n'

    const spot = await binance.balance()

    Object.keys(spot).forEach((key) => {
      if (spot[key].available > 0) {
        msg += `${key} ${Number(spot[key].available).toFixed(2)}$\n`
      }
    })
  }

  return msg
}

// Get fundings
const getFundingRate = async () => {
  const db = new JSONdb('database/db.json')
  const alerts = db.has('alerts') ? await db.get('alerts') : 'on'
  const fundingMinRate = db.has('fundingMinRate')
    ? db.get('fundingMinRate')
    : '0.5'
  let msg = ''
  let alertMsg = ''
  const tickers = []
  const res = await binance.futuresMarkPrice()
  const currentTime = res[1].time
  const nextTime = res[1].nextFundingTime
  const minsLeft = Math.round((nextTime - currentTime) / 1000 / 60)
  let h = Math.floor(minsLeft / 60)
  let m = minsLeft % 60

  msg += `⏱ NEXT FUNDING IN: ${(h = h < 10 ? '0' + h : h)}:${(m =
    m < 10 ? '0' + m : m)}\n\n`

  await res.forEach((element) => {
    const rate = (element.lastFundingRate * 100).toFixed(2)

    if (Math.abs(rate) >= Number(fundingMinRate)) {
      tickers.push({ ticker: element.symbol, rate: rate })
    }
  })

  if (tickers.length > 0) {
    tickers.sort((a, b) => a.rate - b.rate)
    tickers.forEach((element) => {
      msg += `<code>${element.ticker}</code> ${element.rate}\n`
      alertMsg += `<code>${element.ticker}</code> ${element.rate}\n`
    })
  } else {
    msg += 'Nothing to trade yet 😢\n'
  }

  msg += `\nAlerts ${alerts.toUpperCase()}\nMin rate: ${fundingMinRate}%`

  return { msg, alertMsg, tickers }
}

// Get funding balances
const getFundingBalances = async () => {
  let msg = 'Before funding:\n'

  const db = new JSONdb('database/db.json')
  const prevBalance = await db.get('prevBalance')

  if (!prevBalance) {
    msg += 'Not available yet\n'
  } else {
    msg += prevBalance
  }

  const fut = await binance.futuresBalance()

  if (fut.code) {
    msg += `⚠️ ${fut.msg}\n`
  } else {
    msg += '\nNow:\n'
    await fut.forEach((element) => {
      if (element.balance > 0) {
        msg += `${element.asset} ${Number(element.balance).toFixed(2)}$\n`
      }
    })
  }

  return msg
}

// Get previous funding balances
const getPrevFundingBalances = async () => {
  let msg = ''

  const fut = await binance.futuresBalance()

  if (fut.code) {
    msg += `⚠️ ${fut.msg}\n`
  } else {
    await fut.forEach((element) => {
      if (element.balance > 0) {
        msg += `${element.asset} ${Number(element.balance).toFixed(2)}$\n`
      }
    })
  }

  return msg
}

module.exports = {
  getPos,
  closePos,
  getOrd,
  cancelOrd,
  setLeverage,
  getBalances,
  getFundingRate,
  getFundingBalances,
  getPrevFundingBalances,
}
