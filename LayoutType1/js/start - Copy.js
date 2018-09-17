var Consts = {
    //FRAME types
    MBUS_FRAME_TYPE_ANY : 0x00,
    MBUS_FRAME_TYPE_ACK : 0x01,
    MBUS_FRAME_TYPE_SHORT : 0x02,
    MBUS_FRAME_TYPE_CONTROL : 0x03,
    MBUS_FRAME_TYPE_LONG : 0x04,

    MBUS_FRAME_ACK_BASE_SIZE           : 1,
    MBUS_FRAME_SHORT_BASE_SIZE         : 5,
    MBUS_FRAME_CONTROL_BASE_SIZE       : 9,
    MBUS_FRAME_LONG_BASE_SIZE          : 9,

    MBUS_FRAME_BASE_SIZE_ACK           : 1,
    MBUS_FRAME_BASE_SIZE_SHORT         : 5,
    MBUS_FRAME_BASE_SIZE_CONTROL       : 9,
    MBUS_FRAME_BASE_SIZE_LONG          : 9,

    MBUS_FRAME_FIXED_SIZE_ACK          : 1,
    MBUS_FRAME_FIXED_SIZE_SHORT        : 5,
    MBUS_FRAME_FIXED_SIZE_CONTROL      : 6,
    MBUS_FRAME_FIXED_SIZE_LONG         : 6,

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

    MBUS_DATA_FIXED_LENGTH  : 16,
    MBUS_DATA_TYPE_FIXED	: 1,
    MBUS_DATA_TYPE_VARIABLE	: 2,
    MBUS_DATA_TYPE_ERROR	: 3
}

