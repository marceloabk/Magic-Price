const request = require('superagent')
const Throttle = require('superagent-throttle')

let throttle = new Throttle({
  active: true,     // set false to pause queue
  rate: 3,          // how many requests can be sent every `ratePer`
  ratePer: 10000,   // number of ms in which `rate` requests may be sent
  concurrent: 2     // how many requests can be sent concurrently
})

function crawlUGC(i, priceArray) {
  const url = `https://www.ugcardshop.com.br/api/products/mtg-versions/${i.name}`

  request
  .get(url)
  .use(throttle.plugin())
  .end((err, res) => {
    const data = res.body
    const result = {name: '', price: Infinity, availability: 0}
    for (let j = 0; j < data.length; j++) {
      if (data[j].estoque > 0 && data[j].preco < result.price && data[j].ativo === '1') {
        result.name = data[j].nome
        result.price = Number(data[j].preco)
        if (data[j].estoque > 20) {
          data[j].estoque = 20
        }
        result.availability = data[j].estoque
      }
    }

    if (result.price !== Infinity) {
      priceArray.push(result.price * i.quantity)

      const normalizedSelector = normalizeSelector(i.name)
      const searchName = document.querySelector(`.${normalizedSelector}`)
      if (searchName === null) {
        const li = document.createElement('li')
        const div = document.createElement('div')
        div.className = `collapsible-header`

        const itemText = document.createTextNode(result.name)

        div.appendChild(itemText)
        li.appendChild(div)
        const body = createCollapsibleBody(`UGC: ${result.name}: ${result.price.toFixed(2)} | Quantidade: ${result.availability}`, normalizedSelector)
        li.appendChild(body)
        ul.appendChild(li)
      } else {
        searchName.innerHTML += `<br />UGC: ${result.name}: ${result.price.toFixed(2)} | Quantidade: ${result.availability}`
      }

      calculatePrice(priceArray, 'UGC', '.ugc-price')
    } else {
      // Imperial Seal
      const itemText = document.createTextNode(`${i.name}`)
      const div = document.createElement('div')
      div.className = 'red-text text-lighten-1'

      div.appendChild(itemText)
      const ugcCards = document.querySelector('.ugc-cards')
      ugcCards.appendChild(div)
    }
  })
}

function createCollapsibleBody(text, name) {
  const textNode = document.createTextNode(text)
  const div = document.createElement('div')

  div.className = `collapsible-body ${name}`

  div.appendChild(textNode)

  return div
}

function calculatePrice(priceArray, name, query) {
  let sum = priceArray.reduce((a, b) => a + b, 0)

  const textNode = document.createTextNode(`${name}: ${sum.toFixed(2)} R$`)
  const priceNode = document.querySelector(`${query}`)
  priceNode.textContent = ''

  priceNode.appendChild(textNode)
}

function replaceAll(str, find, replace) {
  return str.replace(new RegExp(find, 'g'), replace)
}

function normalizeSelector(selector) {
  selector = replaceAll(selector, ' ', '-')
  selector = replaceAll(selector, ',', '')
  selector = replaceAll(selector, '\'', '')
  selector = selector.toLowerCase()

  return selector
}
