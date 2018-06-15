const Crawler = require('crawler')

const c = new Crawler({})
c.setLimiterProperty('default', 'rateLimit', 1500)

function crawlInside(card, priceArray) {
  c.queue([{
    uri: `https://insidegamestore.com.br/publico/buscas/magic.xhtml?p=1&ag=POR_CARTA&n=${card.name}&nm=EQUALS&vmin=&vmax=&t=&tm=CONTAINS&f=&fm=CONTAINS&cm1=0&cm2=AND&ccd=&cca=&pdm=EQ&pd=&pdmcc=&rsm=EQ&rs=&rscc=`,
    callback: function (error, res, done) {
      if (error) {
        console.log(error)
      } else {
        const $ = res.$

        const cardName = $('#resultado > div.features_items > div.col-md-3.col-xs-6 > div > div > div > a.tooltip-image-right > h2').text().trim()
        let cardPrice = $('#resultado > div.features_items > div.col-md-3.col-xs-6 > div > div > div > p:nth-child(2)').text().trim().split(':')
        cardPrice = cardPrice[cardPrice.length - 1]

        const matchPrice = RegExp(/\d+(,\d{1,2})?/g)
        const cardOnlyPrice = cardPrice.match(matchPrice)[0].replace(',', '.')
        const result = {name: cardName, price: Number(cardOnlyPrice)}

        if (cardPrice !== '') {
          const normalizedSelector = normalizeSelector(card.name)
          const searchName = document.querySelector(`.${normalizedSelector}`)

          if (searchName === null) {
            const li = document.createElement('li')
            const div = document.createElement('div')
            div.className = `collapsible-header`

            const itemText = document.createTextNode(result.name)

            div.appendChild(itemText)
            li.appendChild(div)
            const body = createCollapsibleBody(`Inside: ${result.name}: ${result.price.toFixed(2)}`, normalizedSelector)
            li.appendChild(body)
            ul.appendChild(li)
          } else {
            searchName.innerHTML += `<br />Inside: ${result.name}: ${result.price.toFixed(2)}`
          }

          priceArray.push(result.price * card.quantity)
          calculatePrice(priceArray, 'Inside', '.inside-price')
        } else {
          createCardNotFound(card.name, '.inside-cards')
        }
      }
      done()
    }
  }])
}
