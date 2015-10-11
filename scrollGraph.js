var classGraph = function(){
    this.ctx;
    this.tableId;
    this.canvasId;
    this.timeInterval = timeInterval;
    this.interval = null;

    this.boundaries = {};
    this.points = [];
    this.PPwidth = 20; // 5 px default = point to point X-distance
    this.canvasWidth;
    this.canvasHeight;
    this.maxPointsNumber = 2;
    this.pointRadio = 5;

    this.yAxisData = { 'yMax':null, 'ticks':4, 'marks':[] };
    this.xAxisData = [];
    this.titleHeight = 15;
    this.yAxisWidth = 40;
    this.yAxisFontColor = '#0000ff';
    this.xAxisHeight = 15;
    this.xAxisFontColor = '#000000';
    this.xAxisLabelWidth = 50; // 50 pixeles default
    this.xAxixFontSize = 10;
    this.yDefaultDistance = 2;
    
    this.$node;
}
classGraph.prototype.Init = function(pos_x, pos_y, width, height, border_width, border_color, border_style, label, node, tableId, border)
{
    var pos_x = pos_x || '0px';
    var pos_y = pos_y || '0px';
    var width = width || '0px';
    var height = height || '0px';
    this.canvasWidth = parseInt(width.substring(0, width.length-2));
    this.canvasHeight = parseInt(height.substring(0, height.length-2));
    var border_width = border_width || '0px';
    var border_color = border_color || '#000';
    var border_style = border_style || 'solid';
    var label = label || '';
    this.$node = node || '';
    var tableId = tableId || '';
    var lowColor = "#31E1E2",
        lowLowColor = "#0980FF",
        highColor = "#F9A402",
        highHighColor = "#FF0000";
    var canvasId = Math.random().toString(36).substring(6);
    this.buildCanvas(canvasId, pos_x, pos_y, width, height, border_width, border_color, border_style, border);
    this.ctx = document.getElementById(canvasId).getContext("2d");
    
    // write the title (label)
    this.buildTitle(label); 
    this.periodicTimer(tableId, label);
    this.yAxis();
    this.xAxis();  
}
    classGraph.prototype.buildTitle = function(label, value)
    {
        var value = value || '...';
        var label = label + ' : ' + value.toString();
        this.ctx.clearRect(this.yAxisWidth, 0, this.canvasWidth, this.titleHeight);
        this.ctx.fillStyle = '#000000';
        this.ctx.font = "normal 14px Arial";
        this.ctx.textBaseLine = "middle"
        this.ctx.textAlign = "center";
        this.ctx.fillText(label, this.canvasWidth/2, this.titleHeight);
    }
    classGraph.prototype.buildCanvas = function(randId, pos_x, pos_y, width, height, border_width, border_color, border_style, border)
    {
        var canvas = '<canvas id="'+randId+'" width="'+width.toString()+'" height="'+height.toString()+'" style="position:absolute;width:'+width+';height:'+height+';top:'+pos_y+'; left:'+pos_x+'; border-width:'+border_width+'; border-style: '+border_style+';border-bottom-width: '+border_width+'; border-color:'+border_color+';z-index:1000; background-color:#f0f0f0; border: '+border+';">Your browser does not support Canvas :(</canvas>';
        $("body").append(canvas);
    }
    classGraph.prototype.setBoundaries = function()
    {
        this.boundaries.x0 = this.yAxisWidth;
        this.boundaries.xf = this.canvasWidth;
        this.boundaries.y0 = this.titleHeight;
        this.boundaries.yf = this.canvasHeight - this.xAxisHeight;
        this.maxPointsNumber = parseInt((this.boundaries.xf - this.boundaries.x0)/this.PPwidth) + 1;
    }
    classGraph.prototype.yAxis = function()
    {
        // graphic the Y axis
        this.ctx.fillStyle = "#fafafa";
        //this.ctx.fillRect(0, 0, this.boundaries.x0, this.boundaries.yf);
        this.ctx.fillRect(0, 0, this.boundaries.x0, this.canvasHeight);
    }
    classGraph.prototype.xAxis = function()
    {
        // graphic the X axis
        this.ctx.fillStyle = "#fafafa";
        this.ctx.fillRect(this.boundaries.x0, this.boundaries.yf, this.canvasWidth, (this.canvasHeight-this.boundaries.yf) );
    }
    classGraph.prototype.periodicTimer = function(tableId, label)
    {
        var tableId = tableId || '';
        var self = this;
        this.interval = setInterval(function(){
            self.setBoundaries();
            self.$node = $("#"+tableId);
            self.updateData(label);
        }, this.timeInterval);
    }
    classGraph.prototype.updateData = function(label)
    {
        var value = this.getVal();
        this.ctx.clearRect(this.boundaries.x0, this.boundaries.y0, (this.canvasWidth - this.yAxisWidth), (this.canvasHeight - this.xAxisHeight - this.titleHeight));
        this.resizeYAxis(value);
        if( this.points.length == 0 )
            this.points.push( [this.boundaries.x0, this.fixedVal(value), value] );
        else if( this.points.length > 0 && this.points.length < this.maxPointsNumber )
            this.points.push( [(this.boundaries.x0 + this.PPwidth*this.points.length), this.fixedVal(value), value] );
        else if( this.points.length == this.maxPointsNumber )
            this.refreshPoints([this.boundaries.x0 + this.PPwidth*(this.points.length-1), this.fixedVal(value), value] );
        this.plotPoints(label, value);
        this.xAxis();
        this.xMarks();
        this.yAxis();
        this.yMarks();
    }
    classGraph.prototype.fixedValPre = function(realVal)
    {
        return parseInt(realVal * (this.boundaries.yf - this.boundaries.y0) / this.yAxisData.yMax);
    }
    classGraph.prototype.fixedVal = function(realVal)
    {
        return (this.boundaries.yf - this.fixedValPre(realVal));
    }
    classGraph.prototype.plotPoints = function(label, value)
    {
        this.buildTitle(label, value);
        for(var i=0; i<this.maxPointsNumber; i++)
        {
            if(typeof this.points[i] !== 'undefined')
            {
                this.ctx.fillStyle = "#000000";
                if( i==0 )
                    this.ctx.fillRect(this.points[i][0], this.points[i][1]- parseInt(this.pointRadio/2), this.pointRadio, this.pointRadio);
                else    
                    this.ctx.fillRect(this.points[i][0] - parseInt(this.pointRadio/2), this.points[i][1]- parseInt(this.pointRadio/2), this.pointRadio, this.pointRadio);
            }
            else
                break;    
            if( i>0 )
            {
                this.ctx.beginPath();
                this.ctx.moveTo(this.points[i-1][0], this.points[i-1][1]);
                this.ctx.lineTo(this.points[i][0], this.points[i][1]);
                this.ctx.closePath();
                this.ctx.strokeStyle = "#777777";
                this.ctx.lineWidth = 1;
                this.ctx.stroke();
            }
        }
    }

    classGraph.prototype.reAllocatePoints = function()
    {
        // using new yMax
        for(var i=0; i<this.points.length; i++)
            this.points[i][1] = this.fixedVal(this.points[i][2]);
    }

    classGraph.prototype.refreshPoints = function(newData)
    {
        for(var i=0; i<(this.maxPointsNumber-1); i++)
        {
            if( i==0 )
                this.points[i][0] = this.boundaries.x0;
            else
                this.points[i][0] = this.points[(i+1)][0] - this.PPwidth;
            this.points[i][1] = this.points[(i+1)][1];
            this.points[i][2] = this.points[(i+1)][2];
        }
        this.points[(this.maxPointsNumber-1)] = newData;
    }

    classGraph.prototype.resizeYAxis = function(realVal)
    {
        if( this.yAxisData.yMax == null)
            this.yAxisData.yMax = parseInt(realVal*2);
        var fixed = this.fixedValPre(realVal);
        if( this.points.length>=2 )
        {
            if( realVal > (this.points[this.points.length-1][2]*1.5) || realVal>(this.yAxisData.yMax*0.95) )
            {
                this.yAxisData.yMax = parseInt(realVal * 2);
                this.reAllocatePoints();
            }
            else if( realVal < (this.points[this.points.length-1][2]*0.5) || realVal<(this.yAxisData.yMax*0.2) )
            {
                this.yAxisData.yMax = parseInt(this.points[this.points.length-1][2]*1.2);
                this.reAllocatePoints();
            }
        }
    }
    classGraph.prototype.yMarks = function()
    {
        // reset array
        this.yAxisData.marks = [];
        var ticks = this.yAxisData['ticks'] - 1 ;
        //fill
        for(var i=0; i<ticks; i++)
            this.yAxisData.marks.push(0);

        for(var i=0; i<=ticks; i++)
        {
            this.yAxisData['marks'][i] = parseInt(this.yAxisData['yMax']*i/ticks);
            // use k, M, B for large numbers
            if(this.yAxisData['marks'][i]>=1000 && this.yAxisData['marks'][i]<1000000)
                this.yAxisData['marks'][i] = parseInt(this.yAxisData['marks'][i]/1000).toString()+"k";
            else if(this.yAxisData['marks'][i]>=1000000 && this.yAxisData['marks'][i]<1000000000)
                this.yAxisData['marks'][i] = parseInt(this.yAxisData['marks'][i]/1000000).toString()+"M";
            else if(this.yAxisData['marks'][i]>=1000000000)
                this.yAxisData['marks'][i] = parseInt(this.yAxisData['marks'][i]/1000000000).toString()+"B";
        }
        
        for(var i=(this.yAxisData['marks'].length-1); i>=0; i--)
        {
            this.ctx.font = "normal 10px Arial";
            this.ctx.textBaseLine = "middle"
            this.ctx.textAlign = "right";
            this.ctx.fillStyle = this.yAxisFontColor;
            this.ctx.fillText( (isNaN(this.yAxisData['marks'][i]) ? '':this.yAxisData['marks'][i]).toString() + ' _', this.yAxisWidth, ((this.canvasHeight-this.titleHeight-this.xAxisHeight)/(this.yAxisData['ticks']-1))*(ticks - i)+this.titleHeight);
        }
    }
    classGraph.prototype.xMarks = function()
    {
        if(this.points.length<=2)
            return false;
        var ticksNumber = parseInt((this.points[this.points.length-1][0] - this.boundaries.x0 - this.xAxisLabelWidth)/this.xAxisLabelWidth )+1;
        if( ticksNumber<2 )
            return false;
        var d = new Date();
        var lapse = this.timeInterval*(this.points.length-1)/(ticksNumber-1);
        this.xAxisData = [];
        for(var i=ticksNumber; i>=0; i--)
        {
            this.xAxisData.push(0);
        }
        for(var i=ticksNumber; i>=0; i--)
        {
            this.xAxisData[i] = this.getTimeLabel( d.getTime()-(ticksNumber-i)*lapse );
        }

        for(var i=0; i<=ticksNumber; i++)
        {
            this.ctx.font = "normal "+this.xAxixFontSize+"px Arial";
            this.ctx.textBaseLine = "middle"
            this.ctx.textAlign = "right";
            this.ctx.fillStyle = this.xAxisFontColor;
            this.ctx.fillText( this.xAxisData[i], (this.boundaries.x0 + this.xAxisLabelWidth*i), this.canvasHeight - this.xAxisHeight + this.xAxixFontSize );
        }

    }
    classGraph.prototype.getTimeLabel = function(timestamp)
    {
        var d = new Date(timestamp);
        return d.getHours().toString() + ':'+d.getMinutes().toString() + ':' + d.getSeconds().toString();
    }
    classGraph.prototype.getVal = function()
    {
        return parseFloat(this.$node.text());
    }
    classGraph.prototype.toLocalTime = function(timestamp)
    {
        return (timestamp - ((new Date).getTimezoneOffset() * 60));
    }
    classGraph.prototype.setPPwidth = function(newVal)
    {
        this.PPwidth = newVal;
    }
    classGraph.prototype.getYMarks = function(){
        console.log(this.yAxisData['marks']);
    }


var x = [];
$(document).on("ready",function(){
    // looking for Numeric Objects
    $("body").find("span[supplemental=NumericItem]").each(function(){
    var $table = $(this).closest('table');
    if($(this).attr('xpath').indexOf("dt='6'")>0)
    {
        var label = $(this).prevAll(':eq(1)').text();
        tableId = Math.random().toString(36).substring(6);
        $(this).attr('id', tableId);
        var sG = new classGraph();
        sG.Init($table.css("left"), $table.css("top"), $table.css("width"), $table.css("height"), $table.css("border-width"), $table.css("border-color"), $table.css("border-style"), label, $(this), tableId, $table.css("border"));
        x.push(sG);
    } 
    });
});

