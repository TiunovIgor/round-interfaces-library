function SegmentDotsArrayProgressBar(id, context, center_x, center_y, inner_radius, thickness, initial_angle = -90, angle = 360) {    
    this.id = id; // Object identificator
    this.context = context; // CanvasRenderingContext2D for drawing a segment dots array
    this.cx = center_x; // X coordinate of the base segment center
    this.cy = center_y; // Y coordinate of the base segment center
    this.r_in = inner_radius; // base segment inner radius
    this.thickness = thickness; // base segment thickness
    this.r_out = inner_radius + thickness; // base segment outer radius
    this.init_angle = initial_angle; // base segment initial angle
    this.angle = angle; // base segment angle
    
    this.min_value = 0;
    this.max_value = 100;
    this.value = 0;
    this.speed = 0.5; // value change animation speed
    
    this.font_family = 'Open Sans';
    this.font_size = '30px';
    this.font;
    this.text_color = 'black';
    this.text_border_width = 1;
    this.text_border_color = 'rgba(0,0,0,0)';
    this.units = '%';   
    
    this.base_segment = null;
    
    this.gradient = null;
    this.background = "rgba(240, 240, 240, 1)";
    this.border_width = 1;
    this.border_color = "rgba(100, 100, 100, 1)";
    
    this.proportional = false;
    this.start_with = 'dot';
    
    this.dots = [];
    this.dots_count = 24;
    this.dot_angle = 7;
    this.dot_radius = 4;
    this.base_radius = (this.r_in + this.r_out) / 2;
    
    this.dot_gradient = null;
    this.dot_background = 'rgba(200, 200, 200, 1)';
    this.dot_border_width = 1;
    this.dot_border_color = 'rgba(50, 50, 50, 1)';
    
    this.active_dot_gradient = null;
    this.active_dot_background = 'rgba(100, 100, 100, 1)';
    this.active_dot_border_width = 1;
    this.active_dot_border_color = 'rgba(10, 10, 10, 1)';
        
    this.spaces_count = 100;
    this.space_angle = 3;    
    
    this.visible = true;
    this.dots_visible = true;
    this.in_progress = false;
     
    this.anim_value = this.value; 
     
    this.appeared_dots = [];
    this.disappeared_dots = [];
    this.faded_in_dots = [];
    this.faded_out_dots = [];
    
    this.build();
    this.calc();
};

SegmentDotsArrayProgressBar.prototype.build = function() {
    this.dots = [];
    
    this.base_segment = new Segment(this.id + 'base_segment', this.context, this.cx, this.cy, this.r_in, this.thickness, this.init_angle, this.angle);
    this.base_segment.border_width = this.border_width;
    this.base_segment.border_color = this.border_color;
    
    if(this.gradient) { this.base_segment.gradient = this.gradient.instanceCopy(); }
    this.base_segment.background = this.background;
        
    this.base_segment.calc();    
        
    if(this.angle === 360) { this.spaces_count = this.dots_count; }
    else {
        if(this.start_with === 'dot') { this.spaces_count = this.dots_count - 1; }
        else { this.spaces_count = this.dots_count + 1; }
    }
    
    if(this.proportional) {
        let a = this.angle / (this.dots_count + this.spaces_count);
        this.dot_angle = a;
        this.space_angle = a;
    }
    else {        
        this.space_angle = (this.angle - this.dots_count * this.dot_angle) / this.spaces_count;
    }
    
    let first_angle = this.base_segment.init_angle;
    if(this.start_with === 'space') { first_angle += this.space_angle; }
      
    for(let i=0; i < this.dots_count; i++) {
        let dot_init_angle = first_angle + (this.dot_angle + this.space_angle) * i + this.dot_angle / 2;
        let dot_init_a = dot_init_angle * Math.PI / 180;
        let dot_center_x = this.base_radius * Math.cos(dot_init_a) + this.cx; // Координата X центра точки
        let dot_center_y = this.base_radius * Math.sin(dot_init_a) + this.cy; // Координата Y центра точки
                        
        let dot = new SegmentDot(this.id + '_d_' + (i+1), this.context, dot_center_x, dot_center_y, this.dot_radius);
        if(this.dot_gradient) { dot.gradient = this.dot_gradient.instanceCopy(); }
        dot.background = this.dot_background;
        dot.border_width = this.dot_border_width;
        dot.border_color = this.dot_border_color;
        dot.visible = this.dots_visible;
        dot.calc();
        this.dots.push(dot);
    }
    
    this.active_index = this.valueToActiveIndex(this.value);
    
    let progress_bar = this;
    
    addEventListener("segment-changed", function(e) { 
        if(e.detail.segment === progress_bar.base_segment) {
            dispatchEvent(new CustomEvent("segment-dots-array-progress-bar-changed", { detail : { progress_bar : progress_bar } } ));
        }
    });

    addEventListener("segment-dot-changed", function(e) {
        if(progress_bar.dots.indexOf(e.detail.dot) >= 0) {
            dispatchEvent(new CustomEvent("segment-dots-array-progress-bar-changed", { detail : { progress_bar : progress_bar } } ));
        }
    });
};

