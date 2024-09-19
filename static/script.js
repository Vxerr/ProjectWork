let display = document.querySelector(".display");  // Elemento che mostra il mese e l'anno correnti
let days = document.querySelector(".days");        // Giorni del calendario
let previous = document.querySelector(".left");    // Pulsante per navigare al mese precedente
let next = document.querySelector(".right");       // Pulsante per navigare al mese successivo
let selected = document.querySelector(".selected");  // Elemento che mostra i giorni selezionati
let validArray = document.querySelectorAll("#name, #tel, #email");  // Input di validazione del form
let date = new Date();  // Data corrente
let year = date.getFullYear();  // Anno corrente
let month = date.getMonth();    // Mese corrente
let onlyDate, startDate, endDate;  // Variabili per gestire le date selezionate
let selectedDates = [];  // Array per memorizzare le date selezionate
var checkModifica = false;  // Flag per modalità modifica

// Funzione per mostrare il calendario
function displayCalendar() {
  const firstDay = new Date(year, month, 1);  // Primo giorno del mese
  const lastDay = new Date(year, month + 1, 0);  // Ultimo giorno del mese
  const previouslastDay = new Date(year, month, 0);  // Ultimo giorno del mese precedente
  const firstDayIndex = firstDay.getDay();  // Indice del primo giorno
  const lastDayIndex = lastDay.getDay();  // Indice dell'ultimo giorno
  const numberOfDays = lastDay.getDate();  // Numero di giorni nel mese
  let previousMonthCutoff = previouslastDay.getDate() - firstDayIndex + 1;  // Giorni del mese precedente da mostrare
  let nextfirstDay = 1;  // Giorni del mese successivo da mostrare
  
  // Mostra mese e anno in italiano
  display.innerHTML = date.toLocaleString("it-IT", {
    month: "long",
    year: "numeric"
  });

  // Fetch per leggere il database
  fetch("/read_database")
  .then(response => response.json())
  .then(data => {
    // Se ci sono dati nel database e non si è in modalità modifica
    if (Object.keys(data).length != 0 && checkModifica == false) {
      // Se è stata selezionata una sola data converte la data da stringa a oggetto Date
      if ("giorno" in data) {
        const giorno = data.giorno;
        selected.innerHTML = `${giorno}`;
        onlyDate = stringToDate(giorno);
      // Se è stato selezionato un intervallo di date divide l'intervallo in due date e le converte in oggetti Date
      } else if ("giorni" in data) {
        const giorni = data.giorni;
        selected.innerHTML = `${giorni}`;
        let [firstDate, lastDate] = giorni.split(' - ');
        startDate = stringToDate(firstDate);
        endDate = stringToDate(lastDate);
      }
      markBooked(); // Evidenzia i giorni prenotati nel calendario e blocca l'interazione
    } else {
      displaySelected(); // Se non ci sono dati, consenti di selezionare i giorni
    }
  })

  // Aggiunge i giorni del mese precedente al calendario e li rende non selezionabili
  for (let x = 1; x <= firstDayIndex; x++) {
    let div = document.createElement("div");
    let currentDate = new Date(year, month-1, previousMonthCutoff);
    div.dataset.date = currentDate.toDateString();
    div.classList.add("invalid-day");
    div.innerHTML = previousMonthCutoff;
    previousMonthCutoff++;
    days.appendChild(div);
  }
  
  // Aggiunge i giorni del mese corrente al calendario
  for (let i = 1; i <= numberOfDays; i++) {
    let div = document.createElement("div");
    let currentDate = new Date(year, month, i);
    div.dataset.date = currentDate.toDateString();
    div.innerHTML += i;
    days.appendChild(div);
    // Rende non selezionabili i giorni passati
    if (
      currentDate.getFullYear() <= new Date().getFullYear() &&
      currentDate.getMonth() <= new Date().getMonth() &&
      currentDate.getDate() <= new Date().getDate()
    ) {
      div.classList.add("invalid-day");
    }
  }
  
  // Aggiunge i giorni del mese successivo al calendario e li rende non selezionabili
  for (let y = lastDayIndex; y < 6; y++) {
    let div = document.createElement("div");
    let currentDate = new Date(year, month+1, nextfirstDay);
    div.dataset.date = currentDate.toDateString();
    div.classList.add("invalid-day");
    div.innerHTML = nextfirstDay;
    nextfirstDay++;
    days.appendChild(div);
  }
}

