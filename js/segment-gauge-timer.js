function SegmentGaugeTimer(id, context, center_x, center_y, inner_radius, thickness, initial_angle = -90, angle = 360) {    
    SegmentGauge.apply(this, arguments);
        
    //this.units = ' sec';
    
    this.on_pause = false;
    this.on_pause_text = 'on pause';
    this.on_pause_font = '20px Open Sans';
    
    this.build();
    this.calc();
};

SegmentGaugeTimer.prototype = Object.create(SegmentGauge.prototype);
SegmentGaugeTimer.prototype.constructor = SegmentGauge;

SegmentGaugeTimer.prototype.calc = function() {     
    if(this.in_progress) {
        
    }
    else {
        //this.progress_segment.angle = this.valueToAngle();
        //this.progress_segment.calc();
    }
    
    dispatchEvent(new CustomEvent("segment-gauge-timer-changed", { detail : { timer : this } } ));
};
   
SegmentGaugeTimer.prototype.build = function() {
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
                
    let timer = this;
    
    addEventListener("segment-changed", function(e) { 
        if(e.detail.segment === timer.base_segment || e.detail.segment === timer.frame || e.detail.segment === timer.glass) {
            dispatchEvent(new CustomEvent("segment-gauge-timer-changed", { detail : { timer : timer } } ));
        }
    });
    
    addEventListener("segment-scale-changed", function(e) {
        if(e.detail.scale === timer.scale) {
            dispatchEvent(new CustomEvent("segment-gauge-timer-changed", { detail : { timer : timer } } ));
        }
    });
    
    addEventListener("segment-arrow-changed", function(e) {
        if(e.detail.arrow === timer.arrow) {
            dispatchEvent(new CustomEvent("segment-gauge-timer-changed", { detail : { timer : timer } } ));
        }
    });
            
    addEventListener("segment-gauge-changed", function(e) {
        if(e.detail.gauge === timer) {
            dispatchEvent(new CustomEvent("segment-guage-timer-changed", { detail : { timer : timer } } ));
        }
    });
};

SegmentGaugeTimer.prototype.draw = function() {
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

SegmentGaugeTimer.prototype.countdown = function(new_value, value, delay = 0) {    
    let timer = this;
    
    if(value <= 0) {
        this.setValue(new_value);
        this.calc();
        dispatchEvent(new CustomEvent("segment-gauge-timer-value-changed", { detail : { timer : timer } }));
        return;
    }
    
    this.anim_value = this.value;
    let old_value = this.value;
    
    let old_angle = this.init_angle + this.valueToAngle(old_value);
    let new_angle = this.init_angle + this.valueToAngle(new_value);
                                  
    this.in_progress = true;
    this.calc();        
                
    let start = null;       
    let time = null;
    let fraction = 0;
    let request = null;
       
    function changeValueAnim() {
        if(timer.on_pause) {
            return;
        }
        
        time = Date.now();
        fraction = (time - start) / (value * 1000);
        
        let v = fraction * (new_value - old_value);
        let a = fraction * (new_angle - old_angle);
                
        if(fraction <= 1) {
            timer.arrow.visible = true;
            timer.anim_value = (parseFloat(old_value + v)).toFixed(0);
            timer.arrow.angle = old_angle + a;
            timer.arrow.calc();
            timer.calc();
            window.requestAnimFrame(changeValueAnim);
        }
        else {
            timer.value = timer.setValue(parseInt(new_value).toFixed(0));
            timer.in_progress = false;
            timer.calc();
            cancelAnimationFrame(request);
            dispatchEvent(new CustomEvent("segment-gauge-timer-is-up", { detail : { timer : timer } }));
        }         
    }
        
    request = setTimeout(function() {
        start = Date.now();
        window.requestAnimFrame(changeValueAnim);
    }, delay * 1000);
};

SegmentGaugeTimer.prototype.start = function() {
    this.in_progress = true;
    this.on_pause = false;

    this.countdown(this.min_value, this.value, 0);   
};

SegmentGaugeTimer.prototype.pause = function() {
    this.setValue(parseInt(this.anim_value));
    this.on_pause = true;  
    
    this.calc();    
};

SegmentGaugeTimer.prototype.stop = function() {
    this.setValue(this.max_value);
    
    this.in_progress = false;
    this.on_pause = false;
    
    //this.build();
    this.calc();
};