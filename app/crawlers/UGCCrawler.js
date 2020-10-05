const request = require('superagent')
const Throttle = require('superagent-throttle')

let throttle = new Throttle({
  active: true,     // set false to pause queue
  rate: 3,          // how many requests can be sent every `ratePer`
  ratePer: 10000,   // number of ms in which `rate` requests may be sent
  concurrent: 2     // how many requests can be sent concurrently
})


function crawlUGC(card, priceArray) {
  const url = `https://www.ugcardshop.com.br/api/products/versions?name=${card.name}&type=M`

  request
  .get(url)
  .use(throttle.plugin())
  .end((err, res) => {
    const data = res.body
    const result = {name: '', price: Infinity, availability: 0}
    for (let i = 0; i < data.length; i++) {
      if (data[i].estoque > 0 && data[i].preco < result.price && data[i].ativo === '1') {
        result.name = data[i].nome
        result.price = Number(data[i].preco)

        // UGC only show 20 pieces in stock even when stock is higher
        if (data[i].estoque > 20) {
          data[i].estoque = 20
        }
        result.availability = data[i].estoque
      }
    }

    if (result.price !== Infinity) {
      createCardElement(card.name, 'UGC', result)

      priceArray.push(result.price * card.quantity)
      calculatePrice(priceArray, 'UGC', '.ugc-price')
    } else {
      // Imperial Seal
      createCardNotFound(card.name, '.ugc-cards')
    }
  })
}
