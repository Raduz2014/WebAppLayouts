var callback = function () {
    var menuItems = document.querySelector(".scrollmenu");


    menuItems.addEventListener("click", menuClickEvent, false);
    function menuClickEvent(e) {
        console.log("menu click", e)
        if (e.target !== e.currentTarget) {
            //(De)Select item menu
            var currentActive = document.getElementsByClassName("active");
                var cid = currentActive[0].id;
                currentActive[0].className = currentActive[0].className.replace("active", "").trim();


                var currentPage = document.getElementById(cid + "-page")
                if (currentPage !== null) {
                    var cdisp = currentPage.style.display;
                    if (cdisp === "block") currentPage.style.display = "none";
                }
                e.target.className += " active";


                var selectedPage = document.getElementById(e.target.id + "-page")
                if (selectedPage !== null) {
                    var seldisp = selectedPage.style.display;
                    if (seldisp !== null) selectedPage.style.display = "block";
                }
           

            switch (e.target.id) {
                case "home":

                    break;
                case "alarm":
                    break;
                case "analyse":
                    break;
                case "device":
                    break;
                case "map":
                    break;
                default:
                    break;
            }
        }

        e.stopPropagation();
    }
};

if (
    document.readyState === "complete" ||
    (document.readyState !== "loading" && !document.documentElement.doScroll)
) {
    callback();
} else {
    document.addEventListener("DOMContentLoaded", callback);
}
