// This script contains the code related to the
// header that runs on every single page


// Greys the navigation link of the page we are currently on
document.querySelectorAll('nav a').forEach(link => {
	if (link.getAttribute('href') === window.location.pathname) { // e.g. "/news"
		link.classList.add('currPage');
	}
});


{ // Spacing: This block handles the spacing of our header elements at various screen widths
	const header = document.querySelector('header');
	const home = document.querySelector('.home');
	const nav = document.querySelector('nav');
	const links = document.querySelectorAll('nav a');
	// Paddings allowed between each of our header links (right of logo & left of gear)
	const maxPadding = parseInt(getComputedStyle(document.documentElement).getPropertyValue('--header-link-max-padding'));
	const minPadding = parseInt(getComputedStyle(document.documentElement).getPropertyValue('--header-link-min-padding'));
	// const gear = document.querySelector('.settings');
    
	// These things are hidden in our stylesheet off the bat to give our javascript
	// here time to calculate the spacing of everything before rendering
	for (const child of header.children) child.classList.remove('visibility-hidden');
    
	let compactnessLevel = 0;
    
	updateSpacing(); // Initial spacing on page load
	window.addEventListener('resize', updateSpacing); // Continuous spacing on page-resizing
    
	function updateSpacing() {
		// Reset to least compact, so that we can measure if each stage fits.
		// If it doesn't, we go down to the next compact stage
		compactnessLevel = 0;
		updateMode();
		updatePadding();
    
		let spaceBetween = getSpaceBetweenHeaderFlexElements();
    
		while (spaceBetween === 0 && compactnessLevel < 4) {
			compactnessLevel++;
			updateMode();
			updatePadding();
			spaceBetween = getSpaceBetweenHeaderFlexElements(); // Recalculate space after adjusting compactness and padding
		}
	}
    
	/**
     * Updates the left-right padding of the navigation links (right of logo and left of gear)
     * according to how much space is available.
     */
	function updatePadding() {
		const spaceBetween = getSpaceBetweenHeaderFlexElements();
    
		// If the space is less than 100px, reduce padding gradually
		if (spaceBetween >= 100) {
			// Reset to max padding when space is larger than 100px
			links.forEach(link => {
				link.style.paddingLeft = `${maxPadding}px`;
				link.style.paddingRight = `${maxPadding}px`;
			});
		} else {
			const newPadding = Math.max(minPadding, maxPadding * (spaceBetween / 100));
			links.forEach(link => {
				link.style.paddingLeft = `${newPadding}px`;
				link.style.paddingRight = `${newPadding}px`;
			});
		}
	}
    
	function updateMode() {
		if (compactnessLevel === 0) {
			home.classList.remove('compact-1'); // Show the "Infinite Chess" text
			nav.classList.remove('compact-2'); // Show the navigation SVGs
			nav.classList.remove('compact-3'); // Show the navigation TEXT
		} else if (compactnessLevel === 1) {
			home.classList.add('compact-1'); // Hide the "Infinite Chess" text
			nav.classList.remove('compact-2'); // Show the navigation SVGs
			nav.classList.remove('compact-3'); // Show the navigation TEXT
		} else if (compactnessLevel === 2) {
			home.classList.add('compact-1'); // Hide the "Infinite Chess" text
			nav.classList.add('compact-2'); // Hide the navigation SVGs
			nav.classList.remove('compact-3'); // Show the navigation TEXT
		} else if (compactnessLevel === 3) {
			home.classList.add('compact-1'); // Hide the "Infinite Chess" text
			nav.classList.remove('compact-2'); // Show the navigation SVGs
			nav.classList.add('compact-3'); // Hide the navigation TEXT
		}
	}
    
	function getSpaceBetweenHeaderFlexElements() {
		const homeRight = home.getBoundingClientRect().right;
		const navLeft = nav.getBoundingClientRect().left;
		return navLeft - homeRight;
	}
}


