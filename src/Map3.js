import { Point, TileLayer } from './TileLayer3.js';
import {fromEvent} from 'rxjs';
import {debounceTime} from "rxjs/operators";

class Map {
    constructor(mapid) {
        this.canvas = e('#' + mapid);
        this.context = this.canvas.getContext('2d');

        this.clickstatu = false;
        this.zoomscale = 1.1;



        this.tilelayer = new TileLayer();
        this.tilelayer.map = this;



        this.level = 5;
        this.ZoomPoint = new Point(12958175, 4825923.77);
        this.resolution = this.tilelayer.lods[this.level].resolution;

        // 英寸转米换算公式
        this.inch2centimeter = 0.02540005080010158;
        this.dpi = 96;



        this.debuncetime = 200;
        this.statu = false;


        this.movepoint = null;
        this.timer = null;



        this.init();


    }

    init() {
        this.canvas.width = 1300;
        this.canvas.height = 600;


        fromEvent(this.canvas, 'mousewheel')
            .pipe(debounceTime(this.debuncetime))
            .subscribe((event) => {
                this.tilelayer.imgload();
                this.statu = false;
            });

        fromEvent(this.canvas, 'mousewheel')
            .subscribe((event) => {
                this.statu = true;
                log('bbb');

                // 获取当前点的地理数据
                let resolve = this.ScreenToGeo_Coor(new Point(event.x, event.y));
                let type = event.deltaY < 0 ? this.zoomscale : 1/this.zoomscale;
                this.resolution /= type;

                this.ZoomPoint.x = resolve.x - (event.x - this.canvas.width / 2) * this.resolution;
                this.ZoomPoint.y = resolve.y + (event.y - this.canvas.height / 2) * this.resolution;

                // this.tilelayer.drawImage3();

            });


        /*fromEvent(this.canvas, 'mouseup')
            .pipe(debounceTime(this.debuncetime))
            .subscribe((event) => {
                this.tilelayer.imgload();
            });*/



        fromEvent(this.canvas, 'mousemove')
            .subscribe((event) => {
                // 平移坐标换算
                if(this.clickstatu) {
                    this.movepoint = new Point(event.movementX, event.movementY);
                    this.ZoomPoint.x -= event.movementX * this.resolution;
                    this.ZoomPoint.y += event.movementY * this.resolution;
                    this.tilelayer.drawImage3();
                }
            });

        fromEvent(this.canvas, 'mousedown')
            .subscribe((event) => {
                this.canvas.style.cursor = 'move';
                this.clickstatu = true;
            });

        fromEvent(this.canvas, 'mouseup')
            .subscribe((event) => {
                this.canvas.style.cursor = 'default';
                this.clickstatu = false;
            });

        fromEvent(document, 'mouseup')
            .subscribe((event) => {
                this.canvas.style.cursor = 'default';
                this.clickstatu = false;

                this.timer = setInterval((event) => {
                    this.deatyx = this.movepoint.x / 15;
                    this.deatyy = this.movepoint.y / 15;
                    if(Math.abs(this.deatyx) > 1 || Math.abs(this.deatyy) > 1){
                        this.movepoint.x -= this.deatyx;
                        this.movepoint.y -= this.deatyy;
                    }
                    else {
                        this.movepoint.x = 0;
                        this.movepoint.y = 0;
                    }
                    this.ZoomPoint.x -= this.movepoint.x * this.resolution;
                    this.ZoomPoint.y += this.movepoint.y * this.resolution;
                    this.tilelayer.drawImage3();
                    if(this.movepoint.x == 0 && this.movepoint.y == 0){
                        clearInterval(this.timer);
                    }
                }, 1000/60);
            });

        fromEvent(document, 'mouseup')
            .pipe(debounceTime(this.debuncetime))
            .subscribe((event) => {
                log(event);

                this.tilelayer.imgload();
            });

        this.tilelayer.imgload();
        this.runloop()
        
    }

    // 获取视图范围
    getExtend() {
        let pt1 = new Point(this.ZoomPoint.x - this.resolution * this.canvas.width / 2, this.ZoomPoint.y - this.resolution * this.canvas.height / 2);
        let pt2 = new Point(this.ZoomPoint.x + this.resolution * this.canvas.width / 2, this.ZoomPoint.y + this.resolution * this.canvas.height / 2);
        return [pt1, pt2];
    }



    // 地理坐标转屏幕坐标
    GeoToScreen_Coor(gpt) {
        let sx = this.canvas.width/2 - (this.ZoomPoint.x - gpt.x) / this.resolution;
        let sy = this.canvas.height/2 + (this.ZoomPoint.y - gpt.y) / this.resolution;
        return new Point(sx, sy);
    }

    // 屏幕坐标转地理坐标
    ScreenToGeo_Coor(spt) {
        let gx = this.ZoomPoint.x - (this.canvas.width/2 - spt.x) * this.resolution;
        let gy = this.ZoomPoint.y + (this.canvas.height/2 - spt.y) * this.resolution;
        return new Point(gx, gy);
    }

    runloop() {
        setTimeout((event) => {
            if(this.statu) {
                console.log('aaa');

                this.tilelayer.drawImage3();

            }
            this.runloop()
        }, 1000/100);
    }


    // 比例尺转屏幕一像素代表的实际单位
    ScaleToResolution() {
        return this.scale * this.inch2centimeter / this.dpi;
    }
    // 屏幕一像素代表的实际单位转比例尺
    ResolutionToScale() {
        return this.resolution * this.dpi / this.inch2centimeter;
    }


}

const map = new Map('mycanvas');

