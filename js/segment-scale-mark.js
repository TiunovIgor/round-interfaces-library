function SegmentScaleMark(id, context, center_x, center_y, inner_radius, length, angle) {    
    this.id = id; // Object identificator
    this.context = context; // CanvasRenderingContext2D for drawing a mark
    this.cx = center_x; // X coordinate of the segment scale center
    this.cy = center_y; // Y coordinate of the segment scale center
    this.r_in = inner_radius; // mark inner radius
    this.length = length; // mark length
    this.r_out = inner_radius + length; // mark outer radius
    this.angle = angle; // mark angle
    
    this.width = 1;
    this.color = "rbga(100, 100, 100, 1)";
    
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

SegmentScaleMark.prototype.calc = function() {
    if(this.in_progress) {
        this.anim_a = this.anim_angle * Math.PI / 180;
        
        this.anim_dx1 = this.anim_r_in * Math.cos(this.anim_a) + this.cx; // First point. X coordinate
        this.anim_dy1 = this.anim_r_in * Math.sin(this.anim_a) + this.cy; // First point. Y coordinate
        this.anim_dx2 = this.anim_r_out * Math.cos(this.anim_a) + this.cx; // Second point. X coordinate
        this.anim_dy2 = this.anim_r_out * Math.sin(this.anim_a) + this.cy; // Second point. Y coordinate
    }
    else {
        this.a = this.angle * Math.PI / 180;
        
        this.dx1 = this.r_in * Math.cos(this.a) + this.cx;
        this.dy1 = this.r_in * Math.sin(this.a) + this.cy;
        this.dx2 = this.r_out * Math.cos(this.a) + this.cx;
        this.dy2 = this.r_out * Math.sin(this.a) + this.cy;
    }    
            
    dispatchEvent(new CustomEvent("segment-scale-mark-changed", { detail : { mark : this } } ));
}; 
        
SegmentScaleMark.prototype.draw = function() {
    if(this.visible) {
        let dx1, dy1, dx2, dy2;
        let r_in, r_out;
        let length, width;
        let angle; 
        let color;
        
        if(this.in_progress) {
            dx1 = this.anim_dx1; dy1 = this.anim_dy1;
            dx2 = this.anim_dx2; dy2 = this.anim_dy2;
            r_in = this.anim_r_in;
            r_out = this.anim_r_out;
            length = this.anim_length;
            width = this.anim_width;
            angle = this.anim_angle;
            color = this.anim_color; 
        }
        else {
            dx1 = this.dx1; dy1 = this.dy1;
            dx2 = this.dx2; dy2 = this.dy2;
            r_in = this.r_in;
            r_out = this.r_out;
            length = this.length;
            width = this.width;
            angle = this.angle;
            color = this.color;             
        }     
        
        this.context.beginPath();            
        this.context.moveTo(dx1, dy1);
        this.context.lineTo(dx2, dy2);           
        this.context.lineWidth = width;
        this.context.strokeStyle = color;
        this.context.stroke();
            
        this.context.closePath();
    }
};
       
SegmentScaleMark.prototype.prepareAnim = function() {
    this.anim_r_in = this.r_in;
    this.anim_length = this.length;
    this.anim_r_out = this.r_out;
    this.anim_angle = this.angle;
    
    this.anim_width = this.width;
    this.anim_color = this.color;
};        
       
SegmentScaleMark.prototype.appear = function(direction, duration, delay) {
    this.prepareAnim();
    
    this.in_progress = true;
    this.calc();
        
    let mark = this;
                
    let start;        
    let time = null;
    let fraction = 0;
    let request = null;
       
    function appearAnim() {
        time = Date.now();
        fraction = (time - start) / (duration * 1000);

        let anim_func;
        if(direction === 'from-center') { anim_func = mark.appearFromCenter.bind(mark); }
        else if(direction === 'to-center') { anim_func = mark.appearToCenter.bind(mark); }
        else if(direction === 'from-middle') { anim_func = mark.appearFromMiddle.bind(mark); }
    
        anim_func(fraction);
            
        if(fraction > 1) {
            mark.stopAppearance();
            cancelAnimationFrame(request);
            dispatchEvent(new CustomEvent("segment-scale-mark-appeared", { detail : { mark : mark } }));
        }
        else {
            mark.visible = true;
            window.requestAnimFrame(appearAnim);
        }            
    };
            
    request = setTimeout(function() {
        start = Date.now();
        window.requestAnimFrame(appearAnim);
    }, delay * 1000);
};        
        
SegmentScaleMark.prototype.appearFromCenter = function(t) {
    let r = this.r_in + (this.r_out - this.r_in) * t;
    if(r < this.r_out) { this.anim_r_out = r; }
    else { this.anim_r_out = this.r_out; };
    this.calc();
};
    
SegmentScaleMark.prototype.appearToCenter = function(t) {
    let r = this.r_out - (this.r_out - this.r_in) * t;
    if(r > this.r_in) { this.anim_r_in = r; }
    else { this.anim_r_in = this.r_in; }
    this.calc();
};

SegmentScaleMark.prototype.appearFromMiddle = function(t) {
    let l = this.length * t;
    let r = (this.r_in + this.r_out) / 2;
    if(l < this.length) { this.anim_r_in = r - l / 2; this.anim_r_out = r + l / 2; }
    else { this.anim_r_in = this.r_in; this.anim_r_out = this.r_out; }
    this.calc();
};

SegmentScaleMark.prototype.stopAppearance = function() {
    this.anim_r_in = 0;
    this.anim_r_out = 0;
    this.anim_length = 0;
    this.anim_angle = 0;
    
    this.in_progress = false;
    this.visible = true;
    
    this.calc();
};
    
SegmentScaleMark.prototype.disappear = function(direction, duration, delay) {   
    this.prepareAnim();
                        
    this.in_progress = true;
    this.calc();
        
    let mark = this;
                
    let start;        
    let time;
    let fraction = 0;
    let request = null;
       
    function disappearAnim() {
        time = Date.now();
        fraction = (time - start) / (duration * 1000);

        let anim_func;
        if(direction === 'from-center') { anim_func = mark.disappearFromCenter.bind(mark); }
        else if(direction === 'to-center') { anim_func = mark.disappearToCenter.bind(mark); }
        else if(direction === 'to-middle') { anim_func = mark.disappearToMiddle.bind(mark); }
        anim_func(fraction);      
            
        if(fraction > 1) {
            mark.stopDisappearance();
            cancelAnimationFrame(request);
            dispatchEvent(new CustomEvent("segment-scale-mark-disappeared", { detail : { mark : mark } }));
        }
        else {
            mark.visible = true;
            window.requestAnimFrame(disappearAnim);
        }            
    };
        
    request = setTimeout(function() {
        start = Date.now();
        window.requestAnimFrame(disappearAnim);
    }, delay * 1000);
};        
    
SegmentScaleMark.prototype.disappearFromCenter = function(t) {
    let r = this.r_in + (this.r_out - this.r_in) * t;
    if(r < this.r_out) { this.anim_r_in = r; }
    else { this.anim_r_in = this.r_out; };
    this.calc();
};
    
SegmentScaleMark.prototype.disappearToCenter = function(t) {
    let r = this.r_out - (this.r_out - this.r_in) * t;
    if(r > this.r_in) { this.anim_r_out = r; }
    else { this.anim_r_out = this.r_in; }
    this.calc();
};
    
SegmentScaleMark.prototype.disappearToMiddle = function(t) {
    let l = this.length * (1 - t);
    let r = (this.r_in + this.r_out) / 2;
    if(l < this.length) { this.anim_r_in = r - l / 2; this.anim_r_out = r + l / 2; }
    else { this.anim_r_in = this.r_in; this.anim_r_out = this.r_out; }
    this.calc();
};
    
SegmentScaleMark.prototype.stopDisappearance = function() {
    this.anim_r_in = 0;
    this.anim_r_out = 0;
    this.anim_length = 0;
    this.anim_angle = 0;
    
    this.in_progress = false;
    this.visible = false;
    
    this.calc();
};    
    
SegmentScaleMark.prototype.fadeIn = function(duration, delay) {    
    this.prepareAnim();

    this.calc();
    this.in_progress = true;
        
    let mark = this;
                
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
        mark.anim_color = rgbaObjToStr(new_color);
        
        let calc_func = mark.calc.bind(mark);
        calc_func();
        
        if(fraction > 1) {
            mark.anim_color = mark.color;
            mark.stopFadingIn();
            cancelAnimationFrame(request);
            dispatchEvent(new CustomEvent("segment-scale-mark-faded-in", { detail : { mark : mark } }));
        }
        else {
            mark.visible = true;
            window.requestAnimFrame(fadeInAnim);
        }            
    };
        
    request = setTimeout(function() {
        start = Date.now();
        window.requestAnimFrame(fadeInAnim);
    }, delay * 1000);
};

