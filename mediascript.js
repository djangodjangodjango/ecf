var films = [{
    name: "Deadpool",
    years: 2016,
    authors: "Tim Miller"
  },
  {
    name: "Spiderman",
    years: 2002,
    authors: "Sam Raimi"
  },
  {
    name: "Scream",
    years: 1996,
    authors: "Wes Craven"
  },
  {
    name: "It: chapter 1",
    years: 2019,
    authors: "Andy Muschietti"
  }
];

const form = document.querySelector('form');
const trHead = document.querySelector('#head');
const conData = document.querySelector('#data');
const titleInput = document.querySelector('#movie-title');
const yearInput = document.querySelector('#year');
const directorInput = document.querySelector('#director');
const button = document.querySelector('button');

let db;

window.onload = () => {
  let request = window.indexedDB.open('contacts', 1)

  request.onerror = () => {
    console.log('Erreur affichage liste');
  };

  request.onsuccess = () => {
    console.log('Liste affichée');
    db = request.result;
    displayData();
  };

  request.onupgradeneeded = (e) => {
    let db = e.target.result;
    let objectStore = db.createObjectStore('contacts', {
      keyPath: 'id',
      autoIncrement: true
    });

    objectStore.createIndex('movie-title', 'movie-title', {
      unique: false
    });
    objectStore.createIndex('year', 'year', {
      unique: false
    });
    objectStore.createIndex('director', 'director', {
      unique: false
    });

  };

  form.onsubmit = (e) => {
    e.preventDefault()
    let newItem = {
      Titre: titleInput.value,
      Année: yearInput.value,
      Réalisateur: directorInput.value
    };
    let transaction = db.transaction(['contacts'], 'readwrite');
    let objectStore = transaction.objectStore('contacts');
    var request = objectStore.add(newItem);

    request.onsuccess = () => {
      titleInput.value = '';
      yearInput.value = '';
      directorInput.value = '';
    };

    transaction.oncomplete = () => {
      console.log('liste modifiée');
      displayData();
    };

    transaction.onerror = () => {
      console.log('Erreur');
    };
  }

  function displayData() {
    while (conData.firstChild) {
      conData.removeChild(conData.firstChild);
    }

    let objectStore = db.transaction('contacts').objectStore('contacts');

    objectStore.openCursor().onsuccess = (e) => {
      let cursor = e.target.result;

      if (cursor) {
        let tr = document.createElement('tr');
        let tdTitle = document.createElement('td');
        let tdYear = document.createElement('td');
        let tdDirector = document.createElement('td');

        tr.appendChild(tdTitle);
        tr.appendChild(tdYear);
        tr.appendChild(tdDirector);
        conData.appendChild(tr);

        tdTitle.textContent = cursor.value.Titre;
        tdYear.textContent = cursor.value.Année;
        tdDirector.textContent = cursor.value.Réalisateur;

        tr.setAttribute('data-movie-id', cursor.value.id);

        let deleteBtn = document.createElement('button');
        tr.appendChild(deleteBtn);
        deleteBtn.textContent = 'Delete';

        deleteBtn.onclick = deleteItem;

        cursor.continue();
      } else {
        if (!conData.firstChild) {
          let para = document.createElement('p');
          para.textContent = "Entrer le titre d'un film"
          conData.appendChild(para);
        }
        console.log('Tout les films');
      }
    };
  }

  function deleteItem(e) {
    let movieId = Number(e.target.parentNode.getAttribute('data-movie-id'));
    let transaction = db.transaction(['contacts'], 'readwrite');
    let objectStore = transaction.objectStore('contacts');
    let request = objectStore.delete(movieId);


    transaction.oncomplete = () => {
      e.target.parentNode.parentNode.removeChild(e.target.parentNode);
      console.log('Movie ' + movieId + ' deleted.');

      if (!conData.firstChild) {
        let para = document.createElement('p');
        para.textContent = 'Pas de films à afficher';
        conData.appendChild(para);
      }
    };
  }
};