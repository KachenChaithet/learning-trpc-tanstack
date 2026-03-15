self.addEventListener("push", function (event) {


    let data

    try {
        data = event.data.json()
    } catch {
        data = { title: "Notification", body: event.data.text(), url: "/" }
    }


    const options = {
        body: data.type,
        icon: "/logos/logoipsum-389.svg",
        data: {
            url: data.link
        }
    }

    event.waitUntil(
        self.registration.showNotification(data.type, options)
    )

})

self.addEventListener("notificationclick", function (event) {

    event.notification.close()

    event.waitUntil(
        clients.openWindow(event.notification.data.url)
    )

})