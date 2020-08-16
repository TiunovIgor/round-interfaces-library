function SegmentProgressBar(id, context, center_x, center_y, inner_radius, thickness, initial_angle = -90, angle = -360) {    
    this.id = id; // segment identificator as a text string
    this.context = context; // CanvasRenderingContext2D for drawing a segment
    this.cx = center_x; // X coordinate of the segment center
    this.cy = center_y; // Y coordinate of the segment center
    this.r_in = inner_radius; // segment inner radius
    this.thickness = thickness; // segment thickness
    this.r_out = inner_radius + thickness; // segment outer radius
    this.init_angle = initial_angle; // segment initial angle   
    this.angle = angle;
    
    if((this.angle %= 360) === 0) { this.angle = 360; }
    else if(this.angle > 360) { this.angle = 360; }
    else if(this.angle < 0) { while(this.angle < 0) { this.angle += 360; }; }
       
    this.min_value = 0;
    this.max_value = 100;
    this.value = 0;
    this.speed = 0.5; // value change animation speed
    
    this.font_family = 'Arial';
    this.font_size = '30px';
    this.font;
    this.text_color = 'black';
    this.text_border_width = 1;
    this.text_border_color = 'rgba(0,0,0,0)';
    this.units = '%';
       
    this.base_segment = null;
    this.active_segment = null;
    
    this.active_segment_thickness = 0.6 * this.thickness;
       
    this.base_segment_gradient = null;
    this.base_segment_background = "rgba(250, 250, 250, 1)";
    this.base_segment_border_width = 1;
    this.base_segment_border_color = "rgba(100, 100, 100, 0.5)";
    
    this.active_segment_gradient = null;
    this.active_segment_background = "rgba(100, 100, 100, 1)";
    this.active_segment_border_width = 0;
    this.active_segment_border_color = 'none';

    this.full_thickness = false;
    this.visible = true;
    this.in_progress = false;
    
    this.anim_value = this.value;                
                
    this.build();
    this.calc();
};

SegmentProgressBar.prototype.calc = function() {     
    if(this.in_progress) {
        
    }
    else {
        this.active_segment.angle = this.valueToAngle();
        this.active_segment.calc();
    }
    
    dispatchEvent(new CustomEvent("segment-progress-bar-changed", { detail : { segment : this } } ));
};
   
SegmentProgressBar.prototype.build = function() {
    this.base_segment = new Segment(this.id + '-base-segment', this.context, this.cx, this.cy, this.r_in, this.thickness, this.init_angle, this.angle);
    if(this.base_segment_gradient) { this.base_segment.gradient = this.base_segment_gradient.instanceCopy(); }
    this.base_segment.background = this.base_segment_background;
    this.base_segment.border_width = this.base_segment_border_width;
    this.base_segment.border_color = this.base_segment_border_color;
    this.base_segment.calc();

    if(this.full_thickness) {
        this.active_segment_thickness = this.thickness;
    }
    
    let active_segment_r_in = this.r_in + (this.thickness - this.active_segment_thickness) / 2;
    let angle = this.valueToAngle();
    
    this.active_segment = new Segment(this.id + '-active-segment', this.context, this.cx, this.cy, active_segment_r_in, this.active_segment_thickness, this.init_angle, this.angle);
    if(this.active_segment_gradient) { this.active_segment.gradient = this.active_segment_gradient.instanceCopy(); }
    this.active_segment.background = this.active_segment_background;
    this.active_segment.border_width = this.active_segment_border_width;
    this.active_segment.border_color = this.active_segment_border_color;
    this.active_segment.calc();
        
    let progress_bar = this;
    
    addEventListener("segment-changed", function(e) { 
        if(e.detail.segment === progress_bar.base_segment) {
            dispatchEvent(new CustomEvent("segment-progress-bar-changed", { detail : { progress_bar : progress_bar } } ));
        }
        
        if(e.detail.segment === progress_bar.active_segment) {
            dispatchEvent(new CustomEvent("segment-progress-bar-changed", { detail : { progress_bar : progress_bar } } ));
        }
    });
};

SegmentProgressBar.prototype.draw = function() {
    this.base_segment.draw();
    this.active_segment.draw();
    
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

    let text;

    if(this.in_progress) { text = '' + this.anim_value + this.units; }
    else { text = '' + this.value + this.units; }
    
    this.context.fillText(text, this.cx, this.cy);
    this.context.strokeText(text, this.cx, this.cy);
};

