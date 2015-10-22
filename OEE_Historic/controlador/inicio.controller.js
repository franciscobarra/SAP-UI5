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
 * @memberOf controlador.inicio
 */
   onInit: function() {
    aSearch = [{
      username : "",
      planta: "TODOS",
      equipo: "TODOS",
      linea: "TODOS", 
      fecha_desde: "", 
      fecha_hasta: ""
    }];
    this.getData_Planta();
   },

/**
 * Similar to onAfterRendering, but this hook is invoked before the controller's View is re-rendered
 * (NOT before the first rendering! onInit() is used for that one!).
 * @memberOf controlador.inicio
 */
//  onBeforeRendering: function() {
//    
//  },

/**
 * Called when the View has been rendered (so its HTML is part of the document). Post-rendering manipulations of the HTML could be done here.
 * This hook is the same one that SAPUI5 controls get after being rendered.
 * @memberOf controlador.inicio
 */
//  onAfterRendering: function() {
//
//  },

/**
 * Called when the Controller is destroyed. Use this one to free resources and finalize activities.
 * @memberOf controlador.inicio
 */
//  onExit: function() {
//
//  },

  getData_Planta : function(){
    var planta = [{planta: "", PLN_ID: "TODOS"}];
  
    global.SAPMII.obtenerDatosTrx("/Directory",{
      pPLN_ID : "TODOS",
      pUserName : ""
    
    },"OutXML",function(retorno) {
    
      var filas =  retorno.datos.Rowset.Row;  
      if(filas && retorno.tipo!="E" ){ 
        if(filas instanceof Array) {
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
      }else{
  //      sap.ui.commons.MessageBox.show("Error al cargar datos de planta ",sap.ui.commons.MessageBox.Icon.WARNING);
      }     
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
        
        SAP_UI.setData_Dropdown(linea, "linea", "linea");
        SAP_UI.setEstadoElements(true,"linea");
        SAP_UI.setEstadoElements(true,"fechaDesde");
        SAP_UI.setEstadoElements(true,"fechaHasta");     
      }else{
      //  sap.ui.commons.MessageBox.show("Error. No se| encuentran lineas para esta planta: ",sap.ui.commons.MessageBox.Icon.WARNING);
        SAP_UI.setData_Dropdown([], "linea", "linea");
        SAP_UI.setEstadoElements(false,"linea");
        SAP_UI.setEstadoElements(false,"equipo");
      }
    });
  },
  
  getData_Equipo : function(){
  
    var equipo = [{equipo : "", LIN_SHORT_NAME : "", LIN_ID: "TODOS"}];
    if(aSearch[0].linea!="TODOS"){
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
          SAP_UI.setData_Dropdown(equipo, "equipo", "equipo");
          SAP_UI.setEstadoElements(true,"equipo");
        }else{
  //        sap.ui.commons.MessageBox.show("Error. No se encuentran equipos para esta linea: ",sap.ui.commons.MessageBox.Icon.WARNING);
          SAP_UI.setEstadoElements(false,"equipo");
          SAP_UI.setEstadoElements(false,"searchButton");
        }                 
      });
    }else{
      aSearch[0].equipo = "TODOS";
      SAP_UI.setData_Dropdown(equipo, "equipo", "equipo");
      SAP_UI.setEstadoElements(false,"equipo");
      SAP_UI.setEstadoElements(false,"searchButton");
    }
  },
  
  getData_Search: function() {

  
    if(this.validateDate()){
      
      aData = [];
      dataTable = []; 
      SAP_UI.refreshData(dataTable);  
      global.SAPMII.obtenerDatosTrx("/Directory",{
      
        Planta : aSearch[0].planta,
        Linea_agrupador : aSearch[0].linea,
        Linea : aSearch[0].equipo,
        fechaDesde :  aSearch[0].fecha_desde+" 00:00:00",
        fechaHasta :  aSearch[0].fecha_hasta+" 23:59:59"  
    
      },"xmlOUTPUT",function(retorno) {
        
      //console.log(aSearch[0]);
        var filas =  retorno.datos.Rowset.Row;   
        //console.log(filas);
        if(filas && retorno.tipo!="E" ){
          if(filas instanceof Array) {
            for(var index in filas) {
              aData.push({          
                availability: filas[index].PRE_CALC_AVAILABILITY,
                performance: filas[index].PRE_CALC_PERFORMANCE,
                quality: filas[index].PRE_CALC_QUALITY,
                real_OEE: filas[index].PRE_CALC_OEE,
                t_OEE: filas[index].PRE_CALC_TEORICO_OEE,
                t_availability: filas[index].PRE_CALC_TEORICO_AVAILABILITY,
                t_performance: filas[index].PRE_CALC_TEORICO_PERFORMANCE,
                t_quality: filas[index].PRE_CALC_TEORICO_QUALTITY,
                historico : filas[index].HISTORICO          
              });

              dataTable.push({          
                HISTORICO  : filas[index].HISTORICO,
                PRE_CALC_PIECES : filas[index].PRE_CALC_PIECES,
                PRE_CALC_GOOD_PIECES  : filas[index].PRE_CALC_GOOD_PIECES,
                PRE_CALC_REJECT_PIECES : filas[index].PRE_CALC_REJECT_PIECES,
                PRE_CALC_SHIFTH_LENGTH  : filas[index].PRE_CALC_SHIFTH_LENGTH+" min",
                PRE_CALC_SHORT_BREAK  : filas[index].PRE_CALC_SHORT_BREAK+" min",
                PRE_CALC_PLANNED_PRODUCTION  : filas[index].PRE_CALC_PLANNED_PRODUCTION+" min",
                PRE_CALC_DOWN_TIME : filas[index].PRE_CALC_DOWN_TIME+" min",
                PRE_CALC_OPERATING_TIME : filas[index].PRE_CALC_OPERATING_TIME+" min",
              });  
            }
          }else{
            aData.push({
              availability: filas.PRE_CALC_AVAILABILITY,
              performance: filas.PRE_CALC_PERFORMANCE,
              quality: filas.PRE_CALC_QUALITY,
              real_OEE: filas.PRE_CALC_OEE,
              t_OEE: filas.PRE_CALC_TEORICO_OEE,
              t_availability: filas.PRE_CALC_TEORICO_AVAILABILITY,
              t_performance: filas.PRE_CALC_TEORICO_PERFORMANCE,
              t_quality: filas.PRE_CALC_TEORICO_QUALTITY,
              historico : filas.HISTORICO                 
            });

            dataTable.push({          
                HISTORICO  : filas.HISTORICO,
                PRE_CALC_PIECES : filas.PRE_CALC_PIECES,
                PRE_CALC_GOOD_PIECES  : filas.PRE_CALC_GOOD_PIECES,
                PRE_CALC_REJECT_PIECES : filas.PRE_CALC_REJECT_PIECES,
                PRE_CALC_SHIFTH_LENGTH  : filas.PRE_CALC_SHIFTH_LENGTH+" min",
                PRE_CALC_SHORT_BREAK  : filas.PRE_CALC_SHORT_BREAK+" min",
                PRE_CALC_PLANNED_PRODUCTION  : filas.PRE_CALC_PLANNED_PRODUCTION+" min",
                PRE_CALC_DOWN_TIME : filas.PRE_CALC_DOWN_TIME+" min",
                PRE_CALC_OPERATING_TIME : filas.PRE_CALC_OPERATING_TIME+" min",
              }); 
          }
          SAP_UI.formatDataTable(dataTable);
          oTable.setVisibleRowCount(dataTable.length);
          SAP_UI.refreshData(dataTable); 
          SAP_UI.renderOEE_Teorico(aData);  
          SAP_UI.renderOEE_Variable(aData);
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
  //    sap.ui.commons.MessageBox.show("Error. Ambas fechas son invalidas ",sap.ui.commons.MessageBox.Icon.WARNING);
      return false;  
    }
    else if(!(fecha_desde instanceof Date) || faux_desde==""){
  //    sap.ui.commons.MessageBox.show("Error. Fecha desde es invalida ",sap.ui.commons.MessageBox.Icon.WARNING);
      return false;  
    }
    else if(!(fecha_hasta instanceof Date) || faux_hasta==""){
  //    sap.ui.commons.MessageBox.show("Error. Fecha hasta es invalida ",sap.ui.commons.MessageBox.Icon.WARNING); 
      return false;       
    }
    if(fecha_desde.getTime() > fecha_hasta.getTime()){
  //    sap.ui.commons.MessageBox.show("Error. Rango de fechas invalido ",sap.ui.commons.MessageBox.Icon.WARNING); 
      return false;  
    }   
    if(aSearch[0].equipo == "TODOS"){ 
       return false;
    }

      SAP_UI.setEstadoElements(true,"searchButton");
      return true;
  
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

  formatDate : function(){

    var faux_desde = (aSearch[0].fecha_desde.split("-").join("/")).split("/");
    var faux_hasta =  (aSearch[0].fecha_hasta.split("-").join("/")).split("/");
    
    var fecha_desde = new Date (faux_desde[1]+"/"+faux_desde[0]+"/"+faux_desde[2]);
    var fecha_hasta = new Date (faux_hasta[1]+"/"+faux_hasta[0]+"/"+faux_hasta[2]);

    if(parseInt(faux_desde[1]) <= 9) faux_desde[1] = "0"+faux_desde[1];
    if(parseInt(faux_hasta[1]) <= 9) faux_hasta[1] = "0"+faux_hasta[1];

    aSearch[0].fecha_desde = faux_desde[0]+"/"+faux_desde[1]+"/"+faux_desde[2];
    aSearch[0].fecha_hasta = faux_hasta[0]+"/"+faux_hasta[1]+"/"+faux_hasta[2];

    return; 

  },

  refreshData : function (){

    oTable.setModel(new sap.ui.model.json.JSONModel(({modelData: dataTable})));
    oTable.bindRows("/modelData");
    oTable.getModel().refresh(true);  
  },

  setTable : function (oTable,text,property,width){
    oTable.addColumn(new sap.ui.table.Column({
      label: new sap.ui.commons.Label({
        text: text}),
      template: new sap.ui.commons.TextField().bindProperty("value",property),
      width: width
    }));  
  },
  
  renderOEE_Variable : function(aData){
  
    var cosPoints = [];
    var sinPoints = [];
    var powPoints = [];
  
    for (var i = 0; i < aData.length; i++){
      cosPoints.push([aData[i].historico, parseFloat(aData[i].availability)]);
      sinPoints.push([aData[i].historico, parseFloat(aData[i].performance)]);
      powPoints.push([aData[i].historico, parseFloat(aData[i].quality)]);
    }
  
    document.getElementById("chart-OEEVariable").innerHTML = "";
    var plot3 = $.jqplot('chart-OEEVariable', [cosPoints, sinPoints, powPoints],{ 
           // title:'Puntos', 
           animate: true,
           series:[{
            lineWidth:2, 
            markerOptions: { style:'diamond' },
            pointLabels : {
              show: true,
              location:'s',
              ypadding : 10
            }
           }, 
           { 
            markerOptions: { style:"circle" },
            pointLabels : {
              show: true,
              location:'s',
              ypadding : 10
            }
           }, 
           {
            color: '#008080',  
            lineWidth:5, 
            markerOptions: { style:"filledSquare", size:10 },
            pointLabels : {
              show: true,
              location:'s',
              ypadding : 10
            }
           }
           ],
    
           axes: {
            xaxis: {
              renderer: $.jqplot.CategoryAxisRenderer
            },
            x2axis: {
              renderer: $.jqplot.CategoryAxisRenderer,
              tickOptions : {
                show: false
              }
            },
            yaxis: {
              autoscale:true,
              max: 100,
              min: 0,
              ticks: [[0],[20],[40],[60],[80],[100]]
            },
            y2axis: {
              autoscale:true,
              tickOptions : {
                show: false
              }
    
            }
           },
           
           axesDefaults : {
            tickRenderer : $.jqplot.CanvasAxisTickRenderer,
            tickOptions : {
              formatString: '%s%',
              fontSize: '10pt',
              textColor: '#000000',
              fontStretch : 2.0
            }
           },
           legend : {
            show : true,
            location : 'ne',
            xoffset : 100, 
            yoffset : -100, 
            placement : 'outside',
            marginLeft: "20px",  
            marginTop: '30px',
            labels: ["Disponibilidad","Performance","Calidad"]
          }
    }
         );
    
    },
  
  renderOEE_Teorico : function(aData){
  
    var render = [];
  
    for (var i = 0; i < aData.length; i++){
  
      render.push([aData[i].historico, parseFloat(aData[i].real_OEE)]);
    }
  
    document.getElementById("chart-OEETeorico").innerHTML = "";
  
  var plot2 = $.jqplot('chart-OEETeorico', [render, render], {
    animate : true,
    series:[{renderer:$.jqplot.BarRenderer}, {xaxis:'x2axis', yaxis:'y2axis', pointLabels : {
      show: true,
      location:'n',
      ypadding : 15
    }}],
    axesDefaults: {
      tickRenderer: $.jqplot.CanvasAxisTickRenderer ,
      tickOptions: {
        angle: 0
      }
    },
    seriesDefaults: {
      markerOptions: {
        show: true,
        style: 'circle',
        size: 9,
        shadow: false,
        shapeRenderer: new $.jqplot.customMarkerRenderer()}
      },
      axes: {
        xaxis: {
          renderer: $.jqplot.CategoryAxisRenderer
        },
        x2axis: {
          renderer: $.jqplot.CategoryAxisRenderer,
          tickOptions : {
            show: false
          }
        },
        yaxis: {
          min : 0,
          max : 100,
          ticks: [[0],[20],[40],[60],[80],[100]]
        },
        y2axis: {
          autoscale:true,
          ticks: [[0],[20],[40],[60],[80],[100]],
          tickOptions : {
            show: false
          }
        }
      },
      axesDefaults : {
        tickRenderer : $.jqplot.CanvasAxisTickRenderer,
        tickOptions : {
          formatString: '%s%',
          fontSize: '10pt',
          textColor: '#000000',
          fontStretch : 2.0
        }
      },
      legend : {
        show : true,
        location : 'ne',
        xoffset : 100, 
        yoffset : -100, 
        placement : 'outside',
        marginLeft: "20px",  
        marginTop: '30px',
        labels: ["OEE Teórico","OEE"]
        }
      });
  
  },
  
  setData_Dropdown : function(Key,elementById,bindProperty){
    var oDropdownBox = sap.ui.getCore().getElementById(elementById);
    oDropdownBox.setModel(new sap.ui.model.json.JSONModel(({modelData: Key}))); 
    oDropdownBox.bindItems("/modelData", new sap.ui.core.ListItem().bindProperty("text",bindProperty).bindProperty("enabled","enabled"));
  },
  
  setEstadoElements : function (boolean,elementById){
    var element = sap.ui.getCore().getElementById(elementById);
    element.setEnabled(boolean);
  
  }

});