// Event listener per navigare al mese precedente
previous.addEventListener("click", () => {
  if (month <= new Date().getMonth() && year <= new Date().getFullYear()) {
    return; // Impedisce di andare indietro nel passato
  }
  form.classList.remove("show");
  days.innerHTML = "";
  month = month - 1;
  if (month < 0) {
    month = 11;
    year = year - 1;
  }
  date.setMonth(month);
  date.setFullYear(year);
  displayCalendar();
  if (selectedDates.length === 1) {
    highlightRange(selectedDates[0], selectedDates[0], document.querySelectorAll(".days div"));
  }
  if (selectedDates.length === 2) {
    highlightRange(selectedDates[0], selectedDates[1], document.querySelectorAll(".days div"));
  }
});

// Event listener per navigare al mese successivo
next.addEventListener("click", () => {
  form.classList.remove("show");
  days.innerHTML = "";
  month = month + 1;
  if (month > 11) {
    month = 0;
    year = year + 1;
  }
  date.setMonth(month);
  date.setFullYear(year);
  displayCalendar();
  if (selectedDates.length === 1) {
    highlightRange(selectedDates[0], selectedDates[0], document.querySelectorAll(".days div"));
  }
  if (selectedDates.length === 2) {
    highlightRange(selectedDates[0], selectedDates[1], document.querySelectorAll(".days div"));
  }
});

// Validazione dei dati inseriti nel form, se sono validi abilita il pulsante di conferma prenotazione
validArray.forEach((input) => {
  input.addEventListener("keyup", () => {
    if(validArray[0].checkValidity() == true && validArray[1].checkValidity() == true && validArray[2].checkValidity() == true) {
      document.getElementById("sendForm").disabled = false;
    } else {
      document.getElementById("sendForm").disabled = true;
    }
})})

// Event listener per aprire il form di prenotazione
openForm.addEventListener("click", () => {
  document.getElementById("openForm").hidden = true;
  // Se non si è in modalità modifica, apre il form
  if(checkModifica == false) {
    form.classList.add("show");
  }
  // Se si è in modalità modifica, modifica la prenotazione senza riaprire il form
  else {
    sendData();
    days.innerHTML = "";
    selected.innerHTML = "";
    selectedDates = [];
    checkModifica = false;
    modifica.innerHTML = "Modifica";
    displayCalendar();
  }
})

// Event listener per chiudere il form di prenotazione quando si clicca sul pulsante Annulla
closeForm.addEventListener("click", () => {
  document.getElementById("openForm").hidden = false;
  form.classList.remove("show");
})

// Event listener per confermare la prenotazione e inviare i dati
sendForm.addEventListener("click", (event) => {
  event.preventDefault(); // Impedisce la navigazione all'endpoint /write_database
  sendData();
  form.classList.remove("show");
  days.innerHTML = "";
  document.getElementById("openForm").hidden = true;
  selected.innerHTML = "";
  selectedDates = [];
  displayCalendar();
})

// Event listener per eliminare la prenotazione quando si clicca sul pulsante Cancella
cancella.addEventListener("click", () => {
  fetch("/clear_database", {
    method: "POST",
  })
  days.innerHTML = "";
  selected.innerHTML = "";
  selectedDates = [];
  displayCalendar();
  document.getElementById("modifica").hidden = true;
  document.getElementById("cancella").hidden = true;
  document.querySelector(".days").classList.remove("block"); // Riabilita l'interazione con il calendario
})

// Event listener per entrare in modalità modifica quando si clicca sul pulsante Modifica
modifica.addEventListener("click", () => {
  // Se si clicca sul pulsante mentre si è in modalità modifica, esce dalla modalità modifica
  if(modifica.innerHTML == "Annulla") {
    document.querySelector(".days").classList.add("block"); // Blocca l'interazione con il calendario
    document.getElementById("cancella").hidden = false;
    modifica.innerHTML = "Modifica";
    markBooked();
  // Altrimenti entra in modalità modifica e deseleziona i giorni precedentemente selezionati
  } else {
    checkModifica = true;
    const booked = document.querySelectorAll(".booked-day");
    booked.forEach((day) => {
      day.classList.remove("booked-day");
    })
    document.querySelector(".days").classList.remove("block"); // Riabilita l'interazione con il calendario
    document.getElementById("cancella").hidden = true;
    modifica.innerHTML = "Annulla";
    selected.innerHTML = "";
  }
})

// Funzione per inviare i dati
function sendData() {
  const formData = new FormData(document.querySelector("#userinfo"));
  if(selectedDates.length === 1) {
    formData.append("giorno", new Date(selectedDates[0]).toLocaleString("it-IT", {dateStyle: "long"}));
  } else {
    const first = new Date(selectedDates[0]);
    const last = new Date(selectedDates[1]);
    const startDate = first< last ? first : last;
    const endDate = first > last ? first : last;
    formData.append("giorni", startDate.toLocaleString("it-IT", {dateStyle: "long"})
                              + " - " + 
                              endDate.toLocaleString("it-IT", {dateStyle: "long"}));
  }
  fetch("/write_database", {
      method: "POST",
      body: formData,
    })
}

