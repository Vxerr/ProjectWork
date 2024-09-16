let display = document.querySelector(".display");
let days = document.querySelector(".days");
let previous = document.querySelector(".left");
let next = document.querySelector(".right");
let selected = document.querySelector(".selected");
let booking = document.querySelector(".booking");
let date = new Date();
let year = date.getFullYear(); //2024
let month = date.getMonth(); //7
let onlyDate;
let startDate;
let endDate;
let selectedDates = [];
let validArray = document.querySelectorAll("#name, #tel, #email");
var checkModifica = false;

function displayCalendar() {
  const firstDay = new Date(year, month, 1);
  let   nextfirstDay = 1;
  const lastDay = new Date(year, month + 1, 0);
  const previouslastDay = new Date(year, month, 0);
  const firstDayIndex = firstDay.getDay();
  const lastDayIndex = lastDay.getDay();
  const numberOfDays = lastDay.getDate();
  let   previousMonthCutoff = previouslastDay.getDate()-firstDayIndex+1;
  let formattedDate = date.toLocaleString("it-IT", {
    month: "long",
    year: "numeric"
  });
  
  display.innerHTML = `${formattedDate}`;

  fetch("/read_database")
  .then(response => response.json()) // Convert the response to JSON
  .then(data => {
    if (Object.keys(data).length != 0 && checkModifica == false) {
      if ("giorno" in data) {
        const giorno = data.giorno;
        selected.innerHTML = `${giorno}`;
        onlyDate = stringToDate(giorno);
      } else if ("giorni" in data) {
        const giorni = data.giorni;
        selected.innerHTML = `${giorni}`;
        let [firstDate, lastDate] = giorni.split(' - ');
        startDate = stringToDate(firstDate);
        endDate = stringToDate(lastDate);
      }
      markBooked();
      //displaySelected();
      //document.getElementById("modifica").hidden = false;
      //document.getElementById("cancella").hidden = false;
    } else {
      displaySelected();
    }
  })
  for (let x = 1; x <= firstDayIndex; x++) {
    let div = document.createElement("div");
    let currentDate = new Date(year, month-1, previousMonthCutoff);
    div.dataset.date = currentDate.toDateString();
    div.classList.add("invalid-day");
    
    div.innerHTML = previousMonthCutoff;
    previousMonthCutoff++;
    days.appendChild(div);
  }
  
  for (let i = 1; i <= numberOfDays; i++) {
    let div = document.createElement("div");
    let currentDate = new Date(year, month, i);
    div.dataset.date = currentDate.toDateString();
    
    div.innerHTML += i;
    days.appendChild(div);
    if (
      currentDate.getFullYear() <= new Date().getFullYear() &&
      currentDate.getMonth() <= new Date().getMonth() &&
      currentDate.getDate() <= new Date().getDate()
    ) {
      div.classList.add("invalid-day");
    }
    
  }
  
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

previous.addEventListener("click", () => {
  if (month <= new Date().getMonth() && year <= new Date().getFullYear()) {
    return; // Do nothing, can't go further back in time
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
  //displaySelected();

  if (selectedDates.length === 1) {
    highlightRange(selectedDates[0], selectedDates[0], document.querySelectorAll(".days div"));
  }
  if (selectedDates.length === 2) {
    highlightRange(selectedDates[0], selectedDates[1], document.querySelectorAll(".days div"));
  }
});

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
  //displaySelected();

  if (selectedDates.length === 1) {
    highlightRange(selectedDates[0], selectedDates[0], document.querySelectorAll(".days div"));
  }
  if (selectedDates.length === 2) {
    highlightRange(selectedDates[0], selectedDates[1], document.querySelectorAll(".days div"));
  }
});

validArray.forEach((input) => {
  input.addEventListener("keyup", () => {
    if(validArray[0].checkValidity() == true && validArray[1].checkValidity() == true && validArray[2].checkValidity() == true) {
      document.getElementById("sendForm").disabled = false;
    } else {
      document.getElementById("sendForm").disabled = true;
    }
})})

