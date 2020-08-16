function SegmentSpiralVolumeControl(id, context, center_x, center_y, inner_radius, thickness, initial_angle = -90, angle) {    
    this.id = id; // segment identificator as a text string
    this.context = context; // CanvasRenderingContext2D for drawing a segment
    this.cx = center_x; // X coordinate of the segment center
    this.cy = center_y; // Y coordinate of the segment center
    this.r_in = inner_radius; // segment inner radius
    this.thickness = thickness; // segment thickness
    this.r_out = inner_radius + thickness; // segment outer radius
    this.init_angle = initial_angle; // segment initial angle
    this.angle = angle;
       
    this.min_value = 0;
    this.max_value = 100;
    this.value = 0;
    this.speed = 0.5; // value change animation speed
    
    this.min_text = 'min';
    this.min_font = '11pt Arial';
    this.min_color = 'black';
    this.min_border_width = 1;
    this.min_border_color = 'rgba(0, 0, 0, 0)';
    this.min_init_x = 0;
    this.min_init_y = 0;
    this.min_offset_x = 0;
    this.min_offset_y = 15;
    
    this.max_text = 'max';
    this.max_font = '11pt Arial';
    this.max_color = 'black';
    this.max_border_width = 1;
    this.max_border_color = 'rgba(0, 0, 0, 0)';   
    this.max_init_x = 0;
    this.max_init_y = 0;
    this.max_offset_x = 0;
    this.max_offset_y = 15;
       
    this.base_spiral = null;
    this.active_spiral = null;
    this.knob = null;
           
    this.base_spiral_gradient = null;
    this.base_spiral_background = "rgba(200, 200, 200, 1)";
    this.base_spiral_border_width = 1;
    this.base_spiral_border_color = "rgba(100, 100, 100, 0)";
    
    this.active_spiral_gradient = null;
    this.active_spiral_background = "rgba(50, 50, 50, 1)";
    this.active_spiral_border_width = 0;
    this.active_spiral_border_color = 'none';

    this.visible = true;
    this.in_progress = false;
    
    this.anim_value = this.value;                
                
    this.build();
    this.calc();
};

SegmentSpiralVolumeControl.prototype.calc = function() {     
    if(this.in_progress) {
        
    }
    else {
        /*this.active_spiral.angle = this.valueToAngle();
        this.active_spiral.thickness = this.valueToThickness();
        this.active_spiral.calc();
        */
    }
    
    dispatchEvent(new CustomEvent("segment-spiral-volume-control-changed", { detail : { volume_control : this } } ));
};

SegmentSpiralVolumeControl.prototype.calcLabels = function() {
    let base = this.base_spiral;
    
    let start_a = base.init_angle * Math.PI / 180;
    let end_a = (base.init_angle + base.angle) * Math.PI / 180; 
    
    this.min_init_x = (base.r_in + 15) * Math.cos(start_a) + base.cx;
    this.min_init_y = (base.r_in + 15) * Math.sin(start_a) + base.cy;
    
    this.max_init_x = (base.r_in + 15) * Math.cos(end_a) + base.cx;
    this.max_init_y = (base.r_in + 15) * Math.cos(end_a) + base.cy;
};
   
