const createCollapsibleBody = (text, name) => {
  const textNode = document.createTextNode(text);
  const div = document.createElement("div");

  div.className = `collapsible-body ${name}`;

  div.appendChild(textNode);

  return div;
};

const calculatePrice = (priceArray, name, querySelector) => {
  let sum = priceArray.reduce((a, b) => a + b, 0);

  const textNode = document.createTextNode(`${sum.toFixed(2)} R$`);
  const priceNode = document.querySelector(`${querySelector}`);
  priceNode.textContent = "";

  priceNode.appendChild(textNode);
};

const replaceAll = (str, find, replace) => {
  return str.replace(new RegExp(find, "g"), replace);
};

const normalizeSelector = (selector) => {
  selector = replaceAll(selector, " ", "-");
  selector = replaceAll(selector, ",", "");
  selector = replaceAll(selector, "'", "");
  selector = selector.toLowerCase();

  return selector;
};

const createCardNotFound = (cardName, querySelector) => {
  const itemText = document.createTextNode(cardName);
  const div = document.createElement("div");
  div.className = "red-text text-lighten-1";

  div.appendChild(itemText);
  const node = document.querySelector(querySelector);
  node.appendChild(div);
};

const createCardElement = (typedName, storeName, result, allPrices) => {
  const normalizedSelector = normalizeSelector(typedName);
  const card = document.querySelector(`.${normalizedSelector}`);
  const cardInfo = cardString(storeName, result);

  if (allPrices[storeName]) {
    allPrices[storeName][result.name] = result.price;
  } else {
    allPrices[storeName] = { [result.name]: result.price };
  }

  if (!card) {
    const li = document.createElement("li");
    const div = document.createElement("div");
    div.className = `collapsible-header`;

    const itemText = document.createTextNode(result.name);

    div.appendChild(itemText);
    li.appendChild(div);

    const body = createCollapsibleBody(cardInfo, normalizedSelector);
    li.appendChild(body);
    ul.appendChild(li);
  } else {
    card.innerHTML += `<br />${cardInfo}`;
  }
};

const cardString = (storeName, result) => {
  let cardInfo = `${storeName} -> ${result.name}: ${result.price.toFixed(2)}`;
  if (result.availability) {
    cardInfo += ` | Quantidade: ${result.availability}`;
  }

  return cardInfo;
};

module.exports = {
  createCollapsibleBody,
  calculatePrice,
  normalizeSelector,
  createCardNotFound,
  createCardElement,
  cardString
}