{ // This block opens and closes our settings drop-down menu when it is clicked.
	const settings = document.getElementById('settings');
	const settingsDropdown = document.querySelector('.settings-dropdown');
	const languageDropdownSelection = document.getElementById('language-settings-dropdown-item');
	const languageDropdown = document.querySelector('.language-dropdown');

	const languageDropdownTitle = document.querySelector('.language-dropdown .dropdown-title');

	const allSettingsDropdowns = [settingsDropdown, languageDropdown];
	let settingsIsOpen = settings.classList.contains('open');

	settings.addEventListener('click', event => {
		if (didEventClickAnyDropdown(event)) return; // We clicked any dropdown, don't toggle it off
		toggleSettingsDropdown();
	});

	// Close the dropdown if clicking outside of it
	document.addEventListener('click', (event) => {
		if (!settings.contains(event.target) && !didEventClickAnyDropdown(event)) closeSettingsDropdowns();
	});

	function didEventClickAnyDropdown(event) {
		// Check if the click was outside the dropdown
		let clickedDropdown = false;
		allSettingsDropdowns.forEach(dropdown => {
			if (dropdown.contains(event.target)) clickedDropdown = true;
		});
		return clickedDropdown;
	}

	function toggleSettingsDropdown() {
		if (settingsIsOpen) closeSettingsDropdowns();
		else openSettingsDropdown();
	}
	function openSettingsDropdown() { // Opens the initial settings dropdown
		settings.classList.add('open');
		settingsDropdown.classList.remove('visibility-hidden'); // The stylesheet adds a short delay animation to when it becomes hidden
		settingsIsOpen = true;
	}
	function closeSettingsDropdowns() { // Closes all dropdowns that may be open
		settings.classList.remove('open');
		settingsDropdown.classList.add('visibility-hidden'); // The stylesheet adds a short delay animation to when it becomes hidden
		languageDropdown.classList.add('visibility-hidden'); // The stylesheet adds a short delay animation to when it becomes hidden
		settingsIsOpen = false;
	}
	
	languageDropdownSelection.addEventListener('click', toggleLanguageDropdown);

	function toggleLanguageDropdown() {
		languageDropdown.classList.toggle('visibility-hidden'); // The stylesheet adds a short delay animation to when it becomes hidden
	}

	languageDropdownTitle.addEventListener('click', toggleLanguageDropdown);
}



{ // This block selects new languages when we click a language in the language dropdown
	// Request cookie if it doesn't exist
	if (getCookieValue("i18next") === undefined) {
		fetch("/setlanguage", {
			method: "POST",
			credentials: "same-origin",
		});
	}

	// Attach click event listener to language dropdown items
	const dropdownItems = document.querySelectorAll(".language-dropdown-item");
	dropdownItems.forEach(item => {
		item.addEventListener("click", () => {
			const selectedLanguage = item.getAttribute("value"); // Get the selected language code
			updateCookie("i18next", selectedLanguage, 365);

			// Modify the URL to include the "lng" query parameter
			const url = new URL(window.location);
			url.searchParams.set("lng", selectedLanguage);

			// Update the browser's URL without reloading the page
			window.history.replaceState({}, '', url);

			// Reload the page
			location.reload();
		});
	});

	function updateCookie(cookieName, value, days) {
		let expires = "";
		if (days) {
			const date = new Date();
			date.setTime(date.getTime() + days * 24 * 60 * 60 * 1000);
			expires = "; expires=" + date.toUTCString();
		}
		document.cookie = cookieName + "=" + (value || "") + expires + "; path=/";
	}
}



favicon: { // This block auto detects device theme and adjusts the browser icon accordingly

	const element_favicon = document.getElementById('favicon');

	/**
     * Switches the browser icon to match the given theme.
     * @param {string} theme "dark"/"light"
     */
	function switchFavicon(theme) {
		if (theme === 'dark') element_favicon.href = '/img/favicon-dark.png';
		else element_favicon.href = '/img/favicon-light.png';
	}
    
	if (!window.matchMedia) break favicon; // Don't create a theme-change event listener if matchMedia isn't supported.

	// Initial theme detection
	const prefersDarkScheme = window.matchMedia('(prefers-color-scheme: dark)').matches;
	switchFavicon(prefersDarkScheme ? 'dark' : 'light');
    
	// Listen for theme changes
	window.matchMedia('(prefers-color-scheme: dark)').addEventListener('change', event => {
		const newTheme = event.matches ? 'dark' : 'light';
		console.log(`Toggled ${newTheme} icon`);
		switchFavicon(newTheme);
	});
}



{ // This block auto-removes the "lng" query parameter from the url, visually, without refreshing
	(function removeLngQueryParam() {
		// Create a URL object from the current window location
		const url = new URL(window.location);
  
		// Remove the "lng" query parameter
		url.searchParams.delete('lng');
  
		// Update the browser's URL without refreshing the page
		window.history.replaceState({}, '', url);
	})();
}


