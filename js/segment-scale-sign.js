function SegmentScaleSign(id, context, center_x, center_y, inner_radius, text, angle) {    
    this.id = id; // Object identificator
    this.context = context; // CanvasRenderingContext2D for drawing a mark
    this.cx = center_x; // X coordinate of the segment scale center
    this.cy = center_y; // Y coordinate of the segment scale center
    this.r_in = inner_radius; // mark inner radius
    this.text = text; // number value
    this.r_out = inner_radius + length; // mark outer radius
    this.angle = angle; // mark angle
        
    this.font_family = 'Arial';
    this.font_size = '9pt';
    this.font;
    this.text_color = 'black';
    this.text_border_width = 0;
    this.text_border_color = 'black';
    this.text_direction = 'vertical'; // vertical, clockwise, anticlockwise, from_center, to_center
    
    this.visible = true;
    this.in_progress = false;
    
    this.anim_r_in = 0;
    this.anim_length = 0;
    this.anim_r_out = 0;
    this.anim_angle = 0;
    
    this.anim_width = 0;
    this.anim_color;
                
    this.calc();
};

SegmentScaleSign.prototype.calc = function() {
    if(this.in_progress) {
        this.anim_a = this.anim_angle * Math.PI / 180;
        
        this.anim_dx = this.anim_r_in * Math.cos(this.anim_a) + this.cx; // First point. X coordinate
        this.anim_dy = this.anim_r_in * Math.sin(this.anim_a) + this.cy; // First point. Y coordinate
    }
    else {       
        this.a = this.angle * Math.PI / 180;
        
        this.dx = this.r_in * Math.cos(this.a) + this.cx;
        this.dy = this.r_in * Math.sin(this.a) + this.cy;
    }    
            
    dispatchEvent(new CustomEvent("segment-scale-sign-changed", { detail : { sign : this } } ));
}; 
        
SegmentScaleSign.prototype.draw = function() {
    if(this.visible) {
        let dx, dy;
        let r_in, r_out;
        let text;
        let angle; 
        let color;
        
        if(this.in_progress) {
            dx = this.anim_dx; dy = this.anim_dy;
            r_in = this.anim_r_in;
            r_out = this.anim_r_out;
            text = this.anim_text;
            angle = this.anim_angle;
            color = this.anim_color; 
        }
        else {
            dx = this.dx; dy = this.dy;
            dx = this.dx; dy = this.dy;
            r_in = this.r_in;
            r_out = this.r_out;
            text = this.text;
            angle = this.angle;
            color = this.color;             
        }     
        
        let font = this.font;
    
        if(this.font === undefined || this.font === null || this.font === '') {
            font = this.font_size + ' ' + this.font_family;
        }

        this.context.font = font;
        this.context.fillStyle = this.text_color;
        this.context.lineWidth = this.text_border_width;
        this.context.strokeStyle = this.text_border_color;

        this.context.textAlign = "center";
        this.context.textBaseline = 'middle';

        if(this.in_progress) { text = '' + this.anim_text; }
        else { text = '' + this.text; }

        this.context.fillText(text, dx, dy);
        this.context.strokeText(text, dx, dy);
    }
};
       
SegmentScaleSign.prototype.prepareAnim = function() {
    this.anim_r_in = this.r_in;
    this.anim_length = this.length;
    this.anim_r_out = this.r_out;
    this.anim_angle = this.angle;
    
    this.anim_width = this.width;
    this.anim_color = this.color;
};        
       
SegmentScaleSign.prototype.appear = function(direction, duration, delay) {
    this.prepareAnim();
    
    this.in_progress = true;
    this.calc();
        
    let sign = this;
                
    let start;        
    let time = null;
    let fraction = 0;
    let request = null;
       
    function appearAnim() {
        time = Date.now();
        fraction = (time - start) / (duration * 1000);

        let anim_func;
        if(direction === 'from-center') { anim_func = sign.appearFromCenter.bind(sign); }
        else if(direction === 'to-center') { anim_func = sign.appearToCenter.bind(sign); }
        else if(direction === 'from-middle') { anim_func = sign.appearFromMiddle.bind(sign); }
    
        anim_func(fraction);
            
        if(fraction > 1) {
            sign.stopAppearance();
            cancelAnimationFrame(request);
            dispatchEvent(new CustomEvent("segment-scale-sign-appeared", { detail : { sign : sign } }));
        }
        else {
            sign.visible = true;
            window.requestAnimFrame(appearAnim);
        }            
    };
            
    request = setTimeout(function() {
        start = Date.now();
        window.requestAnimFrame(appearAnim);
    }, delay * 1000);
};        
        
SegmentScaleSign.prototype.appearFromCenter = function(t) {
    let r = this.r_in + (this.r_out - this.r_in) * t;
    if(r < this.r_out) { this.anim_r_out = r; }
    else { this.anim_r_out = this.r_out; };
    this.calc();
};
    
SegmentScaleSign.prototype.appearToCenter = function(t) {
    let r = this.r_out - (this.r_out - this.r_in) * t;
    if(r > this.r_in) { this.anim_r_in = r; }
    else { this.anim_r_in = this.r_in; }
    this.calc();
};

SegmentScaleSign.prototype.appearFromMiddle = function(t) {
    let l = this.length * t;
    let r = (this.r_in + this.r_out) / 2;
    if(l < this.length) { this.anim_r_in = r - l / 2; this.anim_r_out = r + l / 2; }
    else { this.anim_r_in = this.r_in; this.anim_r_out = this.r_out; }
    this.calc();
};

