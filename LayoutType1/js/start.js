
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

            unselectActivePage(cid);
              
            let mid = e.target.id,
                tmpTarget;
            if(mid == "") {
                tmpTarget = e.target.parentNode;
            }else{
                tmpTarget = e.target;
            }
            mid = tmpTarget.id;
            tmpTarget.className += " selected";           

            switch (mid) {
                case "home":
                    selectPage("home");
                    break;
                case "datacollect":
                    selectPage("datacollect");
                    break;
                case "drawing":
                    selectPage("drawing");
                    break;
                case "myapps":
                    selectPage("myapps");
                    break;
                case "network":
                    selectPage("network");
                    break;
                case "map":
                    selectPage("map");
                    break;
                default:
                    selectPage("default");
                    break;
            }

            RunModules(mid);

        }

        e.stopPropagation();
        closeNav();
    }

    function RunModules(page) {
        var fn;
        selectPage(page);
        var Modules = {
            'home': function () {
                console.log("home module")
                var context;
                var x = 0;
                var y = 0;
                var width = 850;
                var height = 640;
                var imageObj = new Image();
                imageObj.src = '../img/d.JPG';


                function InitContext() {
                    var $canvasDiv = document.querySelector('#canvasdiv');
                    context = mycanvas.getContext('2d');


                    var canvas = document.getElementById("mycanvas");
                    canvas.height = $canvasDiv.clientHeight;
                    canvas.width = $canvasDiv.clientWidth;

                    imageObj.onload = function () {
                        context.drawImage(imageObj, x, y, canvas.width, canvas.height);
                    };
                }

                InitContext();

                window.addEventListener("resize", resizeCanvas, false);

                function resizeCanvas(e) {
                    var myCanvas = document.getElementById("mycanvas");
                    var $canvasDiv = document.querySelector('#canvasdiv');

                    myCanvas.width = $canvasDiv.clientWidth;
                    myCanvas.height = $canvasDiv.clientHeight;
                    context.drawImage(imageObj, x, y, myCanvas.width, myCanvas.height);

                }

                    return null
            },
            'myapps': function () {
                console.log("Apps module");
                loadJS('js/MbusParser.js', MyAppsModule, document.head);                
                function MyAppsModule() {
                    console.log("MbusParser.js script loaded");
                    MBusParserModule.initModule();
                }
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


function openNav() {
    document.getElementById("appNav").style.width = "100%";
}

function closeNav() {
    document.getElementById("appNav").style.width = "0%";
}