SegmentDotsArrayProgressBar.prototype.calc = function() {
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
    }
    else {
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
    }
    
    let progress_bar = this;
    
    this.dots.forEach(function callback(value, index, array) {
        if(index < progress_bar.active_index) {
            if(progress_bar.active_dot_gradient) { value.gradient = progress_bar.active_dot_gradient.instanceCopy(); }
            value.background = progress_bar.active_dot_background;
            value.border_width = progress_bar.active_dot_border_width;
            value.border_color = progress_bar.active_dot_border_color;
        }
        else {
            if(progress_bar.segment_gradient) { value.gradient = progress_bar.dot_gradient.instanceCopy(); }
            value.background = progress_bar.dot_background;
            value.border_width = progress_bar.dot_border_width;
            value.border_color = progress_bar.dot_border_color;
        }
    });
            
    dispatchEvent(new CustomEvent("segment-dots-array-progress-bar-changed", { detail : { progress_bar : this } } ));
};

SegmentDotsArrayProgressBar.prototype.draw = function() {
    this.base_segment.draw();
    
    this.dots.forEach(function(dot) {
        dot.draw();
    });
    
    let font = this.font;
    
    if(this.font === undefined || this.font === null || this.font === '') {
        font = this.font_size + ' ' + this.font_family;
    }
    
    this.context.font = font;
    this.context.fillStyle = this.text_color;
        
    this.context.textAlign = "center";
    this.context.textBaseline = 'middle';

    let text;

    if(this.in_progress) { text = '' + this.anim_value + this.units; }
    else { text = '' + this.value + this.units; }
    
    if(this.text_border_color !== '' && this.text_border_color !== 'none') {
        this.context.lineWidth = this.text_border_width;
        this.context.strokeStyle = this.text_border_color;
        this.context.strokeText(text, this.cx, this.cy);
    }    
    
    this.context.fillText(text, this.cx, this.cy);
};

SegmentDotsArrayProgressBar.prototype.valueToActiveIndex = function(value = this.value) {
    let ind = this.dots_count * (value - this.min_value) / (this.max_value - this.min_value);
    ind = Math.floor(ind);
    return ind;
};

SegmentDotsArrayProgressBar.prototype.changeValue = function(new_value, speed = this.speed, delay = 0) {
    let progress_bar = this;
    
    if(speed <= 0) {
        this.value = new_value;
        this.calc();
        dispatchEvent(new CustomEvent("segment-dots-array-progress-bar-value-changed", { detail : { progress_bar : progress_bar } }));
        return;
    }
    
    this.anim_value = this.value;
    let old_value = this.value;
    
    let old_index = this.valueToActiveIndex(old_value);
    let new_index = this.valueToActiveIndex(new_value);
                                      
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
        let ind = fraction * (new_index - old_index);
                
        if(fraction <= 1) {
            progress_bar.anim_value = parseInt((old_value + v).toFixed());
            progress_bar.active_index = parseInt((old_index + ind).toFixed());
            progress_bar.calc();
        }
        
        if(fraction > 1) {
            progress_bar.value = parseInt(new_value.toFixed(0));
            progress_bar.in_progress = false;
            progress_bar.calc();
            cancelAnimationFrame(request);
            dispatchEvent(new CustomEvent("segment-dots-array-progress-bar-value-changed", { detail : { progress_bar : progress_bar } }));
        }
        else {
            progress_bar.dots_visible = true;
            window.requestAnimFrame(changeValueAnim);
        }            
    };
        
    request = setTimeout(function() {
        start = Date.now();
        window.requestAnimFrame(changeValueAnim);
    }, delay * 1000);
};

