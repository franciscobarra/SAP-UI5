sap.ui.controller("recubrimientos.Consumo", {

/**
* Called when a controller is instantiated and its View controls (if available) are already created.
* Can be used to modify the View before it is displayed, to bind event handlers and do other one-time initialization.
* @memberOf recubrimientos.Consumo
*/
	onInit: function() {    
	aData = [{item: "200",
	 		 barcode: "EP100000000004000004120000135693", 
	 		 material: "Material 1", 
	 		 lote: "50001002", 
	 		 descripcion: "Desc 1", 
	 		 fecha_ingreso: "09-07-2015 12:05:03", 
	 		 stock: "100KG"},
	 		{item: "201",
		   		 barcode: "EP100000000004000004120000135693", 
		   		 material: "Material 1", 
		   		 lote: "50001002", 
		   		 descripcion: "Desc 1", 
		   		 fecha_ingreso: "09-07-2015 12:05:03", 
		   		 stock: "100KG"}
 		     ];
		this.refreshData();
	},
	
	  setData : function (item,barcode,material,lote,descripcion,fecha_ingreso,ingreso,stock){		  
		  aData.push({item: this.autoIncrement(),
		 		 barcode: barcode, 
		 		 material: material, 
		 		 lote: lote, 
		 		 descripcion: descripcion, 
		 		 fecha_ingreso: fecha_ingreso, 
		 		 stock: stock});  
		  this.refreshData();
	  },
	  
	  autoIncrement : function (){
		  if(aData.length!=0)return String(+aData[aData.length-1].item + +1);
			else return "200";
	  },
	  
	  refreshData : function (){
		  oTable.setModel(new sap.ui.model.json.JSONModel(({modelData: aData})));
	      oTable.bindRows("/modelData");
	      oTable.getModel().refresh(true);  
	      console.log(aData);
	  },
	  
	  manageItem: function (item,op){
			if(op){ItemDelete.push(item);}
			else{ 
				for (var i=0; i<ItemDelete.length; i++){
				     if(ItemDelete[i] == item ) ItemDelete.splice(i, 1);
				}
		    }
			return ItemDelete.length ? true : false;
	  }, 
	  
	  deleteRowCheck : function (oButtonEliminar){
		  console.log(ItemDelete);
		  for (var i=0; i < ItemDelete.length ; i++ ){ 
			  for (var j=0; j < aData.length ; j++ ){ 
				   if(ItemDelete[i] == aData[j].item){
					  aData.splice(j,1);	 
			   }   }	   			 
	    }  
		  ItemDelete = [];
		  oButtonEliminar.setEnabled(false);
		  this.refreshData();
	  },
	  
	  setTable : function (oTable,text,property,width){
	   oTable.addColumn(new sap.ui.table.Column({
			label: new sap.ui.commons.Label({
					text: text}),
			template: new sap.ui.commons.TextField().bindProperty("value",property),
			width: width
		}));  
      }
 
/**
* Similar to onAfterRendering, but this hook is invoked before the controller's View is re-rendered
* (NOT before the first rendering! onInit() is used for that one!).
* @memberOf recubrimientos.Consumo
*/
//	onBeforeRendering: function() {
//
//	},

/**
* Called when the View has been rendered (so its HTML is part of the document). Post-rendering manipulations of the HTML could be done here.
* This hook is the same one that SAPUI5 controls get after being rendered.
* @memberOf recubrimientos.Consumo
*/
//	onAfterRendering: function() {
//
//	},

/**
* Called when the Controller is destroyed. Use this one to free resources and finalize activities.
* @memberOf recubrimientos.Consumo
*/
//	onExit: function() {
//
//	}

});