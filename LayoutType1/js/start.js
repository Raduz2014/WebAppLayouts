var callback = function () {
    var menuItems = document.querySelector(".scrollmenu");
    menuItems.addEventListener("click", menuClickEvent, false);

    function unselectActivePage(page) {
        //hide default page
        var defaultPage = document.getElementById("default-page");
        if (defaultPage !== null) {
            var cdisp = defaultPage.style.display;
            if (cdisp === "block") defaultPage.style.display = "none";
        }

        var currentPage = document.getElementById(page + "-page");
        if (currentPage !== null) {
            var cdisp = currentPage.style.display;
            if (cdisp === "block") currentPage.style.display = "none";
        }
    }

    function selectPage(page) {
        var selectedPage = document.getElementById(page + "-page")
        if (selectedPage !== null) {
            var seldisp = selectedPage.style.display;
            if (seldisp !== null) selectedPage.style.display = "block";
        }
    }

    function getActivePage() {
        var currActiveMenu = document.getElementsByClassName("active");
        return currActiveMenu[0].id;
    }

    function menuClickEvent(e) {
        if (e.target !== e.currentTarget) {
            //(De)Select item menu
            var currentActive = document.getElementsByClassName("active");
            var cid = currentActive[0].id;
            currentActive[0].className = currentActive[0].className.replace("active", "").trim();

            unselectActivePage(cid);
              
            e.target.className += " active";

            switch (e.target.id) {
                case "home":
                    selectPage("home");
                    break;
                case "alarm":
                    selectPage("alarm");
                    break;
                case "analyse":
                    selectPage("analyse");
                    break;
                case "device":
                    selectPage("device");
                    break;
                case "map":
                    selectPage("map");
                    break;
                default:
                    selectPage("default");
                    break;
            }

            RunModules(e.target.id);

        }

        e.stopPropagation();
    }

    function RunModules(page) {
        var fn;

        var Modules = {
            'home': function () {
                console.log("home module")
                var context;
                var x = 0;
                var y = 0;
                var width = 850;
                var height = 640;
                var imageObj = new Image();

                function InitContext() {
                    var $canvasDiv = document.querySelector('#canvasdiv');
                    context = mycanvas.getContext('2d');


                    var canvas = document.getElementById("mycanvas");
                    canvas.height = $canvasDiv.clientHeight;
                    canvas.width = $canvasDiv.clientWidth;

                    imageObj.onload = function () {
                        context.drawImage(imageObj, x, y, width, height);
                    };
                    imageObj.src = '../img/diagrama_zona_1.JPG';
                }

                InitContext();

                window.addEventListener("resize", resizeCanvas, false);

                function resizeCanvas(e) {
                    var myCanvas = document.getElementById("mycanvas");
                    var $canvasDiv = document.querySelector('#canvasdiv');

                    myCanvas.width = $canvasDiv.clientWidth;
                    myCanvas.height = $canvasDiv.clientHeight;
                }

                    return null
            },
            'alarm': function () {
                console.log("alarm module")

                return null;
            },
            'default': function () {
                console.log("default module")

                return null;
            }
        }

        if (Modules[page]) {
            fn = Modules[page];
        }
        else {
            fn = Modules['default'];
        }

        return fn();
    }

    RunModules(getActivePage());
};

if (
    document.readyState === "complete" ||
    (document.readyState !== "loading" && !document.documentElement.doScroll)
) {
    callback();
} else {
    document.addEventListener("DOMContentLoaded", callback);
}