SegmentSpiralVolumeControl.prototype.build = function() {
    this.base_spiral = new SegmentSpiral(this.id + '-base-spiral', this.context, this.cx, this.cy, this.r_in, this.thickness, this.init_angle, this.angle);
    if(this.base_spiral_gradient) { this.base_spiral.gradient = this.base_spiral_gradient.instanceCopy(); }
    this.base_spiral.background = this.base_spiral_background;
    this.base_spiral.border_width = this.base_spiral_border_width;
    this.base_spiral.border_color = this.base_spiral_border_color;
    this.base_spiral.calc();
    
    let angle = this.valueToAngle();
    
    this.active_spiral = new SegmentSpiral(this.id + '-active-spiral', this.context, this.cx, this.cy, this.r_in, this.thickness, this.init_angle, angle);
    if(this.active_spiral_gradient) { this.active_spiral.gradient = this.active_spiral_gradient.instanceCopy(); }
    this.active_spiral.background = this.active_spiral_background;
    this.active_spiral.border_width = this.active_spiral_border_width;
    this.active_spiral.border_color = this.active_spiral_border_color;
    this.active_spiral.calc();
    
    this.calcLabels();
    
    this.knob = new SegmentKnob(this.id + '-knob', this.context, this.cx, this.cy, 0, this.thickness * 0.6);
    this.knob.calc();
    
    this.removeKnobListeners();
    
    let control = this;
    
    this.removeKnobListeners();
        
    this.mousedown = function(e) { control.catchKnob(e); };        
    this.context.canvas.addEventListener('mousedown', control.mousedown);
    
    this.mousemove = function(e) { control.rotateKnobByMouseMovement(e); };
    this.context.canvas.addEventListener('mousemove', control.mousemove);
    
    this.wheel = function(e) { control.rotateKnobByMouseWheel(e); };
    this.context.canvas.addEventListener('wheel', control.wheel);
    
    this.mouseup = function() { control.releaseKnob(); };
    this.context.canvas.addEventListener('mouseup', control.mouseup);
    
    this.mouseout = function() { control.releaseKnob(); };
    this.context.canvas.addEventListener('mouseout', control.mouseout);
};

SegmentSpiralVolumeControl.prototype.draw = function() {
    this.base_spiral.draw();
    this.active_spiral.draw();
    this.knob.draw();
    
    this.context.textAlign = "center";
    this.context.textBaseline = 'middle';
    
    // Draw Min Label
    this.context.font = this.min_font;;
    this.context.fillStyle = this.min_color;
    this.context.lineWidth = this.min_border_width;
    this.context.strokeStyle = this.min_border_color;
    
    this.context.fillText(this.min_text, this.min_init_x + this.min_offset_x, this.min_init_y + this.min_offset_y);
    this.context.strokeText(this.min_text, this.min_init_x + this.min_offset_x, this.min_init_y + this.min_offset_y);
    
    // Draw Max Label;
    this.context.font = this.max_font;;
    this.context.fillStyle = this.max_color;
    this.context.lineWidth = this.max_border_width;
    this.context.strokeStyle = this.max_border_color;
    
    this.context.fillText(this.max_text, this.max_init_x + this.max_offset_x, this.max_init_y + this.max_offset_y);
    this.context.strokeText(this.max_text, this.max_init_x + this.max_offset_x, this.max_init_y + this.max_offset_y);   
};

SegmentSpiralVolumeControl.prototype.catchKnob = function(e) {
    let control = this;
    let knob = this.knob;
    
    if(knob.isPointInside(e.offsetX, e.offsetY)) {
        knob.is_active = true;
        
        control.sx = e.offsetX - control.cx;
        control.sy = e.offsetY - control.cy;
    }
};

SegmentSpiralVolumeControl.prototype.rotateKnobByMouseMovement = function(e) {      
    let control = this;
    let knob = this.knob;
    
    if(knob.is_active) {       
        let x1 = this.sx;
        let y1 = this.sy;
        let x2 = e.offsetX - this.cx;
        let y2 = e.offsetY - this.cy;
        
        let a = Math.atan( (x1 * y2 - y1 * x2) / (x1 * x2 + y1 * y2) ) * 180 / Math.PI;
        let value;
        
        let new_a = knob.notch_angle + a;
        if(new_a < knob.notch_min_angle) {
            knob.setNotchAngle(knob.notch_min_angle);
            value = control.angleToValue(knob.notch_min_angle);
            
        }
        else if(new_a > knob.notch_max_angle) {
            knob.setNotchAngle(knob.notch_max_angle);
            value = control.angleToValue(knob.notch_max_angle);
        }
        else {
            knob.setNotchAngle(new_a);
            value = control.angleToValue(new_a);
        }
        
        control.active_spiral.angle = control.valueToAngle(value);
        control.active_spiral.thickness = control.valueToThickness(value);    
        control.active_spiral.calc();
                              
        this.sx = x2;
        this.sy = y2;
                
        dispatchEvent(new CustomEvent("segment-spiral-volume-control-changed", { detail : { volume_control : control } } ));
    } 
};

