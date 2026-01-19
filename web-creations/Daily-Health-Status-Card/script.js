function updateStatus() {
    const healthOptions = [
        "Feeling okay but need rest 😴",
        "Little weak, taking care ❤️‍🩹",
        "Recovering slowly 🌿",
        "Not well today 🤒",
        "Feeling better than morning 🙂"
    ];

    const randomStatus = healthOptions[Math.floor(Math.random() * healthOptions.length)];
    document.getElementById("status").innerText = randomStatus;
}