/*
 * Refreshes our token if we are logged in and have a refresh token,
 * and if we are login logged in it, changes the login and
 * create account header links into profile and logout links.
 * 
 * If we are not logged in the server will give us a browser-id
 * cookie to validate our identity in future requests.
 * 
 * It appends our lng query param to all the navigation links.
 */
// eslint-disable-next-line no-unused-vars
const header = (function() {

	/** Our username, if we are logged in. @type{string} */

	let username;
	let reqIsOut = false;

	const loginLink = document.getElementById('login-link');
	const loginText = document.getElementById('login');
	const loginSVG = document.getElementById('svg-login');
	const profileText = document.getElementById('profile');
	const profileSVG = document.getElementById('svg-profile');
	const createaccountLink = document.getElementById('createaccount-link');
	const createaccountText = document.getElementById('createaccount');
	const createaccountSVG = document.getElementById('svg-createaccount');
	const logoutText = document.getElementById('logout');
	const logoutSVG = document.getElementById('svg-logout');

	// If we're logged in, the log in button will change to their profile,
	// and create account will change to log out...

	function getOurUsername() {
		return username;
	}

	/**
	 * Inits our token, and, if we're logged in, inits member, and changes navigation links if we're logged in.
	 * 
	 * If we're not signed in, the server will give/renew us a browser-id cookie for validating our identity.
	 * 
	 * @returns {Promise<void>} Resolves when the token refresh process is complete.
	 */
	async function refreshToken() {
		reqIsOut = true;
		let OK = false;
		
		try {
			const response = await fetch('/refresh');
			OK = response.ok;

			const result = await response.json();

			if (OK) { // Refresh token (from cookie) accepted!
				// token = getCookieValue('token'); // The access token is provided in this cookie, with a 10-second expiry time
				username = result.member;
			} else { // Unauthorized, don't change any navigation links. Should have given us a browser-id!
				console.log(`Server: ${result.message}`);
			}

			// Delete the token cookie after reading it, so it doesn't bleed
			// into future page refreshes, even after we have logged out
			deleteCookie('token');
			updateNavigationLinks();
		} catch (error) {
			// Handle the error
			console.error('Error occurred during refreshing of token:', error);
			// Optionally set areLoggedIn to false or perform other error handling logic here
		} finally {
			reqIsOut = false;
			// Grey the background of the profile button if we are viewing our profile AND are logged in
			if (window.location.pathname.startsWith("/member") && getLastSegmentOfURL() === username.toLowerCase()) loginLink.classList.add('currPage');
		}
	}


	/**
     * This function will not return until our initial request for an access token,
     * to see if we're logged in, is back.
     */
	async function waitUntilInitialRequestBack() {
		while (reqIsOut) {
			await new Promise(resolve => setTimeout(resolve, 100));
		}
	}

	/**
     * Changes the navigation links, depending on if we're logged in, to
     * go to our Profile or the Log Out route, or the Log In / Create Account pages.
     */
	function updateNavigationLinks() {
		if (username) { // Logged in
			loginText.classList.add('hidden');
			loginSVG.classList.add('hidden');
			createaccountText.classList.add('hidden');
			createaccountSVG.classList.add('hidden');
			profileText.classList.remove('hidden');
			profileSVG.classList.remove('hidden');
			logoutText.classList.remove('hidden');
			logoutSVG.classList.remove('hidden');

			loginLink.href = addLngQueryParamToLink(`/member/${username.toLowerCase()}`);
			createaccountLink.href = addLngQueryParamToLink('/logout');
		} else { // Not logged in
			profileText.classList.add('hidden');
			profileSVG.classList.add('hidden');
			logoutSVG.classList.add('hidden');
			logoutText.classList.add('hidden');
			loginText.classList.remove('hidden');
			loginSVG.classList.remove('hidden');
			createaccountText.classList.remove('hidden');
			createaccountSVG.classList.remove('hidden');

			loginLink.href = addLngQueryParamToLink('/login');
			createaccountLink.href = addLngQueryParamToLink('/createaccount');
		}

		// Manually dispatch a window resize event so that our javascript knows to
		// recalc the spacing/compactness of the header, as the items have changed their content.
		const resizeEvent = new Event('resize');
		window.dispatchEvent(resizeEvent);
	}

	/**
     * Modifies the given URL to include the "lng" query parameter based on the i18next cookie.
     * @param {string} href - The original URL.
     * @returns {string} The modified URL with the "lng" query parameter.
     */
	function addLngQueryParamToLink(href) {
		// Get the value of the i18next cookie
		const lng = getCookieValue('i18next');
		if (!lng) return href;
    
		// Create a URL object from the given href
		const url = new URL(href, window.location.origin);
    
		// Add or update the "lng" query parameter
		url.searchParams.set('lng', lng);
    
		// Return the modified URL as a string
		return url.toString();
	}

	/**
     * Adds the "lng" query parameter to all navigation links.
	 * 
     */
	(function addLngToNavLinks() {
		const lng = getCookieValue('i18next');
		if (!lng) return;
    
		const navLinks = document.querySelectorAll('nav a');
		navLinks.forEach(link => {
			link.href = addLngQueryParamToLink(link);
		});

		/** Adds the "lng" query parameter to the ToS link at the bottom, if it exists (it doesn't on the play page) */
		toslink: {
			const element_toslink = document.getElementById("toslink");
			if (!element_toslink) break toslink;
			element_toslink.href = addLngQueryParamToLink(element_toslink);
		}
	})();

	/**
     * This is called when a web socket connection closes due
     * to us logging out, this updates the header bar hyperlinks.
     */
	function onLogOut() {
		username = undefined;
		updateNavigationLinks();
	}

	/**
     * Deletes a document cookie.
     * @param {string} cookieName - The name of the cookie you would like to delete.
     */
	function deleteCookie(cookieName) {
		document.cookie = cookieName + '=; Max-Age=-99999999;';  
	}
	
	/**
	 * Gets the last segment of the current URL without query parameters.
	 * @returns {string} - The last segment of the URL.
	 */
	function getLastSegmentOfURL() {
		const url = new URL(window.location.href);
		const pathname = url.pathname;
		const segments = pathname.split('/');
		return segments[segments.length - 1] || segments[segments.length - 2]; // Handle situation if trailing '/' is present
	}

	// function removeQueryParamsFromLink(link) {
	// 	const url = new URL(link, window.location.origin);
	// 	// Remove query parameters
	// 	url.search = '';
	// 	return url.toString();
	// }

	/**
	 * Creates a checkerboard pattern image of a given size with custom colors.
	 * @param {string} lightColor - The color for the light squares (CSS color format).
	 * @param {string} darkColor - The color for the dark squares (CSS color format).
	 * @param {number} imageSize - The size of the image (width and height). The final image will be imageSize x imageSize, split into 4 squares.
	 * @returns {Promise<HTMLImageElement>} A promise that resolves to the checkerboard image.
	 */
	function createCheckerboardIMG(lightColor, darkColor, imageSize = 2) {
		const canvas = document.createElement('canvas');
		canvas.width = imageSize;
		canvas.height = imageSize;
		const ctx = canvas.getContext('2d');

		// Define the size of each square
		const squareSize = imageSize / 2;

		// Top-left (light square)
		ctx.fillStyle = lightColor;
		ctx.fillRect(0, 0, squareSize, squareSize);

		// Top-right (dark square)
		ctx.fillStyle = darkColor;
		ctx.fillRect(squareSize, 0, squareSize, squareSize);

		// Bottom-left (dark square)
		ctx.fillStyle = darkColor;
		ctx.fillRect(0, squareSize, squareSize, squareSize);

		// Bottom-right (light square)
		ctx.fillStyle = lightColor;
		ctx.fillRect(squareSize, squareSize, squareSize, squareSize);

		// Convert to an image element
		const img = new Image();
		img.src = canvas.toDataURL();

		// Return a promise that resolves when the image is loaded
		return new Promise((resolve, reject) => {
			img.onload = () => { resolve(img); };
			img.onerror = () => {
				console.error('Error loading the image!', img);
				reject(new Error('Error loading the checkerboard texture'));
			};
		});
	}

	refreshToken();

	// Export these methods to be used by other scripts
	return Object.freeze({
		refreshToken,
		waitUntilInitialRequestBack,
		getOurUsername,
		onLogOut,
		createCheckerboardIMG,
	});
})();



/**
 * Searches the document for the specified cookie, and returns it if found.
 * @param {string} cookieName The name of the cookie you would like to retrieve.
 * @returns {string | undefined} The cookie, if it exists, otherwise, undefined.
 */
function getCookieValue(cookieName) {
	const cookieArray = document.cookie.split("; ");
	
	for (let i = 0; i < cookieArray.length; i++) {
		const cookiePair = cookieArray[i].split("=");
		if (cookiePair[0] === cookieName) return cookiePair[1];
	}
}