var MBusTelegram = {
    type: null,
    base_size: null,
    start1: 0,
    length1: 0,
    length2: 0,
    start2: 0,
    control: 0,
    address: 0,
    control_information: 0,
    //variable data field
    checksum: 0,
    stop: 0,
    data_size: 0,
    data: [],
    records: [],
    data_record_decode: function (record) {
        var vif  = record.drh['vib'].vif & Consts.MBUS_DIB_VIF_WITHOUT_EXTENSION
        var vife = 0
        try{
            vife = record.drh['vib'].vife[0] & Consts.MBUS_DIB_VIF_WITHOUT_EXTENSION
        } catch (err) { }

        //console.log("record.drh['dib'].dif", record.drh['dib'].dif.toString(16));

        switch (record.drh['dib'].dif & Consts.MBUS_DATA_RECORD_DIF_MASK_DATA) {
            case 0x00: //no data
                return "";
            case 0x01: //1 byte integer (8 bit)
                return this.int_decode(record.data);
            case 0x02: //2 byte (16 bit)
                if (vif == 0x6C) // E110 1100  Time Point (date)
                {
                    return "";
                }
                else { // 2 byte integer
                    return this.int_decode(record.data)
                }
            case 0x03: //3 byte (24 bit)
                return this.int_decode(record.data);
            case 0x04: //3 byte (32 bit)
                if ((vif == 0x6D) ||
                    ((record.drh['vib'].vif == 0xFD) || (vife == 0x30)) ||
                    ((record.drh['vib'].vif == 0xFD) && (vife == 0x70))){
                    break;
                }else {
                    //4 byte integer
                    return this.int_decode(record.data);
                }                
            case 0x05: //4 byte Real(32 bit)
                break;
            case 0x06: //6 byte integer (48 bit)
                break;
            case 0x07: //8 byte integer (64 bit)
                return "";
            case 0x09: // 2 digit BCD (8 bit)
                return parseInt(this.bcd_decode(record.data));
            case 0x0A: //4 digit BCD (16 bit)
                return parseInt(this.bcd_decode(record.data));
            case 0x0B: //6 digit BCD (24 bit)
                return parseInt(this.bcd_decode(record.data));
            case 0x0C: //8 digit BCD (32 bit)
                return parseInt(this.bcd_decode(record.data));
            case 0x0E: // 12 digit BCD (48 bit)
                return parseInt(this.bcd_decode(record.data));
            case 0x0F: //special functions
                break;
            case 0x0D: break;
                return "";
            default:
                return "Unknown DIF ({0})".replace("{0}", record.drh['dib'].dif.toString(16));
        }
        return "FIXME"
    },
    data_record_func: function (record) {
        let dif = record.drh['dib'].dif;
        let func = dif & Consts.MBUS_DATA_RECORD_DIF_MASK_FUNCTION;
        switch (func) {
            case 0x00:
                return "Instantaneous value";
            case 0x10:
                return "Maximum value";
            case 0x20:
                return "Minimum value";
            case 0x30:
                return "Value during error state";
            default:
                return "Unknown";
        }
    },
    data_record_storage_num: function(record){
        let bit_index = 0,
		    result    = 0;

        result |= (record.drh['dib'].dif & Consts.MBUS_DATA_RECORD_DIF_MASK_STORAGE_NO) >> 6;
        bit_index += 1

        record.drh['dib'].dife.forEach(function (item) {
            result |= (item & Consts.MBUS_DATA_RECORD_DIFE_MASK_STORAGE_NO) << bit_index
            bit_index += 4
        });
        return result;
    },
    decode_manufacture: function (bytearr) {
        let m_id = this.byteArrayToLong(bytearr);
        return String.fromCharCode(((m_id >> 10) & 0x001F) + 64) +
               String.fromCharCode(((m_id >> 5) & 0x001F) + 64) +
               String.fromCharCode(((m_id) & 0x001F) + 64);
    },
    int_decode: function(int_data){
        var value = 0;
        var neg = int_data[-1] & 0x80;

        var i = int_data.length;
        while (i > 0){
            if(neg)
                value = (value << 8) + (int_data[i - 1] ^ 0xFF)
            else
                value = (value << 8) + int_data[i - 1]

            i -= 1
        }

        if(neg)
            value = (value * -1) - 1

        return value
    },
    bcd_decode: function(bcd_data){
        let val = 0;
        let i = bcd_data.length;
        while (i > 0) {
            val = (val * 10) + ((bcd_data[i - 1] >> 4) & 0xF)
            val = (val * 10) + (bcd_data[i - 1] & 0xF)

            i -= 1
        }
        return val
    },
    byteArrayToLong: function (/*byte[]*/byteArray) {
        var value = 0;
        for (var i = byteArray.length - 1; i >= 0; i--) {
            value = (value * 256) + byteArray[i];
        }
        return value;
    },
    vib_unit_lookup: function(vib){
        if (vib.vif == 0xFD || vib.vif == 0xFB) {
            // first type of VIF extention: see table 8.4.4            
            if (vib.vife.length == 0)
                return "Missing VIF extension";

            else if(vib.vife[0] == 0x08 || vib.vife[0] == 0x88)
                // E000 1000
                return "Access Number (transmission count)";

            else if(vib.vife[0] == 0x09 || vib.vife[0] == 0x89)
                //E000 1001
                return "Medium (as in fixed header)";

            else if(vib.vife[0] == 0x0A || vib.vife[0] == 0x8A)
                //E000 1010
                return "Manufacturer (as in fixed header)";

            else if(vib.vife[0] == 0x0B || vib.vife[0] == 0x8B)
                //E000 1010
                return "Parameter set identification";
            else if(vib.vife[0] == 0x0C || vib.vife[0] == 0x8C)
                //E000 1100
                return "Model / Version"
            else if(vib.vife[0] == 0x0D || vib.vife[0] == 0x8D)
                //E000 1100
                return "Hardware version"
            else if(vib.vife[0] == 0x0E || vib.vife[0] == 0x8E)
                //E000 1101
                return "Firmware version"
            else if(vib.vife[0] == 0x0F || vib.vife[0] == 0x8F)
                //E000 1101
                return "Software version"
            else if(vib.vife[0] == 0x16)
                //VIFE = E001 0110 Password
                return "Password";
            else if(vib.vife[0] == 0x17 || vib.vife[0] == 0x97)
				//VIFE = E001 0111 Error flags
                return "Error flags"
            else if(vib.vife[0] == 0x10)
				//VIFE = E001 0000 Customer location
                return "Customer location"
            else if(vib.vife[0] == 0x11)
				// VIFE = E001 0001 Customer
                return "Customer"
            else if(vib.vife[0] == 0x1A)
				//VIFE = E001 1010 Digital output (binary)
                return "Digital output (binary)"
            else if(vib.vife[0] == 0x1B)
				//VIFE = E001 1011 Digital input (binary)
                return "Digital input (binary)"
            else if ((vib.vife[0] & 0x70) == 0x40){
                //VIFE = E100 nnnn 10^(nnnn-9) V
                let n = (vib.vife[0] & 0x0F)
                //return "{0} V".format( mbus_unit_prefix(n-9) )
                return "---";
            }
            else if ((vib.vife[0] & 0x70) == 0x50){
                //VIFE = E101 nnnn 10nnnn-12 A
                let n = (vib.vife[0] & 0x0F)
                //return "{0} A".replace("{0}", mbus_unit_prefix(n - 12));
                return "---";
            }
            else if ((vib.vife[0] & 0xF0) == 0x70)
				//VIFE = E111 nnn Reserved
                return "Reserved VIF extension"
        else
                return "Unrecognized VIF extension: {0}".replace(Number(vib.vife[0]).toString(16));
        }
        else if(vib.vif == 0x7C){
            //custom VIF
            return vib.custom_vif;
        }
        else if(vib.vif == 0xFC && (vib.vife[0] & 0x78) == 0x70){
            //custom VIF
            let n = vib.vife[0] & 0x07
            //return "{0} {1}".replace("{0}", mbus_unit_prefix(n - 6)).replace("{1}", vib.custom_vif);
            return "---";
        }

        return "FIXME"; //mbus_vif_unit_lookup(vib->vif); # no extention, use VIF
    }
};

