function SegmentKnob(id, context, center_x, center_y, inner_radius, thickness, initial_angle = -90, angle = 360) {    
    this.id = id; // Object identificator
    this.context = context; // CanvasRenderingContext2D for drawing a segment dots array
    this.cx = center_x; // X coordinate of the base segment center
    this.cy = center_y; // Y coordinate of the base segment center
    this.r_in = inner_radius; // base segment inner radius
    this.thickness = thickness; // base segment thickness
    this.r_out = inner_radius + thickness; // base segment outer radius
    this.init_angle = initial_angle; // base segment initial angle
    this.angle = angle; // base segment angle
           
    this.base_segment = null;
    
    this.gradient = new SegmentGradient('radial', 'from-center', '#fff 0%, #eee 80%, #ccc 86%, #666 90%, #eee 95%, #ddd 100%');
    this.background = "rgba(200, 200, 200, 1)";
    this.border_width = 1;
    this.border_color = "rgba(100, 100, 100, 1)";
    
    this.notch_type = 'dot'; // 'dot' - SegmentDot, 'mark' - SegmentScaleMark
    this.notch_init_angle = this.angle / 2;
    this.notch_min_angle = 180;
    this.notch_max_angle = 360;    
    this.notch_angle = 180;
    this.notch_width = 1; // dot_border_width or mark_width
    this.notch_color = 'rgba(50, 50, 50, 1)'; // dot_border_color or mark_color
    
    this.dot = null;
    this.dot_radius = 5;
    this.dot_base_radius = this.r_in + this.thickness * 0.7;
    this.dot_gradient = null;
    this.dot_background = 'rgba(150, 150, 150, 1)';
    
    this.mark = null;
    this.mark_r_in = this.r_in + this.thickness - 9;
    this.mark_length = 8;
    
    this.visible = true;
    this.notch_visible = true;
    this.in_progress = false;
    this.is_active = false;
     
    this.build();
    this.calc();
};

SegmentKnob.prototype.build = function() {
    this.base_segment = new Segment(this.id + '_base_segment', this.context, this.cx, this.cy, this.r_in, this.thickness, this.init_angle, this.angle);
    if(this.gradient) { this.base_segment.gradient = this.gradient.instanceCopy(); }
    this.base_segment.background = this.background;this.base_segment.border_width = this.border_width;
    this.base_segment.border_color = this.border_color;       
    this.base_segment.calc();    
    
    let angle = this.init_angle + this.notch_init_angle;
    let a = angle * Math.PI / 180;
    
    if(this.notch_type === 'dot') {    
        let nx = this.dot_base_radius * Math.cos(a) + this.cx;
        let ny = this.dot_base_radius * Math.sin(a) + this.cy;
        this.dot = new SegmentDot(this.id + '_notch', this.context, nx, ny, this.dot_radius);
        if(this.dot_gradient) { this.dot.gradient = this.dot_gradient.instanceCopy(); }
        this.dot.background = this.dot_background;
        this.dot.border_width = this.notch_width;
        this.dot.border_color = this.notch_color;
        this.dot.calc();
    }
    else if(this.notch_type === 'mark') {
        this.mark = new SegmentScaleMark(this.id + '_notch', this.context, this.cx, this.cy, this.mark_r_in, this.mark_length, angle);
        this.mark.width = this.notch_width;
        this.mark.color = this.notch_color;
        this.mark.calc();
    }
    
    let knob = this;
       
    addEventListener("segment-changed", function(e) { 
        if(e.detail.segment === knob.base_segment) {
            dispatchEvent(new CustomEvent("segment-knob-changed", { detail : { knob : knob } } ));
        }
    });

    addEventListener("segment-dot-changed", function(e) {
        if(e.detail.dot === knob.dot) {
            dispatchEvent(new CustomEvent("segment-knob-changed", { detail : { knob : knob } } ));
        }
    });
    
    addEventListener("segment-scale-mark-changed", function(e) {
        if(e.detail.mark === knob.mark) {
            dispatchEvent(new CustomEvent("segment-knob-changed", { detail : { knob : knob } } ));
        }
    });
    
    this.mousedown = function(e) { knob.catchKnob(e); };
    this.context.canvas.addEventListener('mousedown', knob.mousedown);
    
    this.mousemove = function(e) { knob.rotateKnobByMouseMovement(e); };
    this.context.canvas.addEventListener('mousemove', knob.mousemove);

    this.wheel = function(e) { knob.rotateKnobByMouseWheel(e); };
    this.context.canvas.addEventListener('wheel', knob.wheel);

    this.mouseup = function() { knob.releaseKnob(); };
    this.context.canvas.addEventListener('mouseup', knob.mouseup);
    
    this.mouseout = function() { knob.releaseKnob(); };    
    this.context.canvas.addEventListener('mouseout', knob.mouseout);
};