SegmentDotsArrayProgressBar.prototype.appear = function(order, lag, direction, duration, delay) {
    this.in_progress = true;
    
    this.appeared_dots = [];
    
    let check_func = this.checkAppearedDots.bind(this);
    
    let dots_arr = this;
    let dots = this.dots;   
        
    let dot_duration = duration;
    let lag_array = [];
    
    for(let i=0; i < dots.length; i++) {
        if(order === 'together') {
            lag_array[i] = 0;
        }
        else if(order === 'one-by-one-clockwise') {
            dot_duration = (duration - lag * (dots.length - 1)) / dots.length;
            lag_array[i] = i * (dot_duration + lag);
        }
        else if(order === 'one-by-one-anticlockwise') {
            dot_duration = (duration -lag * (dots.length - 1)) / dots.length;
            lag_array[i] = (dots.length - 1 - i) * (dot_duration + lag);
        }
    }
    
    setTimeout(function() {
        dots.forEach(function callback(value, index, array) {
            value.appear(direction, dot_duration, lag_array[index]);

            addEventListener("segment-dot-appeared", function(e) {
                if(dots.indexOf(e.detail.dot) >= 0) {
                    check_func(e.detail.dot);
                }
            });
        });
    }, delay * 1000);
};

SegmentDotsArrayProgressBar.prototype.checkAppearedDots = function(dot) {
    if(this.dots.indexOf(dot) < 0) {
        return;
    }
    else {    
        if(this.appeared_dots.indexOf(dot) < 0) {
            this.appeared_dots.push(dot);
        }

        let appeared = true;
        let array = this;

        this.dots.forEach(function(d) {
            if(array.appeared_dots.indexOf(d) < 0) {
                appeared = false;
            }
        });    
        
        if(appeared) {
            this.dots_visible = true;
            this.appeared_dots = [];
            this.in_progress = false;
            dispatchEvent(new CustomEvent("segment-dots-array-appeared", { detail : { progress_bar : this } }));
        }
    }
};

SegmentDotsArrayProgressBar.prototype.disappear = function(order, lag, direction, duration, delay) {
    this.in_progress = true;
    
    this.disappeared_dots = [];
    
    let check_func = this.checkDisappearedDots.bind(this);
    
    let seg_arr = this;
    let dots = this.dots;   
        
    let dot_duration = duration;
    let lag_array = [];
    
    for(let i=0; i < dots.length; i++) {
        if(order === 'together') {
            lag_array[i] = 0;
        }
        else if(order === 'one-by-one-clockwise') {
            dot_duration = (duration - lag * (dots.length - 1)) / dots.length;
            lag_array[i] = i * (dot_duration + lag);
        }
        else if(order === 'one-by-one-anticlockwise') {
            dot_duration = (duration -lag * (dots.length - 1)) / dots.length;
            lag_array[i] = (dots.length - 1 - i) * (dot_duration + lag);
        }
    }
    
    setTimeout(function() {
        dots.forEach(function callback(value, index, array) {
            value.disappear(direction, dot_duration, lag_array[index]);

            addEventListener("segment-dot-disappeared", function(e) {
                if(dots.indexOf(e.detail.dot) >= 0) {
                    check_func(e.detail.dot);
                }
            });
        });
    }, delay * 1000);
};

SegmentDotsArrayProgressBar.prototype.checkDisappearedDots = function(dot) {  
    if(this.dots.indexOf(dot) < 0) {
        return;
    }
    else {  
        if(this.disappeared_dots.indexOf(dot) < 0) {
            this.disappeared_dots.push(dot);
        }

        let disappeared = true;
        let array = this;

        this.dots.forEach(function(d) {
            if(array.disappeared_dots.indexOf(d) < 0) {
                disappeared = false;
            }
        });    

        if(disappeared) {    
            this.dots_visible = false;
            this.disappeared_dots.length = 0;
            this.in_progress = false;
            dispatchEvent(new CustomEvent("segment-dots-array-disappeared", { detail : { progress_bar : this } }));
        }    
    };
};