var MBusDataInformationBlock = {
    dif: undefined,
    dife: [],
};

var MBusValueInformationBlock = {
    vif: undefined,
    vife: [],
};

function MBusRecord() {
    this.drh = {
        dib: Object.create(MBusDataInformationBlock),
        vib: Object.create(MBusValueInformationBlock),
    }
    this.data = []; //data[254]
    this.timestamp = undefined;
    this.data_length = 0;
    this.data_len = function (dlen) {
        if (!dlen) {
            let rec_len = {
                '0x0': 0, '0x1': 1,
                '0x2': 2, '0x3': 3,
                '0x4': 4, '0x5': 4,
                '0x6': 6, '0x7': 8,

                '0x8': 0, '0x9': 1,
                '0xA': 2, '0xB': 3,
                '0xC': 4, '0xD': 0, // variable data length, data length stored in data field
                '0xE': 6, '0xF': 8
            };

            let idx = this.drh['dib'].dif & Consts.MBUS_DATA_RECORD_DIF_MASK_DATA;
            let idx_hexstr = "0x" + Number(idx).toString(16).toLocaleUpperCase();
            let datalen = rec_len[idx_hexstr];
            return datalen;
        }
        else {
            this.data_length = dlen;            
        }

        if (this.data_length > 0) {
            return this.data_length;
        }
        return;
    }
}


