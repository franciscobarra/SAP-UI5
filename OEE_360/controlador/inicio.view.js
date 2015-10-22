sap.ui.jsview("controlador.inicio", {

  /** Specifies the Controller belonging to this View. 
  * In the case that it is not implemented, or that "null" is returned, this View does not have a Controller.
  * @memberOf filtroparadas.FiltroParadas
  */ 
  getControllerName : function() {
    return "controlador.inicio";
  },

  /** Is initially called once after the Controller has been instantiated. It is the place where the UI is constructed. 
  * Since the Controller is given to this method, its event handlers can be attached right away. 
  * @memberOf filtroparadas.FiltroParadas
  */ 
  createContent : function(oController) {

    var aControls = [];

    var oAppHeader = new sap.ui.commons.ApplicationHeader("appHeader"); 
    oAppHeader.setLogoSrc("images/SAPLogo.gif");
    oAppHeader.setLogoText("360 (Overall Equipment Effectiveness)");
    oAppHeader.setDisplayWelcome(false);
    oAppHeader.setDisplayLogoff(false);
    

    aControls.push(oAppHeader);


        //Create a layout instance
    var oMatrixElements = new sap.ui.commons.layout.AbsoluteLayout("oMatrixElements",{
      width: "1200px", 
      height: "620px"
    });
    
    oMatrixElements.addStyleClass("oMatrixElements"); 

    //IMAGE 360

    oMatrixElements.addContent(new sap.ui.commons.Image({src: "images/360.png",width: "1200px",height: "700px" }));
    
    oMatrixElements.addContent(new sap.ui.commons.Image({id:"loading", src: "images/Loading2.gif",width: "120px",height: "120px" }),
     {left: "48%", top: "44%"});

    // GAUGES

    oMatrixElements.addContent(new sap.ui.core.HTML().setContent("<canvas id='OEE_Planta'></canvas>"),
                    {left: "100px", top: "200px"});
    oMatrixElements.addContent(new sap.ui.core.HTML().setContent("<canvas id='OEE_Linea_0205-42107'></canvas>"),
                    {left: "1000px", top: "30px"});
    oMatrixElements.addContent(new sap.ui.core.HTML().setContent("<canvas id='OEE_Linea_0205-42123'></canvas>"),
                    {left: "1000px", top: "210px"});
    oMatrixElements.addContent(new sap.ui.core.HTML().setContent("<canvas id='OEE_Linea_0205-42124'></canvas>"),
                    {left: "1000px", top: "400px"});
    oMatrixElements.addContent(new sap.ui.core.HTML().setContent("<canvas id='OEE_Linea_0205-42125'></canvas>"),
                    {left: "580px", top: "295px"});

    // ESTADO


    oMatrixElements.addContent(new sap.ui.core.HTML().setContent("<img id='OEE_Planta_Estado' class= 'statusLed' src='images/Ledgreen.png' style='display:none;'>"),
                    {left: "25%", top: "33%"}); 
    oMatrixElements.addContent(new sap.ui.core.HTML().setContent("<img id='OEE_Linea_0205-42107_Estado' class= 'statusLed' src='images/Ledgreen.png' style='display:none;'>"),
                    {left: "96%", top: "5%"});
    oMatrixElements.addContent(new sap.ui.core.HTML().setContent("<img id='OEE_Linea_0205-42123_Estado' class= 'statusLed' src='images/Ledgreen.png' style='display:none;'>"),
                    {left: "96%", top: "35%"});
    oMatrixElements.addContent(new sap.ui.core.HTML().setContent("<img id='OEE_Linea_0205-42124_Estado' class= 'statusLed' src='images/Ledgreen.png' style='display:none;'>"),
                    {left: "96%", top: "65%"});
    oMatrixElements.addContent(new sap.ui.core.HTML().setContent("<img id='OEE_Linea_0205-42125_Estado' class= 'statusLed' src='images/Ledgreen.png' style='display:none;'>"),
                    {left: "61%", top: "48%"});



    aControls.push(oMatrixElements);


    return aControls;


  }
  

});
