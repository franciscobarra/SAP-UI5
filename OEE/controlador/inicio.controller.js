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
  aSearch = [
  {username : "TODOS",
  planta: "TODOS",
  linea: "TODOS", 
  equipo: "TODOS", 
  fecha_desde: "", 
  fecha_hasta: ""
}
];

this.getData_Planta();

},

/**
* Similar to onAfterRendering, but this hook is invoked before the controller's View is re-rendered
* (NOT before the first rendering! onInit() is used for that one!).
* @memberOf filtroparadas.FiltroParadas
*/
//  onBeforeRendering: function() {
//
//
//  },

/**
* Called when the View has been rendered (so its HTML is part of the document). Post-rendering manipulations of the HTML could be done here.
* This hook is the same one that SAPUI5 controls get after being rendered.
* @memberOf filtroparadas.FiltroParadas
*/
//onAfterRendering: function() {
//
//
//},

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
    if(filas && retorno.tipo!="E" ){ 
//      if(Array.isArray(filas)) {
      if(filas instanceof Array){
        for(var index in filas) { 
          planta.push({planta : filas[index].PLN_DESC,
            PLN_ID : filas[index].PLN_ID
          });

        }
      }else{
        planta.push({planta : filas.PLN_DESC,
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
  var linea = [{linea : "", LIN_ID: ""}];
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
          linea.push({linea : filas.LIN_DESCRIP_AGRUP,
            LIN_ID: filas.LIN_AGRUPADOR});  
        }   
        SAP_UI.setData_Dropdown(linea, "linea", "linea");
        SAP_UI.setEstadoElements(true,"linea");

      }else{
//        sap.ui.commons.MessageBox.show("Error. No se encuentran lineas para esta planta: ",sap.ui.commons.MessageBox.Icon.WARNING);
        SAP_UI.setData_Dropdown([], "linea", "linea");
        SAP_UI.setEstadoElements(false,"linea");
        SAP_UI.setEstadoElements(false,"equipo");
      }

    });

},

getData_Equipo : function(){

  var equipo = [{equipo : "", LIN_SHORT_NAME : "", LIN_ID: "TODOS"}];
  if(aSearch[0].linea!=""){
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
          equipo.push({equipo : filas.LIN_DESC,
            LIN_SHORT_NAME : filas.LIN_SHORT_NAME,
            LIN_ID: filas.LIN_ID}); 
        }
        
        SAP_UI.setData_Dropdown(equipo, "equipo", "equipo");
        SAP_UI.setEstadoElements(true,"search");
        SAP_UI.setEstadoElements(true,"equipo");

      }else{
//        sap.ui.commons.MessageBox.show("Error. No se encuentran equipos para esta linea: ",sap.ui.commons.MessageBox.Icon.WARNING);
        SAP_UI.setEstadoElements(false,"search");
        SAP_UI.setEstadoElements(false,"equipo");
      }                 

    });
  }else{
    SAP_UI.setData_Dropdown([], "equipo", "equipo");
    SAP_UI.setEstadoElements(false,"equipo");
  }

},