function MBusLongFrame() {
    this.compute_crc = function () {
        var crcsum = 0;
        for (var ii = 0; ii < this.data.length; ii++) {
            crcsum += this.data[ii]
        }
        var crcSumHex = crcsum % 256;
        return crcSumHex;
    }
    this.check_crc = function(){
        return this.compute_crc() === this.checksum;
    }
    this.parse_user_data = function (user_data) {
        if (!user_data)
            user_data = this.data;

        //C, A, CI + User data sections
        var dType, dError;

        //This entire block acts on data outside User Data...
        var direction = this.control & Consts.MBUS_CONTROL_MASK_DIR;

        if (direction == Consts.MBUS_CONTROL_MASK_DIR_S2M) {
            //console.log("direction S2M", direction)
            var ci = this.control_information;
            if (ci == Consts.MBUS_CONTROL_INFO_RESP_VARIABLE) {
                if (user_data.length <= 3) {
                    console.log("Got zero data_size")
                    return -1;
                }

                dType = Consts.MBUS_DATA_TYPE_VARIABLE;
            }
        }
        else {
            console.log("Wrong direction in frame (master to slave)");
            return -1
        }

        if (dType) {
            switch (dType) {
                case Consts.MBUS_DATA_TYPE_ERROR:
                    break;
                case Consts.MBUS_DATA_TYPE_FIXED:
                    break;
                case Consts.MBUS_DATA_TYPE_VARIABLE:
                    let data = user_data.slice(3);
                    //console.log("user-data", user_data.map(x=>x.toString(16)));
                    //console.log("user-data-slice", data.map(x=>x.toString(16)));
                    return this.parse_variable_data(data);
            }
        }
        else {
            console.log("Unknown control information {0}".replace("{0}", this.control_information));
            return -1;
        }
    }
    this.dump_records = function () {
        let jdata = {
            'header': {
                'manufacturer': null,
                'version': null,
                'medium': null,
                'access_no': null,
                'status': null,
            },
            'mbus_data': []
        };

        jdata['header'].manufacturer = this.decode_manufacture(this.info.manufacturer);
        jdata['header'].medium = this.info.medium;
        jdata['header'].version = this.info.version;
        jdata['header'].status = this.info.status;
        jdata['header'].access_no = this.info.access_no;

        for (var idx = 0; idx < this.records.length; idx++) {
            let record = this.records[idx];
            let row = {
                'id': idx,
                'function': null,
                'storage': null,
                'unit': null,
                'value': null
            }

            if(record.drh['dib'].dif == Consts.MBUS_DIB_DIF_MANUFACTURER_SPECIFIC)
                row['function'] = 'manufacturer specific'
            else if (record.drh['dib'].dif == Consts.MBUS_DIB_DIF_MORE_RECORDS_FOLLOW)
                row['function'] = 'more records'
            else {
                row['function'] = this.data_record_func(record)
                row['storage'] = this.data_record_storage_num(record)
                row['unit'] = this.vib_unit_lookup(record.drh['vib'])
                row['value'] = this.data_record_decode(record)
            }

            jdata['mbus_data'].push(row);
        }

        var resJson = JSON.stringify(jdata, null, 5);
        console.log(resJson);
    }
    this.parse_variable_data = function (data) {
        //Attempting to parse variable data
        if (data.length < Consts.MBUS_DATA_VARIABLE_HEADER_LENGTH) {
            console.log("Varialble header to short")
            return -1;
        }
        
        console.log("user-data-slice hex", data.map(x=>x.toString(16)));
        console.log("user-data-slice dec", data);

        var hdr = {
            id_bcd: data.slice(0, 4),
            manufacturer: data.slice(4, 6),
            version: data[6],
            medium: data[7],
            access_no: data[8],
            status: data[9],
            signature: data.slice(10, 12),
            records: []
        }

        var more_records_follow = false;

        var i = Consts.MBUS_DATA_VARIABLE_HEADER_LENGTH;

        while (i < this.data_size) {
            // Skip filler DIF=0x2F
            if ((data[i] & 0xff) == Consts.MBUS_DIB_DIF_IDLE_FILLER) {
                i += 1;
                continue;
            }

            var newRecord = new MBusRecord();

            //read and parse DIB(=DIF+DIFE)
            newRecord.drh['dib'].dif = data[i];

            if(newRecord.drh['dib'].dif == Consts.MBUS_DIB_DIF_MANUFACTURER_SPECIFIC || 
               newRecord.drh['dib'].dif == Consts.MBUS_DIB_DIF_MORE_RECORDS_FOLLOW) {

                if ((newRecord.drh['dib'].dif & 0xff) == Consts.MBUS_DIB_DIF_MORE_RECORDS_FOLLOW)
                    more_records_follow = true;
                i += 1;

                //just copy the remaining data as it is vendor specific
                //and append it as a record
                newRecord.data_length = this.data_size - i;
                newRecord.data = newRecord.data.concat(data.slice(i, i + newRecord.data_len()));
                i += newRecord.data_len();
                this.records = this.records.concat(newRecord);
                continue;
            }

            //calculate length of data record
            while ((i < this.data_size) && (data[i] & Consts.MBUS_DIB_DIF_EXTENSION_BIT)) {
                newRecord.drh['dib'].dife.push(data[i + 1])
                i += 1
            }
            
            i += 1;

            //Read and parse VIF
            let dif =  newRecord.drh['dib'].dif;
            let lVarRec = dif & Consts.MBUS_DIB_VIF_WITHOUT_EXTENSION;
            if (lVarRec == parseInt(0x7C)) {
                //variable length VIF in ASCII format
                var var_vif_len = data[i];
                i += 1

                newRecord.drh['vib'].custom_vif = data.slice(i, i + var_vif_len);

                i += var_vif_len
            }

            //VIFE
            if(newRecord.drh['vib'].vif & Consts.MBUS_DIB_VIF_EXTENSION_BIT){
                newRecord.drh['vib'].vife.push(data[i]);

                while ((i < this.data_size) && (data[i] & MBUS_DIB_VIF_EXTENSION_BIT)) {
                    newRecord.drh['vib'].vife.push(data[i + 1])
                    i += 1
                }

                i += 1
            }

            //Re-calculate data length, if of variable length type
            if ((newRecord.drh['dib'].dif & Consts.MBUS_DATA_RECORD_DIF_MASK_DATA) == 0x0D) { //flag for variable length data
                if (data[i] <= 0xBF) {
                    newRecord.data_len(data[i]);
                    i += 1;
                }
                else if (data[i] >= 0xC0 && data[i] <= 0xCF) {
                    newRecord.data_len((data - 0xC0) * 2);
                    i += 1;
                }
                else if (data[i] >= 0xD0 && data[i] <= 0xDF) {
                    newRecord.data_len((data[i] - 0xD0) * 2);
                    i += 1
                }
                else if (data[i] >= 0xE0 && data[i] <= 0xEF) {
                    newRecord.data_len(data[i] - 0xE0);
                    i += 1;
                }
                else if (data[i] >= 0xF0 && data[i] <= 0xFA) {
                    newRecord.data_len(data[i] - 0xF0);
                    i += 1;
                }
            }
            var ll = newRecord.data_len();
            var rec = data.slice(i, i + ll);
            newRecord.data = rec;
            i += ll;

            //Add action
            hdr.records = hdr.records.concat(newRecord);
        }

        //Exit
        return hdr;
    }
}
MBusLongFrame.prototype = Object.create(MBusTelegram);


