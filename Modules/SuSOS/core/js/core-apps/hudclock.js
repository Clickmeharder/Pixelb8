// Function to update the clocks
function updateClock(localClockId, euClockId) {
    var now = new Date();

    // Update the local clock element
    document.getElementById('localtime').innerHTML = 'Local: ' + formatTime(now);

    // Convert the current time to UTC
    var euTime = now.toISOString().slice(11, 19);

    // Update the EU clock element
    document.getElementById('EUtime').innerHTML = 'UTC: ' + euTime;

    // Update the clocks every second
    setTimeout(function () {
        updateClock(localClockId, euClockId);
    }, 1000);
}
// Function to format time as hh:mm:ss AM/PM in UTC
function formatTimeUTC12Hr(date) {
    var hours = date.getUTCHours();
    var minutes = date.getUTCMinutes();
    var seconds = date.getUTCSeconds();

    var ampm = hours >= 12 ? 'PM' : 'AM';
    hours = hours % 12;
    hours = hours ? hours : 12; // Handle midnight (0 hours)

    // Add leading zero if needed
    hours = (hours < 10) ? '0' + hours : hours;
    minutes = (minutes < 10) ? '0' + minutes : minutes;
    seconds = (seconds < 10) ? '0' + seconds : seconds;

    return hours + ':' + minutes + ':' + seconds + ' ' + ampm + ' UTC';
}
// Function to format time as HH:mm:ss
function formatTime(date) {
    var hours = date.getHours();
    var minutes = date.getMinutes();
    var seconds = date.getSeconds();

    // Add leading zero if needed
    hours = (hours < 10) ? '0' + hours : hours;
    minutes = (minutes < 10) ? '0' + minutes : minutes;
    seconds = (seconds < 10) ? '0' + seconds : seconds;

    return hours + ':' + minutes + ':' + seconds;
}
// Function to format time as HH:mm
function formatTimehhss(date) {
    var hours = date.getHours();
    var minutes = date.getMinutes();

    // Add leading zero if needed
    hours = (hours < 10) ? '0' + hours : hours;
    minutes = (minutes < 10) ? '0' + minutes : minutes;

    return hours + ':' + minutes;
}
// Function to extract location and time from the event title
function extractLocationTime(eventTitle, dateTimeString) {
    var parts = eventTitle.split(' - ');
    var location = parts[0].trim(); // The first part is the location
    
    var dateTime = new Date(dateTimeString);
    var time = dateTime.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

    return {
        location: location,
        time: time
    };
}
document.addEventListener('DOMContentLoaded', function () {
	var calendarEl = document.getElementById('calendar');
	var calendar = new FullCalendar.Calendar(calendarEl, {
		eventMouseEnter: function (info) {
			// Create a tooltip element
			var tooltip = document.createElement('div');
			tooltip.className = 'custom-tooltip';

			// Populate the tooltip with event details
			var extendedProps = info.event.extendedProps;
			tooltip.innerHTML = `<strong>${info.event.title}</strong><br>`;
			
			if (extendedProps.departureandArrival !== undefined) {
				tooltip.innerHTML += `Departure and Arrival: ${extendedProps.departureandArrival}<br>`;
			}

            if (extendedProps.dayPassPrice !== undefined) {
                // Check if dayPassPrice is greater than 0.00
                if (parseFloat(extendedProps.dayPassPrice) > 0.00) {
                    tooltip.innerHTML += `Day Pass Price: <span class="green-text">${extendedProps.dayPassPrice}</span><br>`;
                } else {
                    tooltip.innerHTML += `Day Pass Price: ${extendedProps.dayPassPrice}<br>`;
                }
            }

			if (extendedProps.originPlanet !== undefined) {
				tooltip.innerHTML += `Origin Planet: ${extendedProps.originPlanet}<br>`;
			}

			if (extendedProps.destinationPlanet !== undefined) {
				tooltip.innerHTML += `Destination Planet: ${extendedProps.destinationPlanet}<br>`;
			}

            // Additional checks for prizeValue and ticketPrice
            if (extendedProps.prizeValue !== undefined) {
                // Check if prizeValue is greater than ticketPrice and greater than 0.00
                if (parseFloat(extendedProps.prizeValue) > parseFloat(extendedProps.ticketPrice) && parseFloat(extendedProps.prizeValue) > 0.00) {
                    tooltip.innerHTML += `Prize Value: <span class="gold-text">${extendedProps.prizeValue}</span><br>`;
                } else {
                    tooltip.innerHTML += `Prize Value: ${extendedProps.prizeValue}<br>`;
                }
            }
            if (extendedProps.ticketPrice !== undefined) {
                tooltip.innerHTML += `Ticket Price: <span class="green-text">${extendedProps.ticketPrice}</span><br>`;
            }

			// Check if the event title contains 'Yamato'
			if (info.event.title.includes('Yamato')) {
				tooltip.innerHTML += "<br>Warp Schedule:<br>";
				tooltip.innerHTML += "19:00 Monria → Toulan<br>";
				tooltip.innerHTML += "19:30 Toulan → Arkadia<br>";
				tooltip.innerHTML += "20:00 Arkadia → Calypso<br>";
				tooltip.innerHTML += "20:30 Calypso → Rocktropia<br>";
				tooltip.innerHTML += "21:00 Rocktropia → Cyrene<br>";
				tooltip.innerHTML += "21:30 Cyrene → Next Island<br>";
				tooltip.innerHTML += "22:00 Next Island → Toulan<br>";
				tooltip.innerHTML += "22:30 Toulan → Monria<br>";
				tooltip.innerHTML += "NOTICE:<br>";
				tooltip.innerHTML += "First Summons: T-15min<br>";
				tooltip.innerHTML += "Final Summons: T-5min<br>";
			}

			// Set an offset from the cursor
			var offsetLeft = 50; // Adjust this value as needed for horizontal positioning

			var left = info.jsEvent.pageX + offsetLeft;

			// Position and append the tooltip to the body
			tooltip.style.position = 'absolute';
			tooltip.style.left = left + 'px';
			document.body.appendChild(tooltip);

			// Retrieve the height of the tooltip
			var tooltipHeight = tooltip.offsetHeight;

			// Set the offsetTop equal to the height of the tooltip
			tooltip.style.top = (info.jsEvent.pageY - tooltipHeight) + 'px';
			
			// Add a class for styling
			tooltip.classList.add('visible-tooltip');
			 // Add custom styles for the green text
			// Add custom styles for the gold and green text
			var style = document.createElement('style');
			style.innerHTML = '.gold-text { color: gold; } .green-text { color: green; }';
			document.head.appendChild(style);

		},

		eventMouseLeave: function (info) {
			// Remove the tooltip when leaving the event
			var tooltips = document.querySelectorAll('.custom-tooltip');
			tooltips.forEach(function (tooltip) {
				tooltip.parentNode.removeChild(tooltip);
			});
		},
		headerToolbar: {
			left: 'prev,next today',
			center: 'title',
			right: 'dayGridMonth,timeGridWeek,timeGridDay'
		},
		initialView: 'dayGridMonth',

		events: [], // Empty array to be populated dynamically

		eventContent: function (arg) {
			// Customize the rendering of each event
			var eventDetails = document.createElement('div');
			var prizeValue = arg.event.extendedProps.prizeValue;
			var ticketPrice = arg.event.extendedProps.ticketPrice;

			eventDetails.innerHTML = `<strong>${arg.event.title}</strong>`;

			if (prizeValue !== undefined && prizeValue !== null) {
				// Display both prizeValue and ticketPrice on the same line
				eventDetails.innerHTML += `<br><span>Prize: ${prizeValue} - Tickets: ${ticketPrice}</span>`;
			}

			return { domNodes: [eventDetails] };
		},
		eventClick: function (info) {
			// Log the title of the clicked event
			console.log('Event clicked:', info.event.title);

			// Log details of the clicked event
			var extendedProps = info.event.extendedProps;

			// Check for specific extended properties and log them
			if (extendedProps.departureandArrival !== undefined) {
				console.log('Departure and Arrival:', extendedProps.departureandArrival);
			}

			if (extendedProps.dayPassPrice !== undefined) {
				console.log('Day Pass Price:', extendedProps.dayPassPrice);
			}

			if (extendedProps.originPlanet !== undefined) {
				console.log('Origin Planet:', extendedProps.originPlanet);
			}

			if (extendedProps.destinationPlanet !== undefined) {
				console.log('Destination Planet:', extendedProps.destinationPlanet);
			}

			// Additional checks for prizeValue and ticketPrice
			if (extendedProps.prizeValue !== undefined) {
				console.log('Prize Value:', extendedProps.prizeValue);
			}

			if (extendedProps.ticketPrice !== undefined) {
				console.log('Ticket Price:', extendedProps.ticketPrice);
			}

			// You can add more checks for other extended properties as needed
		},
		dateClick: function (date, jsEvent, view) {
			console.log('Date clicked:', date);
		}
	});

		// Function to load the scheduled events list from local storage
		function loadScheduledEventsList() {
			// Retrieve the JSON string from local storage
			var scheduledEventsListJson = localStorage.getItem('scheduledEventsList');

			// Parse the JSON string to get the scheduled events list
			var scheduledevents = JSON.parse(scheduledEventsListJson) || [];

			// Add scheduled events to the FullCalendar
			scheduledevents.forEach(function (event) {
				calendar.addEvent({
					title: event.eventName,
					start: event.date + 'T' + event.time + ':00',
					backgroundColor: '#620a0ae0',  // Change to the desired background color  blue  #0a3662d1 green #0a6211e0 red #620a0ae0 purple #8c27b0a3 pink #b8166c9c
					borderColor: '#d77901',
					textColor: '#00e7ff',
					extendedProps: {
						prizeValue: event.prizeValue || '0.00',
						ticketPrice: event.totalTicketPrice || '0.00'
						// Add other properties as needed
					}
				});
			});

			// Add events for weekdays at 21:00
			for (var i = 1; i <= 5; i++) {
				calendar.addEvent({
					title: 'Big Industries SSI',
					daysOfWeek: [i],
					startTime: '21:00',
					duration: { hours: 2 },
					backgroundColor: '#0a6211e0',
				});
			}

			// Add events for Saturday & Sunday at 15:00
			calendar.addEvent({
				title: 'Big Industries SSI',
				daysOfWeek: [0, 6],
				startTime: '15:00',
				duration: { hours: 2 },
				backgroundColor: '#0a6211e0',
			});
			// Call the function to set warp days
			setWarpDays();
			
			// Add Kronan M.S Warp events
			addKronanMSWarpEvents();

			// Re-render the calendar to display the new events
			calendar.render();
		}
		// Function to set warp days based on specific dates for all 12 months
		function addKronanMSWarpEvents() {
			// Array of Kronan M.S Warp events with departure and arrival details
			var kronanEvents = [
				{ title: 'Kronan Ark-Caly', start: '2024-01-01T00:30:00', duration: '00:15' },
				{ title: 'Kronan Caly-Rt', start: '2024-01-01T01:00:00', duration: '00:15' },
				{ title: 'Kronan Rt-Request*', start: '2024-01-01T01:30:00', duration: '00:15' },
				{ title: 'Kronan Request*-Caly', start: '2024-01-01T01:40:00', duration: '00:15' },
				{ title: 'Kronan Caly-Ark', start: '2024-01-01T02:05:00', duration: '00:15' }
				// Add more events as needed
			];

			// Add Kronan M.S Warp events to the calendar
			kronanEvents.forEach(function (event) {
				// Set the event start and end times in extendedProps
				var extendedProps = {
					departureandArrival: ``,
					dayPassPrice: '10.00', // Default day pass price for Kronan warps
					originPlanet: event.title.split('Kronan')[1]?.split('-')[0] || event.title.split('Kronan')[1]?.split('*')[0] || '', // Assuming the origin planet is part of the event title
					destinationPlanet: event.title.split('-')[1] || event.title.split('*')[1] || '', // Assuming the destination planet is part of the event title
				};

				calendar.addEvent({
					title: event.title,
					start: event.start,
					end: addDuration(event.start, event.duration), // Set arrival time as the end of the duration
					backgroundColor: '#yourBackgroundColor',  // Change to your desired background color
					borderColor: '#yourBorderColor',  // Change to your desired border color
					textColor: '#yourTextColor',  // Change to your desired text color
					daysOfWeek: [0, 1, 2, 3, 4, 5, 6],  // Repeat every day of the week except Saturday (0 is Sunday),
					extendedProps: extendedProps,
					eventContent: function (arg) {
						// Customize the rendering of each event
						var eventDetails = document.createElement('div');
						eventDetails.innerHTML = `<strong>${arg.event.title}</strong>`;
						// Display departure and arrival times
						eventDetails.innerHTML += `<br>Departure: ${event.start.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}`;
						eventDetails.innerHTML += `<br>Arrival: ${addDuration(event.start, event.duration).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}`;
						return { domNodes: [eventDetails] };
					},
				});
			});
		}

		// Function to add duration to a date and return the new date
		function addDuration(dateString, duration) {
			var date = new Date(dateString);
			var hours = parseInt(duration.split(':')[0]);
			var minutes = parseInt(duration.split(':')[1]);
			date.setHours(date.getHours() + hours);
			date.setMinutes(date.getMinutes() + minutes);
			return date;
		}
		function setWarpDays() {
			var warpDates = {
				1: [5, 12, 19, 25, 7, 14, 21, 29], //month 1
				2: [2, 9, 16, 22, 4, 11, 18, 26],   //month 2
				3: [1, 8, 15, 22, 28, 2, 9, 16, 23], //month 3
				4: [1, 5, 12, 19, 25, 7, 14, 21, 29],  //month 4
				5: [3, 10, 17, 23, 5, 12, 19, 27],  //month 5
				6: [7, 14, 21, 27, 2, 9, 16, 23], //month 6
				7: [1, 5, 12, 19, 25, 7, 14, 21, 29],  // month 7
				8: [2, 9, 16, 22, 30, 4, 11, 18, 26], //month 8
				9: [6, 13, 20, 26, 1, 8, 15, 22, 30], //month 9
				10: [4, 10, 18, 25, 6, 14, 20, 27],  //month 10
				11: [1, 8, 15, 21, 29, 3, 10, 17, 25], //month 11
				12: [6, 13, 20, 26, 1, 8, 15, 22, 30] //month 12
			};

			// Get the current month
			var currentMonth = new Date().getMonth() + 1;

			// Access the array for the current month directly
			var currentMonthWarpDates = warpDates[currentMonth];

			// Log some information for debugging
			console.log('Current Month:', currentMonth);
			console.log('Warp Dates for Current Month:', currentMonthWarpDates);

			// Check if the current month has warp dates
			if (currentMonthWarpDates) {
				// Add events for specific dates
				currentMonthWarpDates.forEach(function (day) {
					console.log('Adding Event for Day:', day);
					calendar.addEvent({
						title: 'Yamato M.S. Warp',
						start: new Date(new Date().getFullYear(), currentMonth - 1, day, 18, 45),
						end: new Date(new Date().getFullYear(), currentMonth - 1, day, 22, 30),
						backgroundColor: '#0a3662d1',
						extendedProps: {
							ticketPrice: '6.00'
						}
					});
				});
			}
		}
		// Call the function to load scheduled events when the page loads
		loadScheduledEventsList();
		updateClock('localtime', 'EUtime');

		function loadTimersFromLocalStorage() {
			var timers = JSON.parse(localStorage.getItem('timers')) || [];
			timers.forEach(function (timer) {
				var timerElement = document.createElement('div');
				timerElement.className = 'timer';

				// Calculate the remaining time based on current local time
				var currentTime = new Date().getTime();
				var elapsed = currentTime - timer.startTime;
				var remainingTime = timer.totalTime - elapsed;

				// Check if the timer has already expired
				if (remainingTime <= 0) {
					timerElement.textContent = timer.label + ' - Timer Expired';

					// Display a message and ask the user to click to hear the label
					timerElement.innerHTML += '<br>Click to hear label';
					timerElement.addEventListener('click', function () {
						// Read the label using text-to-speech
						speakLabel(timer.label);

						// Remove the timer from the stack
						timerStack.removeChild(timerElement);

						// Remove the timer from local storage
						removeTimerFromLocalStorage(timer.label);
					});
				} else {
					// Calculate hours, minutes, and seconds
					var hoursLeft = Math.floor(remainingTime / (60 * 60 * 1000));
					var minutesLeft = Math.floor((remainingTime % (60 * 60 * 1000)) / (60 * 1000));
					var secondsLeft = Math.floor((remainingTime % (60 * 1000)) / 1000);

					// Display the remaining time
					timerElement.textContent = timer.label + ' - ' + hoursLeft + 'h ' + minutesLeft + 'm ' + secondsLeft + 's';

					// Change text color when remaining time is below 30 minutes
					if (remainingTime < 30 * 60 * 1000) {
						timerElement.style.color = 'red'; // Change to your desired color
					}

					// Create a countdown timer
					var countdownInterval = setInterval(function () {
						// Calculate the remaining time based on current local time
						var currentTime = new Date().getTime();
						var elapsed = currentTime - timer.startTime;
						var remainingTime = timer.totalTime - elapsed;

						// Calculate hours, minutes, and seconds
						var hoursLeft = Math.floor(remainingTime / (60 * 60 * 1000));
						var minutesLeft = Math.floor((remainingTime % (60 * 60 * 1000)) / (60 * 1000));
						var secondsLeft = Math.floor((remainingTime % (60 * 1000)) / 1000);

						// Display the remaining time
						timerElement.textContent = timer.label + ' - ' + hoursLeft + 'h ' + minutesLeft + 'm ' + secondsLeft + 's';

						// Change text color when remaining time is below 30 minutes
						if (remainingTime < 30 * 60 * 1000) {
							timerElement.style.color = 'red'; // Change to your desired color
						}

						// Check if the countdown is finished
						if (remainingTime <= 0) {
							clearInterval(countdownInterval);
							timerElement.textContent = timer.label + ' - Timer Expired';

							// Display a message and ask the user to click to hear the label
							timerElement.innerHTML += '<br>Click to hear label';
							timerElement.addEventListener('click', function () {
								// Read the label using text-to-speech
								speakLabel(timer.label);

								// Remove the timer from the stack
								timerStack.removeChild(timerElement);

								// Remove the timer from local storage
								removeTimerFromLocalStorage(timer.label);
							});
						}
					}, 1000);
				}

				// Add the timer to the stack
				timerStack.appendChild(timerElement);
			});
		}

		// Call the function to load scheduled events when the page loads
		/* loadScheduledEventsList(); */
		updateClock('localtime', 'EUtime');

		var timerButton = document.getElementById('timer-button');
		var timerStack = document.getElementById('timer-stack');

		timerButton.addEventListener('click', function () {
			// Ask the user for input
			var hours = prompt('Enter the number of hours for the timer:');
			var label;
			    // Check if the user canceled the input
			if (hours === null) {
				alert('Timer creation canceled.'); // Notify the user
				return; // Exit the function
			}

			// Ask for label only if the user provided hours
			if (hours !== '') {
				label = prompt('Enter a label for the timer:');

				// Check if the user canceled the input
				if (label === null) {
					alert('Timer creation canceled.'); // Notify the user
					return; // Exit the function
				}
			}
			// Save the current local time and the total time in milliseconds
			var startTime = new Date().getTime();
			var totalTime = hours * 60 * 60 * 1000;

			// Create a new timer element
			var timerElement = document.createElement('div');
			timerElement.className = 'timer';
			timerElement.textContent = label + ' - ' + hours + ' hours';

			// Create a countdown timer
			var countdownInterval = setInterval(function () {
				// Calculate the remaining time based on current local time
				var currentTime = new Date().getTime();
				var elapsed = currentTime - startTime;
				var remainingTime = totalTime - elapsed;

				// Calculate hours, minutes, and seconds
				var hoursLeft = Math.floor(remainingTime / (60 * 60 * 1000));
				var minutesLeft = Math.floor((remainingTime % (60 * 60 * 1000)) / (60 * 1000));
				var secondsLeft = Math.floor((remainingTime % (60 * 1000)) / 1000);

				// Display the remaining time
				timerElement.textContent = label + ' - ' + hoursLeft + 'h ' + minutesLeft + 'm ' + secondsLeft + 's';

				// Change text color when remaining time is below 30 minutes
				if (remainingTime < 30 * 60 * 1000) {
					timerElement.style.color = 'red'; // Change to your desired color
				}

				// Check if the countdown is finished
				if (remainingTime <= 0) {
					clearInterval(countdownInterval);
					timerElement.textContent = label + ' - Timer Expired';
					// Play the timer expired message
					
					
					var voices = speechSynthesis.getVoices();
					console.log("Available Voices:");
					voices.forEach(function (voice, index) {
						console.log(index + ": " + voice.name);
					});
					playTimerExpiredMessage(label);
					// Display a message and ask the user to click to hear the label
					timerElement.innerHTML += '<br>Click to hear label';
					timerElement.addEventListener('click', function () {
						
						// Log available voices and their indices
						var voices = speechSynthesis.getVoices();
						console.log("Available Voices:");
						voices.forEach(function (voice, index) {
							console.log(index + ": " + voice.name);
						});

						// Read the label using text-to-speech
						speakLabel(label);

						// Remove the timer from the stack
						timerStack.removeChild(timerElement);

						// Remove the timer from local storage
						removeTimerFromLocalStorage(label);
					});
				}
			}, 1000);

			// Add the timer and start time to the stack
			timerStack.appendChild(timerElement);
			saveTimerToLocalStorage(label, totalTime, startTime);
		});

	// Function to save a timer to local storage
	function saveTimerToLocalStorage(label, totalTime, startTime) {
		var timers = JSON.parse(localStorage.getItem('timers')) || [];
		timers.push({ label: label, totalTime: totalTime, startTime: startTime });
		localStorage.setItem('timers', JSON.stringify(timers));
	}

	// Function to load timers from local storage when the page loads
	loadTimersFromLocalStorage();
	});
