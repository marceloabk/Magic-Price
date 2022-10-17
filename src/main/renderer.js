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
let allCards = new Set();

const bestResultButton = document.getElementById('bestResult')
bestResultButton.addEventListener('click', () => {
  const cardNames = [...allCards];
  console.log({ cardNames })
  const storeNames = Object.keys(allPrices);
  console.log({ storeNames })
  const arrayToBeMultiplied = cardNames.map(() => storeNames);
  console.log({ arrayToBeMultiplied })

  let resultMatrix = product(arrayToBeMultiplied);
  console.log({ resultMatrix })
  resultMatrix.forEach((line, i) => {
    line.forEach((element, j) => {
      resultMatrix[i][j] += `|${cardNames[j]}`;
    });
  });

  let priceMatrix = JSON.parse(JSON.stringify(resultMatrix));
  resultMatrix.forEach((line, i) => {
    line.forEach((element, j) => {
      const [storeName, cardName] = resultMatrix[i][j].split("|");
      console.log({ storeName, cardName });
      priceMatrix[i][j] = allPrices[storeName][cardName];
    });
  });

  let bestIndex,
    total = Infinity;
  priceMatrix.forEach((priceArray, index) => {
    const newTotal = priceArray.reduce((a, b) => a + b, 0);
    if (!isNaN(newTotal) && newTotal < total) {
      total = newTotal;
      bestIndex = index;
    }
  });

  console.log({ priceMatrix });
  console.log({ resultMatrix });
  console.log({ total });
  console.log({ bestIndex });
  console.log({
    result: resultMatrix[bestIndex],
    total: priceMatrix[bestIndex].reduce((a, b) => a + b, 0),
  });

  const bestPriceTextNode = document.createTextNode(
    priceMatrix[bestIndex].reduce((a, b) => a + b, 0)
  );
  const bestPriceNode = document.querySelector(".bestResult-price");
  bestPriceNode.appendChild(bestPriceTextNode);

  resultMatrix[bestIndex].forEach((card) => {
    const itemText = document.createTextNode(card);
    const div = document.createElement("div");
    div.appendChild(itemText);

    const node = document.querySelector(".bestResult-cards");
    node.appendChild(div);
  });

})


function product(elements) {
	if (!Array.isArray(elements)) {
		throw new TypeError();
	}

	var end = elements.length - 1,
		result = [];

	function addTo(curr, start) {
		var first = elements[start],
			last = (start === end);

		for (var i = 0; i < first.length; ++i) {
			var copy = curr.slice();
			copy.push(first[i]);

			if (last) {
				result.push(copy);
			} else {
				addTo(copy, start + 1);
			}
		}
	}

	if (elements.length) {
		addTo([], 0);
	} else {
		result.push([]);
	}
	return result;
}

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
  allCards.add(item.name)


  if (store === "asgardstore") {
    if (item.price !== Infinity) {
      createCardElement(card.name, store, item, allPrices, ul);
      asgardstorePrice.push(item.price * card.quantity);
      calculatePrice(asgardstorePrice,`.${store}-price`);
    } else {
      // Imperial Seal
      createCardNotFound(card.name, `.${store}-cards`);
    }
  } else if (store === "mtgcardsgames") {
    if (item.price !== Infinity) {
      createCardElement(card.name, store, item, allPrices, ul);
      mtgcardsgamesPrice.push(item.price * card.quantity);
      calculatePrice(mtgcardsgamesPrice,`.${store}-price`);
    } else {
      // Imperial Seal
      createCardNotFound(card.name, `.${store}-cards`);
    }
  } else if (store === "spellcastgames") {
    if (item.price !== Infinity) {
      createCardElement(card.name, store, item, allPrices, ul);
      spellcastgamesPrice.push(item.price * card.quantity);
      calculatePrice(spellcastgamesPrice,`.${store}-price`);
    } else {
      // Imperial Seal
      createCardNotFound(card.name, `.${store}-cards`);
    }
  } else if (store === "otemplosm") {
    if (item.price !== Infinity) {
      createCardElement(card.name, store, item, allPrices, ul);
      otemplosmPrice.push(item.price * card.quantity);
      calculatePrice(otemplosmPrice,`.${store}-price`);
    } else {
      // Imperial Seal
      createCardNotFound(card.name, `.${store}-cards`);
    }
  } else if (store === "clmtg") {
    if (item.price !== Infinity) {
      createCardElement(card.name, store, item, allPrices, ul);
      clmtgPrice.push(item.price * card.quantity);
      calculatePrice(clmtgPrice,`.${store}-price`);
    } else {
      // Imperial Seal
      createCardNotFound(card.name, `.${store}-cards`);
    }
  }
})
