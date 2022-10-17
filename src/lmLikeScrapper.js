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

  const tableLines = $("div[onmouseover]")

  const quantity = getTextsFromQuery(tableLines.find("div:nth-of-type(5)"), $)
  const price = getTextsFromQuery(tableLines.find("div:nth-of-type(6)"), $)

  const lines = zip(quantity, price)

  const erros = []

  const qualities = new Set(["M", "NM", "SP", "MP", "HP", "DM"])

  const parsedCards = lines.map(([quantity, price]) => {
    const parsedQuantity = parseQuantity(quantity)
    const parsedPrice = parsePrice(price)
    return [parsedQuantity, parsedPrice]
  }).filter(([quantity, price]) => {
    if (!quantity || !price || quantity === 0) {
      return false
    }

    return true
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
  if (!price) return undefined
  
  const brlString = price.match(/R\$ \d+,\d+/g)?.at(-1) // if it has two values probabily it has a promotion

  if (!brlString) return undefined

  const brlPrice = brlString.split(" ")?.[1]

  const priceNumberFormated = moneyStringToNumber(brlPrice)

  return Number(priceNumberFormated)
}

const parseQuantity = (quantity) => {
  if (!quantity) return quantity

  const quantityString = quantity.match(/\d+ unid./g)[0]
  const quantityNumber = quantityString.split(" ")[0]

  return Number(quantityNumber)
}

const moneyStringToNumber = (string) => {
  return Number(string.replace("," ,"."))
}

const mountCheapestCard = (cards, cardName) => {
  const cheapestCard = { name: cardName, price: Infinity, availability: null }

  for (const [quantity, price] of cards) {
    if (cheapestCard.price > price) {
      cheapestCard.price = price
      cheapestCard.availability = quantity
    }
  }

  return cheapestCard
}

getCardFrom("brainstorm", "asgardstore").then((e) => console.log(e))

module.exports = {
  getCardFrom
}