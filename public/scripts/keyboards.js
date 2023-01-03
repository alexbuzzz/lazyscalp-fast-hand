const { Markup } = require('telegraf')

// Start keyboard
const startKeyboard = {
  parse_mode: 'HTML',
  ...Markup.inlineKeyboard([
    [
      Markup.button.callback('🔄 ORDERS', 'check_orders'),
      Markup.button.callback('🔄 POSITIONS', 'check_positions'),
    ],
    [
      Markup.button.callback('⚙️ LEVERAGE', 'leverage'),
      Markup.button.callback('💰 BALANCES ', 'balances'),
    ],
    [
      Markup.button.callback('🚁 FUNDING', 'fundings'),
      Markup.button.callback('❓ HELP', 'help'),
    ],
  ]),
}

// Remove orders
const removeOrders = {
  parse_mode: 'HTML',
  ...Markup.inlineKeyboard([
    [Markup.button.callback('❌ TAKE OFF ALL ORDERS', 'remove_orders')],
    [Markup.button.callback('⬅️ BACK', 'back')],
  ]),
}

// Close positions
const closePositions = {
  parse_mode: 'HTML',
  ...Markup.inlineKeyboard([
    [Markup.button.callback('❌ CLOSE ALL POSITIONS', 'close_positions')],
    [Markup.button.callback('⬅️ BACK', 'back')],
  ]),
}

// Choose leverage
const chooseLeverage = {
  parse_mode: 'HTML',
  ...Markup.inlineKeyboard([
    [
      Markup.button.callback('CROSS', 'cross'),
      Markup.button.callback('ISOLATED', 'isolated'),
    ],
    [
      Markup.button.callback('1x', 'one'),
      Markup.button.callback('2x', 'two'),
      Markup.button.callback('5x', 'five'),
    ],
    [
      Markup.button.callback('8x', 'eight'),
      Markup.button.callback('10x', 'ten'),
      Markup.button.callback('20x', 'twenty'),
    ],
    [
      Markup.button.callback('⬅️ BACK', 'back'),
      Markup.button.callback('MAX', 'max'),
    ],
  ]),
}

// Funding
const fundingMenu = {
  parse_mode: 'HTML',
  ...Markup.inlineKeyboard([
    [Markup.button.callback('🎚 SET MIN RATE', 'fundingRateFilterMenu')],
    [Markup.button.callback('🔔 ALERTS ON/OFF', 'switch_funding_alerts')],
    [Markup.button.callback('💵 CHECK BALANCES', 'fundingBalances')],
    [Markup.button.callback('⬅️ BACK', 'back')],
  ]),
}

// Funding rate filter menu
const fundingRateFilterMenu = {
  parse_mode: 'HTML',
  ...Markup.inlineKeyboard([
    [
      Markup.button.callback('0.2%', 'rate 0.2%'),
      Markup.button.callback('0.5%', 'rate 0.5%'),
      Markup.button.callback('0.8%', 'rate 0.8%'),
    ],
    [
      Markup.button.callback('1%', 'rate 1%'),
      Markup.button.callback('1.5%', 'rate 1.5%'),
      Markup.button.callback('2%', 'rate 2%'),
    ],
    [Markup.button.callback('⬅️ BACK', 'fundings')],
  ]),
}

// Back
const backKeyboard = {
  parse_mode: 'HTML',
  ...Markup.inlineKeyboard([Markup.button.callback('⬅️ BACK', 'back')]),
}

// Back to funding
const backToFundingKeyboard = {
  parse_mode: 'HTML',
  ...Markup.inlineKeyboard([Markup.button.callback('⬅️ BACK', 'fundings')]),
}

// Back to leverage
const backToLeverageKeyboard = {
  parse_mode: 'HTML',
  ...Markup.inlineKeyboard([Markup.button.callback('⬅️ BACK', 'leverage')]),
}

module.exports = {
  startKeyboard,
  removeOrders,
  closePositions,
  backKeyboard,
  fundingMenu,
  fundingRateFilterMenu,
  chooseLeverage,
  backToFundingKeyboard,
  backToLeverageKeyboard,
}
