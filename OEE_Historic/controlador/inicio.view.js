sap.ui.jsview("controlador.inicio", {

  /** Specifies the Controller belonging to this View. 
  * In the case that it is not implemented, or that "null" is returned, this View does not have a Controller.
  * @memberOf controlador.inicio
  */ 
  getControllerName : function() {
    return "controlador.inicio";
  },

  /** Is initially called once after the Controller has been instantiated. It is the place where the UI is constructed. 
  * Since the Controller is given to this method, its event handlers can be attached right away. 
  * @memberOf controlador.inicio
  */ 
  createContent : function(oController) {
    var aControls = [];

    var oAppHeader = new sap.ui.commons.ApplicationHeader("appHeader"); 
    oAppHeader.setLogoSrc("images/SAPLogo.gif");
    oAppHeader.setLogoText("O.E.E (Historico)");
    oAppHeader.setDisplayWelcome(false);
    oAppHeader.setDisplayLogoff(false);
    
    aControls.push(oAppHeader);

    var oPanelFilter = new sap.ui.commons.Panel({width: "100%"});
    oPanelFilter.setTitle(new sap.ui.core.Title({text: "Filtros", icon: "sap-icon://lightbulb"}));

  
    var oMatrixSelections = new sap.ui.commons.layout.MatrixLayout({
      id : 'oMatrixSelections',
      layoutFixed : false,
      width : '400px',
      columns : 3,
      widths : ['20px','1px','30px']
    });
    
    oMatrixSelections.addStyleClass("oMatrixSelections");
    

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

    oMatrixSelections.createRow(
        new sap.ui.commons.layout.MatrixLayoutCell(), 
        new sap.ui.commons.Label("lb_planta",{text: "Planta: ", labelFor: oDropdownPlanta}),
        oDropdownPlanta
    );

    
    /************************************************************************************************/
    
    var oDropdownLinea = new sap.ui.commons.DropdownBox("linea",{
      width: "170px",
      tooltip: "Linea",
      enabled : false,
      change: function(oEvent){
        aSearch[0].linea = oDropdownLinea.getModel().oData.modelData[this.mProperties.selectedItemId.split("linea-")[1]].LIN_ID;      
//        console.log(oDropdownLinea.getSelectedKey());
        oController.getData_Equipo();

      } 
    });
    
    oMatrixSelections.createRow(
      new sap.ui.commons.layout.MatrixLayoutCell(),
      new sap.ui.commons.Label("lb_linea",{text: "Linea:", labelFor: oDropdownLinea}),
      oDropdownLinea
    );

    var oDropdownEquipo = new sap.ui.commons.DropdownBox("equipo",{
      width: "170px",
      tooltip: "Equipo",
      enabled : false,
      change: function(oEvent){
        aSearch[0].equipo = oDropdownEquipo.getModel().oData.modelData[this.mProperties.selectedItemId.split("equipo-")[1]].LIN_ID;
         oController.validateDate();
      } 
    });
    
    oMatrixSelections.createRow(
      new sap.ui.commons.layout.MatrixLayoutCell(),
      new sap.ui.commons.Label("lb_equipo",{text: "Equipo:", labelFor: oDropdownEquipo}),
      oDropdownEquipo);
      
    
    oPanelFilter.addContent(oMatrixSelections);
      
    var oMatrixDateSelection = new sap.ui.commons.layout.MatrixLayout({
      id : 'oMatrixDateSelection',
      layoutFixed : false,
      width : '410px',
      columns : 8,
      widths : ['30px','1px','25px','1px','1px','1px','1px','1px']
    });
    
    oMatrixDateSelection.addStyleClass("oMatrixDateSelection");
    
    var oDatePickerFechaDesde = new sap.ui.commons.DatePicker("fechaDesde", {
      width: "92px",
      enabled: false,
      change: function(oEvent){
        aSearch[0].fecha_desde = oDatePickerFechaDesde.getValue();
        if(oEvent.getParameter("invalidValue")){
          oEvent.oSource.setValueState(sap.ui.core.ValueState.Error);
        }else{
          oEvent.oSource.setValueState(sap.ui.core.ValueState.None);
        }
        if(oDatePickerFechaDesde.getValue()!="" && oDatePickerFechaHasta.getValue()!=""){
          oController.validateDate();
        }
      }
    });
    
    var oDatePickerFechaHasta= new sap.ui.commons.DatePicker("fechaHasta", {
      width: "92px",
      enabled: false,
      change: function(oEvent){
        aSearch[0].fecha_hasta = oDatePickerFechaHasta.getValue();  
        if(oEvent.getParameter("invalidValue")){
          oEvent.oSource.setValueState(sap.ui.core.ValueState.Error);
        }else{
          oEvent.oSource.setValueState(sap.ui.core.ValueState.None);
        }
        if(oDatePickerFechaDesde.getValue()!="" && oDatePickerFechaHasta.getValue()!=""){
          oController.validateDate();
        }
      }
    });
    
    oMatrixDateSelection.createRow(
      new sap.ui.commons.layout.MatrixLayoutCell(),
      new sap.ui.commons.Label("lb_fechaa",{text: "Fecha:"}),
      new sap.ui.commons.layout.MatrixLayoutCell(),
      new sap.ui.commons.Label("lb_fecha_desde",{text: "Desde: ", labelFor: oDatePickerFechaDesde}),
      oDatePickerFechaDesde,
      new sap.ui.commons.layout.MatrixLayoutCell(),
      new sap.ui.commons.Label("lb_fecha_hasta",{text: "Hasta: ", labelFor: oDatePickerFechaHasta}),
      oDatePickerFechaHasta
    );

    oPanelFilter.addContent(oMatrixDateSelection);  

    var oMatrixButton= new sap.ui.commons.layout.MatrixLayout({
      id : 'oMatrixButton',
      layoutFixed : false,
      width : '210px',
      columns : 3,
      widths : ['282px','1px','30px']
    }); 

    oMatrixButton.addStyleClass("oMatrixButton");

    var oButtonSearch = new sap.ui.commons.Button("searchButton",{
      text : "Buscar",
      width : '80px',
      enabled: false,
      icon : "sap-icon://search",
      press : function() {
        oController.getData_Search();
      }
    });
    
    oMatrixButton.createRow(
      new sap.ui.commons.layout.MatrixLayoutCell(),
      oButtonSearch
    );

    oPanelFilter.addContent(oMatrixButton);   
    
    aControls.push(oPanelFilter);

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
      width : "764px",
      visibleRowCount: 0,
      firstVisibleRow: 1,
      fixedColumnCount: 7
    });

    oTable.addStyleClass("oTable");
    
    oController.setTable(oTable,"Calendario","HISTORICO","100px");  
    oController.setTable(oTable,"T.Planif","PRE_CALC_PLANNED_PRODUCTION","80px"); 
    oController.setTable(oTable,"T.Paradas Prog ","PRE_CALC_SHORT_BREAK","125px");
    oController.setTable(oTable,"T.Paradas No Prog","PRE_CALC_DOWN_TIME","145px"); 
    oController.setTable(oTable,"P.Totales","PRE_CALC_PIECES","85px");
    oController.setTable(oTable,"P.Buenos","PRE_CALC_GOOD_PIECES","85px");
    oController.setTable(oTable,"P.Rechazados","PRE_CALC_REJECT_PIECES","117px");
  
    oTable.setModel(new sap.ui.model.json.JSONModel(({modelData: dataTable})));
    oTable.bindRows("/modelData");

    oMatrixTableDetail_OEE.createRow(oTable);
    oPanelDetail.addContent(oTable);

    aControls.push(oPanelDetail);
    
    var oMatrixGraphic = new sap.ui.commons.layout.MatrixLayout({
      id: "oMatrixGraphic",
      layoutFixed : false,
      width : "400px",
      columns : 5,
      widths : ["150px","200px"]                
    });
    
    oMatrixGraphic.addStyleClass("oMatrixGraphic");
    
    oMatrixGraphic.createRow(new sap.ui.core.HTML().setContent("<div id='chart-OEETeorico'  style='height:350px; width:810px;' class='chart'></div>"));
    oMatrixGraphic.createRow(new sap.ui.core.HTML().setContent("<div id='chart-OEEVariable'  style='height:350px; width:800px;' class='chart'></div>"));
    aControls.push(oMatrixGraphic);
    
    return aControls;
  }

});
