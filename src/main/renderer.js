const addButton = document.getElementById('add')
addButton.addEventListener('click', () => {
    window.add.create()
})

let asgardstorePrice = [];
let mtgcardsgamesPrice = [];
let spellcastgamesPrice = [];
let otemplosmPrice = [];
let clmtgPrice = [];

let allPrices = {};
let allCards;

const createCollapsibleBody = (text, name) => {
  const textNode = document.createTextNode(text);
  const div = document.createElement("div");

  div.className = `collapsible-body ${name}`;

  div.appendChild(textNode);

  return div;
};
  
const calculatePrice = (priceArray, querySelector) => {
  let sum = priceArray.reduce((a, b) => a + b, 0);

  const textNode = document.createTextNode(`R$ ${sum.toFixed(2)}`);
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
  
const createCardElement = (typedName, storeName, result, allPrices, ul) => {
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
  
window.add.onCards((_event, {item, card, store}) => {
  const ul = document.querySelector("ul");
  ul.className = "collapsible";
  const elems = document.querySelectorAll('.collapsible');
  M.Collapsible.init(elems);


  if (store === "asgardstore") {
    if (item.price !== Infinity) {
      createCardElement(card.name, store, item, allPrices, ul);
      asgardstorePrice.push(item.price * card.quantity);
      calculatePrice(asgardstorePrice, store, `.${store}-price`);
    } else {
      // Imperial Seal
      createCardNotFound(card.name, `.${store}-cards`);
    }
  } else if (store === "mtgcardsgames") {
    if (item.price !== Infinity) {
      createCardElement(card.name, store, item, allPrices, ul);
      mtgcardsgamesPrice.push(item.price * card.quantity);
      calculatePrice(mtgcardsgamesPrice, store, `.${store}-price`);
    } else {
      // Imperial Seal
      createCardNotFound(card.name, `.${store}-cards`);
    }
  } else if (store === "spellcastgames") {
    if (item.price !== Infinity) {
      createCardElement(card.name, store, item, allPrices, ul);
      spellcastgamesPrice.push(item.price * card.quantity);
      calculatePrice(spellcastgamesPrice, store, `.${store}-price`);
    } else {
      // Imperial Seal
      createCardNotFound(card.name, `.${store}-cards`);
    }
  } else if (store === "otemplosm") {
    if (item.price !== Infinity) {
      createCardElement(card.name, store, item, allPrices, ul);
      otemplosmPrice.push(item.price * card.quantity);
      calculatePrice(otemplosmPrice, store, `.${store}-price`);
    } else {
      // Imperial Seal
      createCardNotFound(card.name, `.${store}-cards`);
    }
  } else if (store === "clmtg") {
    if (item.price !== Infinity) {
      createCardElement(card.name, store, item, allPrices, ul);
      clmtgPrice.push(item.price * card.quantity);
      calculatePrice(clmtgPrice, store, `.${store}-price`);
    } else {
      // Imperial Seal
      createCardNotFound(card.name, `.${store}-cards`);
    }
  }
})
