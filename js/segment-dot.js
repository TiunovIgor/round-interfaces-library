function SegmentDot(id, context, center_x, center_y, radius) {    
    this.id = id; // Object identificator
    this.context = context; // CanvasRenderingContext2D for drawing a dot
    this.cx = center_x; // X coordinate of the dot center
    this.cy = center_y; // Y coordinate of the dot center
    this.r = radius; // dot radius
       
    this.gradient = null;
    this.background = "rgba(200, 200, 200, 0.2)";
    this.border_width = 1;
    this.border_color = "rbga(100, 100, 100, 1)";
       
    this.visible = true;
    this.in_progress = false;
    
    this.anim_r = 0;
    this.anim_gradient = null;
    this.anim_background;
    this.anim_border_width;
    this.anim_border_color;
            
    this.calc();
};

SegmentDot.prototype.calc = function() {     
    dispatchEvent(new CustomEvent("segment-dot-changed", { detail : { dot : this } } ));
}; 
        
SegmentDot.prototype.draw = function() {   
    if(this.visible) {
        let cx = this.cx, cy = this.cy;
        let r = this.r;
        let gradient = null;
        let background;
        let border_width;
        let border_color;
        
        if(this.in_progress) {
            r = this.anim_r;
            if((this.anim_gradient !== null) && (this.anim_gradient instanceof SegmentGradient)) { gradient = this.anim_gradient.instanceCopy(); }    
            background = this.anim_background;
            border_width = this.anim_border_width;
            border_color = this.anim_border_color;
        }
        else {
            r = this.r;
            if((this.gradient !== null) && (this.gradient instanceof SegmentGradient)) { gradient = this.gradient.instanceCopy(); }
            background = this.background;
            border_width = this.border_width;
            border_color = this.border_color;
        }
    
        this.context.beginPath();       
        
        this.context.arc(cx, cy, r, 0, 2 * Math.PI);  
            
        if((gradient !== null) && (gradient instanceof SegmentGradient)) {               
            let canvas_gradient;
            
            if(gradient.type === 'radial') {
                if(gradient.direction === 'from-center') { canvas_gradient = this.context.createRadialGradient(cx, cy, 0, cx, cy, r); }
                else if(gradient.direction === 'to-center') { canvas_gradient = this.context.createRadialGradient(cx, cy, r, cx, cy, 0); }
            }
            else if(gradient.type === 'linear') {
                let x1 = cx - r/2;
                let y1 = cy;
                let x2 = cx + r/2;
                let y2 = cy;
                let x3 = cx;
                let y3 = cy - r/2;
                let x4 = cx;
                let y4 = cy + r/2;
                
                if(gradient.direction === 'to-left') { canvas_gradient = this.context.createLinearGradient(x1, y1, x2, y2); }
                else if(gradient.direction === 'to-right') { canvas_gradient = this.context.createLinearGradient(x2, y2, x1, y1); }
                else if(gradient.direction === 'to-bottom') { canvas_gradient = this.context.createLinearGradient(x3, y3, x4, y4); }
                else if(gradient.direction === 'to-top') { canvas_gradient = this.context.createLinearGradient(x4, y4, x3, y3); }
            }
            
            gradient.stops.forEach(function(stop) {
                canvas_gradient.addColorStop(stop.offset, stop.color);
            });
            
            this.context.fillStyle = canvas_gradient;
        }
        else {
            this.context.fillStyle = background;
        }

        this.context.fill();
        this.context.lineWidth = border_width;
        this.context.strokeStyle = border_color;
        this.context.stroke();
    }                

    this.context.closePath();
};

SegmentDot.prototype.prepareAnim = function() {
    this.anim_r = this.r;
    
    if((this.gradient !== null) && (this.gradient instanceof SegmentGradient)) { this.anim_gradient = this.gradient.instanceCopy(); }
   
    this.anim_background = this.background;
    this.anim_border_width = this.border_width;
    this.anim_border_color = this.border_color;
}
       
SegmentDot.prototype.appear = function(direction, duration, delay) {
    this.prepareAnim();
          
    this.in_progress = true;
    this.calc();
        
    let dot = this;
                
    let start;        
    let time = null;
    let fraction = 0;
    let request = null;
       
    function appearAnim() {
        time = Date.now();
        fraction = (time - start) / (duration * 1000);

        let anim_func;
        if(direction === 'from-center') { anim_func = dot.appearFromCenter.bind(dot); }
        anim_func(fraction);
            
        if(fraction > 1) {
            dot.stopAppearance();
            cancelAnimationFrame(request);
            dispatchEvent(new CustomEvent("segment-dot-appeared", { detail : { dot : dot } }));
        }
        else {
            dot.visible = true;
            window.requestAnimFrame(appearAnim);
        }            
    };
        
    request = setTimeout(function() {
        start = Date.now();
        window.requestAnimFrame(appearAnim); }, delay * 1000);
};        
        
SegmentDot.prototype.appearFromCenter = function(t) {
    let r = this.r * t;
    if(r < this.r) { this.anim_r = r; }
    else { this.anim_r = this.r; };
    this.calc();
};