SegmentScaleMark.prototype.stopFadingIn = function() {
    this.visible = true;
    this.in_progress = false;
    
    this.calc();
};

SegmentScaleMark.prototype.fadeOut = function(duration, delay) {
    this.prepareAnim();
    
    this.in_progress = true;
    this.calc();
        
    let mark = this;
                
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
        mark.anim_color = rgbaObjToStr(new_color);
        
        let calc_func = mark.calc.bind(mark);
        calc_func();
        
        if(fraction > 1) {
            mark.anim_color = mark.color; 
            mark.stopFadingOut();
            cancelAnimationFrame(request);
            dispatchEvent(new CustomEvent("segment-scale-mark-faded-out", { detail : { mark : mark } }));
        }
        else {
            mark.visible = true;
            window.requestAnimFrame(fadeOutAnim);
        }            
    };
        
    request = setTimeout(function() {
        start = Date.now();
        window.requestAnimFrame(fadeOutAnim); }, delay * 1000);
};       

SegmentScaleMark.prototype.stopFadingOut = function() {
    this.visible = false;
    this.in_progress = false;
    
    this.calc();
};

SegmentScaleMark.prototype.instanceCopy = function() {
    const copy = new this.constructor();
    const keys = Object.keys(this);
    keys.forEach(key => { copy[key] = this[key]; });
    return copy;
};