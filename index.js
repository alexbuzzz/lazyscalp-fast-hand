require('dotenv').config()

const cron = require('node-cron')

const JSONdb = require('simple-json-db')

const {
  startKeyboard,
  removeOrders,
  closePositions,
  backKeyboard,
  chooseLeverage,
  fundingMenu,
  fundingRateFilterMenu,
  backToFundingKeyboard,
  backToLeverageKeyboard,
} = require('./public/scripts/keyboards')

const {
  getTickers,
  getPos,
  closePos,
  getOrd,
  cancelOrd,
  setLeverage,
  setMarginType,
  getBalances,
  getFundingRate,
  getFundingBalances,
  getPrevFundingBalances,
} = require('./public/scripts/binance')

const { helpText, fundingText } = require('./public/scripts/textTemplates')

const { Telegraf } = require('telegraf')

const bot = new Telegraf(process.env.BOT_TOKEN)

// FUNDING TIMER 5M
cron.schedule('55 23,7,15 * * *', async () => {
  const db = new JSONdb('database/db.json')

  const fundingRate = await getFundingRate()

  if (fundingRate.tickers.length > 0) {
    if (db.get('alerts')) {
      if (db.get('alerts') == 'on') {
        const msg = await bot.telegram.sendMessage(
          process.env.USER_ID,
          `❗️ FUNDING IN 5 MINUTES\n\n${fundingRate.alertMsg}`,
          { parse_mode: 'HTML' }
        )
        setTimeout(() => {
          bot.telegram.deleteMessage(process.env.USER_ID, msg.message_id).then(
            (response) => response,
            ({ response }) => response.ok
          )
        }, 1000 * 268)
      }
    }
  }
})

// FUNDING TIMER 30 SEC
cron.schedule('30 59 23,7,15 * * *', async () => {
  const db = new JSONdb('database/db.json')

  const fundingRate = await getFundingRate()

  if (fundingRate.tickers.length > 0) {
    const prevBalance = await getPrevFundingBalances()
    db.set('prevBalance', prevBalance)

    if (db.get('alerts')) {
      if (db.get('alerts') == 'on') {
        const msg = await bot.telegram.sendMessage(
          process.env.USER_ID,
          `❗️ FUNDING IN 30 SEC\n\n${fundingRate.alertMsg}`,
          { parse_mode: 'HTML' }
        )
        setTimeout(() => {
          bot.telegram.deleteMessage(process.env.USER_ID, msg.message_id).then(
            (response) => response,
            ({ response }) => response.ok
          )
        }, 1000 * 28)
      }
    }
  }
})

// CHECK NEW LISTED FUTURES
const initTickersList = async () => {
  const tickers = await getTickers()
  const db = new JSONdb('database/db.json')
  db.set('futTickers', tickers)
}
initTickersList()

cron.schedule('10,40 * * * *', async () => {
  initTickersList()
})

cron.schedule('10 0,30 * * * *', async () => {
  const db = new JSONdb('database/db.json')
  const tickersFromDB = await db.get('futTickers')
  const tickers = await getTickers()

  let difference = tickers.filter((x) => !tickersFromDB.includes(x))

  let text = '🆕 FUTURES JUST LISTED:\n\n'

  if (difference.length > 0) {
    difference.forEach((element) => {
      text += `<code>${element}</code>\n`
    })

    const msg = await bot.telegram.sendMessage(process.env.USER_ID, text, {
      parse_mode: 'HTML',
    })
    setTimeout(() => {
      bot.telegram.deleteMessage(process.env.USER_ID, msg.message_id).then(
        (response) => response,
        ({ response }) => response.ok
      )
    }, 1000 * 60 * 60 * 12)
  }
})

// START
bot.command('start', async (ctx) => {
  if (ctx.message.chat.id == process.env.USER_ID) {
    try {
      await ctx.replyWithPhoto({
        source: './public/images/lazyscalp1000x1000.png',
      })
      ctx.reply('Press button to do something:', startKeyboard)
    } catch (error) {
      console.log('start error' + error)
    }
  }
})

// CHECK ORDERS
bot.action('check_orders', async (ctx) => {
  const orders = await getOrd()

  if (orders.status === 'empty') {
    ctx.editMessageText('No open ORDERS yet 👌', backKeyboard)
  } else if (orders.status === 'error') {
    ctx.editMessageText(orders.msg, backKeyboard)
  } else {
    ctx.editMessageText(`Orders:\n${orders.msg}`, removeOrders)
  }
})

// CHECK POSITIONS
bot.action('check_positions', async (ctx) => {
  const positions = await getPos()

  if (positions.status === 'empty') {
    ctx.editMessageText('No open POSITIONS yet 👌', backKeyboard)
  } else if (positions.status === 'error') {
    ctx.editMessageText(positions.msg, backKeyboard)
  } else {
    ctx.editMessageText(`Positions:\n${positions.msg}`, closePositions)
  }
})

// CANCEL ORDERS
bot.action('remove_orders', async (ctx) => {
  const cancelStatus = await cancelOrd()
  ctx.editMessageText(cancelStatus, backKeyboard)
})

