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
    oAppHeader.setLogoText("Pareto (Diagrama)");
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
        aSearch[0].planta = oDropdownPlanta.getModel().oData.modelData[sap.ui.getCore().byId(oDropdownPlanta.getSelectedItemId()).oParent._iLastDirectlySelectedIndex].PLN_ID;
         if(oDropdownPlanta.getModel().oData.modelData[0].PLN_ID==""){
           oDropdownPlanta.getModel().oData.modelData[0].enabled =false;
           oDropdownPlanta.getModel().refresh(true);

        }
        oController.getData_Linea();
//        console.log(aSearch[0].planta);
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
        aSearch[0].linea = oDropdownLinea.getModel().oData.modelData[sap.ui.getCore().byId(oDropdownLinea.getSelectedItemId()).oParent._iLastDirectlySelectedIndex].LIN_ID;
        oController.getData_Equipo();
//        console.log(aSearch[0].linea);
      } 
    });
    
    oMatrixSelection.createRow(new sap.ui.commons.layout.MatrixLayoutCell(),
      new sap.ui.commons.Label("lb_linea",{text: "Linea:",labelFor: oDropdownLinea}),
      oDropdownLinea);

    var oDropdownEquipo = new sap.ui.commons.DropdownBox("equipo",{
      width: "170px",
      tooltip: "Linea",
      enabled : false,
      change: function(oEvent){
        aSearch[0].equipo = oDropdownEquipo.getModel().oData.modelData[sap.ui.getCore().byId(oDropdownEquipo.getSelectedItemId()).oParent._iLastDirectlySelectedIndex].LIN_ID;          
        oController.getData_TipoOperacion();
      } 
    });
    
    oMatrixSelection.createRow(new sap.ui.commons.layout.MatrixLayoutCell(),
      new sap.ui.commons.Label("lb_equipo",{text: "Equipo:",labelFor: oDropdownEquipo}),
      oDropdownEquipo);
        
    
    var oDropdownTipoOperacion = new sap.ui.commons.DropdownBox("tipo_operacion",{
      width:"170px",
      tooltip:"Tipo de operación",
      enabled: false,
      change : function(oEvent){        
        aSearch[0].tipo_operacion = oDropdownTipoOperacion.getModel().oData.modelData[sap.ui.getCore().byId(oDropdownTipoOperacion.getSelectedItemId()).oParent._iLastDirectlySelectedIndex].TDE_ID;  
        oController.validateDate();
      }
    });
    
    oMatrixSelection.createRow(new sap.ui.commons.layout.MatrixLayoutCell(),
      new sap.ui.commons.Label("lb_operacion",{text : "Tipo de operación:",labelFor: oDropdownTipoOperacion}),
      oDropdownTipoOperacion);
    
    oPanelFilter.addContent(oMatrixSelection);
        
    var oMatrixDate = new sap.ui.commons.layout.MatrixLayout({
      id : 'oMatrixDate',
      layoutFixed : false,
      width : '550px',
      columns : 8,
      widths : ['28px','1px','64px','1px','1px','1px','1px','1px']
    });
    
    oMatrixDate.addStyleClass("oMatrixDate");
    
    var oDatePickerFechaDesde = new sap.ui.commons.DatePicker("fechaDesde", {
      width: "92px",
      enabled: true,
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
      enabled: true,
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
    
    oMatrixDate.createRow(new sap.ui.commons.layout.MatrixLayoutCell(),
      new sap.ui.commons.Label("lb_fechaa",{text: "Fecha:"}),
      new sap.ui.commons.layout.MatrixLayoutCell(),
      new sap.ui.commons.Label("lb_fecha_desde",{text: "Desde: ",labelFor: oDatePickerFechaDesde}),
      oDatePickerFechaDesde,
      new sap.ui.commons.layout.MatrixLayoutCell(),
      new sap.ui.commons.Label("lb_fecha_hasta",{text: "Hasta: ",labelFor: oDatePickerFechaHasta}),
      oDatePickerFechaHasta);
    ;

    oPanelFilter.addContent(oMatrixDate);
    
    aControls.push(oPanelFilter);   

    var oMatrixButtonSearch = new sap.ui.commons.layout.MatrixLayout({
      id : 'oMatrixButtonSearch',
      layoutFixed : false,
      width : '268px',
      columns : 3,
      widths : ['282px','1px','30px']
    }); 

    oMatrixButtonSearch.addStyleClass("oMatrixButtonSearch");

    var oButtonSearch = new sap.ui.commons.Button("searchButton",{
      text : "Buscar",
      width : '80px',
      enabled: false,
      icon : "sap-icon://search",
      press : function() {
        if(aSearch[0].tipo_operacion == "TODOS"){
          sap.ui.commons.MessageBox.show("Error. Se debe seleccionar un tipo de operación ",sap.ui.commons.MessageBox.Icon.WARNING); 
        }else{
          oController.getData_Search();
        }
      }
    });
    
    oMatrixButtonSearch.createRow(new sap.ui.commons.layout.MatrixLayoutCell(),
      oButtonSearch);

    oPanelFilter.addContent(oMatrixButtonSearch);

    aControls.push(oPanelFilter);   

    oMatrixGraphic = new sap.ui.commons.layout.AbsoluteLayout("oMatrixElements",{
      width: "1400px", 
      height: "620px"
    });
    
    oMatrixGraphic.addStyleClass("oMatrixGraphic");

    oTable = new sap.ui.table.Table({
      id : "Pareto",
      width : "410px",
       visibleRowCount: 0,
      firstVisibleRow: 1,
      selectionMode: sap.ui.table.SelectionMode.Single,
      enableCustomFilter : true,  
      toolbar: new sap.ui.commons.Toolbar({rightItems: [    
        new sap.ui.commons.ToolbarSeparator({
          width : "20px"
        }),
        new sap.ui.commons.Label("l1",{
          text : "Exportar a Excel",
          design: sap.ui.commons.LabelDesign.Bold,
          width : "110px" 
        }),
        new sap.ui.commons.Label("l2",{
          icon: "sap-icon://excel-attachment",
          text : "",
          width : "20px"  
        }),
        oTextField1 = new sap.ui.commons.TextField("nameFile",
        {
          enabled: false,
          placeholder : "NombreDeArchivo",
          value : "",
          width : "136px"
        }),
        new sap.ui.commons.Button("excelExport",{ 
          text: "Guardar",
            enabled:false,
          icon: "sap-icon://action",
          press: function() { 
            SAP_UI.exportExcel(); 
            }
        })
      ]})
    });
    
    oController.setTable(oTable,"Descripcion","desc_motivo","68px"); 
    oController.setTable(oTable,"Minutos","minutos_ocurrencia","35px"); 
    oController.setTable(oTable,"Porcentaje %","porcentajeAcumulado","42px");

    oTable.setModel(new sap.ui.model.json.JSONModel(({modelData: aData})));
    oTable.bindRows("/modelData");

    oMatrixGraphic.addContent(oTable,{ left: "0%", top: "5%"});

     oMatrixGraphic.addContent(new sap.ui.core.HTML().setContent("<div id='chart-placeholder' style='height: 550px; width: 900px; margin-bottom: 0px;' class='chart'> </div>"),
    { left: "33%", top: "-6.5%"});
    
    aControls.push(oMatrixGraphic);

    
    return aControls;



  }
  

});
