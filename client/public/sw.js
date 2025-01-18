// Listen for the 'push' event
self.addEventListener("push", (event) => {
    if (event.data) {
      // Extract the notification data sent from the backend
      const data = event.data.json();
  
      const options = {
        body: data.body || "You have a new notification!",
        icon: data.icon || "/logo192.png", // Update with your app's icon
        badge: data.badge || "/badge-icon.png", // Optional badge icon
        data: data.url || "/", // Optional data for notification click handling
      };
  
      // Show the notification
      event.waitUntil(
        self.registration.showNotification(data.title || "Notification", options)
      );
    }
  });
  
  // Handle notification click event
  self.addEventListener("notificationclick", (event) => {
    event.notification.close(); // Close the notification
  
    const urlToOpen = event.notification.data || "/"; // URL passed from the notification
  
    // Focus on an existing tab or open a new one
    event.waitUntil(
      clients
        .matchAll({
          type: "window",
          includeUncontrolled: true,
        })
        .then((clientList) => {
          // Check if any tab is already open with the URL
          for (const client of clientList) {
            if (client.url === urlToOpen && "focus" in client) {
              return client.focus();
            }
          }
          // Open a new tab if none is found
          if (clients.openWindow) {
            return clients.openWindow(urlToOpen);
          }
        })
    );
  });
  