openForm.addEventListener("click", () => {
  document.getElementById("openForm").hidden = true;
  if(checkModifica == false) {
    form.classList.add("show");
  }
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
/*
closeForm.addEventListener("click", (event) => {
  if (closeForm.value == "Annulla") {
    document.getElementById("openForm").hidden = false;
    form.classList.remove("show");
  } else {
    event.preventDefault();
    sendData();
    form.classList.remove("show");
    days.innerHTML = "";
    document.getElementById("openForm").hidden = true;
    selected.innerHTML = "";
    selectedDates = [];
    displayCalendar();
    //document.querySelector(".calendar").classList.add("block");
  }
})
  */
closeForm.addEventListener("click", () => {
  document.getElementById("openForm").hidden = false;
  form.classList.remove("show");
})
sendForm.addEventListener("click", (event) => {
  event.preventDefault();
  sendData();
  form.classList.remove("show");
  days.innerHTML = "";
  document.getElementById("openForm").hidden = true;
  selected.innerHTML = "";
  selectedDates = [];
  displayCalendar();
    //document.querySelector(".calendar").classList.add("block");
})
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
  document.querySelector(".calendar").classList.remove("block");
})

modifica.addEventListener("click", () => {
  if(modifica.innerHTML == "Annulla") {
    document.querySelector(".calendar").classList.add("block");
    document.getElementById("cancella").hidden = false;
    modifica.innerHTML = "Modifica";
    markBooked();
  } else {
    checkModifica = true;
  
    const booked = document.querySelectorAll(".booked-day");
    booked.forEach((day) => {
      day.classList.remove("booked-day");
    })
    //days.innerHTML = "";
    //selected.innerHTML = "";
    //selectedDates = [];
    //displayCalendar();
    document.querySelector(".calendar").classList.remove("block");
    document.getElementById("cancella").hidden = true;
    modifica.innerHTML = "Annulla";
    selected.innerHTML = "";
  }
})
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

function displaySelected() {

  const dayElements = document.querySelectorAll(".days div:not(.invalid-day)");

  dayElements.forEach((day) => {
    day.addEventListener("click", (e) => {
      const selectedDate = e.target.dataset.date;
      if (selectedDates.length < 2) {
        if(e.target.classList.contains("selected-day")) {
           e.target.classList.remove("selected-day");
           selectedDates = [];
        } else {
        e.target.classList.add("selected-day");
        selectedDates.push(selectedDate);
        }
      } else {
        // Reset when a third date is clicked, and start over
        selectedDates = [];
        document.querySelectorAll(".days div").forEach((d) => d.classList.remove("selected-day", "selection-start", "selected-range", "selection-end"));
      }

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

function highlightRange(firstDate, lastDate, dayElements) {
  // Convert the date strings into Date objects for comparison
  const first = new Date(firstDate);
  const last = new Date(lastDate);
  
  // Ensure first is earlier than last for easier comparison
  const startDate = first < last ? first : last;
  const endDate = first > last ? first : last;

  // Loop through all day elements and check if they fall within the range
  dayElements.forEach((day) => {
    const dayDate = new Date(day.dataset.date);
    if ((firstDate == lastDate) && (dayDate.getMonth() == startDate.getMonth() && dayDate.getDate() == startDate.getDate())) {
      day.classList.add("selected-day");
      return;
    }
    // If the day is between startDate and endDate, add the CSS class
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

function stringToDate(dateString) {
  // Define a mapping of Italian month names to their numeric equivalents
  const months = {
    "gennaio": 0,     // January
    "febbraio": 1,    // February
    "marzo": 2,       // March
    "aprile": 3,      // April
    "maggio": 4,      // May
    "giugno": 5,      // June
    "luglio": 6,      // July
    "agosto": 7,      // August
    "settembre": 8,   // September
    "ottobre": 9,     // October
    "novembre": 10,   // November
    "dicembre": 11    // December
  };

 // Split the date string into day, month, and year components
 const [day, monthName, year] = dateString.split(' ');

 // Convert the month name to its numeric equivalent
 const month = months[monthName];

 // Create and return a new Date object
 return new Date(year, month, parseInt(day));
}

function markBooked() {
  const dayElements = document.querySelectorAll(".days div");

  dayElements.forEach((day) => {
    const currentDate = new Date(day.dataset.date);
    
    if (typeof onlyDate !== "undefined") {
      if (currentDate.getTime() == onlyDate.getTime()) {
      day.classList.add("booked-day");
      }
    } else if (typeof startDate !== "undefined") {
      
      if(currentDate >= startDate && currentDate <= endDate) {
        day.classList.add("booked-day");
      }
    }
    
  })
  displaySelected();
  //if (checkModifica == false) {
    document.querySelector(".calendar").classList.add("block");
    document.getElementById("modifica").hidden = false;
    document.getElementById("cancella").hidden = false;
  //}
}
function main() {
  displayCalendar();
  displaySelected();
}
displayCalendar();
//displaySelected();