renderElements : function(cantidadMaquina){
  
  clearInterval(timer);

    if(cantidadMaquina > 1 ){

      /********* GAUGES **********/
      oMatrixGraphic.getPositions()[0].mProperties = { left: "11.8%", top: "8%" }; //Enfardadora
      oMatrixGraphic.getPositions()[1].mProperties = { left: "25%", top: "55%" }; // Envasadora 2
      oMatrixGraphic.getPositions()[2].mProperties = { left: "5%", top: "55%"}; // Envasadora 1
      
      
      /********* GRAPHIC **********/ 
      oMatrixGraphic.getPositions()[3].mProperties = { left: "42%", top: "6.5%"}; // Gráfico

      /********* COUNTS **********/   
      oMatrixGraphic.getPositions()[4].mProperties = { left: "72%", top: "10%"}; // Funcionamiento
      oMatrixGraphic.getPositions()[5].mProperties = { left: "72%", top: "30%"}; // Paradas
      oMatrixGraphic.getPositions()[6].mProperties = { left: "72%", top: "50%"}; // Tiempo Turno

      /********* LED **********/   
         
      oMatrixGraphic.getPositions()[7].mProperties = { left: "5.5%", top: "50.5%"};  // Envasadora 1
      oMatrixGraphic.getPositions()[8].mProperties = { left: "26%", top: "50.5%"}; // Envasadora 2
      oMatrixGraphic.getPositions()[9].mProperties = { left: "20%", top: "7%"};  // Estado Enfardadora 

    /********* LINEAS **********/   
      oMatrixGraphic.getPositions()[10].mProperties = { left: "11.7%", top: "40%"}; // Linea_vertica_1
  oMatrixGraphic.getPositions()[12].mProperties = { left: "31.7%", top: "40%"};  // Linea_vertica_2 
      oMatrixGraphic.getPositions()[11].mProperties = { left: "12%", top: "40%"};  // Linea_horizontal_1
  oMatrixGraphic.getPositions()[13].mProperties = { left: "28.8%", top: "40%"};  // Linea_horizontal_2


    document.getElementById("Linea_vertical_1").style.display = "";
      document.getElementById("Linea_vertical_2").style.display = "";
      document.getElementById("Linea_horizontal_1").style.display = "";
      document.getElementById("Linea_horizontal_2").style.display = "";
      
    }
    else
    {
      /********* GAUGES **********/
      oMatrixGraphic.getPositions()[0].mProperties = { left: "5%", top: "15%"}; // Envasadora

      /********* GRAPHIC **********/  
      oMatrixGraphic.getPositions()[3].mProperties = { left: "38%", top: "6.5%"}; // Gráfico

      /********* COUNTS **********/    
      oMatrixGraphic.getPositions()[4].mProperties = { left: "72%", top: "10%"};  // Funcionamiento
      oMatrixGraphic.getPositions()[5].mProperties = { left: "72%", top: "30%"}; // Paradas
      oMatrixGraphic.getPositions()[6].mProperties = { left: "72%", top: "50%"}; // Tiempo Turno

      /********* LED **********/  
      oMatrixGraphic.getPositions()[7].mProperties = { left: "15.5%", top: "11%"};  // Estado Envasadora

      
      document.getElementById("Linea_vertical_1").style.display = "none";
      document.getElementById("Linea_vertical_2").style.display = "none";
      document.getElementById("Linea_horizontal_1").style.display = "none";
      document.getElementById("Linea_horizontal_2").style.display = "none";

    }

  document.getElementById("canvas_0").innerHTML = "<div id='canvas_0'> <canvas id='OEE_Maquina_2'></canvas></div>";
  document.getElementById("canvas_1").innerHTML = "<div id='canvas_1'> <canvas id='OEE_Maquina_1'></canvas></div>";
  document.getElementById("canvas_2").innerHTML = "<div id='canvas_2'> <canvas id='OEE_Maquina_0'></canvas></div>";

  document.getElementById("OEE_Estado_0").style.display = "none";
    document.getElementById("OEE_Estado_1").style.display = "none";
    document.getElementById("OEE_Estado_2").style.display = "none";

  oMatrixGraphic.rerender();

},


