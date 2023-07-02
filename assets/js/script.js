// ADDITIONAL FEATURES TO DO
// Select start and end hours
// Add location field
// Arrows to upcoming and previous days
// Link to jump back to today's schedule



// Following do not interact with the DOM, are safe to be called outisde of the $(function(){})
// Use DayJS to get the current day
var today = dayjs();
// Number of miliseconds until the next hour
var rerun = (60 - parseInt(today.format("m"))) * 60000

// See if there is already data saved to local storage. If not, create an empty array.
var calendar = JSON.parse(localStorage.getItem("calendar"))
if (calendar === null) {
  // Created an array of length 24 in case we ever wanted to change the displayed hours in the future
  calendar = Array(24).fill("")
}

// Wrap all calls to functions that deal with the DOM in this function, so that it doesn't run until all elements are loaded
$(function () {
  // Format the day and display it on the HTML element
  $("#currentDay").text(today.format("[Today is ]MMMM D, YYYY"))


  // Load any locally saved entries
  loadEntry()

  // Run checkTime function to apply colors to the hour blocks
  checkTime()

  // Rerun the checkTime function at the top of the next hour 
  setTimeout(function () {
    checkTime()
    // Now that we're at the top of the hour, set a timer interval to run checkTime every 60 minutes, so that the time blocks will continue to update
    setInterval(function () {
      checkTime()
    }, 3600000)
  }, rerun)

  // Use event delegation to listen for clicks on the saveBtn inside the containter-lg
  $(".container-lg").on("click", ".saveBtn", saveEntry)
})


// FUNCTIONS DECLARED BELOW
function loadEntry() {
  // Go through the calendar object, construct the time-block's id from the index of the array
  for (var i = 0; i < calendar.length; i++) {
    // If no element exists with that id, nothing will happen
    var index = "#hour-" + i
    // Get that element's child with the class of description, and set the value equal to the activity stored in the array
    $(index).children(".description").val(calendar[i])
  }
}

function checkTime() {
  // Because this runs every hour, it needs to update what time it is "now" every time it runs
  var now = dayjs()
  // Get just the hour, in 24-hour format, from the current day
  var currentHour = parseInt(now.format("H"))
  // Get an array of all the time-block elements on the page
  var timeBlocks = $(".time-block").get()
  // for each time-block element, get its id, and use that to detemrine the hour it represents
  for (var i = 0; i < timeBlocks.length; i++) {
    var hour = parseInt(($(timeBlocks[i]).attr("id")).replace("hour-", ""))
    // Compare the hour from the element's id to the current hour, and use that to determine if it is past, present, or future
    if (hour < currentHour) {
      $(timeBlocks[i]).addClass("past")
    } else if (hour === currentHour) {
      $(timeBlocks[i]).addClass("present")
    } else {
      $(timeBlocks[i]).addClass("future")
    }
  }
}

function saveEntry(event) {
  // Get the closest ancestor with the time-block class
  var parentEl = $(event.target).closest(".time-block")
  // Modify the time-block element's id to derive the index at which the activity should be stored in the calendar array
  var index = parseInt(parentEl.attr("id").replace("hour-", ""))
  // Get the previous value so we can see if it has changed
  var prevVal = calendar[index]
  var description = parentEl.children(".description").val().trim()
  calendar[index] = description
  // Save to local storage
  localStorage.setItem("calendar", JSON.stringify(calendar))
  // Show save message only if the event has changed
  if(prevVal !== description ){
    var toastEl = $('#saveToast')
    bootstrap.Toast.getOrCreateInstance(toastEl).show()
  }
}
