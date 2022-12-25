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
    Markup.button.callback('⬅️ BACK', 'back'),
    Markup.button.callback('ALERTS', 'switch_funding_alerts'),
  ]),
}

// Back
const backKeyboard = {
  parse_mode: 'HTML',
  ...Markup.inlineKeyboard([Markup.button.callback('⬅️ BACK', 'back')]),
}

module.exports = {
  startKeyboard,
  removeOrders,
  closePositions,
  backKeyboard,
  fundingMenu,
  chooseLeverage,
}