// Function to remove a timer from local storage by label
function removeTimerFromLocalStorage(label) {
    var timers = JSON.parse(localStorage.getItem('timers')) || [];
    timers = timers.filter(function (timer) {
        return timer.label !== label;
    });
    localStorage.setItem('timers', JSON.stringify(timers));
}

// Function to remove a timer from the stack
function removeTimerFromStack(label) {
    var timerStack = document.getElementById('timer-stack');
    var timers = timerStack.getElementsByClassName('timer');

    for (var i = 0; i < timers.length; i++) {
        var timerLabel = timers[i].textContent.split(' - ')[0];
        if (timerLabel === label) {
            timerStack.removeChild(timers[i]);
            break;
        }
    }
}

// Function to handle utterance end event
function onUtteranceEnd(label) {
    console.log('Utterance ended for label: ' + label);
    removeTimerFromStack(label);
    removeTimerFromLocalStorage(label);
}

// Modify your existing speakLabel function
function speakLabel(label, desiredVoiceIndex) {
    // Create a new SpeechSynthesisUtterance
    var utterance = new SpeechSynthesisUtterance(label);

   
    // Set up the onend event listener
    utterance.onend = function () {
        onUtteranceEnd(label);
    };

    // Speak the utterance
    speechSynthesis.speak(utterance);
}
// Function to play the timer expired sound
/* function playTimerExpiredSound() {
    var audio = new Audio('sounds/timeend_sound1.mp3');
    audio.play();
} */
// Function to play a message when the timer expires
function playTimerExpiredMessage(label) {
    var message = new SpeechSynthesisUtterance('Captain,  The, ' + label + ' Timer. has expired.');
    speechSynthesis.speak(message);
}