SegmentSpiralVolumeControl.prototype.rotateKnobByMouseWheel = function(e) {
    if(this.knob.is_active) {
        let new_a = this.notch_angle - e.deltaY / 360;
        if(new_a < this.notch_min_angle) { this.setNotchAngle(this.notch_min_angle); }
        else if(new_a > this.notch_max_angle) { this.setNotchAngle(this.notch_max_angle); }
        else { this.setNotchAngle(new_a); }        
        
        dispatchEvent(new CustomEvent("segment-spiral-volume-control-changed", { detail : { volume_control : this } } ));
    }    
};

SegmentSpiralVolumeControl.prototype.releaseKnob = function() {
    let knob = this.knob;
    
    if(knob.is_active) {        
        knob.is_active = false;
    }    
};

SegmentSpiralVolumeControl.prototype.angleToValue = function(angle) {
    let k = this.knob;    
    let f = (k.notch_angle - k.notch_min_angle) / (k.notch_max_angle - k.notch_min_angle);
    let v = f * (this.max_value - this.min_value) + this.min_value;
    return v;
};

SegmentSpiralVolumeControl.prototype.valueToAngle = function(value = this.value) {
    let a = this.angle * (value - this.min_value) / (this.max_value - this.min_value);
    return a;
};

SegmentSpiralVolumeControl.prototype.valueToThickness = function(value = this.value) {
    let th = this.thickness * (value - this.min_value) / (this.max_value - this.min_value);
    return th;
};

SegmentSpiralVolumeControl.prototype.setValue = function(new_value) {
    let control = this;
    
    control.active_spiral.angle = control.valueToAngle(new_value);
    control.active_spiral.thickness = control.valueToThickness(new_value);
    control.active_spiral.calc();
        
    this.calc();
};

SegmentSpiralVolumeControl.prototype.changeValue = function(new_value, speed = this.speed, delay = 0) {
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
            progress_bar.progress_segment.angle = old_angle + a;
            progress_bar.progress_segment.angle %= 360;
            progress_bar.progress_segment.calc();
        }
        
        if(fraction > 1) {
            progress_bar.value = parseInt(new_value.toFixed(0));
            progress_bar.in_progress = false;
            progress_bar.calc();
            cancelAnimationFrame(request);
            dispatchEvent(new CustomEvent("segment-progress-bar-value-changed", { detail : { progress_bar : progress_bar } }));
        }
        else {
            progress_bar.progress_segment.visible = true;
            window.requestAnimFrame(changeValueAnim);
        }            
    };
        
    request = setTimeout(function() {
        start = Date.now();
        window.requestAnimFrame(changeValueAnim);
    }, delay * 1000);
};

SegmentSpiralVolumeControl.prototype.removeKnobListeners = function() {   
    let control = this;
    let knob = this.knob;
    
    knob.context.canvas.removeEventListener('mousedown', knob.mousedown);
    knob.context.canvas.removeEventListener('mousemove', knob.mousemove);
    knob.context.canvas.removeEventListener('mousewheel', knob.mousewheel);
    knob.context.canvas.removeEventListener('mouseup', knob.mouseup);
    knob.context.canvas.removeEventListener('mouseout', knob.mouseout);
};

SegmentSpiralVolumeControl.prototype.prepareAnim = function() {
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

SegmentSpiralVolumeControl.prototype.instanceCopy = function() {
    const copy = new this.constructor();
    const keys = Object.keys(this);
    keys.forEach(key => { copy[key] = this[key]; });
    return copy;
};