SegmentScaleSign.prototype.stopAppearance = function() {
    this.anim_r_in = 0;
    this.anim_r_out = 0;
    this.anim_length = 0;
    this.anim_angle = 0;
    
    this.in_progress = false;
    this.visible = true;
    
    this.calc();
};
    
SegmentScaleSign.prototype.disappear = function(direction, duration, delay) {   
    this.prepareAnim();
                        
    this.in_progress = true;
    this.calc();
        
    let sign = this;
                
    let start;        
    let time;
    let fraction = 0;
    let request = null;
       
    function disappearAnim() {
        time = Date.now();
        fraction = (time - start) / (duration * 1000);

        let anim_func;
        if(direction === 'from-center') { anim_func = sign.disappearFromCenter.bind(sign); }
        else if(direction === 'to-center') { anim_func = sign.disappearToCenter.bind(sign); }
        else if(direction === 'to-middle') { anim_func = sign.disappearToMiddle.bind(sign); }
        anim_func(fraction);      
            
        if(fraction > 1) {
            sign.stopDisappearance();
            cancelAnimationFrame(request);
            dispatchEvent(new CustomEvent("segment-scale-sign-disappeared", { detail : { sign : sign } }));
        }
        else {
            sign.visible = true;
            window.requestAnimFrame(disappearAnim);
        }            
    };
        
    request = setTimeout(function() {
        start = Date.now();
        window.requestAnimFrame(disappearAnim);
    }, delay * 1000);
};        
    
SegmentScaleSign.prototype.disappearFromCenter = function(t) {
    let r = this.r_in + (this.r_out - this.r_in) * t;
    if(r < this.r_out) { this.anim_r_in = r; }
    else { this.anim_r_in = this.r_out; };
    this.calc();
};
    
SegmentScaleSign.prototype.disappearToCenter = function(t) {
    let r = this.r_out - (this.r_out - this.r_in) * t;
    if(r > this.r_in) { this.anim_r_out = r; }
    else { this.anim_r_out = this.r_in; }
    this.calc();
};
    
SegmentScaleSign.prototype.disappearToMiddle = function(t) {
    let l = this.length * (1 - t);
    let r = (this.r_in + this.r_out) / 2;
    if(l < this.length) { this.anim_r_in = r - l / 2; this.anim_r_out = r + l / 2; }
    else { this.anim_r_in = this.r_in; this.anim_r_out = this.r_out; }
    this.calc();
};
    
SegmentScaleSign.prototype.stopDisappearance = function() {
    this.anim_r_in = 0;
    this.anim_r_out = 0;
    this.anim_length = 0;
    this.anim_angle = 0;
    
    this.in_progress = false;
    this.visible = false;
    
    this.calc();
};    
    
SegmentScaleSign.prototype.fadeIn = function(duration, delay) {    
    this.prepareAnim();

    this.calc();
    this.in_progress = true;
        
    let sign = this;
                
    let start;
    let time = null;
    let fraction = 0;
    let request = null;
    
    let color = rgbaStrToObj(rgbaStrFromColor(this.color));
    let new_color = Object.assign({}, color);
    
    function fadeInAnim() {
        time = Date.now();
        fraction = (time - start) / (duration * 1000);
        
        new_color.a = color.a * (fraction);
        sign.anim_color = rgbaObjToStr(new_color);
        
        let calc_func = sign.calc.bind(sign);
        calc_func();
        
        if(fraction > 1) {
            sign.anim_color = sign.color;
            sign.stopFadingIn();
            cancelAnimationFrame(request);
            dispatchEvent(new CustomEvent("segment-scale-sign-faded-in", { detail : { sign : sign } }));
        }
        else {
            sign.visible = true;
            window.requestAnimFrame(fadeInAnim);
        }            
    };
        
    request = setTimeout(function() {
        start = Date.now();
        window.requestAnimFrame(fadeInAnim);
    }, delay * 1000);
};

SegmentScaleSign.prototype.stopFadingIn = function() {
    this.visible = true;
    this.in_progress = false;
    
    this.calc();
};

SegmentScaleSign.prototype.fadeOut = function(duration, delay) {
    this.prepareAnim();
    
    this.in_progress = true;
    this.calc();
        
    let sign = this;
                
    let start;
    let time = null;
    let fraction = 0;
    let request = null;
    
    let color = rgbaStrToObj(rgbaStrFromColor(this.anim_color));    
    let new_color = Object.assign({}, color);
    
    function fadeOutAnim() {
        time = Date.now();
        fraction = (time - start) / (duration * 1000);
               
        new_color.a = color.a * (1 - fraction);
        sign.anim_color = rgbaObjToStr(new_color);
        
        let calc_func = sign.calc.bind(sign);
        calc_func();
        
        if(fraction > 1) {
            sign.anim_color = sign.color; 
            sign.stopFadingOut();
            cancelAnimationFrame(request);
            dispatchEvent(new CustomEvent("segment-scale-sign-faded-out", { detail : { sign : sign } }));
        }
        else {
            sign.visible = true;
            window.requestAnimFrame(fadeOutAnim);
        }            
    };
        
    request = setTimeout(function() {
        start = Date.now();
        window.requestAnimFrame(fadeOutAnim); }, delay * 1000);
};       

SegmentScaleSign.prototype.stopFadingOut = function() {
    this.visible = false;
    this.in_progress = false;
    
    this.calc();
};

SegmentScaleSign.prototype.instanceCopy = function() {
    const copy = new this.constructor();
    const keys = Object.keys(this);
    keys.forEach(key => { copy[key] = this[key]; });
    return copy;
};