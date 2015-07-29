sap.ui.controller("oeepareto.inicio", {

	/**
	 * Called when a controller is instantiated and its View controls (if available) are already created.
	 * Can be used to modify the View before it is displayed, to bind event handlers and do other one-time initialization.
	 * @memberOf oeepareto.inicio
	 */
	onInit: function() {
		// Obtener box planta.
		var dpPlanta = sap.ui.getCore().byId(this.createId('dropdownBoxPlanta'));
		// Obtener plantas disponibles.
		
		var aPlantaData = [ {
			idPlanta : "p01",
			nombre : "Planta 01"
		}, {
			idPlanta : "p02",
			nombre : "Planta 02"
		} ];
		var oModelPlanta = new sap.ui.model.json.JSONModel();
		oModelPlanta.setData({modelData: aPlantaData});
		
		dpPlanta.setModel(oModelPlanta);
		var oItemTemplate1 = new sap.ui.core.ListItem();
		oItemTemplate1.bindProperty("text", "nombre");
		oItemTemplate1.bindProperty("key", "idPlanta");
		dpPlanta.bindItems("/modelData", oItemTemplate1);
		
		// Agregar elemento vacio.
		var oItem = new sap.ui.core.ListItem();
		oItem.setText("Seleccione una planta");
		oItem.setKey("");
		dpPlanta.insertItem(oItem, 0);
				
		// Obtener box tipo operacion.
		var dpTipoOperacion = sap.ui.getCore().byId(this.createId('dropdownBoxTipoOperacion'));
		// Obtener lineas disponibles de la planta.
		var aTipoOperacionData = [ {
			idTipoOperacion : "to01",
			nombre : "Parada No Programada"
		}, {
			idTipoOperacion : "to02",
			nombre : "Parada Programada"
		} ];
		var oModelTipoOperacion = new sap.ui.model.json.JSONModel();
		oModelTipoOperacion.setData({modelData: aTipoOperacionData});
		
		dpTipoOperacion.setModel(oModelTipoOperacion);
		var oItemTemplate3 = new sap.ui.core.ListItem();
		oItemTemplate3.bindProperty("text", "nombre");
		oItemTemplate3.bindProperty("key", "idTipoOperacion");
		dpTipoOperacion.bindItems("/modelData", oItemTemplate3);
		
		// Agregar elemento vacio.
		var oItem2 = new sap.ui.core.ListItem();
		oItem2.setText("Seleccione un tipo de operación");
		oItem2.setKey("");
		dpTipoOperacion.insertItem(oItem2, 0);
	},

	/**
	 * Similar to onAfterRendering, but this hook is invoked before the controller's View is re-rendered
	 * (NOT before the first rendering! onInit() is used for that one!).
	 * @memberOf oeepareto.inicio
	 */
//	onBeforeRendering: function() {

//	},

	/**
	 * Called when the View has been rendered (so its HTML is part of the document). Post-rendering manipulations of the HTML could be done here.
	 * This hook is the same one that SAPUI5 controls get after being rendered.
	 * @memberOf oeepareto.inicio
	 */
//	onAfterRendering: function() {

//	},

	/**
	 * Called when the Controller is destroyed. Use this one to free resources and finalize activities.
	 * @memberOf oeepareto.inicio
	 */
//	onExit: function() {

//	}
	cargarDpLinea : function(key) {
		// Obtener box linea.
		var dpLinea = sap.ui.getCore().byId(this.createId('dropdownBoxLinea'));
		// Obtener lineas disponibles de la planta.
		var aLineaData = [ {
			idLinea : "l01",
			nombre : "Linea 01"
		}, {
			idLinea : "l02",
			nombre : "Linea 02"
		}, {
			idLinea : "l03",
			nombre : "Linea 03"
		} ];
		var oModelLinea = new sap.ui.model.json.JSONModel();
		oModelLinea.setData({modelData: aLineaData});
		
		dpLinea.setModel(oModelLinea);
		var oItemTemplate1 = new sap.ui.core.ListItem();
		oItemTemplate1.bindProperty("text", "nombre");
		oItemTemplate1.bindProperty("key", "idLinea");
		dpLinea.bindItems("/modelData", oItemTemplate1);
		
		// Agregar elemento vacio.
		var oItem = new sap.ui.core.ListItem();
		oItem.setText("Seleccione una linea");
		oItem.setKey("");
		dpLinea.insertItem(oItem, 0);
		dpLinea.setSelectedKey("");
		
		dpLinea.setEnabled(true);
	},
	descargarCSV : function(){
		console.log("Descargando CSV...");
		this.generarTabla();
		
	},
	buscarDatos: function() {
	console.log("Buscando...");

	var oTable = sap.ui.getCore().byId(this.createId('dataTableOperaciones'));

	var aData = [
	             {descripcion: "Accidente en la Linea", minutos: 3212, porcentajeAcumulado: 31.25},
	             {descripcion: "Falla Mecanica", minutos: 1644, porcentajeAcumulado: 45.2},
	             {descripcion: "Falla Electrica", minutos: 902, porcentajeAcumulado: 66.2},
	             {descripcion: "Incendio", minutos: 400, porcentajeAcumulado: 88.7},
	             {descripcion: "Choque de tren", minutos: 234, porcentajeAcumulado: 100.00}
	             ];
	
	// Arreglos para las series del gráfico.
	var aOcurrencia = [];
	var aPorcentajeAcumulado = [];
	
	// Arreglo para la descarga del CSV.
	var aDescarga = [];

	for ( var i = 0; i < aData.length; i++) {
		aOcurrencia.push([aData[i].descripcion, aData[i].minutos]);
		aPorcentajeAcumulado.push([aData[i].descripcion, aData[i].porcentajeAcumulado]);
		aDescarga.push([aData[i].descripcion, aData[i].minutos, aData[i].porcentajeAcumulado]);
	}
	
	sap.ui.getCore().AppContext.Data = aDescarga;
	
	var oModel = new sap.ui.model.json.JSONModel();
	oModel.setData({modelData: aData});
	oTable.setModel(oModel);
	oTable.bindRows("/modelData");

	oTable.sort(oTable.getColumns()[1], sap.ui.table.SortOrder.Descending);

	// Creación de gráfico.
	var chart = document.getElementById("chart-placeholder");
	chart.innerHTML = "";
	 $.jqplot.config.enablePlugins = true;
	  var s1 = [ 5];
      var s2 = [ 10];
      var s3 = [ 15];
      var ticks = [ 'Section1' ];

      plot2 = $.jqplot('chart-placeholder', [ s1, s2, s3 ], {
          animate : !$.jqplot.use_excanvas,
          seriesDefaults : {
              renderer : $.jqplot.BarRenderer,
              pointLabels : {
                  show : true
              },
              rendererOptions : {
                  barPadding : 8, // number of pixels between
                  // adjacent bars in the same
                  // group (same category or bin).
                  barMargin : 25, // number of pixels between
                  // adjacent groups of bars.
                  barDirection : 'vertical', // vertical or
                  // horizontal.
                  barWidth : 20, // width of the bars. null to
              // calculate automatically.

              }
          },
          series : [ {
              label : 'Puesto 1
          }, {
              label : 'Puesto 2'
          }, {
              label : 'X axis 3'
          }, ],
          seriesColors : [ "#efa229", "#245779", "#4BB2C5" ],
          axesDefaults : {
              base : 10, // the logarithmic base.
              tickDistribution : 'even', // 'even' or 'power'.
          // 'even' will produce
          // with even visiual
          // (pixel)
          // spacing on the axis. 'power' will produce ticks
          // spaced by
          // increasing powers of the log base.
          },
          axesDefaults : {
              tickRenderer : $.jqplot.CanvasAxisTickRenderer,
              tickOptions : {

                  fontSize : '7pt'
              }
          },
          axes : {
              xaxis : {
                  renderer : $.jqplot.CategoryAxisRenderer,
                  ticks : ticks
              },
              yaxis : {
                  // Don't pad out the bottom of the data range.
                  // By default,
                  // axes scaled as if data extended 10% above and
                  // below the
                  // actual range to prevent data points right on
                  // grid boundaries.
                  // Don't want to do that here.
                  padMin : 0
              }
          },
          tickOptions : {

              fontSize : '7pt'
          },
          legend : {
              show : true,
              location : 'ne', // compass direction, nw, n, ne,
              // e, se, s, sw, w.
              xoffset : 12, // pixel offset of the legend box
              // from the x (or x2) axis.
              yoffset : 12, // pixel offset of the legend box
              // from the y (or y2) axis.
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
{horizontalLine: {
    name: 'pebbles',
    y: 15,
    lineWidth: 3,
    xOffset: 0,
    color: 'rgb(89, 198, 154)',
    shadow: false
}}
                  
              ]   
           }  
      });  	

	var chartData = $('#chart-placeholder').jqplotToImageStr({});
	console.log(chartData);
},






 generarTabla : function(){
	var originalData = [
	                    ['Artist', 'Album', 'Price'],
	                    ['Buckethead', 'Albino Slug', 8.99],
	                    ['Buckethead', 'Electric Tears', 13.99],
	                    ['Buckethead', 'Colma', 11.34],
	                    ['Crystal Method', 'Vegas', 10.54],
	                    ['Crystal Method', 'Tweekend', 10.64],
	                    ['Crystal Method', 'Divided By Night', 8.99]
	                ];
	var chartData = ($('#chart-placeholder').jqplotToImageStr({})).split("data:image/png;base64,")[1];
	//console.log(chartData);
	                require(['libs/Excel/excel-builder.js', 
	                         'libs/Excel/Excel/Table.js',
	                         'libs/Excel/FileSaver.min.js',
	                         'libs/Excel/Excel/util.js',
	                         'libs/Excel/Excel/Drawings',
	                         'libs/Excel/Excel/Drawings/Picture',
	                         'libs/Excel/Excel/Positioning'],
	                         
	                	function (EB, Table2,downloader,util, Drawings, Picture, Positioning) {
	                	console.log("LLEGUE");
	                	var artistWorkbook = EB.createWorkbook();
	                    var albumList = artistWorkbook.createWorksheet({name: 'Album List'});
	                    var albumList2 = artistWorkbook.createWorksheet({name: 'Album Liswt'});
	                    
	                    var drawings = new Drawings();
	                    var picRef = artistWorkbook.addMedia('image', 'grafico.png', chartData);
	                    
	                    var grafico_picture = new Picture();
	                    grafico_picture.createAnchor('twoCellAnchor', {
	                        from: {
	                            x: 10,
	                            y: 1
	                        },
	                        to: {
	                            x: 17,
	                            y: 15
	                        }
	                    });
	                    grafico_picture.setMedia(picRef);
	                    drawings.addDrawing(grafico_picture);
	                   
	                    albumList.setColumns([
	                        {width: 16},
	                        {width: 17},
	                        {width: 7}
	                    ]); 
	                    
	                    var albumTable = new Table2();
	                    albumTable.styleInfo.themeStyle = "TableStyleMedium2"; //This is a predefined table style
	                    albumTable.setReferenceRange([1, 1], [3, originalData.length]); //X/Y position where the table starts and stops.
	                 
	                    albumTable.setTableColumns([
	                        'Artist',
	                        'Album',
	                        'Price'
	                    ]);
	                   
	                     console.log(albumTable);
	                     albumList.setData(originalData);   
	                     albumList.addTable(albumTable);
	                     albumList.addDrawings(drawings);
	                     artistWorkbook.addDrawings(drawings);
	                     artistWorkbook.addTable(albumTable);
	                     artistWorkbook.addWorksheet(albumList);
	                     
	                     console.log(artistWorkbook);
	                     	                     
	                    // albumList.addTable(albumTable);	                     
	                    // artistWorkbook.addWorksheet(albumList);
	                    // var albumlist3 = [albumList,albumList2];	                     
	                    // artistWorkbook.addWorksheet(albumList);	
	                    	                    
	                    console.log(artistWorkbook.worksheets);
	                    var data = EB.createFile(artistWorkbook);
	                   // console.log(data);
	                    
	                   
							console.log("IE Download");
							function b64toBlob(b64Data, contentType, sliceSize) {
							    contentType = contentType || '';
							    sliceSize = sliceSize || 512;

							    var byteCharacters = atob(b64Data);
							    var byteArrays = [];

							    for (var offset = 0; offset < byteCharacters.length; offset += sliceSize) {
							        var slice = byteCharacters.slice(offset, offset + sliceSize);

							        var byteNumbers = new Array(slice.length);
							        for (var i = 0; i < slice.length; i++) {
							            byteNumbers[i] = slice.charCodeAt(i);
							        }

							        var byteArray = new Uint8Array(byteNumbers);

							        byteArrays.push(byteArray);
							    }

							    var blob = new Blob(byteArrays, {type: contentType});
							    console.log(blob);
							    return blob;
							}
							var blob = b64toBlob(data, "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet;charset=utf-8;");
							
							//saveAs(blob, "HOLA.xlsx");	
							saveAs(blob, "HOLA.xlsx");	
	           });
	},
	generarImagen : function (){
		
		
		
		
		
	}
});