drawElements : function(planta,linea,equipo){

  clearInterval(timer);

  aSearch[0].planta = planta.getModel().oData.modelData[planta.mProperties.selectedItemId.split("planta-")[1]].PLN_ID;
  aSearch[0].linea = linea.getModel().oData.modelData[linea.mProperties.selectedItemId.split("linea-")[1]].LIN_ID;
  aSearch[0].equipo = equipo.getModel().oData.modelData[equipo.mProperties.selectedItemId.split("equipo-")[1]].LIN_ID;

  aGauge   =  [];
  aData    =  [];
  SAP_UI.refreshData();
  global.SAPMII.obtenerDatosTrx("/Directory",{    
    pLIN_ID : aSearch[0].equipo,
    pPLN_ID : aSearch[0].planta,
    pLIN_AGRUPADOR : aSearch[0].linea

  },"XML_OUT",function(retorno){

  console.log("RETORNO DETALLE TODO:");
  console.log(retorno);
    
    var aData_Variables = [];
    var filas =  retorno.datos.Rowset.Row;  

    if(filas){
      if(filas instanceof Array) {
        for(var index in filas) {           
          aData_Variables.push({
                  PLN_ID : filas[index].PLN_ID,
                  LIN_AGRUPADOR: filas[index].LIN_AGRUPADOR,
                  LIN_DESCRIP_AGRUP: filas[index].LIN_DESCRIP_AGRUP,
                  LIN_ID : filas[index].LIN_ID,                 
                  LIN_DESC : filas[index].LIN_DESC,
                  LIN_SHORT_NAME : filas[index].LIN_SHORT_NAME,
                  OEE_ESTADO_MAQUINA : filas[index].OEE_ESTADO_MAQUINA,
                  OEE_VAR_PERFORMANCE : filas[index].OEE_VAR_PERFORMANCE,
                  OEE_VAR_AVAILABILITY : filas[index].OEE_VAR_AVAILABILITY,
                  OEE_VAR_QUALITY : filas[index].OEE_VAR_QUALITY,
                  OEE_VALOR_TOTAL : filas[index].OEE_VALOR_TOTAL,
                  OEE_TIEMPO_FIN_TURNO : filas[index].OEE_TIEMPO_FIN_TURNO,
                  OEE_TIEMPO_PARADA : filas[index].OEE_TIEMPO_PARADA,
                  OEE_TIEMPO_FUNCIONAMIENTO : filas[index].OEE_TIEMPO_FUNCIONAMIENTO
          });

          aData.push({
                  LIN_ORDEN : filas[index].LIN_ORDEN,
                  LIN_DESC: filas[index].LIN_DESC,
                  LIN_PRODUCTO: filas[index].LIN_PRODUCTO,
                  LIN_EMPAQUETADO : "x"+filas[index].LIN_EMPAQUETADO,                 
                  OEE_PLANNED_PRODUCTION : filas[index].OEE_PLANNED_PRODUCTION +" min",
                  OEE_SHORT_BREAK : filas[index].OEE_SHORT_BREAK +" min",
                  OEE_DOWN_TIME : filas[index].OEE_DOWN_TIME+" min",
                  OEE_IDEAL_RUN_TIME : filas[index].OEE_IDEAL_RUN_TIME+" rpm",
                  OEE_GOOD_PIECES : filas[index].OEE_GOOD_PIECES,
                  OEE_REJECT_PIECES : filas[index].OEE_REJECT_PIECES,
                  OEE_PIECES : filas[index].OEE_PIECES
          });
        }

      } else {
        aData_Variables.push({
                  PLN_ID : filas.PLN_ID,
                  LIN_AGRUPADOR: filas.LIN_AGRUPADOR,
                  LIN_DESCRIP_AGRUP: filas.LIN_DESCRIP_AGRUP,
                  LIN_ID : filas.LIN_ID,                  
                  LIN_DESC : filas.LIN_DESC,
                  LIN_SHORT_NAME : filas.LIN_SHORT_NAME,
                  OEE_ESTADO_MAQUINA : filas.OEE_ESTADO_MAQUINA,
                  OEE_VAR_PERFORMANCE : filas.OEE_VAR_PERFORMANCE,
                  OEE_VAR_AVAILABILITY : filas.OEE_VAR_AVAILABILITY,
                  OEE_VAR_QUALITY : filas.OEE_VAR_QUALITY,
                  OEE_VALOR_TOTAL : filas.OEE_VALOR_TOTAL,
                  OEE_TIEMPO_FIN_TURNO : filas.OEE_TIEMPO_FIN_TURNO,
                  OEE_TIEMPO_PARADA : filas.OEE_TIEMPO_PARADA,
                  OEE_TIEMPO_FUNCIONAMIENTO : filas.OEE_TIEMPO_FUNCIONAMIENTO
          });

          aData.push({
                  LIN_ORDEN : filas.LIN_ORDEN,
                  LIN_DESC: filas.LIN_DESC,
                  LIN_PRODUCTO: filas.LIN_PRODUCTO,
                  LIN_EMPAQUETADO : "x"+filas.LIN_EMPAQUETADO,                 
                  OEE_PLANNED_PRODUCTION : filas.OEE_PLANNED_PRODUCTION +" min",
                  OEE_SHORT_BREAK : filas.OEE_SHORT_BREAK +" min",
                  OEE_DOWN_TIME : filas.OEE_DOWN_TIME+" min",
                  OEE_IDEAL_RUN_TIME : filas.OEE_IDEAL_RUN_TIME+" rpm",
                  OEE_GOOD_PIECES : filas.OEE_GOOD_PIECES,
                  OEE_REJECT_PIECES : filas.OEE_REJECT_PIECES,
                  OEE_PIECES : filas.OEE_PIECES
          });
      }
      SAP_UI.formatDataTable(aData);
      oTable.setVisibleRowCount(aData.length);
      SAP_UI.refreshData();
      SAP_UI.renderElements(aData_Variables.length);
      
      if(aData_Variables.length > 1){

        for(var i=0; i< aData_Variables.length -1 ; i++){

          SAP_UI.createGauge("OEE_Maquina_"+i,aData_Variables[i].OEE_VALOR_TOTAL, 170, 170, (aData_Variables[i].LIN_SHORT_NAME).split("-")[0], (aData_Variables[i].LIN_SHORT_NAME).split("-")[1]);
          SAP_UI.setEstadoLinea(i,aData_Variables[i].OEE_ESTADO_MAQUINA,22,20);

        }

        SAP_UI.createGauge("OEE_Maquina_2",aData_Variables[aData_Variables.length - 1].OEE_VALOR_TOTAL,250,250,(aData_Variables[aData_Variables.length -1].LIN_SHORT_NAME).split("-")[0],(aData_Variables[aData_Variables.length -1].LIN_SHORT_NAME).split("-")[1]);
        SAP_UI.setEstadoLinea(aData_Variables.length -1,aData_Variables[aData_Variables.length - 1].OEE_ESTADO_MAQUINA,30,26);   
      }
      else{

        SAP_UI.createGauge("OEE_Maquina_2",aData_Variables[aData_Variables.length - 1].OEE_VALOR_TOTAL,300,300,(aData_Variables[aData_Variables.length -1].LIN_SHORT_NAME).split("-")[0],(aData_Variables[aData_Variables.length -1].LIN_SHORT_NAME).split("-")[1]);
        SAP_UI.setEstadoLinea(aData_Variables.length - 1,aData_Variables[aData_Variables.length - 1].OEE_ESTADO_MAQUINA,30,26);
      }
      

      SAP_UI.getGraphic(

          aData_Variables[aData_Variables.length-1].OEE_VAR_AVAILABILITY,
          aData_Variables[aData_Variables.length-1].OEE_VAR_QUALITY,
          aData_Variables[aData_Variables.length-1].OEE_VAR_PERFORMANCE
      );

      var totalParadas = SAP_UI.secondsToTime(aData_Variables[aData_Variables.length-1].OEE_TIEMPO_PARADA);   
      var totalFinTurno = SAP_UI.secondsToTime(aData_Variables[aData_Variables.length-1].OEE_TIEMPO_FIN_TURNO); 
      var totalFuncionamiento = SAP_UI.secondsToTime(aData_Variables[aData_Variables.length-1].OEE_TIEMPO_FUNCIONAMIENTO); 

      if(aCount.length > 1){

        var totalFinTurno = SAP_UI.secondsToTime(aData_Variables[aData_Variables.length -1].OEE_TIEMPO_FIN_TURNO); 
        aCount[0].s = totalFinTurno.s;
        aCount[0].m = totalFinTurno.m;
        aCount[0].h = totalFinTurno.h;

        var totalParadas = SAP_UI.secondsToTime(aData_Variables[aData_Variables.length -1].OEE_TIEMPO_PARADA); 
        aCount[1].s = totalParadas.s;
        aCount[1].m = totalParadas.m;
        aCount[1].h = totalParadas.h;

        var totalFuncionamiento = SAP_UI.secondsToTime(aData_Variables[aData_Variables.length -1].OEE_TIEMPO_FUNCIONAMIENTO); 
        aCount[2].s = totalFuncionamiento.s;
        aCount[2].m = totalFuncionamiento.m;
        aCount[2].h = totalFuncionamiento.h;

        refreshCounts();

      }
      else{

        createCount(totalFinTurno.h,totalFinTurno.m,totalFinTurno.s,"#Fin_de_turno");
        createCount(totalParadas.h,totalParadas.m,totalParadas.s,"#Paradas");
        createCount(totalFuncionamiento.h,totalFuncionamiento.m,totalFuncionamiento.s,"#Funcionamiento");

        document.getElementById("Fin_de_turno").style.display = "";
        document.getElementById("Paradas").style.display = "";
        document.getElementById("Funcionamiento").style.display = "";

      }
            
      refreshCounts();

      SAP_UI.refreshElements(10000);  
    }
    
  }); 

},