SegmentProgressBar.prototype.valueToAngle = function(value = this.value) {
    while(this.angle < 0) { this.angle += 360; }
    if(this.angle > 360) { this.angle = 360; }
    
    let a = this.angle * (value - this.min_value) / (this.max_value - this.min_value);
    return a;
};

SegmentProgressBar.prototype.changeValue = function(new_value, speed = this.speed, delay = 0) {
    let progress_bar = this;
    
    if(speed <= 0) {
        this.value = new_value;
        this.calc();
        dispatchEvent(new CustomEvent("segment-progress-bar-value-changed", { detail : { progress_bar : progress_bar } }));
        return;
    }
    
    this.anim_value = this.value;
    let old_value = this.value;
    
    let old_angle = this.valueToAngle(old_value);
    let new_angle = this.valueToAngle(new_value);
                                  
    this.in_progress = true;
    this.calc();        
                
    let start = null;       
    let time = null;
    let fraction = 0;
    let request = null;
       
    function changeValueAnim() {
        time = Date.now();
        fraction = (time - start) / (speed * 1000);
        
        let v = fraction * (new_value - old_value);
        let a = fraction * (new_angle - old_angle);
                
        if(fraction <= 1) {
            progress_bar.anim_value = (old_value + v).toFixed(0);
            progress_bar.active_segment.angle = old_angle + a;
            if(progress_bar.active_segment.angle > 360) { progress_bar.active_segment.angle = 360; }
            progress_bar.active_segment.calc();
        }
        
        if(fraction > 1) {
            progress_bar.value = parseInt(new_value.toFixed(0));
            progress_bar.in_progress = false;
            progress_bar.calc();
            cancelAnimationFrame(request);
            dispatchEvent(new CustomEvent("segment-progress-bar-value-changed", { detail : { progress_bar : progress_bar } }));
        }
        else {
            progress_bar.active_segment.visible = true;
            window.requestAnimFrame(changeValueAnim);
        }            
    };
        
    request = setTimeout(function() {
        start = Date.now();
        window.requestAnimFrame(changeValueAnim);
    }, delay * 1000);
};

SegmentProgressBar.prototype.prepareAnim = function() {
    this.anim_r_in = this.r_in;
    this.anim_thickness = this.thickness;
    this.anim_r_out = this.r_out;
    this.anim_init_angle = this.init_angle;
    this.anim_angle = this.angle;
    
    if(this.gradient) { this.anim_gradient = this.gradient.instanceCopy(); }
    this.anim_background = this.background;
    this.anim_border_width = this.border_width;
    this.anim_border_color = this.border_color;
    
    this.anim_border_opening_color = this.border_opening_color;
    this.anim_border_closing_color = this.border_closing_color;
    this.anim_border_outer_color = this.border_outer_color;
    this.anim_border_inner_color = this.border_inner_color;
};    
    
SegmentProgressBar.prototype.appear = function(direction, duration, delay) {
    this.prepareAnim();
                        
    this.in_progress = true;
    this.calc();
        
    let segment = this;
                
    let start = null;       
    let time = null;
    let fraction = 0;
    let request = null;
       
    function appearAnim() {
        time = Date.now();
        fraction = (time - start) / (duration * 1000);

        let anim_func;
        if(direction === 'from-center') { anim_func = segment.appearFromCenter.bind(segment); }
        else if(direction === 'to-center') { anim_func = segment.appearToCenter.bind(segment); }
        else if(direction === 'from-axis') { anim_func = segment.appearFromAxis.bind(segment); }
        else if(direction === 'clockwise') { anim_func = segment.appearClockwise.bind(segment); }
        else if(direction === 'anticlockwise') { anim_func = segment.appearAnticlockwise.bind(segment); }       
        anim_func(fraction);      
            
        if(fraction > 1) {
            segment.stopAppearance();
            cancelAnimationFrame(request);
            dispatchEvent(new CustomEvent("segment-appeared", { detail : { segment : segment } }));
        }
        else {
            segment.visible = true;
            window.requestAnimFrame(appearAnim);
        }            
    };
        
    request = setTimeout(function() {
        start = Date.now();
        window.requestAnimFrame(appearAnim);
    }, delay * 1000);
};        
        
SegmentProgressBar.prototype.appearFromCenter = function(t) {
    let r = this.r_in + (this.r_out - this.r_in) * t;
    if(r < this.r_out) { this.anim_r_out = r; }
    else { this.anim_r_out = this.r_out; };
    this.calc();
};
    
