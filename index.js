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
} = require('./public/scripts/keyboards')

const {
  getPos,
  closePos,
  getOrd,
  cancelOrd,
  setLeverage,
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

  if (fundingRate.counter > 0) {
    if (db.get('alerts')) {
      if (db.get('alerts') == 'on') {
        const msg = await bot.telegram.sendMessage(
          process.env.USER_ID,
          `❗️ FUNDING 5 MINUTES\n\n${fundingRate.tickers}`,
          { parse_mode: 'HTML' }
        )
        setTimeout(() => {
          bot.telegram.deleteMessage(process.env.USER_ID, msg.message_id).then(
            (response) => response,
            ({ response }) => response.ok
          )
        }, 1000 * 269)
      }
    }
  }
})

// FUNDING TIMER 30 SEC
cron.schedule('30 59 23,7,15 * * *', async () => {
  const db = new JSONdb('database/db.json')

  const fundingRate = await getFundingRate()

  if (fundingRate.counter > 0) {
    const prevBalance = await getPrevFundingBalances()
    db.set('prevBalance', prevBalance)

    if (db.get('alerts')) {
      if (db.get('alerts') == 'on') {
        const msg = await bot.telegram.sendMessage(
          process.env.USER_ID,
          `❗️ FUNDING IN 30 SEC\n\n${fundingRate.tickers}`,
          { parse_mode: 'HTML' }
        )
        setTimeout(() => {
          bot.telegram.deleteMessage(process.env.USER_ID, msg.message_id).then(
            (response) => response,
            ({ response }) => response.ok
          )
        }, 1000 * 30)
      }
    }
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
    'Select leverage value to set in all futures:',
    chooseLeverage
  )
})

// SET 1
bot.action('one', async (ctx) => {
  const res = await setLeverage(1)
  ctx.editMessageText(res, backKeyboard)
})

// SET 2
bot.action('two', async (ctx) => {
  const res = await setLeverage(2)
  ctx.editMessageText(res, backKeyboard)
})

// SET 5
bot.action('five', async (ctx) => {
  const res = await setLeverage(5)
  ctx.editMessageText(res, backKeyboard)
})

// SET 8
bot.action('eight', async (ctx) => {
  const res = await setLeverage(8)
  ctx.editMessageText(res, backKeyboard)
})

// SET 10
bot.action('ten', async (ctx) => {
  const res = await setLeverage(10)
  ctx.editMessageText(res, backKeyboard)
})

// SET 20
bot.action('twenty', async (ctx) => {
  const res = await setLeverage(20)
  ctx.editMessageText(res, backKeyboard)
})

// SET MAX
bot.action('max', async (ctx) => {
  const res = await setLeverage('max')
  ctx.editMessageText(res, backKeyboard)
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

// HELP
bot.action('help', async (ctx) => {
  ctx.editMessageText(helpText, backKeyboard)
})

// BACK
bot.action('back', (ctx) => {
  ctx.editMessageText('Press button to do something:', startKeyboard)
})

// SWITCH FUNDING ALERTS
bot.action('switch_funding_alerts', async (ctx) => {
  const db = new JSONdb('database/db.json')

  if (db.get('alerts') == 'on') {
    db.set('alerts', 'off')
    ctx.editMessageText('❌ You turned OFF funding alerts', backKeyboard)
  } else {
    db.set('alerts', 'on')
    ctx.editMessageText(fundingText, backKeyboard)
  }
})

// FUNDING BALANCES
bot.action('fundingBalances', async (ctx) => {
  const fundingBalances = await getFundingBalances()
  ctx.editMessageText(fundingBalances, backKeyboard)
})

bot.launch()
