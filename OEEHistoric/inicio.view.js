sap.ui.jsview("OEEHistoric.inicio", {

	/** Specifies the Controller belonging to this View. 
	* In the case that it is not implemented, or that "null" is returned, this View does not have a Controller.
	* @memberOf OEEHistoric.inicio
	*/ 
	getControllerName : function() {
		return "OEEHistoric.inicio";
	},

	/** Is initially called once after the Controller has been instantiated. It is the place where the UI is constructed. 
	* Since the Controller is given to this method, its event handlers can be attached right away. 
	* @memberOf OEEHistoric.inicio
	*/ 
	createContent : function(oController) {
		var aControls = [];

		var oAppHeader = new sap.ui.commons.ApplicationHeader(this.createId("appHeader"));
		oAppHeader.getLogoSrc("images/SAPLogo.gif");
		oAppHeader.setLogoText("Registro inventario");
		oAppHeader.setDisplayWelcome(true);
		oAppHeader.setUserName("francisco");
		oAppHeader.setDisplayLogoff(true);

		aControls.push(oAppHeader);

		var oMatrixHead = new sap.ui.commons.layout.MatrixLayout({
			id : 'oMatrixHead',
			layoutFixed : false,
			width : '300px',
			columns: 1,
			widths : ['200px']
		});
		oMatrixHead.addStyleClass("oMatrixHead");	
		
		var html1 = new sap.ui.core.HTML("html1", {
		content:"<h2 align='center' style='margin: 0 auto;margin-top: 4px;'>OEE Historico </h2><hr class='style-two' >" });

		aControls.push(html1);
	
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
				aSearch[0].planta = oDropdownPlanta.getModel().oData.modelData[this.mProperties.selectedItemId.split("__item0-planta-")[1]].key;
				oController.setEnabled_Elements(true,"fechaHasta");
				oController.setEnabled_Elements(true,"fechaDesde");
				oController.setEnabled_Elements(true,"searchButton");
				console.log(aSearch[0].planta);
			}
		});

		oMatrixSelections.createRow(new sap.ui.commons.layout.MatrixLayoutCell(), 
			new sap.ui.commons.Label("lb_planta",{text: "Planta: ",labelFor: oDropdownPlanta}),
			oDropdownPlanta);

		
		/************************************************************************************************/
		
		var oDropdownLinea = new sap.ui.commons.DropdownBox("linea",{
			width: "170px",
			tooltip: "Linea",
			enabled : true,
			change: function(oEvent){	
			aSearch[0].linea = oDropdownLinea.getModel().oData.modelData[this.mProperties.selectedItemId.split("__item1-linea-")[1].key];
			oController.setEnabled_Elements(true,"fechaDesde");
			oController.setEnabled_Elements(true,"fechaHasta");
			oController.setEnabled_Elements(true,"searchButton");
			console.log(aSearch[0].linea);
			}	
		});
		
		oMatrixSelections.createRow(new sap.ui.commons.layout.MatrixLayoutCell(),
			new sap.ui.commons.Label("lb_linea",{text: "Linea:",labelFor: oDropdownLinea}),
			oDropdownLinea);
			
		
		aControls.push(oMatrixSelections);
		
		
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
			}
		});
		
		oMatrixDateSelection.createRow(new sap.ui.commons.layout.MatrixLayoutCell(),
			new sap.ui.commons.Label("lb_fechaa",{text: "Fecha:"}),
			new sap.ui.commons.layout.MatrixLayoutCell(),
			new sap.ui.commons.Label("lb_fecha_desde",{text: "Desde: ",labelFor: oDatePickerFechaDesde}),
			oDatePickerFechaDesde,
			new sap.ui.commons.layout.MatrixLayoutCell(),
			new sap.ui.commons.Label("lb_fecha_hasta",{text: "Hasta: ",labelFor: oDatePickerFechaHasta}),
			oDatePickerFechaHasta);
		;

		aControls.push(oMatrixDateSelection);		

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
		
		oMatrixButton.createRow(new sap.ui.commons.layout.MatrixLayoutCell(),
			oButtonSearch);

		aControls.push(oMatrixButton);
		
		var oMatrixGraphic = new sap.ui.commons.layout.MatrixLayout({
			id: "oMatrixGraphic",
			layoutFixed : false,
			width : "400px",
			columns : 5,
			widths : ["150px","200px"]			          
		});
		
		oMatrixGraphic.addStyleClass("oMatrixGraphic");
		
		oMatrixGraphic.createRow(new sap.ui.core.HTML().setContent("<div id='chart-OEETeorico'  style='height:400px; width:400px;' class='chart'></div>"),
								 new sap.ui.core.HTML().setContent("<div id='chart-OEEVariable'  style='height:400px; width:400px;' class='chart'></div>"));
		aControls.push(oMatrixGraphic);
		return aControls;
	}

});
