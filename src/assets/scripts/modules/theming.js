function getCurrentTheme() {
    let ret;
    document.body.classList.forEach((value, key, listObj) => {
        if(value.startsWith("theme")) { 
            ret = value.replace("theme-", ""); 
        };
    }); 
    return ret; 
};

function setTheme(c, n) {
    document.querySelectorAll(".set-theme").forEach(item => { item.style.display = 'none'; });
    document.querySelector(".set-theme-" + n).style.display = 'inline-block';
    document.body.classList.remove("theme-" + c);
    document.body.classList.add("theme-" + n);
    localStorage.setItem("theme", n);
}

let currentTheme = getCurrentTheme();
let storedTheme = localStorage.getItem("theme");

document.querySelectorAll('.set-theme').forEach(item => {
    let newTheme = item.getAttribute("href").replace("#","");
    item.addEventListener('click', event => {
        event.preventDefault();

        // TODO: TEMPORARY HACK, UNTIL I KNOW HOW TO CALL drawSparklines() DUE TO MINIFYING;
        // currentTheme = getCurrentTheme();
        // setTheme(currentTheme, newTheme);
        localStorage.setItem("theme", newTheme);
        window.location.reload();
    });
});

setTheme(currentTheme, ((storedTheme) ? storedTheme : currentTheme));
