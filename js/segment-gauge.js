function SegmentGauge(id, context, center_x, center_y, inner_radius, thickness, initial_angle = -90, angle = 360) {    
    this.id = id; // segment identificator as a text string
    this.context = context; // CanvasRenderingContext2D for drawing a segment
    this.cx = center_x; // X coordinate of the segment center
    this.cy = center_y; // Y coordinate of the segment center
    this.r_in = inner_radius; // segment inner radius
    this.thickness = thickness; // segment thickness
    this.r_out = inner_radius + thickness; // segment outer radius
    this.init_angle = initial_angle; // segment initial angle
    this.angle = angle; // 
    
    this.base_segment = null;
    this.base_segment_gradient = null;
    this.base_segment_background = "rgba(230, 230, 230, 1)";
    this.base_segment_border_width = 0;
    this.base_segment_border_color = 'none';
    
    this.frame = null; 
    this.frame_gradient = null;
    this.frame_background = "rgba(0, 0, 0, 0)";
    this.frame_border_width = 0;
    this.frame_border_color = 'rgba(0, 0, 0, 0)';
        
    this.scale = null;
    this.arrow = null;
        
    this.min_value = 0;
    this.max_value = 200;
    this.value = 0;
    this.speed = 0.5; // value change animation speed
       
    this.font_family = 'Arial';
    this.font_size = '15px';
    this.font;
    this.text_color = 'black';
    this.text_border_width = 0;
    this.text_border_color = 'black';
    
    this.text;
    this.text_offset_x = 0;
    this.text_offset_y = 20;
       
    this.visible = true;
    this.in_progress = false;
    
    this.anim_value = this.value;                
                
    this.build();
    this.calc();
};

SegmentGauge.prototype.calc = function() {     
    if(this.in_progress) {
        
    }
    else {
        //this.progress_segment.angle = this.valueToAngle();
        //this.progress_segment.calc();
    }
    
    dispatchEvent(new CustomEvent("segment-gauge-changed", { detail : { gauge : this } } ));
};
   
SegmentGauge.prototype.build = function() {
    this.base_segment = new Segment(this.id + '-base-segment', this.context, this.cx, this.cy, this.r_in, this.thickness, this.init_angle, 360);
    if(this.base_segment_gradient) { this.base_segment.gradient = this.base_segment_gradient.instanceCopy(); }
    this.base_segment.background = this.base_segment_background;
    this.base_segment.border_width = this.base_segment_border_width;
    this.base_segment.border_color = this.base_segment_border_color;
    this.base_segment.calc();
    
    this.frame = new Segment(this.id + '-frame', this.context, this.cx, this.cy, this.thickness, this.thickness * 0.1, this.init_angle, 360);
    if(this.frame_gradient) { this.frame.gradient = this.frame_gradient.instanceCopy(); }
    this.frame.background = this.frame_background;
    this.frame.border_width = this.frame_border_width;
    this.frame.border_color = this.frame_border_color;
    this.frame.calc();
    
    this.glass = new Segment(this.id + '-glass', this.context, this.cx, this.cy, this.thickness * 0.5, this.thickness, this.init_angle, 360);
    if(this.glass_gradient) { this.glass.gradient = this.glass_gradient.instanceCopy(); }
    this.glass.background = this.glass_background;
    this.glass.border_width = this.glass_border_width;
    this.glass.border_color = this.glass_border_color;
    this.glass.calc();
        
    this.scale = new SegmentScale(this.id + '-scale', this.context, this.cx, this.cy, this.r_in + this.thickness - 30, 25, this.init_angle, this.angle);
    this.scale.background = 'white';
    this.scale.base_segment.border_width = 0;
    this.scale.base_segment.border_color = 'none';
    this.scale.base_segment.calc();
    this.scale.mark_position = 'outer';
    this.scale.levels = [
            { 'divisions_count' : 9, 'mark_length' : 12, 'mark_width' : 2, 'mark_color' : 'black' },
            { 'divisions_count' : 2, 'mark_length' : 7, 'mark_width' : 1, 'mark_color' : 'black' },
            { 'divisions_count' : 5, 'mark_length' : 5, 'mark_width' : 0.5, 'mark_color' : 'black' }
        ];
    this.scale.build();
    this.scale.calc();
    
    this.arrow = new SegmentArrow(this.id + '-arrow', this.context, this.cx, this.cy, this.thickness * 0.1, this.thickness - 15, this.init_angle);
    this.arrow.angle = this.valueToAngle(this.value);
    this.arrow.calc();
        
    //let angle = this.valueToAngle();
        
    let gauge = this;
    
    addEventListener("segment-changed", function(e) { 
        if(e.detail.segment === gauge.base_segment || e.detail.segment === gauge.frame || e.detail.segment === gauge.glass) {
            dispatchEvent(new CustomEvent("segment-gauge-changed", { detail : { gauge : gauge } } ));
        }
    });
    
    addEventListener("segment-scale-changed", function(e) {
        if(e.detail.scale === gauge.scale) {
            dispatchEvent(new CustomEvent("segment-gauge-changed", { detail : { gauge : gauge } } ));
        }
    });
    
    addEventListener("segment-arrow-changed", function(e) {
        if(e.detail.arrow === gauge.arrow) {
            dispatchEvent(new CustomEvent("segment-gauge-changed", { detail : { gauge : gauge } } ));
        }
    });
};

