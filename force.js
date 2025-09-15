// const { TKGrid } = require("./astar_tk")

   const squaretable = {} 
    for (let t = 0; t < 10000000; t++) {
        squaretable[`${t}`] = Math.sqrt(t)
        if (t > 999) {
            t += 9
        }
    }
    let video_recorder 
    let recording = 0
    const gamepadAPI = {
        controller: {},
        turbo: true,
        connect: function (evt) {
            if (navigator.getGamepads()[0] != null) {
                gamepadAPI.controller = navigator.getGamepads()[0]
                gamepadAPI.turbo = true;
            } else if (navigator.getGamepads()[1] != null) {
                gamepadAPI.controller = navigator.getGamepads()[0]
                gamepadAPI.turbo = true;
            } else if (navigator.getGamepads()[2] != null) {
                gamepadAPI.controller = navigator.getGamepads()[0]
                gamepadAPI.turbo = true;
            } else if (navigator.getGamepads()[3] != null) {
                gamepadAPI.controller = navigator.getGamepads()[0]
                gamepadAPI.turbo = true;
            }
            for (let i = 0; i < gamepads.length; i++) {
                if (gamepads[i] === null) {
                    continue;
                }
                if (!gamepads[i].connected) {
                    continue;
                }
            }
        },
        disconnect: function (evt) {
            gamepadAPI.turbo = false;
            delete gamepadAPI.controller;
        },
        update: function () {
            gamepadAPI.controller = navigator.getGamepads()[0]
            gamepadAPI.buttonsCache = [];// clear the buttons cache
            for (var k = 0; k < gamepadAPI.buttonsStatus.length; k++) {// move the buttons status from the previous frame to the cache
                gamepadAPI.buttonsCache[k] = gamepadAPI.buttonsStatus[k];
            }
            gamepadAPI.buttonsStatus = [];// clear the buttons status
            var c = gamepadAPI.controller || {}; // get the gamepad object
            var pressed = [];
            if (c.buttons) {
                for (var b = 0, t = c.buttons.length; b < t; b++) {// loop through buttons and push the pressed ones to the array
                    if (c.buttons[b].pressed) {
                        pressed.push(gamepadAPI.buttons[b]);
                    }
                }
            }
            var axes = [];
            if (c.axes) {
                for (var a = 0, x = c.axes.length; a < x; a++) {// loop through axes and push their values to the array
                    axes.push(c.axes[a].toFixed(2));
                }
            }
            gamepadAPI.axesStatus = axes;// assign received values
            gamepadAPI.buttonsStatus = pressed;
            // //console.log(pressed); // return buttons for debugging purposes
            return pressed;
        },
        buttonPressed: function (button, hold) {
            var newPress = false;
            for (var i = 0, s = gamepadAPI.buttonsStatus.length; i < s; i++) {// loop through pressed buttons
                if (gamepadAPI.buttonsStatus[i] == button) {// if we found the button we're looking for...
                    newPress = true;// set the boolean variable to true
                    if (!hold) {// if we want to check the single press
                        for (var j = 0, p = gamepadAPI.buttonsCache.length; j < p; j++) {// loop through the cached states from the previous frame
                            if (gamepadAPI.buttonsCache[j] == button) { // if the button was already pressed, ignore new press
                                newPress = false;
                            }
                        }
                    }
                }
            }
            return newPress;
        },
        buttons: [
            'A', 'B', 'X', 'Y', 'LB', 'RB', 'Left-Trigger', 'Right-Trigger', 'Back', 'Start', 'Axis-Left', 'Axis-Right', 'DPad-Up', 'DPad-Down', 'DPad-Left', 'DPad-Right', "Power"
        ],
        buttonsCache: [],
        buttonsStatus: [],
        axesStatus: []
    };
    let canvas
    let canvas_context
    let keysPressed = {}
    let FLEX_engine
    let TIP_engine = {}
    TIP_engine.x = 10000
    TIP_engine.y = 10000
    let XS_engine
    let YS_engine
    class Point {
        constructor(x, y) {
            this.x = x
            this.y = y
            this.radius = 0
        }
        pointDistance(point) {
            return (new LineOP(this, point, "transparent", 0)).hypotenuse()
        }
    }
    class LineOP {
        constructor(object, target, color, width) {
            this.object = object
            this.target = target
            this.color = color
            this.width = width
        }
        squareDistance() {
            let xdif = this.object.x - this.target.x
            let ydif = this.object.y - this.target.y
            let squareDistance = (xdif * xdif) + (ydif * ydif)
            return squareDistance
        }
        hypotenuse() {
            let xdif = this.object.x - this.target.x
            let ydif = this.object.y - this.target.y
            let hypotenuse = (xdif * xdif) + (ydif * ydif)
            if (hypotenuse < 10000000 - 1) {
                if (hypotenuse > 1000) {
                    return squaretable[`${Math.round(10 * Math.round((hypotenuse * .1)))}`]
                } else {
                    return squaretable[`${Math.round(hypotenuse)}`]
                }
            } else {
                return Math.sqrt(hypotenuse)
            }
        }
        angle() {
            return Math.atan2(this.object.y - this.target.y, this.object.x - this.target.x)
        }
        draw() {
            let linewidthstorage = canvas_context.lineWidth
            canvas_context.strokeStyle = this.color
            canvas_context.lineWidth = this.width
            canvas_context.beginPath()
            canvas_context.moveTo(this.object.x, this.object.y)
            canvas_context.lineTo(this.target.x, this.target.y)
            canvas_context.stroke()
            canvas_context.lineWidth = linewidthstorage
        }
    }
    class Rectangle {
        constructor(x, y, width, height, color, fill = 1, stroke = 0, strokeWidth = 1) {
            this.x = x
            this.y = y
            this.height = height
            this.width = width
            this.color = color
            this.xmom = 0
            this.ymom = 0
            this.stroke = stroke
            this.strokeWidth = strokeWidth
            this.fill = fill
        }
        draw() {
            canvas_context.fillStyle = this.color
            canvas_context.fillRect(this.x, this.y, this.width, this.height)
        }
        move() {
            this.x += this.xmom
            this.y += this.ymom
        }
        isPointInside(point) {
            if (point.x >= this.x) {
                if (point.y >= this.y) {
                    if (point.x <= this.x + this.width) {
                        if (point.y <= this.y + this.height) {
                            return true
                        }
                    }
                }
            }
            return false
        }
        doesPerimeterTouch(point) {
            if (point.x + point.radius >= this.x) {
                if (point.y + point.radius >= this.y) {
                    if (point.x - point.radius <= this.x + this.width) {
                        if (point.y - point.radius <= this.y + this.height) {
                            return true
                        }
                    }
                }
            }
            return false
        }
    }
    class Circle {
        constructor(x, y, radius, color, xmom = 0, ymom = 0, friction = 1, reflect = 0, strokeWidth = 0, strokeColor = "transparent") {
            this.x = x
            this.y = y
            this.radius = radius
            this.color = color
            this.xmom = xmom
            this.ymom = ymom
            this.friction = friction
            this.reflect = reflect
            this.strokeWidth = strokeWidth
            this.strokeColor = strokeColor
        }
        draw() {
            canvas_context.lineWidth = 2
            canvas_context.strokeStyle = "black"
            canvas_context.beginPath();
            if (this.radius > 0) {
                canvas_context.arc(this.x, this.y, this.radius, 0, (Math.PI * 2), true)
                canvas_context.fillStyle = this.color
                canvas_context.fill()
                canvas_context.stroke();
            } else {
                //console.l\og("The circle is below a radius of 0, and has not been drawn. The circle is:", this)
            }
        }
        move() {
            if (this.reflect == 1) {
                if (this.x + this.radius > canvas.width) {
                    if (this.xmom > 0) {
                        this.xmom *= -1
                    }
                }
                if (this.y + this.radius > canvas.height) {
                    if (this.ymom > 0) {
                        this.ymom *= -1
                    }
                }
                if (this.x - this.radius < 0) {
                    if (this.xmom < 0) {
                        this.xmom *= -1
                    }
                }
                if (this.y - this.radius < 0) {
                    if (this.ymom < 0) {
                        this.ymom *= -1
                    }
                }
            }
            this.x += this.xmom
            this.y += this.ymom
        }
        unmove() {
            if (this.reflect == 1) {
                if (this.x + this.radius > canvas.width) {
                    if (this.xmom > 0) {
                        this.xmom *= -1
                    }
                }
                if (this.y + this.radius > canvas.height) {
                    if (this.ymom > 0) {
                        this.ymom *= -1
                    }
                }
                if (this.x - this.radius < 0) {
                    if (this.xmom < 0) {
                        this.xmom *= -1
                    }
                }
                if (this.y - this.radius < 0) {
                    if (this.ymom < 0) {
                        this.ymom *= -1
                    }
                }
            }
            this.x -= this.xmom
            this.y -= this.ymom
        }
        frictiveMove() {
            if (this.reflect == 1) {
                if (this.x + this.radius > canvas.width) {
                    if (this.xmom > 0) {
                        this.xmom *= -1
                    }
                }
                if (this.y + this.radius > canvas.height) {
                    if (this.ymom > 0) {
                        this.ymom *= -1
                    }
                }
                if (this.x - this.radius < 0) {
                    if (this.xmom < 0) {
                        this.xmom *= -1
                    }
                }
                if (this.y - this.radius < 0) {
                    if (this.ymom < 0) {
                        this.ymom *= -1
                    }
                }
            }
            this.x += this.xmom
            this.y += this.ymom
            this.xmom *= this.friction
            this.ymom *= this.friction
        }
        frictiveunMove() {
            if (this.reflect == 1) {
                if (this.x + this.radius > canvas.width) {
                    if (this.xmom > 0) {
                        this.xmom *= -1
                    }
                }
                if (this.y + this.radius > canvas.height) {
                    if (this.ymom > 0) {
                        this.ymom *= -1
                    }
                }
                if (this.x - this.radius < 0) {
                    if (this.xmom < 0) {
                        this.xmom *= -1
                    }
                }
                if (this.y - this.radius < 0) {
                    if (this.ymom < 0) {
                        this.ymom *= -1
                    }
                }
            }
            this.xmom /= this.friction
            this.ymom /= this.friction
            this.x -= this.xmom
            this.y -= this.ymom
        }
        isPointInside(point) {
            this.areaY = point.y - this.y
            this.areaX = point.x - this.x
            if (((this.areaX * this.areaX) + (this.areaY * this.areaY)) <= (this.radius * this.radius)) {
                return true
            }
            return false
        }
        doesPerimeterTouch(point) {
            this.areaY = point.y - this.y
            this.areaX = point.x - this.x
            if (((this.areaX * this.areaX) + (this.areaY * this.areaY)) <= ((this.radius + point.radius) * (this.radius + point.radius))) {
                return true
            }
            return false
        }
    } 
    function setUp(canvas_pass, style = "#888888") {
        canvas = canvas_pass
        canvas_context = canvas.getContext('2d');
        canvas.style.background = style
        window.setInterval(function () {
            main()
        }, 1)
        document.addEventListener('keydown', (event) => {
            keysPressed[event.key] = true; //adds key to list of pressed
        });
        document.addEventListener('keyup', (event) => {
            delete keysPressed[event.key]; //for removing key from list of pressed
        });
        window.addEventListener('pointerdown', e => {
            FLEX_engine = canvas.getBoundingClientRect();
            XS_engine = e.clientX - FLEX_engine.left;
            YS_engine = e.clientY - FLEX_engine.top;
            TIP_engine.x = XS_engine
            TIP_engine.y = YS_engine
            TIP_engine.body = TIP_engine

            //for clicking mouse actions
        });
        window.addEventListener('pointermove', continued_stimuli);

        window.addEventListener('pointerup', e => {
            //for upclick actions
        })
        function continued_stimuli(e) {
            FLEX_engine = canvas.getBoundingClientRect();
            XS_engine = e.clientX - FLEX_engine.left;
            YS_engine = e.clientY - FLEX_engine.top;
            TIP_engine.x = XS_engine
            TIP_engine.y = YS_engine
            TIP_engine.body = TIP_engine

            //for moving mouse actions
        }
    }

    Number.prototype.between = function (a, b, inclusive) {
        var min = Math.min(a, b),
            max = Math.max(a, b);
        return inclusive ? this >= min && this <= max : this > min && this < max;
    }

    let setup_canvas = document.getElementById('canvas') //getting canvas from document

    setUp(setup_canvas) // setting up canvas refrences, starting timer. 

    function getRandomColor() { // random color
        var letters = '0123456789ABCDEF';
        var color = '#';
        for (var i = 0; i < 6; i++) {
            color += letters[(Math.floor(Math.random() * 16) + 0)];
        }
        return color;
    }
    class Node {
        constructor(type, content){
            this.body = {}
            this.body.type = type
            this.content = content
            this.body.x = content.x
            this.body.y = content.y
            this.offset = {}
            this.offset.x = 0
            this.offset.y = 0
            this.offset.radius = 12
            this.children = []
            this.type = type
            this.l = new LineOP(this.body, this.body)
            this.cap = {}
            this.cap.x =0 
            this.cap.y =0 
            this.layer = 0
            this.parent = {}
            this.offset.colorball = "olive"
            this.latentColor = getRandomColor()
            this.unik=Math.random()*3

            this.childing = 0
            // this.parent.cap = new Point(this.body.x+1, this.body.y+1)
        }
        offsetting(){
            if(topnodes.includes(this)){
                return
            }
            
            this.hash = {}
            for(let t = 0;t<nodes.length;t++){
                if(this!=nodes[t]){
                    this.l.object = this.cap
                    this.l.target = nodes[t].cap

                    this.hash[t] = {}
                    this.hash[t].distance = this.l.hypotenuse()+1
                    this.hash[t].x = nodes[t].cap.x
                    this.hash[t].y = nodes[t].cap.y
                    this.hash[t].radius = nodes[t].offset.radius
                    this.hash[t].p = nodes.indexOf(nodes[t])
                }
            }

            let keys = Object.keys(this.hash)
            let force = {}
            let force2 = {}

            for(let t = 0;t<keys.length;t++){
                force.x = 0
                force.y = 0
                if(this.hash[keys[t]].distance < this.offset.radius + this.hash[keys[t]].radius){

                    force.x += (this.hash[keys[t]].x-(this.body.x+this.offset.x))/this.hash[keys[t]].distance
                    // force.y  += (this.hash[keys[t]].y-(this.body.y+this.offset.y))/this.hash[keys[t]].distance


                    this.offset.x -= force.x/1
                    this.offset.y -= force.y/1
                }else{
                    if(this.hash[keys[t]].distance < (this.offset.radius + this.hash[keys[t]].radius)*1.1){
                        if(this.hash[keys[t]].distance >( this.offset.radius + this.hash[keys[t]].radius)*.1){

                        
                    force.x += (this.hash[keys[t]].x-(this.body.x+this.offset.x))/this.hash[keys[t]].distance
                    // force.y  += (this.hash[keys[t]].y-(this.body.y+this.offset.y))/this.hash[keys[t]].distance


                    this.offset.x += force.x/100
                    this.offset.y += force.y/100
                        }
                    }
                }
            }

            if(!(topnodes.includes(this))){
            for(let t = 0;t<keys.length;t++){
                if(this.hash[keys[t]].p == nodes.indexOf(this.parent)){

                    force2.x = 0
                    force2.y = 0
                    if(this.hash[keys[t]].distance > this.offset.radius*2){
    
                        force2.x -= (this.hash[keys[t]].x-(this.body.x+this.offset.x))/this.hash[keys[t]].distance
                        force2.y  -= (this.hash[keys[t]].y-(this.body.y+this.offset.y))/this.hash[keys[t]].distance
    
    
                        this.offset.x -= force2.x/3
                        this.offset.y -= force2.y/3
                    }
                }
            }
        }
            // console.log(this.hash)

            // this.offset.x -= (Math.random()-.5)*2
            // this.offset.y -=  (Math.random()-.5)*2
            
            // if(topnodes.includes(this)){
                    let l = ( this.cap.y-this.parent.cap.y)


                    if(l <  Math.min(Math.max(this.offset.radius/2, 12),30)*(2.5+this.unik)){

                        this.offset.y+=.25*this.layer
                    }else{
                        this.offset.y-=.1*this.layer

                    }
                    // if(l.hypotenuse() > 60){

                    //     this.offset.x -= (this.cap.x - this.parent.cap.x)/20
                    //     this.offset.y -= (this.cap.y - this.parent.cap.y)/20
                    // }

                for(let t =0 ;t<this.children.length;t++){
                    let l = this.children[t].cap.y-this.cap.y
                    if(l < Math.min(Math.max(this.offset.radius/2, 12),30)*(2.5+this.unik)){

                        this.children[t].offset.y+=.25*this.children[t].layer
                    }else{

                        this.children[t].offset.y-=.1*this.children[t].layer
                    }
                //     if(l.hypotenuse() > 60){

                //         this.children[t].offset.x -= (this.children[t].cap.x - this.cap.x)/20
                //         this.children[t].offset.y -= (this.children[t].cap.y - this.cap.y)/20
                //     }
                }

            // }else{

            // }

            // let l = new LineOP(new Point(0,0), new Point(1000,1000), "blue",1)
            // l.object = this.body
            for(let t = 0;t<this.children.length;t++){
                // this.children[t].offset.x += (Math.sign((this.body.x+this.offset.x) - (this.children[t].body.x-this.children[t].offset.x)))*2
                // this.children[t].offset.y += (Math.sign((this.body.y+this.offset.y) - (this.children[t].body.y-this.children[t].offset.y)))*2
                // l.target = new Point(this.children[t].offset.x+this.children[t].body.x, this.children[t].offset.y+this.children[t].body.y)
                // l.draw()
            }

            let radsnap = new LineOP(TIP_engine, this.cap)

            this.checker = new Circle(this.cap.x, this.cap.y, this.offset.radius, 'red')
            
        
            if(this.checker.isPointInside(TIP_engine)){
                for(let t = 0;t<nodes.length;t++){
                    nodes[t].childing = 0
                    childrenset(nodes[t])
                }
                this.childing = 1
                this.offset.colorball = this.latentColor
                childrenset(this)
                made = 1
            }else{
                if(made <= -2){
                    this.childing = 0
                    this.offset.colorball = 'olive'
                    childrenset(this)

                }
                
            }
            this.offset.radius *=50
            // this.offset.radius = 12
            this.offset.radius += Math.max(30 + (18-(radsnap.hypotenuse()/1))/10,12)
            if(this.childing==1){
                this.offset.radius+=10
                this.offset.radius /=51
            }else{

            this.offset.radius /=51
            }

        }
    }

    let made = 0
    function childrenset(node){
        for(let t = 0;t<node.children.length;t++){
            console.log('s')
            node.children[t].offset.colorball = node.offset.colorball
            node.children[t].childing = node.childing
            childrenset(node.children[t])
        }
    }
    let circle = new Circle(0,0,1, 'olive')

    function drawNode(node){
        if(node.type == 0){
            circle.x = node.body.x+node.offset.x
            circle.y = node.body.y+node.offset.y
            circle.radius = node.offset.radius
            circle.color = node.offset.colorball
            circle.draw()
            node.cap = {}
            node.cap.x = circle.x
            node.cap.y = circle.y
            for(let t = 0;t<node.children.length;t++){
                node.children[t].layer = node.layer+1
                node.children[t].parent = node
                drawNode(node.children[t])
                // let link = new LineOP(node.cap, node.children[t].cap, "blue", 2)
                // link.draw()
            }
        }else{

        }
    }

    function drawNodeD(node){
        if(node.type == 0){
            // console.log(node)
            for(let t = 0;t<node.children.length;t++){
                let link = new LineOP(new Point(node.body.x+node.offset.x, node.body.y+node.offset.y), new Point(node.children[t].body.x+node.children[t].offset.x,node.children[t].body.y+node.children[t].offset.y), node.color, node.offset.radius/4)
                link.draw()
                drawNodeD(node.children[t])
            }
        }else{

        }
    }

    let topnodes = []
    let nodes = []
    for(let t =0 ;t<3;t++){
        let nodei = new Node(0, {'message':'top', 'x':200+(t*300),'y':200})
        nodei.color = `rgb(${t*100}, ${0*100},${0*100})`
        topnodes.push(nodei)
        nodes.push(nodei)
        for(let k = 0;k<3;k++){
            let n1 = new Node(0, {'message':'child1', 'x':200 + (t*300) + (k*20),'y': 200+k} )
        n1.color = `rgb(${t*100}, ${k*100},${0*100})`
        nodei.children.push(n1)
            nodes.push(n1)

        for(let j = 0;j<2;j++){
            let n3 = new Node(0, {'message':'child2', 'x':200 + (t*300) + (k*20) + (j*10),'y':200+j})
        n3.color = `rgb(${t*100}, ${k*100},${j*100})`
            n1.children.push(n3)
            nodes.push(n3)

            for(let r = 0;r<2;r++){
                let n4 = new Node(0, {'message':'child2', 'x':200 + (t*300) + (k*20) + (j*10),'y':200+j})
                n4.color = `rgb(${r*100}, ${k*100},${j*100})`
                n3.children.push(n4)
                nodes.push(n4)



            // for(let q = 0;q<2;q++){
            //     let n5 = new Node(0, {'message':'child2', 'x':200 + (t*300) + (k*20) + (j*10),'y':200+j})
            //     n5.color = `rgb(${q*100}, ${k*100},${j*100})`
            //     n4.children.push(n5)
            //     nodes.push(n5)
            // }

            }
    


        }


        }
    }

    let rect1 = new Rectangle(0, 150, 1280, 40, "green")
    function main() {
        made--
        canvas_context.clearRect(-1,-1,canvas.width*1, canvas.height*1) 
        rect1.draw()

        for(let t =0;t<topnodes.length;t++){
            drawNodeD(topnodes[t])
        }    
        for(let t =0;t<topnodes.length;t++){
            drawNode(topnodes[t])
        }       
        
        for(let t =0;t<nodes.length;t++){
            // if(topnodes.includes(nodes[t])){

            // }else{

                nodes[t].offsetting()
            // }
        }
    }

