var Consts = {
    //FRAME types
    MBUS_FRAME_TYPE_ANY : 0x00,
    MBUS_FRAME_TYPE_ACK : 0x01,
    MBUS_FRAME_TYPE_SHORT : 0x02,
    MBUS_FRAME_TYPE_CONTROL : 0x03,
    MBUS_FRAME_TYPE_LONG : 0x04,

    //DATA RECORDS
    MBUS_DIB_DIF_WITHOUT_EXTENSION: 0x7F,
    MBUS_DIB_DIF_EXTENSION_BIT: 0x80,
    MBUS_DIB_VIF_WITHOUT_EXTENSION: 0x7F,
    MBUS_DIB_VIF_EXTENSION_BIT: 0x80,
    MBUS_DIB_DIF_MANUFACTURER_SPECIFIC: 0x0F,
    MBUS_DIB_DIF_MORE_RECORDS_FOLLOW: 0x1F,
    MBUS_DIB_DIF_IDLE_FILLER: 0x2F,

    MBUS_DATA_RECORD_DIF_MASK_INST: 0x00,
    MBUS_DATA_RECORD_DIF_MASK_MIN: 0x10,
    MBUS_DATA_RECORD_DIF_MASK_TYPE_INT32: 0x04,
    MBUS_DATA_RECORD_DIF_MASK_DATA: 0x0F,
    MBUS_DATA_RECORD_DIF_MASK_FUNCTION: 0x30,
    MBUS_DATA_RECORD_DIF_MASK_STORAGE_NO: 0x40,
    MBUS_DATA_RECORD_DIF_MASK_EXTENTION: 0x80,
    MBUS_DATA_RECORD_DIF_MASK_NON_DATA: 0xF0,

    MBUS_DATA_RECORD_DIFE_MASK_STORAGE_NO: 0x0F,
    MBUS_DATA_RECORD_DIFE_MASK_TARIFF: 0x30,
    MBUS_DATA_RECORD_DIFE_MASK_DEVICE: 0x40,
    MBUS_DATA_RECORD_DIFE_MASK_EXTENSION: 0x80,

    //VARIABLE DATA FLAGS
    MBUS_FRAME_DATA_LENGTH: 252,
    MBUS_DATA_VARIABLE_HEADER_LENGTH: 12,

    //Frame start/stop bits
    MBUS_FRAME_ACK_START : 0xE5,
    MBUS_FRAME_SHORT_START : 0x10,
    MBUS_FRAME_CONTROL_START : 0x68,
    MBUS_FRAME_LONG_START : 0x68,
    MBUS_FRAME_STOP : 0x16,

    //Control fields
    MBUS_CONTROL_MASK_DIR : 0x40,
    MBUS_CONTROL_MASK_DIR_M2S : 0x40,
    MBUS_CONTROL_MASK_DIR_S2M: 0x00,
    MBUS_CONTROL_INFO_RESP_VARIABLE: 0x72,
    MBUS_CONTROL_INFO_RESP_VARIABLE_MSB: 0x76,
}
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
            'alarm': function () {
                console.log("alarm module");

                function formatHexStr(hexstr) {
                    var dest = []
                    for (var xx = 0; xx < hexstr.length; xx++) {
                        if (xx % 2 === 0) dest.push(hexstr.substr(xx, 2))
                    }
                    return dest.join(':');
                }

                function getBase16Str(dec) {
                    return dec.toString(16);
                }

                var inputMbusMsg = document.getElementById("mbusMessages");

                var MBusParser = {
                    messageStrHex: [],
                    messageBytes: [],
                    data_size: 0,
                    data_block:[],
                    MbusData: {
                        body: {
                            header: {
                                access_no:0,
                                identification: "",
                                manufacturer:"",
                                medium:"",
                                sign:"",
                                status:"",
                                type:"",
                                version:"",
                            },
                            records:[],
                        },
                        head: {
                            a:"",
                            c: "",
                            crc: "",
                            length: "",
                            start: "",
                            stop: "",
                        }
                    },

                    drh:{
                        dib: {
                            dif: {
                                extBit: 0,
                                lsbStorageNo: 0,
                                FuncField: 0,
                                DataField:0
                            },
                            dife: "0x00",
                        },
                        vib: {
                            vif: "0x00",
                            vife: "0x00"
                        }
                    },

                    mbusRecord: {
                        function:"",
                        type:"",
                        unit:"",
                        value:"",
                    },

                    payload: [],
                    init: function (mbusmsg) {
                        if (mbusmsg.length == 1) {
                            var aaa = [];
                            if (mbusmsg[0].length % 2 === 0) {
                                for (var xx = 0 ; xx < mbusmsg[0].length; xx++) {
                                    if (xx % 2 === 0) {
                                        aaa.push(mbusmsg[0].substr(xx,2));
                                    }
                                }
                                this.messageStrHex = aaa;
                                console.log(this.messageStrHex)

                            }
                        }
                        else { this.messageStrHex = mbusmsg }
                        return this;
                    },
                    validate: function () {
                        var frmLen1 = this.messageStrHex[1];
                        var frmLen2 = this.messageStrHex[2];
                        if (frmLen1 === frmLen2) {
                            //we have a valid mbus telegram and next check the crc
                            var crcsum = 0;
                            for (var ii = 0; ii < this.payload.length; ii++) {
                                crcsum += parseInt(this.payload[ii], 16)
                            }
                            var crcSumHex = crcsum.toString(16).slice(-2).toLowerCase();

                            var frameCRC = this.messageStrHex[this.messageStrHex.length - 2].toLowerCase();
                            if (crcSumHex === frameCRC) {
                                return true;
                            }
                        }
                       
                        return false;
                    },

                    bcdToNumber: function(identNoArr){
                        var idNo = 0, len = identNoArr.length;
                        if (len === 4) {
                            for (var x = 0; x < len; x++) {
                                var decIDNo = parseInt(identNoArr[x], 16);
                                var fisrtGrp = decIDNo >> 4;
                                var lastGrp = decIDNo & 0x0f;
                                var val = fisrtGrp * 10 + lastGrp;
                                switch(x){
                                    case 0:
                                        idNo = idNo + val * 1000;
                                        break;
                                    case 1:
                                        idNo = idNo + val * 100;
                                        break;
                                    case 2:
                                        idNo = idNo + val * 10;
                                        break;
                                    case 3:
                                        idNo = idNo + val;
                                        break;
                                }                                
                            }
                            
                            console.log("BCD CONV RES:", idNo);

                            return idNo;
                        }
                    },                    

                    parse: function(){
                        console.log(this.messageStrHex);
                       

                        if (this.messageStrHex[0] === '68') {
                            //We have a LongFrame type
                            var payloadLen = parseInt(this.messageStrHex[1], 16);
                            var lenmsgHex = this.messageStrHex.length;
                            this.payload = this.messageStrHex.slice(4, lenmsgHex-2);

                            var valid = this.validate()
                            if (valid == true) {
                                console.log("frame OK");
                                this.MbusData.head.c = "0x" + this.messageStrHex[4];
                                this.MbusData.head.a = "0x" + this.messageStrHex[5];
                                this.MbusData.head.crc = "0x" + this.messageStrHex[this.messageStrHex.length - 2];
                                this.MbusData.head.start = "0x" + this.messageStrHex[0];
                                this.MbusData.head.length = "0x" + this.messageStrHex[1];
                                this.MbusData.head.stop = "0x" + this.messageStrHex[this.messageStrHex.length-1];

                                this.MbusData.body.header.access_no = ''
                                this.MbusData.body.header.manufacturer = ''
                                this.MbusData.body.header.medium = ''
                                this.MbusData.body.header.sign = ''
                                this.MbusData.body.header.status = ''
                                this.MbusData.body.header.type = "0x" + this.messageStrHex[6];                                

                                if (this.MbusData.body.header.type === "0x72") {
                                    this.data_size = parseInt(this.messageStrHex[1], 16)-3;

                                    //if (this.data_block.length > Consts.MBUS_DATA_VARIABLE_HEADER_LENGTH) {
                                        this.MbusData.body.header.identification = this.messageStrHex.slice(7, 11).reverse().map(function (it) { return "0x" + it });
                                        var byteArray = this.messageStrHex.slice(11, 13).map(function (d) { return parseInt(d, 16) })
                                        var IDNo = myutils.byteArrayToLong(byteArray);
                                        this.MbusData.body.header.manufacturer = myutils.decode_manufacture(IDNo);
                                        this.MbusData.body.header.version = "0x" + this.messageStrHex[13];
                                        this.MbusData.body.header.medium = "0x" + this.messageStrHex[14];
                                        this.MbusData.body.header.access_no = parseInt(this.messageStrHex[15], 16);
                                        this.MbusData.body.header.status = "0x" + this.messageStrHex[16];
                                        this.MbusData.body.header.sign = this.messageStrHex.slice(16, 18).map(function (it) { return "0x" + it });
                                    this.data_block = this.messageStrHex.slice(19, -2);

                                    var lenUserData = this.data_block.length;
                                    var kDataBlock_Counter = lenUserData;
                                    for (var jj = 0; jj < lenUserData; jj++) {

                                    }
                                    
                                    console.log("data_block", this.data_block)
                                }
                                //if (this.cField == "08") {
                                //    //we have a response frame: RSP_UD
                                //    if (this.ciField === "72") {
                                //        //variable data respond
                                //        var idNoArr = this.payload.slice(3, 3 + 4);
                                //        console.log(idNoArr)

                                //        this.IDNumber = this.bcdToNumber(idNoArr)
                                //    }
                                //}
                                console.log(JSON.stringify(this.MbusData, null, 10));
                            }
                            else {
                                console.log("frame INVALID")

                            }
                        }
                    }
                }

                //inputMbusMsg.value = "688e8e6808007200000000824d070e030000000c78724270000f034600451108a75e6f00f7000000f2f4aa901200007f001606a901000027328420083935323938304442373149208d050000000000000080000000808080808080808080fb000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000cb16";
                inputMbusMsg.value = "68 56 56 68 08 01 72 23 15 01 09 77 04 14 07 25 00 00 00 0C 78 23 15 01 09 0D 7C 08 44 49 20 2E 74 73 75 63 0A 35 35 37 36 37 30 41 4C 39 30 04 6D 1A 0E CD 13 02 7C 09 65 6D 69 74 20 2E 74 61 62 D4 09 04 13 1F 00 00 00 04 93 7F 00 00 00 00 44 13 1F 00 00 00 0F 00 01 1F A9 16";
                var btnParse = document.getElementById("btnParseMsg");
                var logParser = document.getElementById("messageResults");

                document.addEventListener("click", function (e) {
                    if (e.target.id == "btnParseMsg") {

                        //var arrStr = formatHexStr(inputMbusMsg.value).split(':');
                        var arrStr = inputMbusMsg.value.split(' ');
                        
                        //if (arrStr[0] == '68') {
                        //    var payloadLen = parseInt(arrStr[1], 16);
                        //    var payload = arrStr.slice(4, arrStr.length - 2);
                        //    var crc = arrStr[arrStr.length - 2].toLowerCase();
                        //    //cslv nre crc of payload
                        //    var crcsum = 0;
                        //    for (var ii = 0; ii < payload.length; ii++) {
                        //        crcsum += parseInt(payload[ii],16)
                        //    }
                        //    var crcsumHexLastOct = crcsum.toString(16).slice(-2);
                        //    logParser.value = crcsumHexLastOct;
                        //    if (crc === crcsumHexLastOct) {
                        //        //logParser.value = payload;
                        //        var cfield = parseInt(payload[0],16) & 0xff;
                        //        var afield = parseInt(payload[1], 16) & 0xff;
                        //        var cifield = parseInt(payload[2], 16) & 0xff;
                        //        console.log('CField', getBase16Str(cfield));
                        //        console.log('AField', getBase16Str(afield));
                        //        console.log('CIField', getBase16Str(cifield));
                        //        switch (cfield) {
                        //            case 8:
                        //                //RSP_UD
                        //                if (cifield.toString(16) === "72") {
                        //                    var dataPayload = payload.splice(3, payload.length)                                            
                        //                    //process FDH
                        //                    var fixDataHeader = dataPayload.splice(0, 12);
                        //                    console.log('Activ data fix data header', fixDataHeader);
                        //                    var mbusIfaceIdNo = fixDataHeader.splice(0, 4);
                        //                    var manufactureID = fixDataHeader.splice(0, 2);
                        //                    var version = fixDataHeader.splice(0, 1);
                        //                    var medium = fixDataHeader.splice(0, 1);
                        //                    var accessNo = fixDataHeader.splice(0, 1);
                        //                    var mbusIfaceStatus = fixDataHeader.splice(0, 1);
                        //                    var signature = fixDataHeader.splice(0, 2);
                        //                    console.log('FDH:>>mbusIfaceIdNo', mbusIfaceIdNo);
                        //                    console.log('FDH:>>manufacureID', manufactureID);
                        //                    console.log('FDH:>>version', medium);
                        //                    console.log('FDH:>>meter medium', accessNo);
                        //                    console.log('FDH:>>access no', mbusIfaceStatus);
                        //                    console.log('FDH:>>signature', signature);
                        //                    //process dara records
                        //                    console.log('Variable data records', dataPayload);
                        //                    //DIF
                        //                    var dif = parseInt(dataPayload[0], 16);
                        //                    //exists DIFE byte
                        //                    var extbit = dif & 0x80;
                        //                    if (extbit == 0) {
                        //                        console.log("no Extension bit")
                        //                    }
                        //                    var codigOfData = dif & 0x0f;
                        //                    switch (codigOfData) {
                        //                        case 1:
                        //                            console.log("8 bit Integer");
                        //                            break;
                        //                        case 2:
                        //                            console.log("16 bit Integer");
                        //                            break;
                        //                        case 3:
                        //                            console.log("24 bit Integer");
                        //                            break;
                        //                        case 4:
                        //                            console.log("32 bit Integer");
                        //                            break;
                        //                        case 8:
                        //                            console.log("48 bit Integer");
                        //                            break;
                        //                        case 9:
                        //                            console.log("64 bit Integer");
                        //                            break;
                        //                        case 12:
                        //                            console.log("8 digit BCD");
                        //                            break;
                        //                        case 13:
                        //                            console.log("Variable length");
                        //                            break;
                        //                    }
                        //                    //var dif = dif & 0x80;
                        //                    console.log('DIF', codigOfData.toString(2));
                        //                    logParser.value = dataPayload;
                        //                }
                        //                break;
                        //        }                                
                        //    }
                        //    else {
                        //        logParser.value = "CRC is not the same";
                        //    }
                        //}

                        var mbusParser1 = Object.create(MBusParser);
                        mbusParser1.init(arrStr).parse();
                        //logParser.value = formatHexStr(inputMbusMsg.value);
                    }
                    e.stopPropagation();
                });

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
