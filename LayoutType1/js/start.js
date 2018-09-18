
var myutils = (function () {
    function byteArrayToLong(/*byte[]*/byteArray) {
        var value = 0;
        for (var i = byteArray.length - 1; i >= 0; i--) {
            value = (value * 256) + byteArray[i];
        }

        return value;
    }

    function longToByteArray(/*long*/long) {
        // we want to represent the input as a 8-bytes array
        var byteArray = [0, 0, 0, 0, 0, 0, 0, 0];

        for (var index = 0; index < byteArray.length; index++) {
            var byte = long & 0xff;
            byteArray[index] = byte;
            long = (long - byte) / 256;
        }

        return byteArray;
    }

    function decode_manufacture(m_id) {
        return String.fromCharCode(((m_id >> 10) & 0x001F) + 64) +
               String.fromCharCode(((m_id >> 5) & 0x001F) + 64) +
               String.fromCharCode(((m_id) & 0x001F) + 64);
    }

    return {
        byteArrayToLong: byteArrayToLong,
        longToByteArray: longToByteArray,
        decode_manufacture: decode_manufacture,
    }
})();

var loadJS = function (url, _onCompleteCallback, location) {
    var scripts = document.scripts;
    var exists = false;
    var x;
    for (x in scripts) {
        if (scripts[x].src && scripts[x].src.indexOf(url) > -1) {
            exists = true;
            break;
        }
    }

    if (!exists) {
        var scriptTag = document.createElement('script');
        scriptTag.src = url;
        scriptTag.type = "text/javascript";
        scriptTag.onload = _onCompleteCallback;
        scriptTag.onreadystatechange = _onCompleteCallback;

        location.appendChild(scriptTag);
    }
};
//loadJS('yourcode.js', yourCodeToBeCalled, document.head)

