const JSONdb = require('simple-json-db')

const fundingText = async () => {
  const db = new JSONdb('database/db.json')
  const fundingMinRate = db.has('fundingMinRate')
    ? db.get('fundingMinRate')
    : '0.5'

  return `✅ You turned ON funding alerts.\n\nIf the funding rates of any futures are at least ${fundingMinRate}%, the bot will send you two alerts:\n\n➖ 5 minutes before funding\n➖ 30 seconds before funding`
}

module.exports = {
  helpText:
    'При обнаружении каких-либо ошибок,\nпросьба писать в чат <a href="https://t.me/+7NgqEi90-vo5NmI6">LazyScalp</a>\n\nЛибо автору @BuzzAlex.\n\n💵 ЦЕНА БОТА\n\nЦену каждый вибирает сам по своим возможностям.\n\nЕсли вы чувствуете, что данный бот приносит вам пользу\nи считаете, что этот продукт стоит денег,\nподдержите автора справедливой суммой на один из реквизитов ниже:\n\n<b>Перевод через BinancePAY:</b>\nPay ID: <code>208207797</code>\nNickname: <code>AlexBuz</code>\n\n<b>Кошелек USDT TRX Tron (TRC20):</b>\n<code>TG7DXAof3m6exNWt4TpiV1dZ77mKuNANsp</code>\n\nP.S. Чтобы скопировать адрес кошелька, нужно на него нажать.',
  fundingText,
}
