const addButton = document.getElementById('add')
addButton.addEventListener('click', () => {
    window.add.create()
})

let ugcPrice = [];
let insidePrice = [];
let bazarPrice = [];
let chuckPrice = [];
let asgardPrice = [];

let allPrices = {};
let allCards;

// const request = require("superagent");
// const Throttle = require("superagent-throttle");

// let throttle = new Throttle({
//   active: true, // set false to pause queue
//   rate: 3, // how many requests can be sent every `ratePer`
//   ratePer: 10000, // number of ms in which `rate` requests may be sent
//   concurrent: 2, // how many requests can be sent concurrently
// });

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
  

// const crawlUGC = (card, priceArray, allPrices) => {
//   const url = `https://www.ugcardshop.com.br/api/products/search/${card.name}`;

//   request
//     .get(url)
//     .use(throttle.plugin())
//     .end((err, res) => {
//       const data = res.body;
//       const result = { name: "", price: Infinity, availability: 0 };
//       for (let i = 0; i < data.length; i++) {
//         if (
//           data[i].estoque > 0 &&
//           data[i].preco < result.price &&
//           data[i].ativo === "1"
//         ) {
//           result.name = data[i].nome;
//           result.price = Number(data[i].preco);

//           // UGC only show 20 pieces in stock even when stock is higher
//           if (data[i].estoque > 20) {
//             data[i].estoque = 20;
//           }
//           result.availability = data[i].estoque;
//         }
//       }

//       if (result.price !== Infinity) {
//         createCardElement(card.name, "UGC", result, allPrices);

//         priceArray.push(result.price * card.quantity);
//         calculatePrice(priceArray, "UGC", ".ugc-price");
//       } else {
//         // Imperial Seal
//         createCardNotFound(card.name, ".ugc-cards");
//       }
//     });
// }



// const LigaCrawler = require("crawler");

// let crawlerInstances = {};

// const crawlLigaLike =  (
//   card,
//   priceArray,
//   siteURL,
//   storeName,
//   allPrices,
//   ignoreQuality = false
// ) => {
//   let crawler = crawlerInstances[storeName];
//   if (crawler === undefined) {
//     crawler = new LigaCrawler({});
//     crawler.setLimiterProperty("default", "rateLimit", 1500);
//     crawlerInstances[storeName] = crawler;
//   }

//   console.log(card);

//   crawler.queue([
//     {
//       uri: `${siteURL}?view=ecom%2Fitens&id=56925&searchExactMatch=1&busca=${card.name}`,
//       callback: function (error, res, done) {
//         if (error) {
//           console.log(error);
//         } else {
//           const $ = res.$;

//           const result = { name: "", price: Infinity, availability: null };

//           const headerSize = $(
//             "tr:nth-child(1) > td > table > tr > td:nth-child(2) > div.itemMain > table > tr > td:nth-child(2) > div:nth-child(3) > table > tr:nth-child(1) > td"
//           ).length;

//           let cardQuality = undefined;
//           let cardAvailability = undefined;
//           let cardPrice = undefined;

//           if (headerSize === 7) {
//             cardQuality = $(
//               "tr:nth-child(1) > td > table > tr > td:nth-child(2) > div.itemMain > table > tr > td:nth-child(2) > div:nth-child(3) > table > tr > td:nth-child(3)"
//             );
//             cardAvailability = $(
//               "tr:nth-child(1) > td > table > tr > td:nth-child(2) > div.itemMain > table > tr > td:nth-child(2) > div:nth-child(3) > table > tr > td:nth-child(5)"
//             );
//             cardPrice = $(
//               "tr:nth-child(1) > td > table > tr > td:nth-child(2) > div.itemMain > table > tr > td:nth-child(2) > div:nth-child(3) > table > tr > td:nth-child(6)"
//             );
//           } else if (headerSize === 6) {
//             cardQuality = $(
//               "tr:nth-child(1) > td > table > tr > td:nth-child(2) > div.itemMain > table > tr > td:nth-child(2) > div:nth-child(3) > table > tr > td:nth-child(3)"
//             );
//             cardAvailability = $(
//               "tr:nth-child(1) > td > table > tr > td:nth-child(2) > div.itemMain > table > tr > td:nth-child(2) > div:nth-child(3) > table > tr > td:nth-child(4)"
//             );
//             cardPrice = $(
//               "tr:nth-child(1) > td > table > tr > td:nth-child(2) > div.itemMain > table > tr > td:nth-child(2) > div:nth-child(3) > table > tr > td:nth-child(5)"
//             );
//           } else {
//             console.log(
//               `ERROR: Header with strange size (${headerSize}). Card ${card.name} on store ${storeName}`
//             );
//           }