function parseMBusFrames(data) {
    var base_frame;
    if (data && data.length < Consts.MBUS_FRAME_BASE_SIZE_LONG)
        console.error("Invalid M-Bus length");

    if (data[0] == Consts.MBUS_FRAME_LONG_START){
        base_frame = new MBusLongFrame();
        base_frame.type = Consts.MBUS_FRAME_TYPE_LONG;
        base_frame.base_size = Consts.MBUS_FRAME_BASE_SIZE_LONG;
        base_frame.start1 = data[0];
        base_frame.length1 = data[1];
        base_frame.length2 = data[2];

        if (base_frame.length1 < 3 || base_frame.length1 != base_frame.length2) {
            console.error("Invalid M-Bus length1 value");
            return;
        }

        base_frame.start2 = data[3];
        base_frame.control = data[4];
        base_frame.address = data[5];
        base_frame.control_information = data[6];
        base_frame.checksum = data.slice(-2)[0];
        base_frame.stop = data.slice(-1)[0];
        base_frame.data_size = base_frame.length1 - 3;
        base_frame.data = data.slice(4, -2);

        if (base_frame.check_crc() == false) {
            console.error("MBus frame crc error", base_frame.compute_crc(), base_frame.checksum);
            return;
        }

        var d = base_frame.parse_user_data();
        base_frame.records = [];
        base_frame.info = d;

        if (d != -1 && 'records' in d) {
            base_frame.records = d['records'];
        }

    }
    else if (data[0] == Consts.MBUS_FRAME_CONTROL_START) {
    }
    else{
        //base_frame = "Wrong start byte";
    }

    return base_frame;
}




