function SegmentArrow(id, context, center_x, center_y, width, length, angle = -90) {    
    this.id = id; // Object identificator
    this.context = context; // CanvasRenderingContext2D for drawing a mark
    this.cx = center_x; // X coordinate of the segment scale center
    this.cy = center_y; // Y coordinate of the segment scale center
    this.width = width;
    this.length = length; // arrow length
    this.angle = angle; // arrow angle
    
    let arrow = this;
    
    this.img = new Image();
        
    this.img_src = '../svg/arrow-one.svg';
    this.img_angle = -90;
    this.img_offset_x = this.width / 2;
    this.img_offset_y = 10;
        
    this.visible = true;
    this.in_progress = false;
    
    this.anim_width = 0;
    this.anim_length = 0;
    this.anim_angle = -90;
    
    this.setImgSrc(this.img_src);
    
    this.calc();
};

SegmentArrow.prototype.calc = function() {        
    if(this.in_progress) {
        this.anim_a = this.anim_angle * Math.PI / 180;
        
        this.anim_dx1 = this.anim_r_in * Math.cos(this.anim_a) + this.cx; // First point. X coordinate
        this.anim_dy1 = this.anim_r_in * Math.sin(this.anim_a) + this.cy; // First point. Y coordinate
        this.anim_dx2 = this.anim_r_out * Math.cos(this.anim_a) + this.cx; // Second point. X coordinate
        this.anim_dy2 = this.anim_r_out * Math.sin(this.anim_a) + this.cy; // Second point. Y coordinate
    }
    else {
        this.r_out = this.r_in + this.length;
        
        this.a = this.angle * Math.PI / 180;
        
        this.dx1 = this.r_in * Math.cos(this.a) + this.cx;
        this.dy1 = this.r_in * Math.sin(this.a) + this.cy;
        this.dx2 = this.r_out * Math.cos(this.a) + this.cx;
        this.dy2 = this.r_out * Math.sin(this.a) + this.cy;
    }    
                
    dispatchEvent(new CustomEvent("segment-arrow-changed", { detail : { arrow : this } } ));
}; 

SegmentArrow.prototype.setImgSrc = function(src) {
    let arrow = this;
    
    this.img.onload = function() {
        arrow.calc();
    };
    
    this.img.src = src;
};
        
SegmentArrow.prototype.draw = function() {   
    if(this.visible) {
        let width;
        let length;
        let angle;
        
        if(this.in_progress) {
            width = this.anim_width;
            length = this.anim_length;
            angle = this.anim_angle;
        }
        else {
            width = this.width;
            length = this.length;
            angle = this.angle;
        }     
                            
        this.context.save();
        this.context.translate(this.cx, this.cy);
        this.context.rotate((angle - this.img_angle) * Math.PI / 180);
        this.context.drawImage(this.img, - this.img_offset_x, - length + this.img_offset_y, width, length);
        this.context.restore();     
    }
};
       
SegmentArrow.prototype.prepareAnim = function() {
    this.anim_width = this.width;
    this.anim_length = this.length;
    this.anim_angle = this.angle;
};        

SegmentArrow.prototype.instanceCopy = function() {
    const copy = new this.constructor();
    const keys = Object.keys(this);
    keys.forEach(key => { copy[key] = this[key]; });
    return copy;
};