// CLOSE POSITIONS
bot.action('close_positions', async (ctx) => {
  const closeStatus = await closePos()
  ctx.editMessageText(closeStatus, backKeyboard)
})

// CHOOSE LEVERAGE
bot.action('leverage', async (ctx) => {
  ctx.editMessageText(
    'Select leverage or margin type to set in all futures:',
    chooseLeverage
  )
})

// SET CROSS TYPE
bot.action('cross', async (ctx) => {
  const res = await setMarginType('CROSSED')
  ctx.editMessageText(res, backToLeverageKeyboard)
})

// SET ISOLATED TYPE
bot.action('isolated', async (ctx) => {
  const res = await setMarginType('ISOLATED')
  ctx.editMessageText(res, backToLeverageKeyboard)
})

// SET LEVER 1
bot.action('one', async (ctx) => {
  const res = await setLeverage(1)
  ctx.editMessageText(res, backToLeverageKeyboard)
})

// SET LEVER 2
bot.action('two', async (ctx) => {
  const res = await setLeverage(2)
  ctx.editMessageText(res, backToLeverageKeyboard)
})

// SET LEVER 5
bot.action('five', async (ctx) => {
  const res = await setLeverage(5)
  ctx.editMessageText(res, backToLeverageKeyboard)
})

// SET LEVER 8
bot.action('eight', async (ctx) => {
  const res = await setLeverage(8)
  ctx.editMessageText(res, backToLeverageKeyboard)
})

// SET LEVER 10
bot.action('ten', async (ctx) => {
  const res = await setLeverage(10)
  ctx.editMessageText(res, backToLeverageKeyboard)
})

// SET LEVER 20
bot.action('twenty', async (ctx) => {
  const res = await setLeverage(20)
  ctx.editMessageText(res, backToLeverageKeyboard)
})

// SET LEVER MAX
bot.action('max', async (ctx) => {
  const res = await setLeverage('max')
  ctx.editMessageText(res, backToLeverageKeyboard)
})

// BALANCES
bot.action('balances', async (ctx) => {
  const balances = await getBalances()
  ctx.editMessageText(balances, backKeyboard)
})

// FUNDING MENU
bot.action('fundings', async (ctx) => {
  const fundings = await getFundingRate()
  ctx.editMessageText(fundings.msg, fundingMenu)
})

// FUNDING RATE FILTER MENU
bot.action('fundingRateFilterMenu', async (ctx) => {
  ctx.editMessageText(
    'Select minimal funding rate to show in bot and alerts:',
    fundingRateFilterMenu
  )
})

// SET MIN RATE 0.2%
bot.action('rate 0.2%', async (ctx) => {
  const db = new JSONdb('database/db.json')
  db.set('fundingMinRate', '0.2')
  ctx.editMessageText('✅ 0.2% successfully set', backToFundingKeyboard)
})

// SET MIN RATE 0.5%
bot.action('rate 0.5%', async (ctx) => {
  const db = new JSONdb('database/db.json')
  db.set('fundingMinRate', '0.5')
  ctx.editMessageText('✅ 0.5% successfully set', backToFundingKeyboard)
})

// SET MIN RATE 0.8%
bot.action('rate 0.8%', async (ctx) => {
  const db = new JSONdb('database/db.json')
  db.set('fundingMinRate', '0.8')
  ctx.editMessageText('✅ 0.8% successfully set', backToFundingKeyboard)
})

// SET MIN RATE 1%
bot.action('rate 1%', async (ctx) => {
  const db = new JSONdb('database/db.json')
  db.set('fundingMinRate', '1')
  ctx.editMessageText('✅ 1% successfully set', backToFundingKeyboard)
})

// SET MIN RATE 1.5%
bot.action('rate 1.5%', async (ctx) => {
  const db = new JSONdb('database/db.json')
  db.set('fundingMinRate', '1.5')
  ctx.editMessageText('✅ 1.5% successfully set', backToFundingKeyboard)
})

// SET MIN RATE 2%
bot.action('rate 2%', async (ctx) => {
  const db = new JSONdb('database/db.json')
  db.set('fundingMinRate', '2')
  ctx.editMessageText('✅ 2% successfully set', backToFundingKeyboard)
})

// SWITCH FUNDING ALERTS
bot.action('switch_funding_alerts', async (ctx) => {
  const db = new JSONdb('database/db.json')

  if (db.has('alerts') && db.get('alerts') == 'off') {
    db.set('alerts', 'on')
    ctx.editMessageText(await fundingText(), backToFundingKeyboard)
  } else {
    db.set('alerts', 'off')
    ctx.editMessageText(
      '❌ You turned OFF funding alerts',
      backToFundingKeyboard
    )
  }
})

// FUNDING BALANCES
bot.action('fundingBalances', async (ctx) => {
  const fundingBalances = await getFundingBalances()
  ctx.editMessageText(fundingBalances, backToFundingKeyboard)
})

// HELP
bot.action('help', async (ctx) => {
  ctx.editMessageText(helpText, backKeyboard)
})

// BACK
bot.action('back', (ctx) => {
  ctx.editMessageText('Press button to do something:', startKeyboard)
})

bot.launch()
