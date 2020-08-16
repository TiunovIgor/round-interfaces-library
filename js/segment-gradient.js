function SegmentGradient(type, direction, stops_string) {    
    this.type = type;
    this.direction = direction;
    this.stops_string = stops_string;
    this.stops = [];
    
    this.resolution = 4;
        
    this.parseStopsString();  
};

SegmentGradient.prototype.parseStopsString = function() {
    this.stops = []; 
       
    if(this.stops_string !== '' && this.stops_string !== undefined) {
        let regexp = /,(?![^\(]*\)) /;
        let stops_array = this.stops_string.split(regexp);

        for(let i=0; i < stops_array.length; i++) {
            let newregexp = /\s(?![^\(]*\))/;
            let stop = stops_array[i].split(newregexp);

            if(stop[1].indexOf('%') > 0) {
                stop[1] = stop[1].replace('%', '') / 100;
            }

            this.stops.push({ 'color' : stop[0], 'offset' : stop[1] });         
        }  
    }   
};

SegmentGradient.prototype.fade = function(f) {
    this.parseStopsString();
    
    for(let i=0; i < this.stops.length; i++) {
        let new_color = rgbaStrToObj(rgbaStrFromColor(this.stops[i].color));
        new_color.a = new_color.a * f;
        this.stops[i].color = rgbaObjToStr(new_color);
    }
};

SegmentGradient.prototype.getImageDataByArcLength = function(arc_length) {
    let canvas = document.createElement('canvas');
    canvas.width = arc_length;
    canvas.length = 1;
    let context = canvas.getContext('2d');
    
    let gradient = context.createLinearGradient(0, 0, arc_length, 0);
    
    for(let i=0; i < this.stops.length; i++) {
        gradient.addColorStop(this.stops[i].offset, this.stops[i].color);
    }
    
    context.fillStyle = gradient;
    context.fillRect(0, 0, arc_length, 1);
        
    return context.getImageData(0, 0, arc_length, 1);
};

SegmentGradient.prototype.instanceCopy = function() {
    const copy = new this.constructor();
    const keys = Object.keys(this);
    keys.forEach(key => { copy[key] = this[key]; });
    return copy;
};