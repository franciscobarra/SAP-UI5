sap.ui.jsview("ui5_offline.ui5_offline", {

	/** Specifies the Controller belonging to this View. 
	* In the case that it is not implemented, or that "null" is returned, this View does not have a Controller.
	* @memberOf ui5_offline.ui5_offline
	*/ 
	getControllerName : function() {
		return "ui5_offline.ui5_offline";
	},

	/** Is initially called once after the Controller has been instantiated. It is the place where the UI is constructed. 
	* Since the Controller is given to this method, its event handlers can be attached right away. 
	* @memberOf ui5_offline.ui5_offline
	*/ 
	createContent : function(oController) {
 		
		var aControls = [];
		
		/* var oAppHeader = new sap.ui.commons.ApplicationHeader("appHeader"); 
		    oAppHeader.setLogoSrc("image/triage_logo_1.png");
		    oAppHeader.setLogoText("Triage");
		    oAppHeader.setDisplayWelcome(false);
		    oAppHeader.setDisplayLogoff(true);
		
		    aControls.push(oAppHeader); */
		
		var oQuestionPage = new sap.m.Page("oQuestionPsage", {
		    title : "Questions",
		    content : [
		              new sap.m.RadioButtonGroup("oRadioButtonGroup", {
			          columns: 1,
			          enabled: true,
			          buttons: []
		                    
				        })],
			    footer : new sap.m.Toolbar({
		 			  active: true,
		    		   content : [ new sap.m.ToolbarSpacer({}),
		    		               new sap.m.Button({text : "Accept", type:"Accept"}),
		    		               new sap.m.Button({
		    		            	   text : "Reject", 
		    		            	   type:"Reject",
		    		            	   press :  function(oEvent){
		    		            		   oController.displaySplitAppMaster();   
		    		            		  
		    		            	   }}),
		    		               new sap.m.Button({text : "Edit"}),
		    		               new sap.m.Button({text : "Delete"})]
		    	})
		 				
		});
	   
		
		var oAnswerPage = new sap.m.Page("oAnswerPage", {
		    title : "Answers",
		    content : [sap.m.VBox("createCheckBoxAnswer",{
		    	items : []
		    })
		               
		               
		               ],
		    footer : new sap.m.Toolbar({
	 			  active: true,
	    		   content : [ new sap.m.ToolbarSpacer({}),
	    		               new sap.m.Button({text : "Accept", type:"Accept"}),
	    		               new sap.m.Button({text : "Reject", type:"Reject"}),
	    		               new sap.m.Button({text : "Edit"}),
	    		               new sap.m.Button({text : "Delete"})]
	    	})
	 				
	  });
		
		oSplitApp = new sap.m.SplitApp("mySplitApp", {
			masterPages : [new sap.m.Page("master1",{
			    title : "Menu",
			    headerContent : [],
			    footer : new sap.m.Toolbar({
		 			   active: true,
		    		   content : [ new sap.m.ToolbarSpacer({})]
		    	}),
		        content : [
		        new sap.m.List("oListMasterPage",{
		        	mode:"SingleSelectMaster",
		        	select: function(oEvent) {
		        		
		        		switch(this.getSelectedItem().getId()){	        		
		        			case "masterPagePacientes": oController.createDetailPage_PACIENTES("oPacientePage","registarPaciente");
		        			break;
		        			
		        			case "masterPageAmbulancia": 
		        			break;
		        		}
		        		
		        	},
		        	items : [
		             new sap.m.StandardListItem("masterPagePacientes",{
		        		
		  				title : "Pacientes ",
		  				//number : "number",
		  				//numberUnit : "TS",
		  				//intro : "INTRO",
		  				icon: "sap-icon://wounds-doc"
		  				//activeIcon : "sap-icon://overlay",
		  				//iconDensityAware : true,
		  				//markFavorite : true,
		  				//markFlagged : true,
		  				//showMarkers : true,
		  				//numberState : sap.ui.core.ValueState (default: None)
		  				//titleTextDirection : sap.ui.core.TextDirection (default: Inherit)
		  				//introTextDirection : sap.ui.core.TextDirection (default: Inherit)
		  				//numberTextDirection : sap.ui.core.TextDirection (default: Inherit)
		  				//markLocked : true,
		  				//firstStatus : new sap.m.ObjectStatus({
		  				//	title : "Status",
		  				//	text : "Status_",
		  				//	state : "Success",
		  				//	icon : "sap-icon://overlay"
		  				//})
		        	}),
		        	new sap.m.StandardListItem("masterPageAmbulancia",{		        		
		  				title : "Ambulancia",
		  				icon: "sap-icon://accidental-leave"
		        	})
		        ]
			  })
			  ]
		})]
		});
		oSplitApp.addDetailPage(new sap.m.Page({}));
		//oSplitApp.setMode("HideMode");
		    aControls.push(oSplitApp);
		    
		return aControls;
	}

});