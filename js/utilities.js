window.requestAnimFrame = (function(callback) {
    return window.requestAnimationFrame || window.webkitRequestAnimationFrame || window.mozRequestAnimationFrame ||
            window.oRequestAnimationFrame || window.msRequestAnimationFrame || function(callback) {
                window.setTimeout(callback, 16);
    };
}());

function Point(px, py) {
    this.x = px;
    this.y = py;
};

function rgbaStrFromRgb(str) {
    if(str.indexOf('rgb') > -1) {
        let rgba = str.replace(')', ',1)').replace('rgb', 'rgba');
        return rgba;
    }
    else {
        return 'rgba(0, 0, 0, 0)';
    }
}

function rgbaStrFromHex(str)
{  
    if(str.length < 7) {
        str = '#' + str[1] + str[1] + str[2] + str[2] + str[3] + str[3] + (str.length > 4 ? str[4] + str[4] : '');
    }
    let rgba = 'rgba(' + parseInt(str.substr(1, 2), 16) + ',' + parseInt(str.substr(3, 2), 16) + ',' +
                parseInt(str.substr(5, 2), 16) + ',' + (str.length > 7 ? parseInt(str.substr(7, 2), 16)/255 : 1) + ')';
    return rgba;
}

function rgbaStrFromColorName(str)
{
    let ctx = document.createElement("canvas").getContext("2d");
    ctx.fillStyle = str;
    let rgba = rgbaStrFromHex(ctx.fillStyle);
    return rgba;
}

function rgbaStrFromColor(str)
{  
    if(!str) { return 'rgba(0, 0, 0, 0)'; }
    else if(str.indexOf('rgba') === 0) { return str; }
    else if(str.indexOf('rgb') === 0) { return rgbaStrFromRgb(str); }
    else if(str[0] === '#') { return rgbaStrFromHex(str); }
    else if(str.toLowerCase() === 'transparent') { return 'rgba(0, 0, 0, 0)'; }
    else { return rgbaStrFromColorName(str); }
};

function rgbaStrToObj(str) {    
    let red = 0;
    let green = 0;
    let blue = 0;
    let alfa = 1;
    
    let arr = [];
    
    if(str.indexOf('rgba') === 0) {
        let value = str.match(/\((.*)\)/);
        value[0] = value[0].replace(/[()]/g, '');
        let sep = value[0].indexOf(",") > -1 ? "," : " ";
        arr = value[0].split(sep);
        red = arr[0].trim();
        green = arr[1].trim();
        blue = arr[2].trim();
        alfa = arr[3].trim();
    }
    
    let obj = {'r' : red, 'g' : green, 'b' : blue, 'a' : alfa };
    
    return Object.assign({}, obj);    
};

function rgbaObjToStr(obj) {    
    let str = 'rgba(' + obj.r + "," + obj.g + "," + obj.b + "," + obj.a + ')';
    
    return str.slice(0); 
};

function libraryInfo() {
    let lib = {
        'name' : 'Round Interfaces Library',
        'version' : '0.1'
    };
    
    return lib;
};