SegmentDotsArrayProgressBar.prototype.fadeIn = function(order, lag, duration, delay) {
    this.in_progress = true;
    
    this.faded_in_dots = [];
    
    let check_func = this.checkFadedInDots.bind(this);
    
    let dot_arr = this;
    let dots = this.dots;   
        
    let dot_duration = duration;
    let lag_array = [];
    
    for(let i=0; i < dots.length; i++) {
        if(order === 'together') {
            lag_array[i] = 0;
        }
        else if(order === 'one-by-one-clockwise') {
            dot_duration = (duration - lag * (dots.length - 1)) / dots.length;
            lag_array[i] = i * (dot_duration + lag);
        }
        else if(order === 'one-by-one-anticlockwise') {
            dot_duration = (duration -lag * (dots.length - 1)) / dots.length;
            lag_array[i] = (dots.length - 1 - i) * (dot_duration + lag);
        }
    }
    
    setTimeout(function() {
        dots.forEach(function callback(value, index, array) {
            value.fadeIn(dot_duration, lag_array[index]);

            addEventListener("segment-dot-faded-in", function(e) {
                if(dots.indexOf(e.detail.dot) >= 0) {
                    check_func(e.detail.dot);
                }
            });
        });
    }, delay * 1000);
};

SegmentDotsArrayProgressBar.prototype.checkFadedInDots = function(dot) {
    if(this.dots.indexOf(dot) < 0) {
        return;
    }
    else {    
        if(this.faded_in_dots.indexOf(dot) < 0) {
            this.faded_in_dots.push(dot);
        }

        let faded_in = true;
        let array = this;

        this.dots.forEach(function(d) {
            if(array.faded_in_dots.indexOf(d) < 0) {
                faded_in = false;
            }
        });    

        if(faded_in) {
            this.dots_visible = true;
            this.faded_in_dots = [];
            this.in_progress = false;
            dispatchEvent(new CustomEvent("segment-dots-array-faded-in", { detail : { progress_bar : this } }));
        }
    }
};

SegmentDotsArrayProgressBar.prototype.fadeOut = function(order, lag, duration, delay) {
    this.in_progress = true;
    
    this.faded_out_dots = [];
    
    let check_func = this.checkFadedOutDots.bind(this);
    
    let dot_arr = this;
    let dots = this.dots;   
        
    let dot_duration = duration;
    let lag_array = [];
    
    for(let i=0; i < dots.length; i++) {
        if(order === 'together') {
            lag_array[i] = 0;
        }
        else if(order === 'one-by-one-clockwise') {
            dot_duration = (duration - lag * (dots.length - 1)) / dots.length;
            lag_array[i] = i * (dot_duration + lag);
        }
        else if(order === 'one-by-one-anticlockwise') {
            dot_duration = (duration -lag * (dots.length - 1)) / dots.length;
            lag_array[i] = (dots.length - 1 - i) * (dot_duration + lag);
        }
    }
    
    setTimeout(function() {
        dots.forEach(function callback(value, index, array) {
            value.fadeOut(dot_duration, lag_array[index]);

            addEventListener("segment-dot-faded-out", function(e) {
                if(dots.indexOf(e.detail.dot) >= 0) {
                    check_func(e.detail.dot);
                }
            });
        });
    }, delay * 1000);
};

SegmentDotsArrayProgressBar.prototype.checkFadedOutDots = function(dot) {
    if(this.dots.indexOf(dot) < 0) {
        return;
    }
    else {    
        if(this.faded_out_dots.indexOf(dot) < 0) {
            this.faded_out_dots.push(dot);
        }

        let faded_out = true;
        let array = this;

        this.dots.forEach(function(d) {
            if(array.faded_out_dots.indexOf(d) < 0) {
                faded_out = false;
            }
        });    

        if(faded_out) {
            this.dots_visible = false;
            this.faded_out_dots = [];
            this.in_progress = false;
            dispatchEvent(new CustomEvent("segment-dots-array-faded-out", { detail : { progress_bar : this } }));
        }
    }
};

SegmentDotsArrayProgressBar.prototype.instanceCopy = function() {
    const copy = new this.constructor();
    const keys = Object.keys(this);
    keys.forEach(key => { copy[key] = this[key]; });
    return copy;
};