////=====
//var longFrame = new MBusLongFrame()
//console.log(longFrame)

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
                                this.MbusData.head.length1 = "0x" + this.messageStrHex[1];
                                this.MbusData.head.length2 = "0x" + this.messageStrHex[2];
                                this.MbusData.data_size = this.MbusData.head.length1 - 3;

                                this.MbusData.head.stop = "0x" + this.messageStrHex[this.messageStrHex.length-1];

                                this.MbusData.body.header.access_no = ''
                                this.MbusData.body.header.manufacturer = ''
                                this.MbusData.body.header.medium = ''
                                this.MbusData.body.header.sign = ''
                                this.MbusData.body.header.status = ''
                                this.MbusData.body.header.type = "0x" + this.messageStrHex[6];                                

                                if (this.MbusData.body.header.type === Consts.MBUS_CONTROL_INFO_RESP_VARIABLE) {
                                    
                                    function DRH(){

                                    }                                 


                                    //this.data_size = parseInt(this.messageStrHex[1], 16)-3;

                                    //if (this.data_block.length > Consts.MBUS_DATA_VARIABLE_HEADER_LENGTH) {
                                    //    this.MbusData.body.header.identification = this.messageStrHex.slice(7, 11).reverse().map(function (it) { return "0x" + it });
                                    //    var byteArray = this.messageStrHex.slice(11, 13).map(function (d) { return parseInt(d, 16) })
                                    //    var IDNo = myutils.byteArrayToLong(byteArray);
                                    //    this.MbusData.body.header.manufacturer = myutils.decode_manufacture(IDNo);
                                    //    this.MbusData.body.header.version = "0x" + this.messageStrHex[13];
                                    //    this.MbusData.body.header.medium = "0x" + this.messageStrHex[14];
                                    //    this.MbusData.body.header.access_no = parseInt(this.messageStrHex[15], 16);
                                    //    this.MbusData.body.header.status = "0x" + this.messageStrHex[16];
                                    //    this.MbusData.body.header.sign = this.messageStrHex.slice(16, 18).map(function (it) { return "0x" + it });
                                    //this.data_block = this.messageStrHex.slice(19, -2);

                                    //var lenUserData = this.data_block.length;
                                    //var kDataBlock_Counter = lenUserData;
                                    //for (var jj = 0; jj < lenUserData; jj++) {

                                    //}
                                    
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

                //let strMbus =   "68 6A 6A 68 08 01 72 43 53 93 07 65" +
                //                " 32 10 04 CA 00 00 00 0C 05 14 00 00" +
                //                " 00 0C 13 13 20 00 00 0B 22 01 24 03" +
                //                " 04 6D 12 0B D3 12 32 6C 00 00 0C 78" +
                //                " 43 53 93 07 06 FD 0C F2 03 01 00 F6" +
                //                " 01 0D FD 0B 05 31 32 4D 46 57 01 FD" +
                //                " 0E 00 4C 05 14 00 00 00 4C 13 13 20" +
                //                " 00 00 42 6C BF 1C 0F 37 FD 17 00 00" +
                //                " 00 00 00 00 00 00 02 7A 25 00 02 78" +
                //                " 25 00 3A 16";
                //inputMbusMsg.value = strMbus;

                var btnParse = document.getElementById("btnParseMsg");
                var logParser = document.getElementById("messageResults");

                document.addEventListener("click", function (e) {
                    if (e.target.id == "btnParseMsg") {
                        //var arrStr = formatHexStr(inputMbusMsg.value).split(':');
                        var msgArr = inputMbusMsg.value.split(' ');
                        if (msgArr.length === 1) {
                            if (msgArr.indexOf("\\x") > -1) {
                                msgArr = msgArr.split('\\x');
                            }
                            else {
                                msgArr = (function splitMbusHex(arr) {
                                    let pythonMsg = [];
                                    if (arr.length % 2 === 0) {
                                        var strs = arr;
                                        for (var xx = 0; xx < strs.length; xx++) {
                                            if (xx % 2 === 0)
                                                pythonMsg.push(strs.substr(xx, 2))
                                        }
                                    }
                                    return pythonMsg;
                                })(msgArr[0]);
                            }
                        }

                        msgArr = msgArr.map(x => parseInt(x, 16));

                        //var mbus_data = arrStr.map(function (s) { return parseInt(s,16) })
                        console.log("M-Bus frame orig:", msgArr)

                        var res = parseMBusFrames(msgArr);
                        console.log("M-Bus frame parsed:", res)
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

                        //var mbusParser1 = Object.create(MBusParser);
                        //mbusParser1.init(arrStr).parse();
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