SegmentGauge.prototype.draw = function() {
    this.base_segment.draw();
    this.frame.draw();
    this.scale.draw();
    
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

    //if(this.in_progress) { text = '' + this.anim_text; }
    //else { text = '' + this.text; }
    text = '' + this.text;

    let x = this.cx + this.text_offset_x;
    let y = this.cy + this.text_offset_y;
    
    this.context.fillText(text, x, y);
    this.context.strokeText(text, x, y);
    
    this.arrow.draw();
};

SegmentGauge.prototype.valueToAngle = function(value = this.value) {
    while(this.angle < 0) { this.angle += 360; }
    if(this.angle > 360) { this.angle = 360; }
    
    let a = this.angle * (value - this.min_value) / (this.max_value - this.min_value);   
    return a;
};

SegmentGauge.prototype.setValue = function(new_value) {
    this.value = new_value;
    this.arrow.angle = this.init_angle + this.valueToAngle(new_value);

    this.arrow.calc();
    this.calc();
};

SegmentGauge.prototype.changeValue = function(new_value, speed = this.speed, delay = 0) {
    let gauge = this;
    let arrow = gauge.arrow;
    
    if(speed <= 0) {
        this.value = new_value;
        this.calc();
        dispatchEvent(new CustomEvent("segment-gauge-value-changed", { detail : { gauge : gauge } }));
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
            arrow.visible = true;
            gauge.anim_value = (old_value + v).toFixed(0);
            arrow.angle = old_angle + a;
            arrow.angle %= 360;
            arrow.calc();
            window.requestAnimFrame(changeValueAnim);
        }
        
        if(fraction > 1) {
            gauge.value = parseInt(new_value.toFixed(0));
            gauge.in_progress = false;
            gauge.calc();
            cancelAnimationFrame(request);
            dispatchEvent(new CustomEvent("segment-gauge-value-changed", { detail : { gauge : gauge } }));
        }
        else {
        }            
    };
        
    request = setTimeout(function() {
        start = Date.now();
        window.requestAnimFrame(changeValueAnim);
    }, delay * 1000);
};

SegmentGauge.prototype.prepareAnim = function() {
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
    
SegmentGauge.prototype.isPointInside = function(x, y) {
    if(this.angle >= 360) return true;
    
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

SegmentGauge.prototype.instanceCopy = function() {
    const copy = new this.constructor();
    const keys = Object.keys(this);
    keys.forEach(key => { copy[key] = this[key]; });
    return copy;
};