SegmentKnob.prototype.calc = function() {
    let notch_angle;
    
    if(this.in_progress) {        
        this.anim_start_a = this.anim_init_angle * Math.PI / 180;
        this.anim_end_a = (this.anim_init_angle + this.anim_angle) * Math.PI / 180;
   
        this.anim_dx1 = this.anim_r_in * Math.cos(this.anim_start_a) + this.cx;
        this.anim_dy1 = this.anim_r_in * Math.sin(this.anim_start_a) + this.cy;
        this.anim_dx2 = this.anim_r_out * Math.cos(this.anim_start_a) + this.cx;
        this.anim_dy2 = this.anim_r_out * Math.sin(this.anim_start_a) + this.cy;
        this.anim_dx3 = this.anim_r_out * Math.cos(this.anim_end_a) + this.cx;
        this.anim_dy3 = this.anim_r_out * Math.sin(this.anim_end_a) + this.cy;
        this.anim_dx4 = this.anim_r_in * Math.cos(this.anim_end_a) + this.cx;
        this.anim_dy4 = this.anim_r_in * Math.sin(this.anim_end_a) + this.cy;
        
        notch_angle = this.anim_notch_angle;
    }
    else {
        this.r_out = this.r_in + this.thickness;
        
        this.start_a = this.init_angle * Math.PI / 180;
        this.end_a = (this.init_angle + this.angle) * Math.PI / 180;
        
        this.dx1 = this.r_in * Math.cos(this.start_a) + this.cx;
        this.dy1 = this.r_in * Math.sin(this.start_a) + this.cy;
        this.dx2 = this.r_out * Math.cos(this.start_a) + this.cx;
        this.dy2 = this.r_out * Math.sin(this.start_a) + this.cy;
        this.dx3 = this.r_out * Math.cos(this.end_a) + this.cx;
        this.dy3 = this.r_out * Math.sin(this.end_a) + this.cy;
        this.dx4 = this.r_in * Math.cos(this.end_a) + this.cx;
        this.dy4 = this.r_in * Math.sin(this.end_a) + this.cy;
        
        notch_angle = this.notch_angle;
    }

    let notch_a = notch_angle * Math.PI / 180;
    if(this.notch_type === 'dot' && this.dot !== null) {
        let nx = this.dot_base_radius * Math.cos(notch_a) + this.cx;
        let ny = this.dot_base_radius * Math.sin(notch_a) + this.cy;
        this.dot.cx = nx;
        this.dot.cy = ny;
        this.dot.calc();
    }
    else if(this.notch_type === 'mark' && this.mark !== null) {
        this.mark.angle = notch_a;        
        this.mark.calc();
    }
    
    dispatchEvent(new CustomEvent("segment-knob-changed", { detail : { knob : this } } ));
};

SegmentKnob.prototype.draw = function() {
    this.base_segment.draw();
   
    if(this.notch_type === 'dot' && this.dot !== null) {
        this.dot.draw();
    }
    else if(this.notch_type === 'mark' && this.mark !== null) {
        this.mark.draw();
    }
};

