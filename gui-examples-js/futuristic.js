function Futuristic(canvasElementId) {
    this.id = "Futuristic";
    this.canvas = document.getElementById(canvasElementId);
    this.context = this.canvas.getContext('2d');
    let context = this.context;
    context.width = this.canvas.width;
    context.height = this.canvas.height;
   
    function Point(px, py) { this.x = px; this.y = py; }
    this.c = new Point(context.width/2, context.height/2); // Центр кругового интерфейса
    
    this.items = [];
    this.animated_items = [];
    
    this.in_progress = false;
    
    this.item_1 = new Segment('item-1', context, this.c.x, this.c.y, 40, 20, -90, 360);
    this.item_1.gradient = new SegmentGradient('radial', 'from-center', '#37c8ff 20%, #aef0f0 30%, #009ddd 70%, #002060 94%');
    this.item_1.calc();
    
    this.item_2 = new Segment('item-2', context, this.c.x, this.c.y, 30, 65, 75, 210);
    this.item_2.gradient = new SegmentGradient('radial', 'from-center',
        'rgba(55, 200, 255, 0.8) 25%, rgba(55, 200, 255, 0.7) 45%, rgba(0, 74, 230, 0.6) 74%, rgba(0, 32, 96, 1) 100%');   
    //this.item_2.visible = false;
    this.item_2.calc();
    
    this.item_3 = new SegmentLevel('item-3', context, this.c.x, this.c.y, 65, 25, 0, 360);
    
    this.item_3_1 = new Segment('item-3-1', context, this.c.x, this.c.y, 65, 15, -50, 20);
    this.item_3_1.gradient = new SegmentGradient('radial', 'to-center', 'rgba(55, 200, 255, 0.55) 10%, #37c8ff 59%, #004ae6 100%');
    this.item_3_1.calc();
    
    this.item_3_2 = this.item_3_1.instanceCopy();
    this.item_3_2.id = 'item-3-2';
    this.item_3_2.init_angle = -25;
    this.item_3_2.thickness = 20;
    this.item_3_2.calc();
    
    this.item_3_3 = this.item_3_1.instanceCopy();
    this.item_3_3.id = 'item-3-3';
    this.item_3_3.init_angle = 0;
    this.item_3_3.thickness = 25;
    this.item_3_3.calc();
    
    this.item_3_4 = this.item_3_1.instanceCopy();
    this.item_3_4.id = 'item-3-4';
    this.item_3_4.init_angle = 25;
    this.item_3_4.thickness = 30;
    this.item_3_4.calc();
       
    this.item_3.segments.push(this.item_3_1);
    this.item_3.segments.push(this.item_3_2);
    this.item_3.segments.push(this.item_3_3);
    this.item_3.segments.push(this.item_3_4);
    
    this.item_4 = new SegmentArray('item-4', context, this.c.x, this.c.y, 100, 20, -90, 360);
    this.item_4.segment_thickness = 15;
    this.item_4.segments_count = 90;
    this.item_4.segments_position = 'middle';
    this.item_4.start_with = 'segment';
    this.item_4.proportional = true;
    this.item_4.background = 'rgba(250, 250, 250, 0)';
    this.item_4.border_width = 0;
    this.item_4.border_color = 'rgba(0, 0, 0, 0)';
    this.item_4.segment_gradient = new SegmentGradient('linear', 'to-center', 'rgba(55, 200, 255, 0.5) 10%, #37c8ff 59%, #004ae6 100%');
    this.item_4.segment_background = 'rgba(100, 100, 100, 1)';
    this.item_4.segment_border_color = 'rgba(100, 100, 100, 0)';
    this.item_4.build();   
    
    this.item_5 = new SegmentArray('item-5', context, this.c.x, this.c.y, 122.5, 10, -30, 60);
    this.item_5.segment_thickness = 8;
    this.item_5.segment_count = 5;
    this.item_5.segment_position = 'middle';
    this.item_5.start_with = 'segment';
    this.item_5.background = 'rgba(0, 0, 0, 0)';
    this.item_5.border_width = 7;
    this.item_5.border_color = 'none';
    this.item_5.segment_gradient = new SegmentGradient('linear', 'from-center', '#37c8ff 30%, #004ae6 100%');
    this.item_5.build();
    
    this.item_6 = this.item_5.instanceCopy();
    this.item_6.id = 'item-6';
    this.item_6.init_angle = 150;
    this.item_6.build();
    
    this.item_7 = new Segment('item-7', context, this.c.x, this.c.y, 165, 15, -30, 90);
    this.item_7.gradient = new SegmentGradient('radial', 'from-center', 'rgba(55, 200, 255, 0.55) 10%, #37c8ff 59%, #004ae6 100%');
    this.item_7.border_width = 1;
    this.item_7.border_color = 'rgba(55, 200, 255, 1)';
    this.item_7.border_opening_color = 'none';
    this.item_7.border_closing_color = 'none';
    this.item_7.border_inner_color = 'none';
    this.item_7.calc();
    
    this.item_8 = this.item_7.instanceCopy();
    this.item_8.id = 'item-8';
    this.item_8.init_angle = 150;
    this.item_8.calc();
    
    this.item_9 = new Segment('item-9', context, this.c.x, this.c.y, 150, 15, -30, 90);
    this.item_9.gradient = new SegmentGradient('radial', 'to-center', 'rgba(55, 200, 255, 0.55) 10%, #37c8ff 59%, #004ae6 100%');
    this.item_9.border_color = 'rgba(55, 200, 255, 1)';
    this.item_9.border_outer_color = 'none';
    this.item_9.calc();
    
    this.item_10 = this.item_9.instanceCopy();
    this.item_10.id = 'item-10';
    this.item_10.init_angle = 150;
    this.item_10.calc();
    
    this.item_11 = new Segment('item-11', context, this.c.x, this.c.y, 165, 15, 60, 90);
    this.item_11.border_color = 'rgba(55, 200, 255, 1)';
    this.item_11.border_opening_color = 'none';
    this.item_11.border_closing_color = 'none';
    this.item_11.gradient = new SegmentGradient('radial', 'from-center', 'rgba(55, 200, 255, 0.55) 10%, #37c8ff 59%, #004ae6 100%');
    this.item_11.calc();
    
    this.item_12 = this.item_11.instanceCopy();
    this.item_12.id = 'item-12';
    this.item_12.init_angle = 240;
    this.item_12.calc();
    
    let items_array = this.items;
    let draw_func = this.draw.bind(this);
    
    items_array.push(this.item_1);
    items_array.push(this.item_2);
    items_array.push(this.item_3);
    items_array.push(this.item_3_1);
    items_array.push(this.item_3_2);
    items_array.push(this.item_3_3);
    items_array.push(this.item_3_4);
    items_array.push(this.item_4);
    items_array.push(this.item_5);
    items_array.push(this.item_6);
    items_array.push(this.item_7);
    items_array.push(this.item_8);
    items_array.push(this.item_9);
    items_array.push(this.item_10);  
    items_array.push(this.item_11);
    items_array.push(this.item_12);   
      
    addEventListener('segment-changed', function(e) {
        if(items_array.indexOf(e.detail.segment)) { draw_func(); } });
    addEventListener('segment-level-changed', function(e) {
        if(items_array.indexOf(e.detail.level)) { draw_func(); } });
    addEventListener('segment-array-changed', function(e) {
        if(items_array.indexOf(e.detail.array)) { draw_func(); } });    
                      
    this.draw();
};
    
