
export class TileLayer {
    constructor() {
        this.map = undefined;
        this.imgs = [];


        this.scale = [591657527.591555, 295828763.795777, 147914381.897889, 73957190.948944, 36978595.474472, 18489297.737236, 9244648.868618,
            4622324.434309, 2311162.217155, 1155581.108577, 577790.554289, 288895.277144, 144447.638572, 72223.819286,
            36111.9096437, 18055.9548224, 9027.977411, 4513.988705, 2256.994353, 1128.497176];
        this.resolution = [156543.033928, 78271.5169639999, 39135.7584820001, 19567.8792409999, 9783.93962049996, 4891.96981024998, 2445.98490512499,
            1222.99245256249, 611.49622628138, 305.748113140558, 152.874056570411, 76.4370282850732, 38.2185141425366, 19.1092570712683, 9.55462853563415,
            4.77731426794937, 2.38865713397468, 1.19432856685505, 0.597164283559817, 0.298582141647617];
        this.lods = [{ "level": 0, "resolution": this.resolution[0], "scale": this.scale[0] },
                { "level": 1, "resolution": this.resolution[1], "scale": this.scale[1] },
                { "level": 2, "resolution": this.resolution[2], "scale": this.scale[2] },
                { "level": 3, "resolution": this.resolution[3], "scale": this.scale[3] },
                { "level": 4, "resolution": this.resolution[4], "scale": this.scale[4] },
                { "level": 5, "resolution": this.resolution[5], "scale": this.scale[5] },
                { "level": 6, "resolution": this.resolution[6], "scale": this.scale[6] },
                { "level": 7, "resolution": this.resolution[7], "scale": this.scale[7] },
                { "level": 8, "resolution": this.resolution[8], "scale": this.scale[8] },
                { "level": 9, "resolution": this.resolution[9], "scale": this.scale[9] },
                { "level": 10, "resolution": this.resolution[10], "scale": this.scale[10] },
                { "level": 11, "resolution": this.resolution[11], "scale": this.scale[11] },
                { "level": 12, "resolution": this.resolution[12], "scale": this.scale[12] },
                { "level": 13, "resolution": this.resolution[13], "scale": this.scale[13] },
                { "level": 14, "resolution": this.resolution[14], "scale": this.scale[14] },
                { "level": 15, "resolution": this.resolution[15], "scale": this.scale[15] },
                { "level": 16, "resolution": this.resolution[16], "scale": this.scale[16] },
                { "level": 17, "resolution": this.resolution[17], "scale": this.scale[17] },
                { "level": 18, "resolution": this.resolution[18], "scale": this.scale[18] },
                { "level": 19, "resolution": this.resolution[19], "scale": this.scale[19] },
        ];
    }

    // 图块行列号转地理坐标
    col_rowToGeo(row, col) {
        let x = col * this.lods[this.map.level].resolution * 256 - 20037508.3427892;
        let y = 20037508.3427892 - row * this.lods[this.map.level].resolution * 256;
        return new Point(x, y);
    }

    // 地理坐标转行列号
    GeoTocol_row(pt) {
        let col = Math.floor((pt.x-(-20037508.3427892))/256/this.lods[this.map.level].resolution);
        let row = Math.floor(((20037508.3427892 - pt.y))/256/this.lods[this.map.level].resolution);
        return [row, col];
    }

    // 行列号转图片地址
    col_rowTopath(row, col) {
        let zoom = this.map.level - 1;
        let offsetX = parseInt(Math.pow(2, zoom));
        let offsetY = offsetX - 1;
        let numX = col - offsetX, numY = (-row) + offsetY;

        let num = (col + row) % 8 + 1;
        return "http://online" + num + ".map.bdimg.com/tile/?qt=tile&x=" + numX + "&y=" + numY + "&z=" + this.map.level + "&styles=pl&scaler=1&udt=20141103";
        // return "http://shangetu" + num + ".map.bdimg.com/it/u=x=" + numX + ";y=" + numY + ";z=" + this.map.level + ";v=009;type=sate&fm=46&udt=20141015";

    }

    imgload() {
        this.map.level = this.getlevel() < this.lods.length ? this.getlevel() : this.lods.length-1;
        this.imgs = [];
        let extend = this.map.getExtend();
        let min = this.GeoTocol_row(extend[0]);
        let max = this.GeoTocol_row(extend[1]);
        for(let i = max[0]; i <= min[0]; i++) {
            for(let j = min[1]; j <= max[1]; j++) {
                let path = this.col_rowTopath(i, j);
                let geop = this.col_rowToGeo(i, j);
                
                this.imgs.push(new Promise((resolve, reject)=>{
                    let img = new guaImage(path, geop);
                    img.img.onload = function () {
                        //第i张加载完成
                        resolve(img)
                    }
                }))
            }
        }
        this.drawImage3();
    }

    drawImage3() {
        Promise.all(this.imgs).then((imgs)=>{
            this.map.context.clearRect(0, 0, this.map.canvas.width, this.map.canvas.height);
            //全部加载完成
            imgs.forEach((img) => {
                this.drawImage2(img.img, this.map.GeoToScreen_Coor(img.geopoint));
            });
        })
    }


    // 绘制图片
    drawImage2(img, sp) {
        let width = img.width * this.lods[this.map.level].resolution / this.map.resolution;
        let height = img.height * this.lods[this.map.level].resolution / this.map.resolution;
        this.map.context.drawImage(img, sp.x, sp.y, width, height);
    }

    getlevel() {
        return this.lods.filter((item) => {
            return item.resolution > this.map.resolution;
        }).length;
    }

}




export class Point {
    constructor(x, y) {
        this.x = x;
        this.y = y;
    }
}

export class guaImage {
    constructor(path, geo) {
        this.img = new Image();
        this.img.src = path;
        this.geopoint = geo;
    }

}
