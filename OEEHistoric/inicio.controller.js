sap.ui.controller("OEEHistoric.inicio", {

	/**
	 * Called when a controller is instantiated and its View controls (if available) are already created.
	 * Can be used to modify the View before it is displayed, to bind event handlers and do other one-time initialization.
	 * @memberOf OEEHistoric.inicio
	 */
	onInit: function() {
	aSearch = [{username : "",
	       		planta: "",
	       		linea: "", 
	       		fecha_desde: "", 
	       		fecha_hasta: ""}];
		this.getData_Planta();
		this.getData_Linea(); 
	},

	/**
	 * Similar to onAfterRendering, but this hook is invoked before the controller's View is re-rendered
	 * (NOT before the first rendering! onInit() is used for that one!).
	 * @memberOf OEEHistoric.inicio
	 */
//	onBeforeRendering: function() {
//		
//	},

	/**
	 * Called when the View has been rendered (so its HTML is part of the document). Post-rendering manipulations of the HTML could be done here.
	 * This hook is the same one that SAPUI5 controls get after being rendered.
	 * @memberOf OEEHistoric.inicio
	 */
//	onAfterRendering: function() {
//
//	},

	/**
	 * Called when the Controller is destroyed. Use this one to free resources and finalize activities.
	 * @memberOf OEEHistoric.inicio
	 */
//	onExit: function() {
//		
//	},
	
	getData_Planta: function (){
			var planta = [{key : "", planta : ""},
			              {key : "Pl_1", planta : "Planta_1"},
			              {key : "PL_2", planta : "Planta_2"},
			              {key : "PL_3", planta : "Planta_3"}];
			
			this.setData_Dropdown(planta,"planta","planta");
						
	},
	
	getData_Linea: function (){
		var linea  = [{key : "", 	 linea : ""},
		              {key : "LN_1", linea : "Linea_1"},
		              {key : "LN_2", linea : "Linea_2"},
		              {key : "LN_3", linea : "Linea_3"}];
		
		this.setData_Dropdown(linea,"linea","linea");
					
	},
	 
	 setData_Dropdown : function(key,elementById,bindProperty){
			var oDropdownBox = sap.ui.getCore().getElementById(elementById);
			oDropdownBox.setModel(new sap.ui.model.json.JSONModel(({modelData: key})));	
			oDropdownBox.bindItems("/modelData",new sap.ui.core.ListItem().bindProperty("text",bindProperty).bindProperty("enabled","enabled"));
			console.log(oDropdownBox);
	},
	
	setEnabled_Elements : function (boolean,elementById){	
		var element = sap.ui.getCore().getElementById(elementById);
		element.setEnabled(boolean);
		
	},
		
	getData_Search: function() {
		if(this.validateDate() && (aSearch[0].planta!="" || aSearch[0].linea!="")){
			this.renderOEE_Teorico(50);	
			this.renderOEE_Variables(50,60,70);
		}else{
			alert("Datos invalidos");
		}
	},
	
	validateDate : function(){
		var faux_desde = (aSearch[0].fecha_desde.split("-").join("/")).split("/");
		var faux_hasta =  (aSearch[0].fecha_hasta.split("-").join("/")).split("/");

		var fecha_desde = new Date (faux_desde[1]+"/"+faux_desde[0]+"/"+faux_desde[2]);
		var fecha_hasta = new Date (faux_hasta[1]+"/"+faux_hasta[0]+"/"+faux_hasta[2]);
		if((fecha_desde instanceof Date) &&(fecha_hasta instanceof Date) && (fecha_desde.getTime() <= fecha_hasta.getTime()) ){
		    return true;
		}else{
		   return false;
		}
	},
	
   renderOEE_Teorico : function(s1){
		if(gOEETeorico == null){
			gOEETeorico = $.jqplot('chart-OEETeorico', [[s1]], {
		          animate : !$.jqplot.use_excanvas,
		          seriesDefaults : {
		              renderer : $.jqplot.BarRenderer,
		              pointLabels : {
		                  show: true,
		                  location:'s',
		                  xpadding : 11
		              },
		              rendererOptions : {
		                  barPadding : 20,
		                  barMargin : 25, 
		                  barDirection : 'vertical', 
		                  barWidth : 100,
		                  varyBarColor: true	
		              }
		          },
		          series : [ {
		              label : 'OEE Teorico'
		          }],
		          seriesColors : [ "#245779"],
		          axesDefaults : {
		              tickRenderer : $.jqplot.CanvasAxisTickRenderer,
		              tickOptions : {
		        	      formatString: '%s%',
		                  fontSize: '11pt',
		      	   		 textColor: '#000000',
		      			 fontStretch : 2.0
		              }
		          },
		          axes : {
		              xaxis : {
		                  renderer : $.jqplot.CategoryAxisRenderer,
		                  ticks : ['OEE Teorico']
		
		              },
		              yaxis : {
		            	 min:0, 
		            	 max: 100,
		            	 ticks: [[0],[20],[40],[60],[80],[100]]},           	 
		                 padMin : 0
		              },
		          legend : {
		              show : true,
		              location : 'ne',
		              xoffset : 12, 
		              yoffset : 12, 
		              placement : 'outside'
		          },
		          cursor : {
		              show : false,
		              showTooltip : true,
		              tooltipLocation : 'ne'
		
		          },
		          grid : {
		              background : 'white'
		          },
		          canvasOverlay: {
		              show: true,
		              objects: [
		                  { dashedHorizontalLine: {
		                    name: 'bam-bam',
		                    y: 80,
		                    lineWidth: 3,
		                    xOffset: 0,
		                    dashPattern: [16, 12],
		                    lineCap: 'round',
		                    color: 'rgb(89, 198, 154)',
		                    shadow: false
		                }}
		                  
		              ]   
		           }  
		      }); 
		    }else{
		    	gOEETeorico.series[0].data = [[1,s1]];
		    	gOEETeorico.replot();
		    	
		    
			}
	},

	renderOEE_Variables : function(s1,s2,s3){
		if(gOEEVariable == null){
			gOEEVariable = $.jqplot('chart-OEEVariable', [[s1], [s2], [s3] ], {
		         animate : !$.jqplot.use_excanvas,
		         seriesDefaults : {
		             renderer : $.jqplot.BarRenderer,
		             pointLabels : {
		                 show: true,
		                 location:'s',
		                 xpadding : 11
		             },
		             rendererOptions : {
		                 barPadding : 20,
		                 barDirection : 'vertical',
		                 barWidth : 80
		             }
		         },
		         series : [ {
		             label : 'Disponibilidad'
		         }, {
		             label : 'Calidad'
		         }, {
		             label : 'Desempeño'
		         }, ],
		         seriesColors : [ "#efa229", "#00749F", "#4BB2C5" ],
		         axesDefaults : {
		             base : 10,
		             tickDistribution : 'even'
		         },
		         axesDefaults : {
		             tickRenderer : $.jqplot.CanvasAxisTickRenderer,
		             tickOptions : {
		       	      formatString: '%s%',
		                 fontSize: '11pt',
		     	   		 textColor: '#000000',
		     			 fontStretch : 2.0
		             }
		         },
		         axes : {
		             xaxis : {
		                 renderer : $.jqplot.CategoryAxisRenderer,
		                 ticks : ['OEE Variables']
		             },
		             yaxis : {
		            	 min:0, 
		            	 max: 100,
		            	 ticks: [[0],[20],[40],[60],[80],[100]]},           	 
		                 padMin : 0
		         },
		         tickOptions : {
		
		             fontSize : '7pt'
		         },
		         legend : {
		             show : true,
		             location : 'ne',
		             xoffset : 12, 
		             yoffset : 12,
		             placement : 'outside'
		         },
		         cursor : {
		             show : false,
		
		             showTooltip : true,
		             tooltipLocation : 'ne'
		
		         },
		         grid : {
		             background : 'white'
		         },
		         canvasOverlay: {
		             show: true,
		             objects: [
		 				{	dashedHorizontalLine: {
		                    name: 'bam-bam',
		                    y: 80,
		                    lineWidth: 3,
		                    xOffset: 0,
		                    dashPattern: [16, 12],
		                    lineCap: 'round',
		                    color: 'rgb(89, 198, 154)',
		                    shadow: false
		                }}
		                 
		             ]   
		          }  
		     });
		}else{			  
			gOEEVariable.series[0].data = [[1,s1],[2,s2],[3,s3]];
			gOEEVariable.replot();
		
		}
	}

});