Futuristic.prototype.draw = function() {
    this.context.clearRect(0, 0, this.canvas.width, this.canvas.height);

    this.item_1.draw();
    this.item_2.draw();
    this.item_3.draw();
    this.item_4.draw();
    this.item_5.draw();
    this.item_6.draw();
    this.item_7.draw();
    this.item_8.draw();
    this.item_9.draw();
    this.item_10.draw();
    this.item_11.draw();
    this.item_12.draw();   
};

Futuristic.prototype.animate = function() {
    if(this.in_progress) {
        return;
    }
    else {        
        this.in_progress = true;
        
        let interface = this;
       
        let item_2 = this.item_2;
        item_2.disappear('to-axis', 2, 1);
        item_2.appear('from-axis', 2, 26);
        
        let item_3 = this.item_3;
        item_3.disappear('one-by-one-anticlockwise', 0.5, 'to-center', 4, 10);
        item_3.appear('one-by-one-clockwise', 0.5, 'from-center', 4, 21);
        
        let item_4 = this.item_4;
        item_4.fadeOut('one-by-one-clockwise', 0, 10, 4);
        addEventListener('segment-array-faded-out', function(e) {
            if(e.detail.array === item_4) {
                item_4.fadeIn('one-by-one-clockwise', 0, 10, 1);
            }
        });
        
        addEventListener('segment-appeared', function(e) {
            if(e.detail.segment === item_2) {
                interface.in_progress = false;
                dispatchEvent(new CustomEvent("futuristic-animation-finished", { detail : { array : this } }));
            }
        });       
    }
};