var callback = function () {
    var menuItems = document.querySelector("#appNav");
    //menuItems.addEventListener("click", menuClickEvent, false);
    let oldUrl = location.hre,
        oldHash = location.hash;

    if ("onhashchange" in window) {
        window.onhashchange = appHashChange
    }

    function appHashChange() {
        console.log("hash change")
        let newUrl = location.href,
            newHash = location.hash;

        if (newHash != oldHash) {
            render(decodeURI(window.location.hash));
        }
    }

    function render(url){
        let temp = url.split('/')[0];
        temp = (temp === "") ? "#home" : temp;
        console.log("render", temp);        

        var allPages = document.querySelectorAll(".main-content .page.visible");
        if (allPages.length > 0) {
            for (let p = 0; p < allPages.length; p++) {
                if (allPages[p].className.indexOf("visible") > -1) {
                    allPages[p].classList.remove("visible");
                    allPages[p].classList.add("hide");
                }
            }
        }

        var activMenus = document.querySelectorAll("div.overlay-content > div.appMenuItem.selected");
        if (activMenus.length > 0) {
            for (let p = 0; p < activMenus.length; p++) {
                if (activMenus[p].className.indexOf("selected") > -1) {
                    activMenus[p].classList.remove("selected");
                }
            }
        }
               
        var map = {
            //home page
            '#home': function () {
                renderHomePage();
            },
            //map page
            '#map': function () {
                renderMapPage();
            },
            //datacollect page
            '#datacollect': function () {
                renderDataCollectPage();
            },
            //map page
            '#drawing': function () {
                renderDrawPage();
            },
            //myapps page
            '#myapps': function () {
                renderMyAppsPage();
            },
            //network page
            '#network': function () {
                renderNetworkPage();
            },
        };

        // Execute the needed function depending on the url keyword (stored in temp).
        if (map[temp]) {
            map[temp]();
        }
            // If the keyword isn't listed in the above - render the error page.
        else {
            renderErrorPage();
        }

        closeNav();
    }

    function renderHomePage() {
        var page = document.querySelectorAll("#home-page");
        page[0].classList.remove("hide");
        page[0].classList.add("visible");

        var selectMenu = document.querySelectorAll("div.overlay-content > div.appMenuItem[id=home]");
        selectMenu[0].classList.add("selected");

        loadJS('js/home_module.js', _cb, document.head);
        function _cb() {
            HomeModule.init();
        }
    }

    function renderMapPage() {
        var page = document.querySelectorAll("#map-page");
        page[0].classList.remove("hide");
        page[0].classList.add("visible");
        var selectMenu = document.querySelectorAll("div.overlay-content > div.appMenuItem[id=map]");
        selectMenu[0].classList.add("selected");
    }

    function renderNetworkPage() {
        var page = document.querySelectorAll("#network-page");
        page[0].classList.remove("hide");
        page[0].classList.add("visible");
        var selectMenu = document.querySelectorAll("div.overlay-content > div.appMenuItem[id=network]");
        selectMenu[0].classList.add("selected");
    }

    function renderMyAppsPage() {
        var page = document.querySelectorAll("#myapps-page");
        page[0].classList.remove("hide");
        page[0].classList.add("visible");
        var selectMenu = document.querySelectorAll("div.overlay-content > div.appMenuItem[id=myapps]");
        selectMenu[0].classList.add("selected");

        loadJS('js/MbusParser.js', _cb, document.head);
        function _cb() {
            console.log("MbusParser.js script loaded");
            MBusParserModule.init();
        }
    } 

    function renderDrawPage() {
        var page = document.querySelectorAll("#drawing-page");
        page[0].classList.remove("hide");
        page[0].classList.add("visible");

        var selectMenu = document.querySelectorAll("div.overlay-content > div.appMenuItem[id=drawing]");
        selectMenu[0].classList.add("selected");

        loadJS('js/drawing_module.js', _cb, document.head);
        function _cb() {
            DrawingModule.init();
        }
    }

    function renderDataCollectPage() {
        var page = document.querySelectorAll("#datacollect-page");
        page[0].classList.remove("hide");
        page[0].classList.add("visible");

        var selectMenu = document.querySelectorAll("div.overlay-content > div.appMenuItem[id=datacollect]");
        selectMenu[0].classList.add("selected");
    }

    function renderErrorPage() {
        var page = document.querySelectorAll("#error-page");
        page[0].classList.remove("hide");
        page[0].classList.add("visible");
    }

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
            if (seldisp !== null) {
                selectedPage.style.display = "block";
            }
        }
    }

    function getActivePage() {
        var currActiveMenu = document.getElementsByClassName("selected");
        return currActiveMenu[0].id;
    }

    function menuClickEvent(e) {
        var targetImg = e.target.className.indexOf("icon") > -1,
            targetItemDiv = e.target.className.indexOf("appMenuItem") > -1;

        if (e.target !== e.currentTarget && (targetImg || targetItemDiv)) {
            //(De)Select item menu
            var currentActive = document.getElementsByClassName("selected");
            var cid = currentActive[0].id;
            currentActive[0].className = currentActive[0].className.replace("selected", "").trim();

            //unselectActivePage(cid);
              
            //let mid = e.target.id,
            //    tmpTarget;
            //if(mid == "") {
            //    tmpTarget = e.target.parentNode;
            //}else{
            //    tmpTarget = e.target;
            //}
            //mid = tmpTarget.id;
            //tmpTarget.className += " selected";           

            //switch (mid) {
            //    case "home":
            //        selectPage("home");
            //        break;
            //    case "datacollect":
            //        selectPage("datacollect");
            //        break;
            //    case "drawing":
            //        selectPage("drawing");
            //        break;
            //    case "myapps":
            //        selectPage("myapps");
            //        break;
            //    case "network":
            //        selectPage("network");
            //        break;
            //    case "map":
            //        selectPage("map");
            //        break;
            //    case "myreactapp":
            //        selectPage("myreactapp")
            //        break;
            //    default:
            //        selectPage("default");
            //        break;
            //}

            //RunModules(mid);
        }

        e.stopPropagation();
        closeNav();
    }

    function RunModules(page) {
        var fn;
        //selectPage(page);
        var Modules = {
            'home': function () {
                loadJS('js/home_module.js', _cb, document.head);
                function _cb() {
                    HomeModule.init();
                }
            },
            'drawing': function () {
                loadJS('js/drawing_module.js', _cb, document.head);
                function _cb() {
                    DrawingModule.init();
                }              
                return;
            },
            'myapps': function () {
                loadJS('js/MbusParser.js', _cb, document.head);
                function _cb() {
                    console.log("MbusParser.js script loaded");
                    MBusParserModule.init();
                }
                return;
            },
            'myreactapp': function () {
                loadJS('js/MyReactApp.js', _cb, document.head);
                function _cb() {
                    console.log("MyReactApp.js script loaded");
                    ReactAppModule.init();
                }
                return;
            },
            'default': function () {
                loadJS('js/default_module.js', _cb, document.head);
                function _cb() {
                    DefaultModule.init();
                }
                return;
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

    location.hash = "#";

    //RunModules(getActivePage());
};

if (
    document.readyState === "complete" ||
    (document.readyState !== "loading" && !document.documentElement.doScroll)
) {
    callback();
} else {
    document.addEventListener("DOMContentLoaded", callback);
}


function openNav() {
    document.getElementById("appNav").style.width = "100%";
}

function closeNav() {
    document.getElementById("appNav").style.width = "0%";
}