SegmentProgressBar.prototype.appearToCenter = function(t) {
    let r = this.r_out - (this.r_out - this.r_in) * t;
    if(r > this.r_in) { this.anim_r_in = r; }
    else { this.anim_r_in = this.r_in; }
    this.calc();
};
    
SegmentProgressBar.prototype.appearFromAxis = function(t) {
    let a = (this.angle / 2) * t;
    if(a < this.angle / 2) {
        this.anim_init_angle = this.init_angle + this.angle/2 - a;
        this.anim_angle = a * 2;
    }
    else {
        this.anim_init_angle = this.init_angle;
        this.anim_angle = this.angle;
    }
    this.calc();
};
    
SegmentProgressBar.prototype.appearClockwise = function(t) {
    let a = this.angle * t;
    if(a < this.angle) { this.anim_angle = a; }
    else { this.anim_angle = this.angle; }
    this.calc();
};
    
SegmentProgressBar.prototype.appearAnticlockwise = function(t) {
    let a = this.angle * t;
    if(a < this.angle) {
        this.anim_init_angle = this.init_angle + this.angle - a;
        this.anim_angle = a;
    }
    else {
        this.anim_init_angle = this.init_angle;
        this.anim_angle = this.angle;
    }
    this.calc();
};

SegmentProgressBar.prototype.stopAppearance = function() {
    this.anim_r_in = 0;
    this.anim_r_out = 0;
    this.anim_init_angle = 0;
    this.anim_angle = 0;
    
    this.in_progress = false;
    this.visible = true;
    
    this.calc();
};

SegmentProgressBar.prototype.disappear = function(direction, duration, delay) {   
    this.prepareAnim();
                        
    this.in_progress = true;
    this.calc();
        
    let segment = this;
                
    let start;        
    let time = null;
    let fraction = 0;
    let request = null;
       
    function disappearAnim() {
        time = Date.now();
        fraction = (time - start) / (duration * 1000);

        let anim_func;
        if(direction === 'from-center') { anim_func = segment.disappearFromCenter.bind(segment); }
        else if(direction === 'to-center') { anim_func = segment.disappearToCenter.bind(segment); }
        else if(direction === 'to-axis') { anim_func = segment.disappearToAxis.bind(segment); }
        else if(direction === 'clockwise') { anim_func = segment.disappearClockwise.bind(segment); }
        else if(direction === 'anticlockwise') { anim_func = segment.disappearAnticlockwise.bind(segment); }       
        anim_func(fraction);      
            
        if(fraction > 1) {
            segment.stopDisappearance();
            cancelAnimationFrame(request);
            dispatchEvent(new CustomEvent("segment-disappeared", { detail : { segment : segment } }));
        }
        else {
            segment.visible = true;
            window.requestAnimFrame(disappearAnim);
        }            
    };
        
    request = setTimeout(function() {
        start = Date.now();
        window.requestAnimFrame(disappearAnim);
    }, delay * 1000);
};        
    
SegmentProgressBar.prototype.disappearFromCenter = function(t) {
    let r = this.r_in + (this.r_out - this.r_in) * t;
    if(r < this.r_out) { this.anim_r_in = r; }
    else { this.anim_r_in = this.r_out; };
    this.calc();
};
    
SegmentProgressBar.prototype.disappearToCenter = function(t) {
    let r = this.r_out - (this.r_out - this.r_in) * t;
    if(r > this.r_in) { this.anim_r_out = r; }
    else { this.anim_r_out = this.r_in; }
    this.calc();
};
    
SegmentProgressBar.prototype.disappearToAxis = function(t) {
    let a = (this.angle / 2) * t;
    if(a < this.angle / 2) {
        this.anim_init_angle = this.init_angle + a;
        this.anim_angle = this.angle - a * 2;
    }
    else {
        this.anim_init_angle = this.init_angle;
        this.anim_angle = this.angle;
    }
    this.calc();
};
    
SegmentProgressBar.prototype.disappearClockwise = function(t) {
    let a = this.angle * t;
    if(a < this.angle) { 
        this.anim_init_angle = this.init_angle + a;
        this.anim_angle = this.angle - a;
    }
    else {
        this.anim_init_angle = this.init_angle;
        this.anim_angle = 0;
    }
    this.calc();
};
    
SegmentProgressBar.prototype.disappearAnticlockwise = function(t) {
    let a = this.angle * t;
    if(a < this.angle) {
        this.anim_init_angle = this.init_angle;
        this.anim_angle = this.angle - a;
    }
    else {
        this.anim_init_angle = this.init_angle;
        this.anim_angle = 0;
    }
    this.calc();
};

