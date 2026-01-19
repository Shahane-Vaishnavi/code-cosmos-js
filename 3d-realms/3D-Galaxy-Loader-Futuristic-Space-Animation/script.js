// Optional tiny sparkle effect
document.body.addEventListener("mousemove", (e) => {
    const spark = document.createElement("div");
    spark.className = "spark";
    spark.style.left = e.pageX + "px";
    spark.style.top = e.pageY + "px";
    document.body.appendChild(spark);

    setTimeout(() => spark.remove(), 500);
});
