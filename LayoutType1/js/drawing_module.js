var DrawingModule = (function () {
    var pageInView = false;

    var context;
    var x = 0;
    var y = 0;
    var width = 850;
    var height = 640;
    var imageObj;
    //imageObj.src = '../img/d.JPG';

    function createImageObj(srcImg) {
        var img = new Image();
        img.src = srcImg;
        return img;
    }

    function InitContext() {
        var $canvasDiv = document.querySelector('#canvasdiv');
        context = mycanvas.getContext('2d');

        imageObj = createImageObj('../img/d.jpg');

        var canvas = document.getElementById("mycanvas");
        canvas.height = $canvasDiv.clientHeight;
        canvas.width = $canvasDiv.clientWidth;

        imageObj.onload = function () {
            context.drawImage(imageObj, x, y, canvas.width, canvas.height);
        };
    }

    function resizeCanvas(e) {
        console.log("window resize");
        var pageInView = document.getElementsByClassName("selected")[0].id.indexOf("drawing") > -1 ? true : false;


        if (pageInView) {
            var myCanvas = document.getElementById("mycanvas");
            var $canvasDiv = document.querySelector('#canvasdiv');

            myCanvas.width = $canvasDiv.clientWidth;
            myCanvas.height = $canvasDiv.clientHeight;
            context.drawImage(imageObj, x, y, myCanvas.width, myCanvas.height);
        }
    }

    function init() {
        pageInView = true;
        InitContext();
                
        window.addEventListener("resize", resizeCanvas, false);
    }

    function isPageInView() {
        var pageInView = document.getElementsByClassName("selected")[0].id.indexOf("drawing") > -1 ? true : false;

        return pageInView;
    }

    return {
        init: init,
        isPageInView: isPageInView,
    }
})();