SegmentProgressBar.prototype.stopDisappearance = function() {
    this.anim_r_in = 0;
    this.anim_r_out = 0;
    this.anim_init_angle = 0;
    this.anim_angle = 0;
    
    this.in_progress = false;
    this.visible = false;
    
    this.calc();
};

SegmentProgressBar.prototype.rotate = function(direction, angle, duration, delay) {       
    this.prepareAnim();
                        
    this.in_progress = true;
    this.calc();
        
    let segment = this;
                
    let start;
    let time = null;
    let fraction = 0;
    let request = null;
       
    function rotateAnim() {
        time = Date.now();
        
        fraction = (time - start) * angle / (duration * 1000);
           
        let anim_func;
        if(direction === 'clockwise') { anim_func = segment.rotateClockwise.bind(segment); }
        else if(direction === 'anticlockwise') { anim_func = segment.rotateAnticlockwise.bind(segment); }
        anim_func(fraction);      
            
        if((time - start) > duration * 1000) { 
            segment.stopRotation();
            cancelAnimationFrame(request);
            dispatchEvent(new CustomEvent("segment-rotated", { detail : { segment : segment } }));
        }
        else {
            segment.visible = true;
            window.requestAnimFrame(rotateAnim);
        }            
    };
        
    request = setTimeout(function() {
        start = Date.now();
        window.requestAnimFrame(rotateAnim); }, delay * 1000);
};

SegmentProgressBar.prototype.rotateClockwise = function(a) {
    this.anim_init_angle = this.init_angle + a;
    this.calc();
};

SegmentProgressBar.prototype.rotateAnticlockwise = function(a) {
    this.anim_init_angle = this.init_angle - a;
    this.calc();
};

SegmentProgressBar.prototype.stopRotation = function() {
    this.r_in = this.anim_r_in;
    this.r_out = this.anim_r_out;
    this.init_angle = this.anim_init_angle;
    this.angle = this.anim_angle;
    
    this.anim_r_in = 0;
    this.anim_r_out = 0;
    this.anim_init_angle = 0;
    this.anim_angle = 0;
        
    this.in_progress = false;
        
    this.calc();
};

SegmentProgressBar.prototype.fadeIn = function(duration, delay) {    
    this.prepareAnim();

    this.calc();
    this.in_progress = true;
        
    let segment = this;
                
    let start;
    let time = null;
    let fraction = 0;
    let request = null;
    
    let bg = rgbaStrToObj(rgbaStrFromColor(this.background));

    let opening_bc = rgbaStrToObj(rgbaStrFromColor(this.opening_stroke_style));
    let closing_bc = rgbaStrToObj(rgbaStrFromColor(this.closing_stroke_style));
    let outer_bc = rgbaStrToObj(rgbaStrFromColor(this.outer_stroke_style));
    let inner_bc = rgbaStrToObj(rgbaStrFromColor(this.inner_stroke_style)); 
        
    let new_bg = Object.assign({}, bg);

    let new_opening_bc = Object.assign({}, opening_bc);
    let new_closing_bc = Object.assign({}, closing_bc);
    let new_outer_bc = Object.assign({}, outer_bc);
    let new_inner_bc = Object.assign({}, inner_bc);
   
    function fadeInAnim() {
        time = Date.now();
        fraction = (time - start) / (duration * 1000);
        
        if(segment.gradient !== null) {
            let new_gr = segment.gradient.instanceCopy();
            new_gr.fade(fraction);
            segment.anim_gradient = new_gr.instanceCopy();
        }
        
        new_bg.a = bg.a * (fraction);
        segment.anim_background = rgbaObjToStr(new_bg);
           
        new_opening_bc.a = opening_bc.a * (fraction);
        segment.anim_border_opening_color = rgbaObjToStr(new_opening_bc);
        
        new_closing_bc.a = closing_bc.a * (fraction);
        segment.anim_border_closing_color = rgbaObjToStr(new_closing_bc);
        
        new_outer_bc.a = outer_bc.a * (fraction);
        segment.anim_border_outer_color = rgbaObjToStr(new_outer_bc);
        
        new_inner_bc.a = inner_bc.a * (fraction);
        segment.anim_border_inner_color = rgbaObjToStr(new_inner_bc);
        
        let calc_func = segment.calc.bind(segment);
        calc_func();
        
        if(fraction > 1) {
            if(this.gradient !== null && (this.gradient instanceof SegmentGradient)) { this.anim_gradient = this.gradient.instanceCopy(); }
            segment.anim_background = segment.background;    
            segment.anim_border_color = segment.border_color;
            segment.stopFadingIn();
            cancelAnimationFrame(request);
            dispatchEvent(new CustomEvent("segment-faded-in", { detail : { segment : segment } }));
        }
        else {
            segment.visible = true;
            window.requestAnimFrame(fadeInAnim);
        }            
    };
        
    request = setTimeout(function() {
        start = Date.now();
        window.requestAnimFrame(fadeInAnim); }, delay * 1000);
};

