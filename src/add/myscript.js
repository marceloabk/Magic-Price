const electron = require("electron");
const { ipcRenderer } = electron;

const form = document.querySelector("form");

form.addEventListener("submit", submitForm);

function submitForm(e) {
  e.preventDefault();
  const item = document.querySelector("#deck").value;
  let items = item.split("\n");

  items = items.filter((n) => {
    return n && n[0] !== n[1] && n[0] !== "/";
  });

  let deckData = [];
  for (let i = 0; i < items.length; i++) {
    let j = 0;
    for (j = 0; j < items[i].length; j++) {
      if (isNaN(items[i][j])) {
        break;
      }
    }
    j--;
    let cardData = {};
    cardData.quantity = items[i].substring(0, j);
    if (!cardData.quantity) cardData.quantity = 1;
    cardData.name = items[i].substring(j + 1, items[i].length - j + 1);
    deckData.push(cardData);
  }
  ipcRenderer.send("deck:add", deckData);
}