const { request } = require('undici')
const cheerio = require('cheerio')
const fs = require("fs").promises
const path = require("path")

// const searchURL = "https://www.asgardstore.com.br/?view=ecom%2Fitens&id=105912&searchExactMatch=1&busca="
// const searchURL = "https://www.insidegamestore.com.br/?view=ecom%2Fitens&id=105912&searchExactMatch=1&busca="
// const searchURL = "https://www.ugcardshop.com.br/?view=ecom%2Fitens&id=105912&searchExactMatch=1&busca="
// const searchURL = "https://www.spellcastgames.com.br/?view=ecom%2Fitens&id=105912&searchExactMatch=1&busca="
// const searchURL = "https://www.treasurecards.com.br/?view=ecom%2Fitens&id=105912&searchExactMatch=1&busca="
// const searchURL = "https://www.clmtg.com.br/?view=ecom%2Fitens&id=105912&searchExactMatch=1&busca="
// const searchURL = "https://www.mtgcardsgames.com.br/?view=ecom%2Fitens&id=105912&searchExactMatch=1&busca="
// const searchURL = "https://www.otemplosm.com.br/?view=ecom%2Fitens&id=105912&searchExactMatch=1&busca="

const getCardFrom = async (cardName, store) => {

  const baseUrl = `https://www.${store}.com.br/?view=ecom%2Fitens&id=105912&tcg=1&txt_estoque=1&searchExactMatch=1&busca=`
  const {
    body
  } = await request(`${baseUrl}${cardName}`, {maxRedirections: 1})
  
  
  const res = await body.text()  
  const $ = cheerio.load(res)

  const tableLines = $("tr[onmouseover]")
  const quality = getTextsFromQuery(tableLines.find("td:nth-of-type(3)"), $)
  const quantity = getTextsFromQuery(tableLines.find("td:nth-of-type(5)"), $)
  const price = getTextsFromQuery(tableLines.find("td:nth-of-type(6)"), $)

  const lines = zip(quality, quantity, price)

  const erros = []

  const qualities = new Set(["M", "NM", "SP", "MP", "HP", "DM"])
  const validLines = lines.filter(([quality, quantity]) => {
    if (qualities.has(quality) && quantity[0] !== "0") return true
  })

  const parsedCards = validLines.map(([quality, quantity, price]) => {
    const parsedQuantity = Number(quantity.split(" ")[0])
    const parsedPrice = parsePrice(price)
    return [quality, parsedQuantity, parsedPrice]
  })

  try {
    if (erros.length > 0)
      await fs.appendFile(path.join(__dirname, 'erros.log'), parseErros(erros))
  } catch (err) {
    console.log(err);
  }

  return mountCheapestCard(parsedCards, cardName)
}

const getTextsFromQuery = (query, $) => {
  return query.map(function () {
    return $(this).text()
  }).get();
}

const zip = (...iterables) => {
  const res = new Array(iterables[0].length).fill(0).map(_ => [])

  for (let i = 0; i < iterables.length; i++) {
    for (let j = 0; j < iterables[i].length; j++) {
      res[j][i] = iterables[i][j]
    }
  }

  return res
}

const parseErros = (erros) => {
  return erros.join("\n")
}

const parsePrice = (price) => {
  const promotionMinLength = 15 // if the string is too big its probably because it has a promotion

  if (price.length <= promotionMinLength) {
    const onlyPrice = price.split(" ")[1]
    return moneyStringToNumber(onlyPrice)
  } else {
    const brlRegex = /\b\d{1,3}(?:\.\d{3})*,\d+\b/g
    const onlyPrice = price.match(brlRegex)
    return moneyStringToNumber(onlyPrice[1])
  }
}

const moneyStringToNumber = (string) => {
  return Number(string.replace("," ,"."))
}

const mountCheapestCard = (cards, cardName) => {
  const cheapestCard = { name: cardName, price: Infinity, availability: null }

  for (const [, quantity, price] of cards) {
    if (cheapestCard.price > price) {
      cheapestCard.price = price
      cheapestCard.availability = quantity
    }
  }

  return cheapestCard
}

module.exports = {
  getCardFrom
}