createGauge : function(renderTo,value,width,height,units,title){
  
  var gauge = new Gauge({
    renderTo  : renderTo,
    width     : width,
    height    : height,
    glow      : true,
    units     : units,
    title     : title,
    strokeTicks : false,
    colors : {
      plate      : "#FFFFFF",
      majorTicks : '#000000',
      minorTicks : '#000000',
      title      : '#000000',
      units      : '#000000',
      numbers    : '#000000',
      needle     : { start : '#9999CC', end : '#000080' }
    },
    highlights : [{
      from  : 0,
      to    : 65,
      color : '#FF4D4D'
    }, {
      from  : 65,
      to    : 75,
      color : '#FFDF33'
    }, {
      from  : 75,
      to    : 100,
      color : '#2E8B57'
    }],
    animation : {
      delay : 0,
      duration: 300,
      fn : 'quad'
    }
  });
  
  gauge.setValue(value);
  aGauge.push(gauge);
  gauge.draw();
},


setEstadoLinea : function (index,boolean_,sizeTrue,sizeFalse){

  if(boolean_==1){

    document.getElementById("OEE_Estado_"+index).style.display = "";
    document.getElementById("OEE_Estado_"+index).style.height = sizeTrue+"px";
    document.getElementById("OEE_Estado_"+index).style.width = sizeTrue+"px";
    document.getElementById("OEE_Estado_"+index).src = "images/Ledgreen.png";
  } 
  else{ 
    document.getElementById("OEE_Estado_"+index).style.display = "";
    document.getElementById("OEE_Estado_"+index).style.height = sizeFalse+"px";
    document.getElementById("OEE_Estado_"+index).style.width = sizeFalse+"px";
    document.getElementById("OEE_Estado_"+index).src = "images/Ledred.png";

  }

},

