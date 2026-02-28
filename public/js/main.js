/*
    Function to set up a system tray menu with options specific to the window mode.
    This function checks if the application is running in window mode, and if so,
    it defines the tray menu items and sets up the tray accordingly.
*/
function setTray() {
    // Define tray menu items
    let tray = {
        title: "TorGUI",
        icon: "/resources/icons/trayIcon.png",
        menuItems: [
            { id: "SHOW", text: "Show" },
            { id: "VERSION", text: "Get version" },
            { id: "SEP", text: "-" },
            { id: "QUIT", text: "Quit" }
        ]
    };

    // Set the tray menu
    Neutralino.os.setTray(tray);
}

/*
    Function to handle click events on the tray menu items.
    This function performs different actions based on the clicked item's ID,
    such as displaying version information or exiting the application.
*/
function onTrayMenuItemClicked(event) {
    switch (event.detail.id) {
        case "SHOW":
            // Show the application window
            Neutralino.window.show();
            break;
        case "VERSION":
            // Display version information
            Neutralino.os.showMessageBox("Version information",
                `Neutralinojs server: 1`);
            break;
        case "QUIT":
            // Exit the application
            Neutralino.app.exit();
            break;
    }
}

/*
    Function to handle the window close event by gracefully exiting the Neutralino application.
*/
function onWindowClose(event) {
    event.preventDefault(); // Prevent the default close behavior
    Neutralino.window.hide(); // Hide the application window (optional, can be used to minimize to tray instead of closing)
    return false; // Return false to prevent the default close behavior and allow for custom handling if needed
}

Neutralino.events.on("trayMenuItemClicked", onTrayMenuItemClicked);
Neutralino.events.on("trayClicked", () => {
    // Optional: Handle tray icon click if needed
    console.log("Tray icon clicked");
    return false; // Return false to prevent default behavior if necessary
});
Neutralino.events.on("windowClose", onWindowClose);

// Display app information
setTray();
// showInfo();