SegmentDot.prototype.stopAppearance = function() {
    this.anim_r = 0;    
    
    this.in_progress = false;
    this.visible = true;
    
    this.calc();
};

SegmentDot.prototype.disappear = function(direction, duration, delay) {
    this.prepareAnim();
                           
    this.in_progress = true;
    this.calc();
        
    let dot = this;
                
    let start;        
    let time = null;
    let fraction = 0;
    let request = null;
       
    function disappearAnim() {
        time = Date.now();
        fraction = (time - start) / (duration * 1000);

        let anim_func;
        if(direction === 'to-center') { anim_func = dot.disappearToCenter.bind(dot); }
        anim_func(fraction);      
            
        if(fraction > 1) {
            dot.stopDisappearance();
            cancelAnimationFrame(request);
            dispatchEvent(new CustomEvent("segment-dot-disappeared", { detail : { dot : dot } }));
        }
        else {
            dot.visible = true;
            window.requestAnimFrame(disappearAnim);
        }            
    };
        
    request = setTimeout(function() {
        start = Date.now();
        window.requestAnimFrame(disappearAnim); }, delay * 1000);
};        
    
SegmentDot.prototype.disappearToCenter = function(t) {
    let r = this.r * (1 - t);
    if(r > 0) { this.anim_r = r; }
    else { this.anim_r = this.r; };
    this.calc();
};

SegmentDot.prototype.stopDisappearance = function() {
    this.anim_r = 0;    
    
    this.in_progress = false;
    this.visible = false;
    
    this.calc();
};
    
SegmentDot.prototype.fadeIn = function(duration, delay) {
    this.prepareAnim();
                        
    this.calc();
    this.in_progress = true;
        
    let dot = this;
                
    let start;        
    let time = null;
    let fraction = 0;
    let request = null;
    
    let bg = rgbaStrToObj(rgbaStrFromColor(this.background));
    let bc = rgbaStrToObj(rgbaStrFromColor(this.border_color));
    
    let new_bg = Object.assign({}, bg);
    let new_bc = Object.assign({}, bc);
   
    function fadeInAnim() {
        time = Date.now();
        fraction = (time - start) / (duration * 1000);
                
        if(dot.gradient !== null) {
            let new_gr = dot.gradient.instanceCopy();
            new_gr.fade(fraction);
            dot.anim_gradient = new_gr.instanceCopy();
        }  
                
        new_bg.a = bg.a * fraction;
        dot.anim_background = rgbaObjToStr(new_bg);
                
        new_bc.a = bc.a * fraction;              
        dot.anim_border_color = rgbaObjToStr(new_bc);
        
        let calc_func = dot.calc.bind(dot);
        calc_func();
            
        if(fraction > 1) {
            dot.stopFadingIn();
            cancelAnimationFrame(request);
            dispatchEvent(new CustomEvent("segment-dot-faded-in", { detail : { dot : dot } }));
        }
        else {
            dot.visible = true;
            window.requestAnimFrame(fadeInAnim);
        }            
    };
        
    request = setTimeout(function() {
        start = Date.now();
        window.requestAnimFrame(fadeInAnim); }, delay * 1000);
};

SegmentDot.prototype.stopFadingIn = function() {
    this.visible = true;
    this.in_progress = false;
    
    this.calc();
};

SegmentDot.prototype.fadeOut = function(duration, delay) {
    this.prepareAnim();
                        
    this.in_progress = true;
    this.calc();
        
    let dot = this;
                
    let start;        
    let time = null;
    let fraction = 0;
    let request = null;
    
    let bg = rgbaStrToObj(rgbaStrFromColor(this.background));
    let bc = rgbaStrToObj(rgbaStrFromColor(this.border_color));
    
    let new_bg = Object.assign({}, bg);
    let new_bc = Object.assign({}, bc);
   
    function fadeOutAnim() {
        time = Date.now();
        fraction = (time - start) / (duration * 1000);
              
        if(dot.gradient !== null) {
            let new_gr = dot.gradient.instanceCopy();
            new_gr.fade(1 - fraction);
            dot.anim_gradient = new_gr.instanceCopy();
        }  
        
        new_bg.a = bg.a * (1 - fraction);
        dot.anim_background = rgbaObjToStr(new_bg);
                
        new_bc.a = bc.a * (1 - fraction);              
        dot.anim_border_color = rgbaObjToStr(new_bc);
        
        let calc_func = dot.calc.bind(dot);
        calc_func();
            
        if(fraction > 1) {
            dot.stopFadingOut();
            cancelAnimationFrame(request);
            dispatchEvent(new CustomEvent("segment-dot-faded-out", { detail : { dot : dot } }));
        }
        else {
            dot.visible = true;
            window.requestAnimFrame(fadeOutAnim);
        }            
    };
        
    request = setTimeout(function() {
        start = Date.now();
        window.requestAnimFrame(fadeOutAnim); }, delay * 1000);
};

SegmentDot.prototype.stopFadingOut = function() {
    this.visible = false;
    this.in_progress = false;
    
    this.calc();
};

SegmentDot.prototype.instanceCopy = function() {
    const copy = new this.constructor();
    const keys = Object.keys(this);
    keys.forEach(key => { copy[key] = this[key]; });
    return copy;
};