// Funzione per gestire la selezione delle date
function displaySelected() {
  const dayElements = document.querySelectorAll(".days div:not(.invalid-day)");
  dayElements.forEach((day) => {
    day.addEventListener("click", (e) => {
      const selectedDate = e.target.dataset.date;
      // Evidenzia il giorno selezionato, o il range se si selezionano 2 giorni
      if (selectedDates.length < 2) {
        if(e.target.classList.contains("selected-day")) {
          e.target.classList.remove("selected-day");
          selectedDates = [];
        } else {
          e.target.classList.add("selected-day");
          selectedDates.push(selectedDate);
        }
      // Svuota la selezione se si clicca su un terzo giorno
      } else {
        selectedDates = [];
        document.querySelectorAll(".days div").forEach((d) => d.classList.remove("selected-day", "selection-start", "selected-range", "selection-end"));
      }
      
      // Gestisci la visualizzazione delle date selezionata
      if (selectedDates.length === 1) {
        selected.innerHTML = `Giorno: ${new Date(selectedDates[0]).toLocaleString("it-IT", {
          dateStyle: "full"
        })}`;
        document.getElementById("openForm").hidden = false;
        document.getElementById("modifica").hidden = true;
      } else if (selectedDates.length === 2) {
        const first = new Date(selectedDates[0]);
        const last = new Date(selectedDates[1]);
        const startDate = first< last ? first : last;
        const endDate = first > last ? first : last;
        selected.innerHTML = `Inizio: ${startDate.toLocaleString("it-IT", {
          dateStyle: "full"
        })}<br>Fine: ${endDate.toLocaleString("it-IT", {
          dateStyle: "full"
        })}`;
        highlightRange(selectedDates[0], selectedDates[1], document.querySelectorAll(".days div"));
      } else {
        selected.innerHTML = "";
        document.getElementById("openForm").hidden = true;
      }
    });
  });
}

// Funzione per evidenziare l'intervallo selezionato nel calendario
function highlightRange(firstDate, lastDate, dayElements) {
  const first = new Date(firstDate);
  const last = new Date(lastDate);
  
  const startDate = first < last ? first : last;
  const endDate = first > last ? first : last;

  dayElements.forEach((day) => {
    const dayDate = new Date(day.dataset.date);
    // Solo 1 giorno
    if ((firstDate == lastDate) && (dayDate.getMonth() == startDate.getMonth() && dayDate.getDate() == startDate.getDate())) {
      day.classList.add("selected-day");
      return;
    }
    // Range di giorni
    if (dayDate >= startDate && dayDate <= endDate) {
      if(dayDate.getMonth() == startDate.getMonth() && dayDate.getDate() == startDate.getDate()) {
        day.classList.remove("selected-day");
        day.classList.add("selection-start");
        return;
      }
      if(dayDate.getMonth() == endDate.getMonth() && dayDate.getDate() == endDate.getDate()) {
        day.classList.remove("selected-day");
        day.classList.add("selection-end");
        return;
      }
      day.classList.add("selected-range");
    }
  });
}

// Funzione per convertire una stringa in un oggetto Date
function stringToDate(dateString) {
  const months = {
    "gennaio": 0,
    "febbraio": 1,
    "marzo": 2,
    "aprile": 3,
    "maggio": 4,
    "giugno": 5,
    "luglio": 6,
    "agosto": 7,
    "settembre": 8,
    "ottobre": 9,
    "novembre": 10,
    "dicembre": 11
  };
 const [day, monthName, year] = dateString.split(' ');
 const month = months[monthName];
 return new Date(year, month, parseInt(day));
}

// Funzione per evidenziare i giorni già prenotati nel calendario
function markBooked() {
  const dayElements = document.querySelectorAll(".days div");
  dayElements.forEach((day) => {
    const currentDate = new Date(day.dataset.date);
    // 1 giorno
    if (typeof onlyDate !== "undefined") {
      if (currentDate.getTime() == onlyDate.getTime()) {
        day.classList.add("booked-day");
      }
    // Range di giorni
    } else if (typeof startDate !== "undefined") {
      if(currentDate >= startDate && currentDate <= endDate) {
        day.classList.add("booked-day");
      }
    }
  })
  displaySelected();
  document.querySelector(".days").classList.add("block"); // Blocca l'interazione con il calendario
  document.getElementById("modifica").hidden = false;
  document.getElementById("cancella").hidden = false;
}

// Genera il calendario
displayCalendar();
