const LigaCrawler = require('crawler')

let crawlerInstances = {}

function crawlLigaLike(card, priceArray, siteURL, storeName, ignoreQuality = false) {

  let crawler = crawlerInstances[storeName];
  if (crawler === undefined) {
    crawler = new LigaCrawler({})
    crawler.setLimiterProperty('default', 'rateLimit', 1500)
    crawlerInstances[storeName] = crawler
  }

  crawler.queue([{
    uri: `${siteURL}?view=ecom%2Fitens&id=56925&searchExactMatch=1&busca=${card.name}`,
    callback: function (error, res, done) {
      if (error) {
        console.log(error)
      } else {
        const $ = res.$

        const result = {name: '', price: Infinity, availability: null}

        const headerSize = $('tr:nth-child(1) > td > table > tr > td:nth-child(2) > div.itemMain > table > tr > td:nth-child(2) > div:nth-child(3) > table > tr:nth-child(1) > td').length

        let cardQuality = undefined
        let cardAvailability = undefined
        let cardPrice = undefined

        if (headerSize === 7) {
          cardQuality = $('tr:nth-child(1) > td > table > tr > td:nth-child(2) > div.itemMain > table > tr > td:nth-child(2) > div:nth-child(3) > table > tr > td:nth-child(3)')
          cardAvailability = $('tr:nth-child(1) > td > table > tr > td:nth-child(2) > div.itemMain > table > tr > td:nth-child(2) > div:nth-child(3) > table > tr > td:nth-child(5)')
          cardPrice = $('tr:nth-child(1) > td > table > tr > td:nth-child(2) > div.itemMain > table > tr > td:nth-child(2) > div:nth-child(3) > table > tr > td:nth-child(6)')
        } else if (headerSize === 6) {
          cardQuality = $('tr:nth-child(1) > td > table > tr > td:nth-child(2) > div.itemMain > table > tr > td:nth-child(2) > div:nth-child(3) > table > tr > td:nth-child(3)')
          cardAvailability = $('tr:nth-child(1) > td > table > tr > td:nth-child(2) > div.itemMain > table > tr > td:nth-child(2) > div:nth-child(3) > table > tr > td:nth-child(4)')
          cardPrice = $('tr:nth-child(1) > td > table > tr > td:nth-child(2) > div.itemMain > table > tr > td:nth-child(2) > div:nth-child(3) > table > tr > td:nth-child(5)')
        } else {
          console.log(`ERROR: Header with strange size (${headerSize}). Card ${card.name} on store ${storeName}`)
        }

        for (let i = 1; i < cardPrice.length; i ++) {
          let availability = cardAvailability[i].children[0].data.split(' ')[0]

          if (availability > 0) {
            let quality = undefined

            if (ignoreQuality) {
              quality = 'NM'
            } else {
              quality = cardQuality[i].children[0].children[0].data
            }

            if (quality === 'NM' || quality === 'M' || quality === 'Near Mint (NM)' || quality === 'Mint (M)') {
              let price = cardPrice[i].children[0].data.trim().split(' ')[1]
              price = Number(price.replace(',', '.'))
              if (price < result.price) {
                result.name = card.name
                result.price = price
                result.availability = availability
              }
            }
          }
        }

        if (result.price !== Infinity) {
          createCardElement(card.name, storeName, result)

          priceArray.push(result.price * card.quantity)
          calculatePrice(priceArray, storeName, `.${replaceAll(storeName, ' ', '')}-price`)
        } else {
          createCardNotFound(card.name, `.${replaceAll(storeName, ' ', '')}-cards`)
        }
      }
      done()
    }
  }])
}
