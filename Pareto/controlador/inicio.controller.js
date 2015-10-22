// ++++++++++++++++++++++++++++ INCLUDE de LIBRERIAS GLOBALES ++++++++++++++++++++++++++++++
jQuery.sap.registerModulePath('global', '/Directory');
jQuery.sap.require("global.SAPMII");
jQuery.sap.require("global.functions");
jQuery.sap.require("global.xml2json");
  // ++++++++++++++++++++++++++++ INCLUDE de LIBRERIAS GLOBALES ++++++++++++++++++++++++++++++


  sap.ui.controller("controlador.inicio", {

/**
* Called when a controller is instantiated and its View controls (if available) are already created.
* Can be used to modify the View before it is displayed, to bind event handlers and do other one-time initialization.
* @memberOf filtroparadas.FiltroParadas
*/

  onInit: function() {
    aSearch = [{
      username : "",
      planta: "0205",
      linea: "TODOS", 
      equipo: "TODOS",
      tipo_operacion: "TODOS", 
      fecha_desde: "", 
      fecha_hasta: ""
    }];
  
    this.getData_Planta();
  },

/**
* Similar to onAfterRendering, but this hook is invoked before the controller's View is re-rendered
* (NOT before the first rendering! onInit() is used for that one!).
* @memberOf filtroparadas.FiltroParadas
*/
//  onBeforeRendering: function() {
//
//  },

/**
* Called when the View has been rendered (so its HTML is part of the document). Post-rendering manipulations of the HTML could be done here.
* This hook is the same one that SAPUI5 controls get after being rendered.
* @memberOf filtroparadas.FiltroParadas
*/
//  onAfterRendering: function() {
//
//  },

/**
* Called when the Controller is destroyed. Use this one to free resources and finalize activities.
* @memberOf filtroparadas.FiltroParadas
*/
//  onExit: function() {
//
//  }
  
  getData_Planta : function(){
    var planta = [{planta: "", PLN_ID: ""}];
  
    global.SAPMII.obtenerDatosTrx("/Directory",{
      pPLN_ID : "TODOS",
      pUserName : ""
  
    },"OutXML",function(retorno) {
  
      var filas =  retorno.datos.Rowset.Row;   
      if(filas instanceof Array){
        for(var index in filas) { 
          planta.push({
            planta : filas[index].PLN_DESC,
            PLN_ID : filas[index].PLN_ID
          });
        }
      }else{
        planta.push({
          planta : filas.PLN_DESC,
          PLN_ID : filas.PLN_ID
        });
      }
      SAP_UI.setData_Dropdown(planta, "planta", "planta");
    });
  },
  
  
  
  getData_Linea : function(){
      var linea = [{linea : "", LIN_ID: "TODOS"}];
      global.SAPMII.obtenerDatosTrx("/Directory",{
        pPLN_ID : aSearch[0].planta
    
      },"XML_OUT",function(retorno) {
        var filas =  retorno.datos.Rowset.Row;
        if(filas && retorno.tipo!="E" ){
          if(filas instanceof Array) {
            for(var index in filas) { 
              linea.push({  
                linea: filas[index].LIN_DESCRIP_AGRUP, 
                LIN_ID: filas[index].LIN_AGRUPADOR
              }); 
            }
          }
          else{
            linea.push({
              linea : filas.LIN_DESCRIP_AGRUP,
              LIN_ID: filas.LIN_AGRUPADOR
            }); 
          }
          
          SAP_UI.setEstadoElements(true,"linea");
        }else{
          sap.ui.commons.MessageBox.show("Error. No se| encuentran lineas para esta planta: ",sap.ui.commons.MessageBox.Icon.WARNING);
  
          SAP_UI.setEstadoElements(false,"linea");
          SAP_UI.setEstadoElements(false,"equipo");
          SAP_UI.setEstadoElements(false,"fechaDesde");
          SAP_UI.setEstadoElements(false,"fechaHasta");
          
        }
        SAP_UI.setData_Dropdown(linea, "linea", "linea");
      });
    },
  
  getData_Equipo : function(){
    
      var equipo = [{equipo : "", LIN_SHORT_NAME : "", LIN_ID: "TODOS"}];

        global.SAPMII.obtenerDatosTrx("/Directory",{
          pPLN_ID : aSearch[0].planta,
          pLIN_ID : aSearch[0].linea
          
        },"XML_OUT",function(retorno) {
      
          var filas =  retorno.datos.Rowset.Row;   
          if(filas && retorno.tipo!="E" ){
            if(filas instanceof Array) {
              for(var index in filas) { 
                equipo.push({         
                  equipo: filas[index].LIN_DESC,
                  LIN_SHORT_NAME : filas[index].LIN_SHORT_NAME, 
                  LIN_ID: filas[index].LIN_ID
                }); 
              }
            }else{
              equipo.push({
                equipo : filas.LIN_DESC,
                LIN_SHORT_NAME : filas.LIN_SHORT_NAME,
                LIN_ID: filas.LIN_ID
              }); 
            }
            SAP_UI.setEstadoElements(true,"equipo");
          }else{
            
            if(aSearch[0].linea != "TODOS")sap.ui.commons.MessageBox.show("Error. No se encuentran equipos para esta linea: ",sap.ui.commons.MessageBox.Icon.WARNING);
            SAP_UI.setEstadoElements(false,"equipo");
            SAP_UI.setData_Dropdown([{}], "tipo_operacion", "tipo_operacion");
            SAP_UI.setEstadoElements(false,"tipo_operacion"); 

          }
  
          SAP_UI.setData_Dropdown(equipo, "equipo", "equipo");                  
        });
    },  
  
  getData_TipoOperacion : function(){
  
    var tipo_operacion = [{tipo_operacion : "", TDE_ID : "TODOS"}];
  
    if(aSearch[0].equipo!="TODOS"){
  
      global.SAPMII.obtenerDatosTrx("/Directory",{
  
      },"OutXML",function(retorno) {
  
        var filas =  retorno.datos.Rowset.Row;     
        if(filas && retorno.tipo!="E" ){
            if(filas instanceof Array) {
              for(var index in filas) { 
                tipo_operacion.push({TDE_ID : filas[index].TDE_ID,
                  tipo_operacion : filas[index].TDE_DESCRIPCION});  
              }
            
            }else{
              tipo_operacion.push({TDE_ID : filas.TDE_ID,
              tipo_operacion : filas.TDE_DESCRIPCION}); 
            }
  
            SAP_UI.setEstadoElements(true,"tipo_operacion"); 
        }else{
            SAP_UI.setEstadoElements(false,"tipo_operacion"); 
            SAP_UI.setEstadoElements(false,"searchButton");
        } 
        
        SAP_UI.setData_Dropdown(tipo_operacion, "tipo_operacion", "tipo_operacion");
                    
      });
    }else{
  
      SAP_UI.setData_Dropdown(tipo_operacion, "tipo_operacion", "tipo_operacion");
      SAP_UI.setEstadoElements(false,"tipo_operacion"); 
      aSearch[0].tipo_operacion ="TODOS";
    } 
  
  },
  
  getData_Search : function(){
  
    if(this.validateDate()){
      aData = [];
       SAP_UI.refreshData();
      global.SAPMII.obtenerDatosTrx("/Directory",{
  
        pPlanta : aSearch[0].planta,
        pLinea : aSearch[0].equipo, 
        pLinea_Agrupador : aSearch[0].linea,
        pTipoOperacion: aSearch[0].tipo_operacion,
        pUserName: aSearch[0].username,
        pFechaDesde : aSearch[0].fecha_desde+" 00:00:00",
        pFechaHasta : aSearch[0].fecha_hasta+" 23:59:59"                  
  
      },"XMLOutput",function(retorno) {
          var filas =  retorno.datos.Rowset.Row;  
//          console.log(filas); 
      if(filas){
        if(filas instanceof Array) {
          for(var index in filas) { 
            aData.push({
              desc_motivo : filas[index].GROUND_DESC, 
              minutos_ocurrencia  : parseInt(filas[index].MINUTOS_OCURRENCIA),
              porcentajeAcumulado : parseFloat(filas[index].PORCENTAJE_PESO)
            });
          }          
        }
        else{
              aData.push({
              desc_motivo : filas.GROUND_DESC, 
              minutos_ocurrencia  : parseInt(filas.MINUTOS_OCURRENCIA),
              porcentajeAcumulado : parseFloat(filas.PORCENTAJE_PESO)
                     });
        }
        SAP_UI.getGraphic(aData);    
        SAP_UI.formatDataTable(aData);
        oTable.setVisibleRowCount(aData.length);
        SAP_UI.refreshData();
        
        }else{         
              sap.ui.commons.MessageBox.show("Error. No existen registros para esta linea en la fecha asignada",sap.ui.commons.MessageBox.Icon.WARNING);
        }
        
      });
    }
  },
  
  validateDate : function(){
  
      var faux_desde = (aSearch[0].fecha_desde.split("-").join("/")).split("/");
      var faux_hasta =  (aSearch[0].fecha_hasta.split("-").join("/")).split("/");
  
      aSearch[0].fecha_desde = aSearch[0].fecha_desde.split("-").join("/");
      aSearch[0].fecha_hasta = aSearch[0].fecha_hasta.split("-").join("/");
      
      var fecha_desde = new Date (faux_desde[1]+"/"+faux_desde[0]+"/"+faux_desde[2]);
      var fecha_hasta = new Date (faux_hasta[1]+"/"+faux_hasta[0]+"/"+faux_hasta[2]);
      
      SAP_UI.setEstadoElements(false,"searchButton");

      if(aSearch[0].fecha_desde == "" || aSearch[0].fecha_hasta == ""){
        return false;
      }
      
      if(!(fecha_desde instanceof Date) && !(fecha_hasta instanceof Date)){
        sap.ui.commons.MessageBox.show("Error. Ambas fechas son invalidas ",sap.ui.commons.MessageBox.Icon.WARNING);
        return false;  
      }
      else if(!(fecha_desde instanceof Date) || faux_desde==""){
        sap.ui.commons.MessageBox.show("Error. Fecha desde es invalida ",sap.ui.commons.MessageBox.Icon.WARNING);
        return false;  
      }
      else if(!(fecha_hasta instanceof Date) || faux_hasta==""){
        sap.ui.commons.MessageBox.show("Error. Fecha hasta es invalida ",sap.ui.commons.MessageBox.Icon.WARNING); 
        return false;       
      }
      if(fecha_desde.getTime() > fecha_hasta.getTime()){
        sap.ui.commons.MessageBox.show("Error. El rango de fechas es invalido ",sap.ui.commons.MessageBox.Icon.WARNING); 
        return false;  
      }   
      if(aSearch[0].tipo_operacion == "TODOS"){
        return false;
      }
        SAP_UI.setEstadoElements(true,"searchButton")
        return true;
    
    },
  
  setData_Dropdown : function(Key,elementById,bindProperty){
    var oDropdownBox = sap.ui.getCore().getElementById(elementById);
    oDropdownBox.setModel(new sap.ui.model.json.JSONModel(({modelData: Key}))); 
    oDropdownBox.bindItems("/modelData",new sap.ui.core.ListItem().bindProperty("text",bindProperty).bindProperty("enabled","enabled"));
  //  console.log(oDropdownBox);
  },
  
  setEstadoElements : function (boolean,elementById){ 
  //  console.log(elementById);
    var element = sap.ui.getCore().getElementById(elementById);
    element.setEnabled(boolean);
    
  },

  formatDataTable: function (aData){
    for(var index in aData){
        var aPropertys = Object.keys(aData[index]);
        for(var cont in aPropertys){
               aData[index][aPropertys[cont]] = this.formatNumber(aData[index][aPropertys[cont]]);
        }      
    }
  
},

formatNumber: function (nStr){
    nStr += '';
    x = nStr.split('.');
    x1 = x[0];
    x2 = x.length > 1 ? '.' + x[1] : '';
    var rgx = /(\d+)(\d{3})/;
    while (rgx.test(x1)) {
      x1 = x1.replace(rgx, '$1' + ',' + '$2');
    }
    return x1 + x2;
},
  
  refreshData : function (){
    oTable.setModel(new sap.ui.model.json.JSONModel(({modelData: aData})));
    oTable.bindRows("/modelData");
    oTable.getModel().refresh(true);  
    oTable.sort(oTable.getColumns()[1], sap.ui.table.SortOrder.Descending);
  //  console.log(aData);
  },
  
  setTable : function (oTable,text,property,width){
    oTable.addColumn(new sap.ui.table.Column({
      label: new sap.ui.commons.Label({
        text: text}),
      template: new sap.ui.commons.TextField().bindProperty("value",property),
      width: width
    }));  
  },
  
  getGraphic: function() {
  
      var aOcurrencia = [];
      var aPorcentajeAcumulado = [];
    var max = 0;
      for ( var i = 0; i < aData.length; i++) {
      max = max + aData[i].minutos_ocurrencia;
        aOcurrencia.push([aData[i].desc_motivo, aData[i].minutos_ocurrencia]);
        aPorcentajeAcumulado.push([aData[i].desc_motivo, aData[i].porcentajeAcumulado]);
      }
  
      if(max > 1000){
        max = Math.round(max / 100);
        max = max * 100;
      }
      else if(max > 100){
        max = Math.round(max / 10);
        max = max * 10;
      }
  
      var chart = document.getElementById("chart-placeholder");
      chart.innerHTML = "";
  
      var plot2 = $.jqplot('chart-placeholder', [aOcurrencia , aPorcentajeAcumulado], {
        series:[{renderer:$.jqplot.BarRenderer}, {xaxis:'x2axis', yaxis:'y2axis'}],
        legend: {
          show: true,
          location: 'e', 
          placement: 'outsideGrid',
          marginLeft: 600,
          labels: ['(Min) Ocurrencia', '(%) Acumulado']
        },
        axesDefaults: {
          tickRenderer: $.jqplot.CanvasAxisTickRenderer,
          tickOptions: {
            fontSize: '9pt',
            textColor: "black",
          angle : -30
          }
        },
        seriesDefaults: {
        markerOptions: {
                  show: true,
                  style: 'circle',
                  size: 9,
                  shadow: false,
                  shapeRenderer: new $.jqplot.customMarkerRenderer()
              },
          rendererOptions: {
            smooth: true
          },
          tickRenderer: $.jqplot.CanvasAxisTickRenderer ,
          tickOptions: {
            angle: 0
          }
        },
        animate: true,
        animateReplot: true,
        axes: {
          xaxis: {
            renderer: $.jqplot.CategoryAxisRenderer       
          },
          x2axis: {
            renderer: $.jqplot.CategoryAxisRenderer,
            tickOptions: {
              show : false
            }
          },
          yaxis: {
          min : 0,
          max : max,
            autoscale:false,
            tickOptions: {
            formatString: '%s',
            fontSize: '10pt',
            textColor: '#000000',
            fontStretch : 2.0
          }
          },
          y2axis: {
            tickOptions: {
            formatString: '%s%',
            fontSize: '10pt',
            textColor: '#000000',
            fontStretch : 2.0,        
                  showGridline: false
                  },
                  min: 0,
            max : 100,
              autoscale:false
          }
        }
      });
  
    var chartData = $('#chart-placeholder').jqplotToImageStr({});
    this.setEstadoElements(true,"nameFile");
    this.setEstadoElements(true,"excelExport");
  },
  
  exportExcel : function(){
    var aDataExport = [['Descripcion', 'Minutos', 'Porcentaje Acumulado %']];
    console.log("ADATA");
    console.log(aData);
    for ( var i = 0; i < aData.length; i++) {
         aDataExport.push([aData[i].desc_motivo, aData[i].minutos_ocurrencia , aData[i].porcentajeAcumulado]);
      }
  console.log(aDataExport);
    var chartData = ($('#chart-placeholder').jqplotToImageStr({})).split("data:image/png;base64,")[1];
  
    require(['libs/js/Excel/excel-builder.js', 
      'libs/js/Excel/Excel/Table.js',
      'libs/js/Excel/FileSaver.min.js',
      'libs/js//Excel/Excel/util.js',
      'libs/js/Excel/Excel/Drawings',
      'libs/js/Excel/Excel/Drawings/Picture',
      'libs/js/Excel/Excel/Positioning.js'],
      function (EB, Table2,downloader,util, Drawings, Picture, Positioning) {
  
        var artistWorkbook = EB.createWorkbook();
        var albumList = artistWorkbook.createWorksheet({name: 'OEE_Pareto'});
  
        var drawings = new Drawings();
        var picRef = artistWorkbook.addMedia('image', 'grafico.png', chartData);
  
        var grafico_picture = new Picture();
        grafico_picture.createAnchor('twoCellAnchor', {
          from: {
            x: 4,
            y: 1
          },
          to: {
            x: 16,
            y: 21
          }
        });
        grafico_picture.setMedia(picRef);
        drawings.addDrawing(grafico_picture);
  
        albumList.setColumns([
          {width: 25.5},
          {width: 17},
          {width: 26}
          ]); 
  
        var albumTable = new Table2();
                        albumTable.styleInfo.themeStyle = "TableStyleMedium2"; //This is a predefined table style
                        albumTable.setReferenceRange([1, 1], [3, aDataExport.length]); //X/Y position where the table starts and stops.
                albumTable.setTableColumns([
                          'Descripcion',
                          'Minutos',
                          'Porcentaje Acumulado'
                        ]);
        
             albumList.setData(aDataExport);  
                        albumList.addTable(albumTable);
                        albumList.addDrawings(drawings);
                        artistWorkbook.addDrawings(drawings);
                        artistWorkbook.addTable(albumTable);
  
                        artistWorkbook.addWorksheet(albumList);
                        var data = EB.createFile(artistWorkbook);
  
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
  
                          return blob;
                         }
      
                       var blob = b64toBlob(data, "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet;charset=utf-8;");
          
       if(sap.ui.getCore().getElementById("nameFile").getValue()!=""){    
                   saveAs(blob, sap.ui.getCore().getElementById("nameFile").getValue()+".xlsx");
                            }else{
                  saveAs(blob, "OEE_Pareto.xlsx");
                           }  
      });
  }
});