SegmentProgressBar.prototype.stopFadingIn = function() {
    this.visible = true;
    this.in_progress = false;
    
    this.calc();
};

SegmentProgressBar.prototype.fadeOut = function(duration, delay) {
    this.prepareAnim();
    
    this.in_progress = true;
    this.calc();
        
    let segment = this;
                
    let start;
    let time = null;
    let fraction = 0;
    let request = null;
    
    let bg = rgbaStrToObj(rgbaStrFromColor(this.anim_background));
     
    let opening_bc = rgbaStrToObj(rgbaStrFromColor(this.opening_stroke_style));
    let closing_bc = rgbaStrToObj(rgbaStrFromColor(this.closing_stroke_style));
    let outer_bc = rgbaStrToObj(rgbaStrFromColor(this.outer_stroke_style));
    let inner_bc = rgbaStrToObj(rgbaStrFromColor(this.inner_stroke_style)); 
    
    let new_bg = Object.assign({}, bg);

    let new_opening_bc = Object.assign({}, opening_bc);
    let new_closing_bc = Object.assign({}, closing_bc);
    let new_outer_bc = Object.assign({}, outer_bc);
    let new_inner_bc = Object.assign({}, inner_bc);
    
    function fadeOutAnim() {
        time = Date.now();
        fraction = (time - start) / (duration * 1000);
        
        if(segment.gradient !== null) {
            let new_gr = segment.gradient.instanceCopy();
            new_gr.fade(1 - fraction);
            segment.anim_gradient = new_gr.instanceCopy();
        }
        
        new_bg.a = bg.a * (1 - fraction);
        segment.anim_background = rgbaObjToStr(new_bg);
        
        new_opening_bc.a = opening_bc.a * (1 - fraction);
        segment.anim_border_opening_color = rgbaObjToStr(new_opening_bc);
        
        new_closing_bc.a = closing_bc.a * (1 - fraction);
        segment.anim_border_closing_color = rgbaObjToStr(new_closing_bc);
        
        new_outer_bc.a = outer_bc.a * (1 - fraction);
        segment.anim_border_outer_color = rgbaObjToStr(new_outer_bc);
        
        new_inner_bc.a = inner_bc.a * (1 - fraction);
        segment.anim_border_inner_color = rgbaObjToStr(new_inner_bc);
        
        let calc_func = segment.calc.bind(segment);
        calc_func();
        
        if(fraction > 1) {
            if(this.gradient !== null && (this.gradient instanceof SegmentGradient)) { this.anim_gradient = this.gradient.instanceCopy(); }
            segment.anim_background = segment.background; 
            segment.anim_border_color = segment.border_color;
            segment.stopFadingOut();
            cancelAnimationFrame(request);
            dispatchEvent(new CustomEvent("segment-faded-out", { detail : { segment : segment } }));
        }
        else {
            segment.visible = true;
            window.requestAnimFrame(fadeOutAnim);
        }            
    };
        
    request = setTimeout(function() {
        start = Date.now();
        window.requestAnimFrame(fadeOutAnim); }, delay * 1000);
};       

SegmentProgressBar.prototype.stopFadingOut = function() {
    this.visible = false;
    this.in_progress = false;
    
    this.calc();
};

SegmentProgressBar.prototype.isPointInside = function(x, y) {
    
    let init_angle = this.init_angle % 360;
    while(init_angle < 0) { init_angle += 360; }
    
    let px = x - this.cx;
    let py = this.cy - y;
    let r = Math.sqrt(Math.pow(px, 2) + Math.pow(py, 2));
    let a = - (Math.atan2(py, px) * 180 / Math.PI);
    while(a < 0) { a += 360; }
        
    let res = true;
    if(r < this.r_in || r > this.r_out) { res = false; }
    if((a < init_angle && (a + 360) > (init_angle + this.angle)) || a > (init_angle + this.angle)) { res = false; }
      
    return res;
};

SegmentProgressBar.prototype.instanceCopy = function() {
    const copy = new this.constructor();
    const keys = Object.keys(this);
    keys.forEach(key => { copy[key] = this[key]; });
    return copy;
};