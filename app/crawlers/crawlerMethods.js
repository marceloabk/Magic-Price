const createCollapsibleBody = (text, name) => {
  const textNode = document.createTextNode(text)
  const div = document.createElement('div')

  div.className = `collapsible-body ${name}`

  div.appendChild(textNode)

  return div
}

const calculatePrice =(priceArray, name, querySelector) => {
  let sum = priceArray.reduce((a, b) => a + b, 0)

  const textNode = document.createTextNode(`${name}: ${sum.toFixed(2)} R$`)
  const priceNode = document.querySelector(`${querySelector}`)
  priceNode.textContent = ''

  priceNode.appendChild(textNode)
}

const replaceAll = (str, find, replace) => {
  return str.replace(new RegExp(find, 'g'), replace)
}

const normalizeSelector = (selector) => {
  selector = replaceAll(selector, ' ', '-')
  selector = replaceAll(selector, ',', '')
  selector = replaceAll(selector, '\'', '')
  selector = selector.toLowerCase()

  return selector
}

const createCardNotFound = (cardName, querySelector) => {
  const itemText = document.createTextNode(cardName)
  const div = document.createElement('div')
  div.className = 'red-text text-lighten-1'

  div.appendChild(itemText)
  const node = document.querySelector(querySelector)
  node.appendChild(div)
}
