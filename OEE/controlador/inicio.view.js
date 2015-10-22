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
    oAppHeader.setLogoText("O.E.E (Overall Equipment Effectiveness)");
    oAppHeader.setDisplayWelcome(false);
    oAppHeader.setDisplayLogoff(false);
    aControls.push(oAppHeader);

    var oPanelFilter = new sap.ui.commons.Panel({width: "100%"});
    oPanelFilter.setTitle(new sap.ui.core.Title({text: "Filtros", icon: "sap-icon://lightbulb"}));

    var oMatrixSelection = new sap.ui.commons.layout.MatrixLayout({
      id : 'matrix2',
      layoutFixed : false,
      width : '400px',
      columns : 3,
      widths : ['20px','1px','30px']
    });
    
    oMatrixSelection.addStyleClass("oMatrixSelection");
    

    var oDropdownPlanta = new sap.ui.commons.DropdownBox("planta",{
      width:"170px",
      tooltip: "{/tooltip}",
      change: function(oEvent){ 
        aSearch[0].planta = oDropdownPlanta.getModel().oData.modelData[this.mProperties.selectedItemId.split("planta-")[1]].PLN_ID;
        if(oDropdownPlanta.getModel().oData.modelData[0].PLN_ID==""){
           oDropdownPlanta.getModel().oData.modelData[0].enabled =false;
           oDropdownPlanta.getModel().refresh(true);

        }
        oController.getData_Linea();  
      }
    });

    oMatrixSelection.createRow(new sap.ui.commons.layout.MatrixLayoutCell(), 
      new sap.ui.commons.Label("lb_planta",{text: "Planta: ",labelFor: oDropdownPlanta}),
      oDropdownPlanta);

    
    /************************************************************************************************/
    
    var oDropdownLinea = new sap.ui.commons.DropdownBox("linea",{
      width: "170px",
      tooltip: "Linea",
      enabled : false,
      change: function(oEvent){
        aSearch[0].linea = oDropdownLinea.getModel().oData.modelData[this.mProperties.selectedItemId.split("linea-")[1]].LIN_ID;
        if(oDropdownLinea.getModel().oData.modelData[0].LIN_ID==""){
           oDropdownLinea.getModel().oData.modelData[0].enabled =false;
           oDropdownLinea.getModel().refresh(true);

        }
        oController.getData_Equipo();     
      } 
    });

    oMatrixSelection.createRow(new sap.ui.commons.layout.MatrixLayoutCell(),
      new sap.ui.commons.Label("lb_linea",{text: "Linea:",labelFor: oDropdownLinea}),
      oDropdownLinea);

    var oDropdownEquipo = new sap.ui.commons.DropdownBox("equipo",{
      width: "170px",
      tooltip: "Equipo",
      enabled : false,
      change: function(oEvent){
        aSearch[0].equipo = oDropdownEquipo.getModel().oData.modelData[this.mProperties.selectedItemId.split("equipo-")[1]].LIN_ID;
      } 
    });
    
    oMatrixSelection.createRow(new sap.ui.commons.layout.MatrixLayoutCell(),
      new sap.ui.commons.Label("lb_equipo",{text: "Equipo:",labelFor: oDropdownEquipo}),
      oDropdownEquipo);
    
      oPanelFilter.addContent(oMatrixSelection);
    
    var oMatrixButtonSearch = new sap.ui.commons.layout.MatrixLayout({
      id : 'matrix4',
      layoutFixed : false,
      width : '268px',
      columns : 3,
      widths : ['93px','1px','30px']
    }); 

    oMatrixButtonSearch.addStyleClass("oMatrixButtonSearch");

    var oButtonSearch = new sap.ui.commons.Button("search",{
      text : "Buscar",
      width : '80px',
      enabled: false,
      icon : "sap-icon://search",
      press : function() {        
        oController.drawElements(oDropdownPlanta,oDropdownLinea,oDropdownEquipo);
      }
    });
    
    oMatrixButtonSearch.createRow(new sap.ui.commons.layout.MatrixLayoutCell(),
      oButtonSearch);

    oPanelFilter.addContent(oMatrixButtonSearch);

    var oPanelDetail = new sap.ui.commons.Panel({width: "100%"});
    oPanelDetail.setTitle(new sap.ui.core.Title({text: "Detalles", icon: "sap-icon://lightbulb"}));

    var oMatrixTableDetail_OEE = new sap.ui.commons.layout.MatrixLayout({
      id: "oMatrixTableDetail_OEE",
      width : "400px",
      columns : 1,
      widths : ["400px"]                
    });
    
    oTable = new sap.ui.table.Table({
      id : "oTable",
      width : "1220px",
      visibleRowCount: 0,
      firstVisibleRow: 1,
      fixedColumnCount: 7
    });

    oTable.addStyleClass("oTable");
    
    oController.setTable(oTable,"Orden","LIN_ORDEN","100px");
    oController.setTable(oTable,"Maquina","LIN_DESC","180px"); 
    oController.setTable(oTable,"Producto","LIN_PRODUCTO","80px"); 
    oController.setTable(oTable,"Empaquetado","LIN_EMPAQUETADO","110px"); 
    oController.setTable(oTable,"T.Turno","OEE_PLANNED_PRODUCTION","75px"); 
    oController.setTable(oTable,"T.Paradas Prog ","OEE_SHORT_BREAK","120px");
    oController.setTable(oTable,"T.Paradas No Prog","OEE_DOWN_TIME","145px"); 
    oController.setTable(oTable,"Velocidad","OEE_IDEAL_RUN_TIME","30px");
    oController.setTable(oTable,"P.Totales","OEE_PIECES","30px");
    oController.setTable(oTable,"P.Buenos","OEE_GOOD_PIECES","30px");
    oController.setTable(oTable,"P. Rechazados","OEE_REJECT_PIECES","40px");
    
  
    oTable.setModel(new sap.ui.model.json.JSONModel(({modelData: aData})));
    oTable.bindRows("/modelData");

    oMatrixTableDetail_OEE.createRow(oTable);
    oPanelDetail.addContent(oTable);

    oMatrixGraphic = new sap.ui.commons.layout.AbsoluteLayout("oMatrixElements",{
      width: "1270px", 
      height: "620px"
    });

    oMatrixGraphic.addStyleClass("oMatrixGraphic");

    
    oMatrixGraphic.addContent(new sap.ui.core.HTML().setContent("<div id='canvas_0'> <canvas id='OEE_Maquina_2'></canvas></div>"),
    { left: "0%", top: "0%"});

    oMatrixGraphic.addContent(new sap.ui.core.HTML().setContent("<div id='canvas_1'> <canvas id='OEE_Maquina_1'></canvas></div>"),
    { left: "0%", top: "0%"});

    oMatrixGraphic.addContent(new sap.ui.core.HTML().setContent("<div id='canvas_2'> <canvas id='OEE_Maquina_0'></canvas></div>"),
    { left: "0%", top: "0%"});

    oMatrixGraphic.addContent(new sap.ui.core.HTML().setContent("<div id='chart-placeholder' class='chart'> </div>"),
    { left: "0%", top: "0%"});

    oMatrixGraphic.addContent(new sap.ui.core.HTML().setContent("<div id='Funcionamiento' style='display:none;'>Funcionamiento:<br></div>"),
    { left: "0%", top: "0%"});

    oMatrixGraphic.addContent(new sap.ui.core.HTML().setContent("<div id='Paradas' style='display:none;' >Paradas:<br></div>"),
    { left: "0%", top: "0%"});

    oMatrixGraphic.addContent(new sap.ui.core.HTML().setContent("<div id='Fin_de_turno' style='display:none;' >Fin de turno:<br></div>"),
    { left: "0%", top: "0%"});

    oMatrixGraphic.addContent(new sap.ui.core.HTML().setContent("<img id='OEE_Estado_0' class= 'statusLed' src='images/Ledgreen.png' style='display:none;'>"),
    { left: "0%", top: "0%"});

    oMatrixGraphic.addContent(new sap.ui.core.HTML().setContent("<img id='OEE_Estado_1' class= 'statusLed' src='images/Ledgreen.png' style='display:none;'>"),
    { left: "0%", top: "0%"});

    oMatrixGraphic.addContent(new sap.ui.core.HTML().setContent("<img id='OEE_Estado_2' class= 'statusLed' src='images/Ledgreen.png' style='display:none;'>"),
    { left: "0%", top: "0%"});
    
    oMatrixGraphic.addContent(new sap.ui.core.HTML().setContent("<hr id='Linea_vertical_1' style='width:0px; height:90px; display:none;'/>"),
    { left: "0%", top: "0%"});
    
    oMatrixGraphic.addContent(new sap.ui.core.HTML().setContent("<hr id='Linea_horizontal_1' style='display:none; width: 35px;'/>"),
    { left: "0%", top: "0%"});
    
    oMatrixGraphic.addContent(new sap.ui.core.HTML().setContent("<hr id='Linea_vertical_2' style='width:0px; height:90px; display:none;'/>"),
    { left: "0%", top: "0%"});
    
    oMatrixGraphic.addContent(new sap.ui.core.HTML().setContent("<hr id='Linea_horizontal_2' style='display:none; width: 35px;'/>"),
    { left: "0%", top: "0%"});
   
  
    aControls.push(oPanelFilter);

    aControls.push(oPanelDetail);

    aControls.push(oMatrixTableDetail_OEE); 
    
    //aControls.push(oMatrixTable);
    
    aControls.push(oMatrixGraphic);

    
    return aControls;



  }
  

});
