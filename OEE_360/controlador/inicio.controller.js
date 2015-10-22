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
onAfterRendering: function() {
  if(render == false){
    this.drawElements();
    render = true;
  }
},


drawElements : function(){
  

  global.SAPMII.obtenerDatosTrx("/Directory",{   
    
  PLN_ID : "0205"

  },"XML_OUT",function(retorno){

    var filas =  retorno.datos.Rowset.Row;  
    aData = [];

    if(filas){
      if(filas instanceof Array) {
        for(var index in filas) {           
          aData.push({
                  PLN_ID : filas[index].PLN_ID,
                  LIN_ID : filas[index].LIN_ID,                 
                  LIN_DESC : filas[index].LIN_DESC,
                  LIN_SHORT_NAME : filas[index].LIN_SHORT_NAME,
                  LIN_ESTADO: filas[index].LIN_ESTADO,
                  LIN_AGRUPADOR : filas[index].LIN_AGRUPADOR,
                  LIN_DESCRIP_AGRUP: filas[index].LIN_DESCRIP_AGRUP,
                  OEE_VAR_PERFORMANCE : filas[index].OEE_VAR_PERFORMANCE,
                  AVG_OEE_AVAILABILITY : filas[index].AVG_OEE_AVAILABILITY,
                  AVG_OEE_PERFORMANCE: filas[index].AVG_OEE_PERFORMANCE,
                  AVG_OEE_QUALITY : filas[index].AVG_OEE_QUALITY,
                  AVG_OEE_TOTAL : filas[index].AVG_OEE_TOTAL
          });
        }

      } else {
         aData.push({
                  PLN_ID : filas.PLN_ID,
                  LIN_ID : filas.LIN_ID,                 
                  LIN_DESC : filas.LIN_DESC,
                  LIN_SHORT_NAME : filas.LIN_SHORT_NAME,
                  LIN_ESTADO: filas.LIN_ESTADO,
                  LIN_AGRUPADOR : filas.LIN_AGRUPADOR,
                  LIN_DESCRIP_AGRUP: filas.LIN_DESCRIP_AGRUP,
                  OEE_VAR_PERFORMANCE : filas.OEE_VAR_PERFORMANCE,
                  AVG_OEE_AVAILABILITY : filas.AVG_OEE_AVAILABILITY,
                  AVG_OEE_PERFORMANCE: filas.AVG_OEE_PERFORMANCE,
                  AVG_OEE_QUALITY : filas.AVG_OEE_QUALITY,
                  AVG_OEE_TOTAL : filas.AVG_OEE_TOTAL
          });
      }
    }

    document.getElementById("loading").style.display = "none";
    SAP_UI.createGauge("OEE_Planta",aData[aData.length - 1].AVG_OEE_TOTAL, 220, 220,"Los Ángeles","Planta");
    SAP_UI.setEstadoLinea("OEE_Planta_Estado",aData[aData.length - 1].LIN_ESTADO,24,22);
  
    for(var i=0; i< aData.length -1 ;i++){
        var aDescGauge = aData[i].LIN_DESCRIP_AGRUP.split("de");
        SAP_UI.createGauge("OEE_Linea_"+aData[i].LIN_AGRUPADOR,aData[i].AVG_OEE_TOTAL, 170, 170, aDescGauge[0], aDescGauge[1]);
        SAP_UI.setEstadoLinea("OEE_Linea_"+aData[i].LIN_AGRUPADOR+"_Estado",aData[i].LIN_ESTADO,20,18);   
    }

    SAP_UI.refreshElements(10000);

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


setEstadoLinea : function (documentById,boolean_,sizeTrue,sizeFalse){

  if(boolean_==1){

    document.getElementById(documentById).style.display = "";
    document.getElementById(documentById).style.height = sizeTrue+"px";
    document.getElementById(documentById).style.width = sizeTrue+"px";
    document.getElementById(documentById).src = "images/Ledgreen.png";
  } 
  else{ 
    document.getElementById(documentById).style.display = "";
    document.getElementById(documentById).style.height = sizeFalse+"px";
    document.getElementById(documentById).style.width = sizeFalse+"px";
    document.getElementById(documentById).src = "images/Ledred.png";

  }


},

refreshElements : function(interval){

  var intervalCount =  (interval/1000);
  timer = setInterval(function() {

  global.SAPMII.obtenerDatosTrx("/Directory",{   
    
  PLN_ID : "0205"

  },"XML_OUT",function(retorno){

    var filas =  retorno.datos.Rowset.Row;  
    aData = [];

    if(filas){
      if(filas instanceof Array) {
        for(var index in filas) {           
          aData.push({
                  PLN_ID : filas[index].PLN_ID,
                  LIN_ID : filas[index].LIN_ID,                 
                  LIN_DESC : filas[index].LIN_DESC,
                  LIN_SHORT_NAME : filas[index].LIN_SHORT_NAME,
                  LIN_ESTADO: filas[index].LIN_ESTADO,
                  LIN_AGRUPADOR : filas[index].LIN_AGRUPADOR,
                  LIN_DESCRIP_AGRUP: filas[index].LIN_DESCRIP_AGRUP,
                  OEE_VAR_PERFORMANCE : filas[index].OEE_VAR_PERFORMANCE,
                  AVG_OEE_AVAILABILITY : filas[index].AVG_OEE_AVAILABILITY,
                  AVG_OEE_PERFORMANCE: filas[index].AVG_OEE_PERFORMANCE,
                  AVG_OEE_QUALITY : filas[index].AVG_OEE_QUALITY,
                  AVG_OEE_TOTAL : filas[index].AVG_OEE_TOTAL
          });
        }

      } else {
         aData.push({
                  PLN_ID : filas.PLN_ID,
                  LIN_ID : filas.LIN_ID,                 
                  LIN_DESC : filas.LIN_DESC,
                  LIN_SHORT_NAME : filas.LIN_SHORT_NAME,
                  LIN_ESTADO: filas.LIN_ESTADO,
                  LIN_AGRUPADOR : filas.LIN_AGRUPADOR,
                  LIN_DESCRIP_AGRUP: filas.LIN_DESCRIP_AGRUP,
                  OEE_VAR_PERFORMANCE : filas.OEE_VAR_PERFORMANCE,
                  AVG_OEE_AVAILABILITY : filas.AVG_OEE_AVAILABILITY,
                  AVG_OEE_PERFORMANCE: filas.AVG_OEE_PERFORMANCE,
                  AVG_OEE_QUALITY : filas.AVG_OEE_QUALITY,
                  AVG_OEE_TOTAL : filas.AVG_OEE_TOTAL
          });
      }
    }
 
    for(var i=0; i < aData.length -1 ; i++){
        aGauge[i+1].setValue(aData[i].AVG_OEE_TOTAL);  
        SAP_UI.setEstadoLinea("OEE_Linea_"+aData[i].LIN_AGRUPADOR+"_Estado",aData[i].LIN_ESTADO,20,18); 
    }

    SAP_UI.setEstadoLinea("OEE_Planta_Estado",aData[aData.length - 1].LIN_ESTADO,24,22);
    aGauge[0].setValue(aData[aData.length - 1].AVG_OEE_TOTAL); 


  }); 
    
  }, interval);

},


});