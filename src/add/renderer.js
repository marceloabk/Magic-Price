const form = document.getElementById('addForm');
form.addEventListener('submit', (event) => {
    event.preventDefault()
    const item = document.querySelector("#deck").value;
    window.add.cards(item)
})