function HiTech(canvasElementId) {
    this.id = "HiTech";
    this.canvas = document.getElementById(canvasElementId);
    this.context = this.canvas.getContext('2d');
    let context = this.context;
    context.width = this.canvas.width;
    context.height = this.canvas.height;
   
    function Point(px, py) { this.x = px; this.y = py; }
    this.c = new Point(context.width/2, context.height/2); // Центр кругового интерфейса
    
    this.items = [];
    
    this.in_progress = false;
    
    this.item_1 = new Segment('item-1', context, this.c.x, this.c.y, 0, 180, -90, 360);
    //this.item_1.background = 'rgba(230, 230, 230, 1)';
    this.item_1.gradient = new SegmentGradient('radial', 'to-center', 'rgba(230, 230, 230, 1) 20%, rgba(210, 210, 210, 1) 40%, rgba(250, 250, 250, 1) 100%');
    this.item_1.border_color = 'rgba(150, 150, 150, 1)';
    this.item_1.calc();
        
    this.item_2 = new Segment('item-2', context, this.c.x, this.c.y, 80, 60, -85, 35);
    this.item_2.gradient = new SegmentGradient('radial', 'from-center', '#06ff1a 45%, #00b050 76%, #034400 98%');
    this.item_2.border_color = "rgba(50, 50, 50, 1)";
    this.item_2.calc();
    
    this.item_3 = this.item_2.instanceCopy();
    this.item_3.id = "item-3";
    this.item_3.init_angle = -40;
    this.item_3.calc();
    
    this.item_4 = this.item_2.instanceCopy();
    this.item_4.id = "item-4";
    this.item_4.init_angle = 5;
    this.item_4.calc();
    
    this.item_5 = this.item_2.instanceCopy();
    this.item_5.id = "item-5";
    this.item_5.init_angle = 50;
    this.item_5.calc();
    
    this.item_6 = this.item_2.instanceCopy();
    this.item_6.id = "item-6";
    this.item_6.init_angle = 95;
    this.item_6.calc();
    
    this.item_7 = this.item_2.instanceCopy();
    this.item_7.id = "item-7";
    this.item_7.init_angle = 140;
    this.item_7.calc();
    
    this.item_8 = this.item_2.instanceCopy();
    this.item_8.id = "item-8";
    this.item_8.init_angle = 185;
    this.item_8.calc();
    
    this.item_9 = this.item_2.instanceCopy();
    this.item_9.id = "item-9";
    this.item_9.init_angle = 230;
    this.item_9.calc();
    
    this.item_10 = new SegmentDotsArray('item-10', context, this.c.x, this.c.y, 150, 20, -95, 360);
    this.item_10.background = "rgba(0, 0, 0, 1)";
    this.item_10.start_with = 'dot';
    this.item_10.dots_count = 8;
    this.item_10.dot_visible = true;
    this.item_10.dot_background = "rgba(0, 155, 0, 1)";
    this.item_10.dot_gradient = new SegmentGradient('radial', 'from-center', '#06ff1a 45%, #00b050 76%, #034400 98%');
    this.item_10.dot_border_width = 0.5;
    this.item_10.dot_border_color = "rgba(0, 155, 0, 0.7)";
    this.item_10.build();
    
    this.item_11 = new SegmentLevel('item-11', context, this.c.x, this.c.y, 80);
    this.item_11.addSegment(this.item_2);
    this.item_11.addSegment(this.item_3);
    this.item_11.addSegment(this.item_4);
    this.item_11.addSegment(this.item_5);
    this.item_11.addSegment(this.item_6);
    this.item_11.addSegment(this.item_7);
    this.item_11.addSegment(this.item_8);
    this.item_11.addSegment(this.item_9);    
    
    this.items.push(this.item_1);
    this.items.push(this.item_2);
    this.items.push(this.item_3);
    this.items.push(this.item_4);
    this.items.push(this.item_5);
    this.items.push(this.item_6);
    this.items.push(this.item_7);
    this.items.push(this.item_8);
    this.items.push(this.item_9);
    this.items.push(this.item_10);  
    this.items.push(this.item_11);
                
    let items_array = this.items;
    let draw_func = this.draw.bind(this);
      
    addEventListener('segment-changed', function(e) {
        if(items_array.indexOf(e.detail.segment)) { draw_func(); } });
    addEventListener('segment-level-changed', function(e) {
        if(items_array.indexOf(e.detail.level)) { draw_func(); } });
    addEventListener('segment-dots-array-changed', function(e) {
        if(items_array.indexOf(e.detail.array)) { draw_func(); } });
                      
    this.draw();
};

HiTech.prototype.draw = function() {
    this.context.clearRect(0, 0, this.canvas.width, this.canvas.height);
    
    this.item_1.draw();
    this.item_10.draw();
    this.item_11.draw();
};

HiTech.prototype.animate = function() {
    if(this.in_progress) {
        return;
    }
    else {        
        this.in_progress = true;
        
        let interface = this;
        
        let item_10 = this.item_10;
        let item_10_anim = true;
        let count = 0;

        item_10.fadeOut('together', 0, 1, 0);    
        addEventListener('segment-dots-array-faded-out', function(e) {
            if(item_10_anim)
            if((e.detail.array === item_10) && (count < 5)) {
                e.detail.array.fadeIn('together', 0, 1, 0);
                count++;
            }
            else {
                item_10_anim = false;
            }
        });
        addEventListener('segment-dots-array-faded-in', function(e) {
            if((e.detail.array === item_10) && (count < 5)) {
                e.detail.array.fadeOut('together', 0, 1, 0);
                count++;
            }
            else {
                item_10_anim = false;
            }
        });    
        
        this.item_2.fadeOut(2, 0);
        this.item_9.fadeOut(2, 0);
        this.item_3.fadeOut(2, 1);
        this.item_8.fadeOut(2, 1);
        this.item_4.fadeOut(2, 2);
        this.item_7.fadeOut(2, 2);
        this.item_5.fadeOut(2, 3);
        this.item_6.fadeOut(2, 3);
        
        let item_6 = this.item_6;
        let lvl = this.item_11;
        
        addEventListener('segment-faded-out', function(e) {
            if(e.detail.segment === item_6) {
                lvl.fadeIn('together', 0, 2, 0);
            }
        });
        addEventListener('segment-level-faded-in', function(e) {
            if(e.detail.level === lvl) {
                interface.in_progress = false;
                dispatchEvent(new CustomEvent("hi-tech-animation-finished", { detail : { array : this } }));
            }
        });
    }
};