//           for (let i = 1; i < cardPrice.length; i++) {
//             let availability = cardAvailability[i].children[0].data.split(
//               " "
//             )[0];

//             if (availability > 0) {
//               let quality = undefined;

//               if (ignoreQuality) {
//                 quality = "NM";
//               } else {
//                 quality = cardQuality[i].children[0].children[0].data;
//               }

//               if (
//                 quality === "NM" ||
//                 quality === "M" ||
//                 quality === "Near Mint (NM)" ||
//                 quality === "Mint (M)"
//               ) {
//                 let price;

//                 if (cardPrice[i].attribs.title) {
//                   // item com desconto
//                   price = cardPrice[i].children[5].children[0].data
//                     .trim()
//                     .split(" ")[1];
//                 } else {
//                   price = cardPrice[i].children[0].data.trim().split(" ")[1];
//                 }

//                 price = Number(price.replace(",", "."));
//                 if (price < result.price) {
//                   result.name = card.name;
//                   result.price = price;
//                   result.availability = availability;
//                 }
//               }
//             }
//           }
//           console.log(result);

//           if (result.price !== Infinity) {
//             createCardElement(card.name, storeName, result, allPrices);

//             priceArray.push(result.price * card.quantity);
//             calculatePrice(
//               priceArray,
//               storeName,
//               `.${replaceAll(storeName, " ", "")}-price`
//             );
//           } else {
//             createCardNotFound(
//               card.name,
//               `.${replaceAll(storeName, " ", "")}-cards`
//             );
//           }
//         }
//         done();
//       },
//     },
//   ]);
// }

window.add.onCards((_event, {items, card}) => {
  console.log({ items })
    const ul = document.querySelector("ul");
    ul.className = "collapsible";
    var elems = document.querySelectorAll('.collapsible');
    var instances = M.Collapsible.init(elems);

    items.forEach(result =>{
      console.log({result})
      if (result.price !== Infinity) {
        createCardElement(card.name, "UGC", result, allPrices, ul);

        priceArray.push(result.price * card.quantity);
        calculatePrice(priceArray, "UGC", ".ugc-price");
      } else {
        // Imperial Seal
        createCardNotFound(card.name, ".ugc-cards");
      }
    })


    // allCards = items;
    // console.log(allCards)
    // items.map((i) => {
    //   crawlUGC(i, ugcPrice, allPrices);
    //   crawlLigaLike(
    //     i,
    //     insidePrice,
    //     "https://www.insidegamestore.com.br/",
    //     "Inside Games",
    //     allPrices
    //   );
    //   crawlLigaLike(
    //     i,
    //     bazarPrice,
    //     "https://www.bazardebagda.com.br/",
    //     "Bazar de Bagda",
    //     allPrices
    //   );
    //   crawlLigaLike(
    //     i,
    //     chuckPrice,
    //     "https://www.chucktcg.com.br/",
    //     "Chuck TCG",
    //     allPrices
    //   );
    //   crawlLigaLike(
    //     i,
    //     asgardPrice,
    //     "https://www.asgardstore.com.br/",
    //     "Asgard",
    //     allPrices,
    //     true
    //   );
    // });
})
