const electron = require("electron");
const product = require("cartesian-product");
const { ipcRenderer } = electron;

const ul = document.querySelector("ul");

let ugcPrice = [];
let insidePrice = [];
let bazarPrice = [];
let chuckPrice = [];
let asgardPrice = [];

let allPrices = {};
let allCards;

ipcRenderer.on("deck:add", function (e, items) {
  ul.className = "collapsible";
  $(".collapsible").collapsible();
  allCards = items;
  items.map((i) => {
    crawlUGC(i, ugcPrice, allPrices);
    crawlLigaLike(
      i,
      insidePrice,
      "https://www.insidegamestore.com.br/",
      "Inside Games",
      allPrices
    );
    crawlLigaLike(
      i,
      bazarPrice,
      "https://www.bazardebagda.com.br/",
      "Bazar de Bagda",
      allPrices
    );
    crawlLigaLike(
      i,
      chuckPrice,
      "https://www.chucktcg.com.br/",
      "Chuck TCG",
      allPrices
    );
    crawlLigaLike(
      i,
      asgardPrice,
      "https://www.asgardstore.com.br/",
      "Asgard",
      allPrices,
      true
    );
  });
});

ipcRenderer.on("deck:clear", function () {
  ul.innerHTML = "";
  ul.className = "";
  const price = document.querySelectorAll(".cards-list > div > div");

  for (let i = 0; i < price.length; i++) {
    price[i].innerHTML = "";
  }

  ugcPrice = [];
  insidePrice = [];
  bazarPrice = [];
  chuckPrice = [];
  asgardPrice = [];
});

// Remove item

$("#bestResult").click(() => {
  const cardNames = allCards.map(({ name }) => name);
  const storeNames = Object.keys(allPrices);
  const arrayToBeMultiplied = cardNames.map(() => storeNames);

  let resultMatrix = product(arrayToBeMultiplied);
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

  // console.log({ priceMatrix });
  // console.log({ resultMatrix });
  // console.log({ total });
  // console.log({ bestIndex });
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
});

$("#add").click(() => {
  ipcRenderer.send("deck:addWindow");
});