sap.ui.jsview("recubrimientos.Consumo", {

	/** Specifies the Controller belonging to this View. 
	* In the case that it is not implemented, or that "null" is returned, this View does not have a Controller.
	* @memberOf recubrimientos.Consumo
	*/ 
	
	getControllerName : function() {
		return "recubrimientos.Consumo";
	},

	/** Is initially called once after the Controller has been instantiated. It is the place where the UI is constructed. 
	* Since the Controller is given to this method, its event handlers can be attached right away. 
	* @memberOf recubrimientos.Consumo
	*/ 
	createContent : function(oController) {
		var aControls = [];
		var arrayDropDown = [];	
		console.log("VISTA"+aData);
			var oAppHeader = new sap.ui.commons.ApplicationHeader(this.createId("appHeader"));
			oAppHeader.getLogoSrc("images/SAPLogo.gif");
			oAppHeader.setLogoText("Recubrimientos");
			oAppHeader.setDisplayWelcome(true);
			oAppHeader.setUserName("francisco");
			oAppHeader.setDisplayLogoff(true);
		
			aControls.push(oAppHeader);
			
			var oMatrix1 = new sap.ui.commons.layout.MatrixLayout({
				id : 'matrix1',
				layoutFixed : false,
				width : '300px',
				columns: 1,
				widths : ['200px']
			});
			oMatrix1.addStyleClass("oMatrix1");
			
			aControls.push(oMatrix1);
			
			var oTV = new sap.ui.commons.TextView({
				id: 'titulo',
				text: 'Consumo De Recubrimientos',
				design : sap.ui.commons.TextViewDesign.H2
			});
			
			oMatrix1.createRow(oTV);
			
			var div = new sap.ui.commons.HorizontalDivider({
				height: sap.ui.commons.HorizontalDividerHeight.Ruleheight});
			
			aControls.push(div);
			
			
			var oMatrix2 = new sap.ui.commons.layout.MatrixLayout({
				id : 'matrix2',
				layoutFixed : false,
				width : '1100px',
				columns : 4,
				widths : ['7px','300px','10px','900px']
			});
			
			oMatrix2.addStyleClass("oMatrix2");
			
			aControls.push(oMatrix2);
			
			var oInputBarcode =  new sap.ui.commons.TextField('Barcode');
			oInputBarcode.setWidth("300px");
			oInputBarcode.setValue("");
			oInputBarcode.setTooltip("Ingresar código de barras");
			oInputBarcode.attachChange(function(){
				oController.setData("",oInputBarcode.getValue(),"meterial1","lote","descripcion","fecha_ingreso","ingreso","stock");
			});
			
			var oButtonGuardar = new sap.ui.commons.Button({
				text : "Guardar",
				tooltip : "Registra Barcode",
				press : function(oEvent) {
					  oController.setData("","EPEPPE","meterial1","lote","descripcion","fecha_ingreso","ingreso","stock");
				}
			});
	
			var oLabelBarcode = new sap.ui.commons.Label("lc_barcode",{text: "Barcode: ",labelFor: oInputBarcode});
			oLabelBarcode.setDesign(sap.ui.commons.LabelDesign.Bold);
			
			oMatrix2.createRow(oLabelBarcode,oInputBarcode,new sap.ui.commons.layout.MatrixLayoutCell(),oButtonGuardar);
			

			var oMatrix3 = new sap.ui.commons.layout.MatrixLayout({
				id: "matrix3",
				layoutFixed : false,
				width : "1000px",
				columns : 8,
				widths : ["120px","120px","120px","120px","120px","120px","120px","120px"]			          
				});
			
			oMatrix3.addStyleClass("oTabla");
			
			
			
			oTable.addColumn(new sap.ui.table.Column({
				label: new sap.ui.commons.Label({text: "",icon: "sap-icon://delete"}),
				template: new sap.ui.commons.CheckBox({
					change: function(oEvent){
					if(oEvent.getParameters().checked){
						 oButtonEliminar.setEnabled(oController.manageItem(aData[this.getBindingContext().sPath.split("/modelData/")[1]].item,true));

					}else{
						oButtonEliminar.setEnabled(oController.manageItem(aData[this.getBindingContext().sPath.split("/modelData/")[1]].item,false));
					}
					
				   }
				}).bindProperty("checked", "checked"),
				sortProperty: "checked",
				filterProperty: "checked",
				width: "27px",
				hAlign: "Center"
				
			}));
			
			oController.setTable(oTable,"Item","item","40px");
			oController.setTable(oTable,"Barcode","barcode","200px"); 
			oController.setTable(oTable,"Material","material","110px"); 
			oController.setTable(oTable,"Lote","lote","110px"); 
			oController.setTable(oTable,"Descripción","descripcion","110px");
			oController.setTable(oTable,"Fecha Ingreso","fecha_ingreso","110px"); 
			oController.setTable(oTable,"Stock Disponible","stock","110px"); 
			
					
			//INSERTA DATOS EN LA TABLA
	        
			oMatrix3.createRow(oTable);
			
			aControls.push(oMatrix3);
			
			var oMatrix4 = new sap.ui.commons.layout.MatrixLayout({
				id : 'matrix4',
				layoutFixed : false,
				width : '1235px',
				columns: 2,
				widths : ['1100px','1px']
			});
			oMatrix4.addStyleClass("oMatrix4");
			
			aControls.push(oMatrix4);
			
			var oButtonEliminar = new sap.ui.commons.Button({
				text : "Eliminar",
				tooltip : "Eliminar Registro",
				enabled : false,
				style: sap.ui.commons.ButtonStyle.Reject,
				press : function(oEvent) {
				        oController.deleteRowCheck(oButtonEliminar);
				}
			});
					
			oMatrix4.createRow(new sap.ui.commons.layout.MatrixLayoutCell(),oButtonEliminar);
			
		
			return aControls;
	}

});
