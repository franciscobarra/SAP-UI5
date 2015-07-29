sap.ui.jsview("oeepareto.inicio", {

	/** Specifies the Controller belonging to this View. 
	* In the case that it is not implemented, or that "null" is returned, this View does not have a Controller.
	* @memberOf oeepareto.inicio
	*/ 
	getControllerName : function() {
		return "oeepareto.inicio";
	},

	/** Is initially called once after the Controller has been instantiated. It is the place where the UI is constructed. 
	* Since the Controller is given to this method, its event handlers can be attached right away. 
	* @memberOf oeepareto.inicio
	*/ 
	createContent : function(oController) {
		var aControls = [];
		// Ancho de los dropdownbox.
		var nWidthDropDownBox = "210px";
		
		var oAppHeader = new sap.ui.commons.ApplicationHeader("appHeader"); 

		oAppHeader.setLogoSrc("http://www.sap.com/global/images/SAPLogo.gif");
		oAppHeader.setLogoText("SAP OEE Pareto");

		oAppHeader.setDisplayWelcome(true);
		oAppHeader.setUserName("Username");

		oAppHeader.setDisplayLogoff(false);

		aControls.push(oAppHeader);
		
		var oLayout = new sap.ui.commons.layout.MatrixLayout({
			id : "matrix1",
			layoutFixed : false,
			width : '900px',
			columns : 4,
			widths : ['100px', '250px', '100px', '200px'] });
		//oLayout.addStyleClass("matrix-center");
		
		var oCellTitle = new sap.ui.commons.layout.MatrixLayoutCell({
			colSpan: 4 });

		var oTitle = new sap.ui.commons.TextView({
			id : this.createId('title'),
			text : 'Reporte Operaciones',
			design : sap.ui.commons.TextViewDesign.H1 });
		
		oCellTitle.addContent(oTitle);
		
		oLayout.createRow(oCellTitle);
		
		var oLabel1 = new sap.ui.commons.Label({
			id : 'lPlanta',
			text : 'Planta',
			design : sap.ui.commons.LabelDesign.Bold });

		var oDropdownBoxPlanta = new sap.ui.commons.DropdownBox(this.createId("dropdownBoxPlanta"), {
			width: nWidthDropDownBox,
			change: function(oEvent){
				if (oEvent.oSource.getSelectedKey() != "") {
					oController.limpiarElementos();
					oController.cargarDpLinea(oEvent.oSource.getSelectedKey());
				}
			}
		});
		
		var oLabel2 = new sap.ui.commons.Label({
			id : 'lLinea',
			text : 'Linea',
			design : sap.ui.commons.LabelDesign.Bold });
		
		var oDropdownBoxLinea = new sap.ui.commons.DropdownBox(this.createId("dropdownBoxLinea"), {
			width: nWidthDropDownBox,
			change: function(oEvent){
				oController.limpiarElementos();
			}
		});
		
		oLayout.createRow(oLabel1, oDropdownBoxPlanta, oLabel2, oDropdownBoxLinea);
		
		var oLabel3 = new sap.ui.commons.Label({
			id : 'lFechaDesde',
			text : 'Fecha Desde',
			design : sap.ui.commons.LabelDesign.Bold });

		var oDatePickerFechaDesde = new sap.ui.commons.DatePicker(this.createId('dpFechaDesde'), {
			width: nWidthDropDownBox
			//enabled: false
		});
		oDatePickerFechaDesde.attachChange(
				function(oEvent){
					if(oEvent.getParameter("invalidValue")){
						oEvent.oSource.setValueState(sap.ui.core.ValueState.Error);
					}else{
						oEvent.oSource.setValueState(sap.ui.core.ValueState.None);
					}
				}
		);
		
		var oLabel4 = new sap.ui.commons.Label({
			id : 'lFechaHasta',
			text : 'Fecha Hasta',
			design : sap.ui.commons.LabelDesign.Bold });
		
		var oDatePickerFechaHasta = new sap.ui.commons.DatePicker(this.createId('dpFechaHasta'), {
			width: nWidthDropDownBox
			//enabled: false
		});
		oDatePickerFechaHasta.attachChange(
				function(oEvent){
					if(oEvent.getParameter("invalidValue")){
						oEvent.oSource.setValueState(sap.ui.core.ValueState.Error);
					}else{
						oEvent.oSource.setValueState(sap.ui.core.ValueState.None);
					}
				}
		);
		
		oLayout.createRow(oLabel3, oDatePickerFechaDesde, oLabel4, oDatePickerFechaHasta);
		
		var oLabel5 = new sap.ui.commons.Label({
			id : 'lTipoOperacion',
			text : 'Tipo Operación',
			design : sap.ui.commons.LabelDesign.Bold });

		var oDropdownBoxTipoOperacion = new sap.ui.commons.DropdownBox(this.createId("dropdownBoxTipoOperacion"), {
			width: nWidthDropDownBox,
			change: function(oEvent){
			}
		});
		
		oLayout.createRow(oLabel5, oDropdownBoxTipoOperacion);
		
		var oCellButton = new sap.ui.commons.layout.MatrixLayoutCell({colSpan: 4, hAlign: sap.ui.commons.layout.HAlign.Center});
		var oButton = new sap.ui.commons.Button(this.createId("btnBuscar"), {
			text : "Buscar",
			icon : "sap-icon://search",
			press : function() {
				oController.buscarDatos();
			}
		});
		oCellButton.addContent(oButton);
		
		oLayout.createRow(oCellButton);
		
		var oCell = new sap.ui.commons.layout.MatrixLayoutCell({colSpan: 4});
		oCell.addContent(new sap.ui.commons.HorizontalDivider());
		oLayout.createRow(oCell);
		
		aControls.push(oLayout);
		
		var oLayoutChart = new sap.ui.commons.layout.MatrixLayout({
			id : "matrix2",
			layoutFixed : false,
			width : '1300px',
			columns : 3,
			widths : ['450px', '450px','300px'] });
		//oLayoutChart.addStyleClass("matrix-center");
		
		// Agregar panel.
		var oTable = new sap.ui.table.Table(this.createId("dataTableOperaciones"), {
			title: "Gráficos",
			visibleRowCount: 7,
			firstVisibleRow: 3,
			selectionMode: sap.ui.table.SelectionMode.Single,
			toolbar: new sap.ui.commons.Toolbar({rightItems: [ 
				new sap.ui.commons.Button({ 
					text: "ExportExcel",
					icon: "sap-icon://excel-attachment",
					press: function() { oController.descargarCSV(); }
				})
			]})
		});
		
		oTable.addColumn(new sap.ui.table.Column({
			label: new sap.ui.commons.Label({text: "Descripción"}),
			template: new sap.ui.commons.TextField().bindProperty("value", "descripcion"),
			sortProperty: "descripcion",
			filterProperty: "descripcion",
			width: "150px"
		}));
		oTable.addColumn(new sap.ui.table.Column({
			label: new sap.ui.commons.Label({text: "Minutos"}),
			template: new sap.ui.commons.TextField().bindProperty("value", "minutos"),
			sortProperty: "minutos",
			filterProperty: "minutos",
			width: "100px"
		}));
		oTable.addColumn(new sap.ui.table.Column({
			label: new sap.ui.commons.Label({text: "Porcentaje Acumulado"}),
			template: new sap.ui.commons.TextField().bindProperty("value", "porcentajeAcumulado"),
			sortProperty: "porcentajeAcumulado",
			filterProperty: "porcentajeAcumulado",
			width: "200px"
		}));
				
		// HTML para agregar el gráfico.
		var chartPlaceholder = "<div id='chart-placeholder'  style='height:400px; width:400px;' class='chart'></div>";
		var gauge = "<canvas id='gauge' ></canvas>";
		var count = "<div id='countdown'></div>";	

				
      /*  
		var html1 = new sap.ui.core.HTML("html1", {
			// the static content as a long string literal
			// use the afterRendering event for 2 purposes
			content: "<div id='chart-placeholder'  style='height:400px; width:400px;' class='chart'></div>"+
			"<canvas id='gauge' ></canvas>"+
			"<div id='countdown'></div>",
			
			afterRendering : function(e) {
				
			}
		});*/
		oLayoutChart.createRow(new sap.ui.core.HTML().setContent(gauge),
				   new sap.ui.core.HTML().setContent(chartPlaceholder),
				   new sap.ui.core.HTML().setContent(count));
	//	aControls.push(html1);
		aControls.push(oLayoutChart);

		return aControls;
	}

});