SegmentKnob.prototype.setNotchAngle = function(angle) {
    this.notch_angle = angle;
    
    this.init_angle = angle - this.notch_init_angle;
        
    this.base_segment.init_angle = this.init_angle;
    this.base_segment.calc();
    
    this.anim_notch_angle = angle;
    this.anim_init_angle = angle - this.notch_init_angle;
        
    let a = angle * Math.PI / 180;
           
    if(this.notch_type === 'dot') {    
        let nx = this.dot_base_radius * Math.cos(a) + this.cx;
        let ny = this.dot_base_radius * Math.sin(a) + this.cy;
        this.dot.cx = nx;
        this.dot.cy = ny;
        this.dot.calc();
    }
    else if(this.notch_type === 'mark') {
        this.mark.angle = angle;
        this.mark.calc();
    }
    
    this.calc();
};

SegmentKnob.prototype.changeNotchAngle = function(anlge) {
    
};

SegmentKnob.prototype.catchKnob = function(e) {
    let knob = this;
    
    if(knob.isPointInside(e.offsetX, e.offsetY)) {
        knob.is_active = true;
        
        knob.sx = e.offsetX - knob.cx;
        knob.sy = e.offsetY - knob.cy;
    }
};

SegmentKnob.prototype.rotateKnobByMouseMovement = function(e) {   
    if(this.is_active) {       
        let x1 = this.sx;
        let y1 = this.sy;
        let x2 = e.offsetX - this.cx;
        let y2 = e.offsetY - this.cy;
        
        let a = Math.atan( (x1 * y2 - y1 * x2) / (x1 * x2 + y1 * y2) ) * 180 / Math.PI;
        
        let new_a = this.notch_angle + a;
        if(new_a < this.notch_min_angle) { this.setNotchAngle(this.notch_min_angle); }
        else if(new_a > this.notch_max_angle) { this.setNotchAngle(this.notch_max_angle); }
        else { this.setNotchAngle(new_a); }
                
        this.sx = x2;
        this.sy = y2;
                
        dispatchEvent(new CustomEvent("segment-knob-changed", { detail : { knob : this } } ));
    }    
};

SegmentKnob.prototype.rotateKnobByMouseWheel = function(e) {
    if(this.is_active) {       
        let new_a = this.notch_angle - e.deltaY / 360;
        if(new_a < this.notch_min_angle) { this.setNotchAngle(this.notch_min_angle); }
        else if(new_a > this.notch_max_angle) { this.setNotchAngle(this.notch_max_angle); }
        else { this.setNotchAngle(new_a); }
        
        dispatchEvent(new CustomEvent("segment-knob-changed", { detail : { knob : this } } ));
    }    
};

SegmentKnob.prototype.releaseKnob = function() {
    if(this.is_active) {
        this.init_angle = this.notch_angle - this.notch_init_angle;
        this.base_segment.init_angle = this.init_angle;
        this.base_segment.calc();
        this.calc();

        this.is_active = false;
    }    
};

SegmentKnob.prototype.isPointInside = function(x, y) {
    let init_angle = this.init_angle % 360;
    while(init_angle < 0) { init_angle += 360; }
    
    let px = x - this.cx;
    let py = this.cy - y;
    let r = Math.sqrt(Math.pow(px, 2) + Math.pow(py, 2));
    let a = - (Math.atan2(py, px) * 180 / Math.PI);
    while(a < 0) { a += 360; }
        
    let res = true;
    if(r < this.r_in || r > this.r_out) { res = false; }
    else if((a < init_angle && (a + 360) > (init_angle + this.angle)) || a > (init_angle + this.angle)) { res = false; }
        
    return res;
};

SegmentKnob.prototype.instanceCopy = function() {
    const copy = new this.constructor();
    const keys = Object.keys(this);
    keys.forEach(key => { copy[key] = this[key]; });
    return copy;
};