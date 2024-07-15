{
  const language_picker = document.getElementById("language-picker");

  function getCookieValue(cookieName) {
    const cookieArray = document.cookie.split("; ");

    for (let i = 0; i < cookieArray.length; i++) {
      const cookiePair = cookieArray[i].split("=");
      if (cookiePair[0] === cookieName) {
        return cookiePair[1];
      }
    }
    return undefined;
  }

  function updateCookie(cookieName, value, days) {
    let expires = "";
    if (days) {
      const date = new Date();
      date.setTime(date.getTime() + days * 24 * 60 * 60 * 1000);
      expires = "; expires=" + date.toUTCString();
    }
    document.cookie = cookieName + "=" + (value || "") + expires + "; path=/";
  }

  // Request cookie if doesn't exist
  if (getCookieValue("i18next") === undefined) {
    fetch("/setlanguage", {
      method: "POST",
      credentials: "same-origin",
    }).then((res) => {
      language_picker.value = getCookieValue("i18next");
    });
  } else {
    language_picker.value = getCookieValue("i18next");
  }

  language_picker.addEventListener("change", () => {
    updateCookie("i18next", language_picker.value, 365);
    location.reload();
  });
}