formatDataTable: function (aData){
    for(var index in aData){
        var aPropertys = Object.keys(aData[index]);
        for(var cont in aPropertys){
            if(aPropertys[cont].indexOf("OEE") > -1){
               aData[index][aPropertys[cont]] = this.formatNumber(aData[index][aPropertys[cont]]);
            }
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

setData_Dropdown : function(Key,elementById,bindProperty){
  var oDropdownBox = sap.ui.getCore().getElementById(elementById);
  oDropdownBox.setModel(new sap.ui.model.json.JSONModel(({modelData: Key}))); 
  oDropdownBox.bindItems("/modelData",new sap.ui.core.ListItem().bindProperty("text",bindProperty).bindProperty("enabled","enabled"));
},

setEstadoElements : function (boolean,elementById){ 
  var element = sap.ui.getCore().getElementById(elementById);
  element.setEnabled(boolean);
  
},

refreshData : function (){

  oTable.setModel(new sap.ui.model.json.JSONModel(({modelData: aData})));
  oTable.bindRows("/modelData");
  oTable.getModel().refresh(true);  
  oTable.sort(oTable.getColumns()[1], sap.ui.table.SortOrder.Descending);
},

setTable : function (oTable,text,property,width){
  oTable.addColumn(new sap.ui.table.Column({
    label: new sap.ui.commons.Label({
      text: text}),
    template: new sap.ui.commons.TextField().bindProperty("value",property),
    width: width
  }));  
},


refreshElements : function(interval){
  var intervalCount =  (interval/1000);
  timer = setInterval(function() {
     aData    =  [];
    Point = [30];
    global.SAPMII.obtenerDatosTrx("/Directory",{
    pLIN_ID : aSearch[0].equipo,
    pPLN_ID : aSearch[0].planta,
    pLIN_AGRUPADOR : aSearch[0].linea

  },"XML_OUT",function(retorno){

    var aData_Variables = [];
    var filas =  retorno.datos.Rowset.Row;  

    if(filas){
      if(filas instanceof Array) {
        for(var index in filas) {           
          aData_Variables.push({
                  PLN_ID : filas[index].PLN_ID,
                  LIN_AGRUPADOR: filas[index].LIN_AGRUPADOR,
                  LIN_DESCRIP_AGRUP: filas[index].LIN_DESCRIP_AGRUP,
                  LIN_ID : filas[index].LIN_ID,                 
                  LIN_DESC : filas[index].LIN_DESC,
                  LIN_SHORT_NAME : filas[index].LIN_SHORT_NAME,
                  OEE_ESTADO_MAQUINA : filas[index].OEE_ESTADO_MAQUINA,
                  OEE_VAR_PERFORMANCE : filas[index].OEE_VAR_PERFORMANCE,
                  OEE_VAR_AVAILABILITY : filas[index].OEE_VAR_AVAILABILITY,
                  OEE_VAR_QUALITY : filas[index].OEE_VAR_QUALITY,
                  OEE_VALOR_TOTAL : filas[index].OEE_VALOR_TOTAL,
                  OEE_TIEMPO_FIN_TURNO : filas[index].OEE_TIEMPO_FIN_TURNO,
                  OEE_TIEMPO_PARADA : filas[index].OEE_TIEMPO_PARADA,
                  OEE_TIEMPO_FUNCIONAMIENTO : filas[index].OEE_TIEMPO_FUNCIONAMIENTO
          });

           aData.push({
                  LIN_ORDEN : filas[index].LIN_ORDEN,
                  LIN_DESC: filas[index].LIN_DESC,
                  LIN_PRODUCTO: filas[index].LIN_PRODUCTO,
                  LIN_EMPAQUETADO : "x"+filas[index].LIN_EMPAQUETADO,                 
                  OEE_PLANNED_PRODUCTION : filas[index].OEE_PLANNED_PRODUCTION +" min",
                  OEE_SHORT_BREAK : filas[index].OEE_SHORT_BREAK +" min",
                  OEE_DOWN_TIME : filas[index].OEE_DOWN_TIME+" min",
                  OEE_IDEAL_RUN_TIME : filas[index].OEE_IDEAL_RUN_TIME+" rpm",
                  OEE_GOOD_PIECES : filas[index].OEE_GOOD_PIECES,
                  OEE_REJECT_PIECES : filas[index].OEE_REJECT_PIECES,
                  OEE_PIECES : filas[index].OEE_PIECES
          });
        }
      } else {
        aData_Variables.push({
                  PLN_ID : filas.PLN_ID,
                  LIN_AGRUPADOR: filas.LIN_AGRUPADOR,
                  LIN_DESCRIP_AGRUP: filas.LIN_DESCRIP_AGRUP,
                  LIN_ID : filas.LIN_ID,                  
                  LIN_DESC : filas.LIN_DESC,
                  LIN_SHORT_NAME : filas.LIN_SHORT_NAME,
                  OEE_ESTADO_MAQUINA : filas.OEE_ESTADO_MAQUINA,
                  OEE_VAR_PERFORMANCE : filas.OEE_VAR_PERFORMANCE,
                  OEE_VAR_AVAILABILITY : filas.OEE_VAR_AVAILABILITY,
                  OEE_VAR_QUALITY : filas.OEE_VAR_QUALITY,
                  OEE_VALOR_TOTAL : filas.OEE_VALOR_TOTAL,
                  OEE_TIEMPO_FIN_TURNO : filas.OEE_TIEMPO_FIN_TURNO,
                  OEE_TIEMPO_PARADA : filas.OEE_TIEMPO_PARADA,
                  OEE_TIEMPO_FUNCIONAMIENTO : filas.OEE_TIEMPO_FUNCIONAMIENTO
        });

        aData.push({
                  LIN_ORDEN : filas.LIN_ORDEN,
                  LIN_DESC: filas.LIN_DESC,
                  LIN_PRODUCTO: filas.LIN_PRODUCTO,
                  LIN_EMPAQUETADO : "x"+filas.LIN_EMPAQUETADO,                 
                  OEE_PLANNED_PRODUCTION : filas.OEE_PLANNED_PRODUCTION +" min",
                  OEE_SHORT_BREAK : filas.OEE_SHORT_BREAK +" min",
                  OEE_DOWN_TIME : filas.OEE_DOWN_TIME+" min",
                  OEE_IDEAL_RUN_TIME : filas.OEE_IDEAL_RUN_TIME+" rpm",
                  OEE_GOOD_PIECES : filas.OEE_GOOD_PIECES,
                  OEE_REJECT_PIECES : filas.OEE_REJECT_PIECES,
                  OEE_PIECES : filas.OEE_PIECES
          });

      }
      SAP_UI.formatDataTable(aData);
      SAP_UI.refreshData();

      if(aData_Variables.length > 1){

        for(var i=0; i< aData_Variables.length -1 ; i++){

          SAP_UI.setEstadoLinea(i,aData_Variables[i].OEE_ESTADO_MAQUINA,22,20);
            aGauge[i].setValue(aData_Variables[i].OEE_VALOR_TOTAL);
        }

        SAP_UI.setEstadoLinea(aData_Variables.length -1,aData_Variables[aData_Variables.length -1].OEE_ESTADO_MAQUINA,30,26);
          aGauge[i].setValue(aData_Variables[aData_Variables.length -1].OEE_VALOR_TOTAL);   
      }
      else{

        SAP_UI.setEstadoLinea(aData_Variables.length -1,aData_Variables[aData_Variables.length -1].OEE_ESTADO_MAQUINA,30,26);
          aGauge[aData_Variables.length -1].setValue(aData_Variables[aData_Variables.length -1].OEE_VALOR_TOTAL);   
      }


      plot1.series[0].data = [ [1,Math.round(aData_Variables[aData_Variables.length -1].OEE_VAR_AVAILABILITY)], 
                   [2,Math.round(aData_Variables[aData_Variables.length -1].OEE_VAR_QUALITY)], 
                   [3,Math.round(aData_Variables[aData_Variables.length -1].OEE_VAR_PERFORMANCE)]
                   ];
      plot1.replot();

      var totalFinTurno = SAP_UI.secondsToTime(aData_Variables[aData_Variables.length -1].OEE_TIEMPO_FIN_TURNO); 
      aCount[0].s = totalFinTurno.s;
      aCount[0].m = totalFinTurno.m;
      aCount[0].h = totalFinTurno.h;

      var totalParadas = SAP_UI.secondsToTime(aData_Variables[aData_Variables.length -1].OEE_TIEMPO_PARADA); 
      aCount[1].s = totalParadas.s;
      aCount[1].m = totalParadas.m;
      aCount[1].h = totalParadas.h;

      var totalFuncionamiento = SAP_UI.secondsToTime(aData_Variables[aData_Variables.length -1].OEE_TIEMPO_FUNCIONAMIENTO); 
      aCount[2].s = totalFuncionamiento.s;
      aCount[2].m = totalFuncionamiento.m;
      aCount[2].h = totalFuncionamiento.h;


      refreshCounts();

    }
    
  });   
    
  }, interval);

},

secondsToTime : function(secs) {

      var hours = Math.floor(secs / (60 * 60));
     
      var divisor_for_minutes = secs % (60 * 60);
      var minutes = Math.floor(divisor_for_minutes / 60);
   
      var divisor_for_seconds = divisor_for_minutes % 60;
      var seconds = Math.ceil(divisor_for_seconds);
     
      var obj = {
          "h": hours,
          "m": minutes,
          "s": seconds
      };

      return obj;
},

getGraphic: function(disponibilidad,calidad,desempeno) {

  var aOcurrencia = [];
  var aPorcentajeAcumulado = [];
  var max = 0;

  var chart = document.getElementById("chart-placeholder");
  chart.innerHTML="";
  $.jqplot.config.enablePlugins = true;
  var line1 = [['Disponibilidad', Math.round(disponibilidad)], ['Calidad', Math.round(calidad)], ['Desempeño', Math.round(desempeno)]];
  plot1 = $.jqplot('chart-placeholder', [line1], {
    title: '\u200C',
    series:[{renderer:$.jqplot.BarRenderer}],
    animate: true,
    tickOptions:{textColor : '#000000'},  
    series:[
    {pointLabels:{
      show: true,
      location:'s',
      xpadding : 11,
      edgeTolerance : -100
    }}],
    seriesDefaults:{
      renderer:$.jqplot.BarRenderer,
      rendererOptions: {
                // Set varyBarColor to tru to use the custom colors on the bars.
                varyBarColor: true
            }
        },
        axesDefaults: {
          tickRenderer: $.jqplot.CanvasAxisTickRenderer ,
          tickOptions: {
            angle: 0,
            formatString: '%s%',
            fontSize: '11pt',
            textColor: '#000000',
            fontStretch : 2.0,
            format: '%' 
          }
        },
        axes: {
          xaxis: {
            renderer: $.jqplot.CategoryAxisRenderer
          },
          yaxis : {
            min:0, 
            max: 100,
            ticks: [[0],[20],[40],[60],[80],[100]]
          },             
          padMin : 0
        },
        canvasOverlay: {
                      show: true,
                      objects: [
                          {dashedHorizontalLine: {
            name: 'bam-bam',
            y: 80,
            lineWidth: 4,
            xOffset: 0,
            dashPattern: [16, 12],
            lineCap: 'round',
            color: 'rgb(89, 198, 154)',
            shadow: false
          }}
                      ]
                },
        seriesColors: [ "#5F9EA0", "#4682B4","#00749F"]
    });

var chartData = $('#chart-placeholder').jqplotToImageStr({});
}

});